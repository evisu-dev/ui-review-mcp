/**
 * UIレビューMCPサーバーの共通型定義
 *
 * このMCPサーバーは「UIの問題を断定する」のではなく、
 * ホスト側LLMが解釈しやすい「構造化レビュー入力」を生成する。
 */

/** デバイス種別 */
export type DeviceType = 'mobile' | 'desktop';

/** 評価軸（MVPでは4軸に限定） */
export type EvaluationAxis =
  | 'visibility'             // 視認性
  | 'information_structure'  // 情報構造
  | 'navigation'             // 操作導線
  | 'input_burden';          // 入力負荷

/** 問題の重要度 */
export type Severity = 'critical' | 'major' | 'minor';

/**
 * axe-core の検出結果（簡略化）
 */
export interface AccessibilityViolation {
  id: string;
  impact: string;
  description: string;
  helpUrl: string;
  nodes: number;
}

/**
 * ページから取得したDOM情報（最低限）
 */
export interface DomSnapshot {
  title: string;
  headings: Array<{ level: number; text: string }>;
  forms: Array<{ action: string; fields: number }>;
  links: number;
  images: { total: number; withoutAlt: number };
  buttons: number;
  lang: string;
  metaViewport: string | null;
}

/**
 * analyze_ui_image の入力
 */
export interface AnalyzeUiImageInput {
  /** Base64エンコードされた画像データ */
  imageBase64: string;
  /** 画像のMIMEタイプ */
  mimeType?: string;
  /** 画面の目的（例: 会員登録、購入完了率改善） */
  purpose?: string;
  /** 対象デバイス */
  device?: DeviceType;
}

/**
 * analyze_ui_url の入力
 */
export interface AnalyzeUiUrlInput {
  /** 対象URL */
  url: string;
  /** ビューポート種別 */
  device?: DeviceType;
  /** 画面の目的 */
  purpose?: string;
}

/**
 * generate_ui_fix_prompt の入力
 */
export interface GenerateUiFixPromptInput {
  /** レビュー結果（analyze_ui_image/url の出力をそのまま渡す想定） */
  reviewContext: string;
  /** 対象技術スタック（例: "Laravel / Blade / Tailwind"） */
  techStack: string;
  /** 制約条件 */
  constraints?: string;
  /** 対象画面名 */
  screenName?: string;
  /** 画面の目的 */
  purpose?: string;
}

/**
 * レビュー材料の構造化出力
 *
 * MCPサーバーが生成する「ホスト側LLMへの入力」。
 * サーバー自身は問題を断定せず、判断材料を整理して渡す。
 */
export interface StructuredReviewInput {
  /** 画像データ（base64） */
  imageBase64?: string;
  /** 画像のMIMEタイプ */
  mimeType?: string;
  /** DOM情報（URLからの取得時のみ） */
  domSnapshot?: DomSnapshot;
  /** アクセシビリティ検査結果（URLからの取得時のみ） */
  accessibilityViolations?: AccessibilityViolation[];
  /** 画面の目的 */
  purpose?: string;
  /** デバイス種別 */
  device: DeviceType;
  /** レビュー観点の指示（ホスト側LLMへのプロンプト） */
  reviewPrompt: string;
}

/**
 * デバイスごとのビューポート設定
 */
export const VIEWPORT_PRESETS: Record<DeviceType, { width: number; height: number }> = {
  mobile: { width: 375, height: 812 },
  desktop: { width: 1440, height: 900 },
} as const;

/**
 * 画像リサイズの最大幅
 */
export const MAX_IMAGE_WIDTH = 1920;
