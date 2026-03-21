/**
 * Playwright によるスクリーンショット取得とDOM情報収集
 */
import { chromium, type Browser, type Page } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import type { DeviceType, DomSnapshot, AccessibilityViolation } from '../types.js';
import { VIEWPORT_PRESETS } from '../types.js';

/** ページ取得結果 */
export interface PageCaptureResult {
  /** スクリーンショット（base64 PNG） */
  screenshotBase64: string;
  /** DOM情報 */
  domSnapshot: DomSnapshot;
  /** アクセシビリティ違反 */
  accessibilityViolations: AccessibilityViolation[];
}

/**
 * URLからスクリーンショット・DOM情報・axe結果を取得する
 */
export async function capturePageData(
  url: string,
  device: DeviceType = 'desktop',
): Promise<PageCaptureResult> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const viewport = VIEWPORT_PRESETS[device];
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    // ページ読み込み（ネットワークが落ち着くまで待つ）
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

    // 並行して取得
    const [screenshotBuffer, domSnapshot, accessibilityViolations] = await Promise.all([
      page.screenshot({ fullPage: true, type: 'png' }),
      extractDomSnapshot(page),
      runAccessibilityCheck(page),
    ]);

    return {
      screenshotBase64: screenshotBuffer.toString('base64'),
      domSnapshot,
      accessibilityViolations,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * ページからDOM情報を抽出する
 */
async function extractDomSnapshot(page: Page): Promise<DomSnapshot> {
  return page.evaluate(() => {
    // 見出し
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((el) => ({
      level: parseInt(el.tagName[1], 10),
      text: (el.textContent ?? '').trim().slice(0, 100),
    }));

    // フォーム
    const forms = Array.from(document.querySelectorAll('form')).map((form) => ({
      action: form.getAttribute('action') ?? '',
      fields: form.querySelectorAll('input,select,textarea').length,
    }));

    // 画像
    const allImages = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(allImages).filter(
      (img) => !img.getAttribute('alt')?.trim(),
    ).length;

    return {
      title: document.title,
      headings,
      forms,
      links: document.querySelectorAll('a').length,
      images: { total: allImages.length, withoutAlt: imagesWithoutAlt },
      buttons: document.querySelectorAll('button,[role="button"]').length,
      lang: document.documentElement.lang ?? '',
      metaViewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? null,
    };
  });
}

/**
 * axe-core でアクセシビリティ検査を実行する
 */
async function runAccessibilityCheck(page: Page): Promise<AccessibilityViolation[]> {
  try {
    const results = await new AxeBuilder({ page }).analyze();
    return results.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? 'unknown',
      description: v.description,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
    }));
  } catch {
    // axe-core が失敗してもレビュー自体は続行する
    return [];
  }
}
