/**
 * analyze_ui_image ツール
 *
 * 画像入力を正規化し、ホスト側LLMが解釈しやすい
 * 構造化レビュー入力を生成する。
 * このツール自身はUIの問題を断定しない。
 */
import { z } from 'zod';
import { normalizeImage } from '../analyzer/image-normalizer.js';
import { buildReviewPrompt } from '../analyzer/prompt-builder.js';
import type { DeviceType } from '../types.js';

/** 入力スキーマ */
export const analyzeUiImageSchema = z.object({
  imageBase64: z.string().describe('Base64エンコードされた画像データ'),
  mimeType: z.string().optional().describe('画像のMIMEタイプ（デフォルト: image/png）'),
  purpose: z.string().optional().describe('画面の目的（例: 会員登録、購入完了率改善）'),
  device: z.enum(['mobile', 'desktop']).optional().describe('対象デバイス（デフォルト: desktop）'),
});

type AnalyzeUiImageParams = z.infer<typeof analyzeUiImageSchema>;

/**
 * 画像を正規化し、レビュー用の構造化入力を返す
 */
export async function handleAnalyzeUiImage(params: AnalyzeUiImageParams) {
  const device: DeviceType = params.device ?? 'desktop';

  // 画像の正規化（リサイズ・PNG変換）
  const normalized = await normalizeImage(params.imageBase64, params.mimeType);

  // レビュー用プロンプト生成
  const reviewPrompt = buildReviewPrompt({
    device,
    purpose: params.purpose,
  });

  // MCP応答: 画像コンテンツ + テキストプロンプトを返す
  // ホスト側LLMがこの画像とプロンプトを受け取り、レビューを実行する
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
          `---`,
          `画像情報: ${normalized.width}x${normalized.height}px (PNG)`,
          `デバイス: ${device}`,
          params.purpose ? `画面目的: ${params.purpose}` : '',
        ].filter(Boolean).join('\n'),
      },
    ],
  };
}
