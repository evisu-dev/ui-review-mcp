/**
 * analyze_ui_url ツール
 *
 * URLからPlaywrightでスクリーンショット・DOM情報・axe結果を取得し、
 * ホスト側LLMが解釈しやすい構造化レビュー入力を生成する。
 * このツール自身はUIの問題を断定しない。
 */
import { z } from 'zod';
import { capturePageData } from '../browser/screenshot.js';
import { normalizeImage } from '../analyzer/image-normalizer.js';
import { buildReviewPrompt } from '../analyzer/prompt-builder.js';
import type { DeviceType } from '../types.js';

/** 入力スキーマ */
export const analyzeUiUrlSchema = z.object({
  url: z.string().url().describe('対象URL'),
  device: z.enum(['mobile', 'desktop']).optional().describe('ビューポート種別（デフォルト: desktop）'),
  purpose: z.string().optional().describe('画面の目的'),
});

type AnalyzeUiUrlParams = z.infer<typeof analyzeUiUrlSchema>;

/**
 * URLからページ情報を取得し、レビュー用の構造化入力を返す
 */
export async function handleAnalyzeUiUrl(params: AnalyzeUiUrlParams) {
  const device: DeviceType = params.device ?? 'desktop';

  // Playwrightでページ情報を取得
  const pageData = await capturePageData(params.url, device);

  // スクリーンショットの正規化
  const normalized = await normalizeImage(pageData.screenshotBase64);

  // DOM情報とaxe結果を含むレビュープロンプト生成
  const reviewPrompt = buildReviewPrompt({
    device,
    purpose: params.purpose,
    domSnapshot: pageData.domSnapshot,
    accessibilityViolations: pageData.accessibilityViolations,
  });

  // MCP応答: 画像 + 構造化テキストを返す
  return {
    content: [
      {
        type: 'image' as const,
        data: normalized.base64,
        mimeType: normalized.mimeType,
      },
      {
        type: 'text' as const,
        text: [
          reviewPrompt,
          '',
          '---',
          `URL: ${params.url}`,
          `画像情報: ${normalized.width}x${normalized.height}px (PNG)`,
          `デバイス: ${device}`,
          params.purpose ? `画面目的: ${params.purpose}` : '',
          `DOM要素数: リンク${pageData.domSnapshot.links} / ボタン${pageData.domSnapshot.buttons} / 画像${pageData.domSnapshot.images.total}`,
          `axe違反数: ${pageData.accessibilityViolations.length}件`,
        ].filter(Boolean).join('\n'),
      },
    ],
  };
}
