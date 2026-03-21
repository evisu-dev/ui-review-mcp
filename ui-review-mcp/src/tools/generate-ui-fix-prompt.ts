/**
 * generate_ui_fix_prompt ツール
 *
 * レビュー結果と技術スタック情報を受け取り、
 * 実装AIにそのまま渡せる改善指示プロンプトを生成する。
 */
import { z } from 'zod';

/** 入力スキーマ */
export const generateUiFixPromptSchema = z.object({
  reviewContext: z.string().describe('レビュー結果（analyze_ui_image/url の出力テキスト、または手動で記述した問題一覧）'),
  techStack: z.string().describe('対象技術スタック（例: "Laravel / Blade / Tailwind"）'),
  constraints: z.string().optional().describe('制約条件（例: "既存のコンポーネント構成を維持"）'),
  screenName: z.string().optional().describe('対象画面名（例: "会員登録画面"）'),
  purpose: z.string().optional().describe('画面の目的（例: "会員登録の完了率改善"）'),
});

type GenerateUiFixPromptParams = z.infer<typeof generateUiFixPromptSchema>;

/**
 * 実装AI向けの改善指示プロンプトを生成する
 */
export async function handleGenerateUiFixPrompt(params: GenerateUiFixPromptParams) {
  const prompt = buildFixPrompt(params);

  return {
    content: [
      {
        type: 'text' as const,
        text: prompt,
      },
    ],
  };
}

/**
 * 改善指示プロンプトを組み立てる
 */
function buildFixPrompt(params: GenerateUiFixPromptParams): string {
  const sections: string[] = [];

  // ヘッダー
  sections.push('# UI改善指示プロンプト');
  sections.push('');

  // 対象画面
  if (params.screenName) {
    sections.push(`## 対象画面`);
    sections.push(params.screenName);
    sections.push('');
  }

  // 目的
  if (params.purpose) {
    sections.push(`## 目的`);
    sections.push(params.purpose);
    sections.push('');
  }

  // 技術スタック
  sections.push(`## 技術スタック`);
  sections.push(params.techStack);
  sections.push('');

  // レビュー結果から抽出した問題点
  sections.push(`## レビュー結果（以下の問題点を修正してください）`);
  sections.push('');
  sections.push(params.reviewContext);
  sections.push('');

  // 制約条件
  sections.push(`## 制約条件`);
  if (params.constraints) {
    sections.push(params.constraints);
  }
  sections.push('- 「見やすくする」「使いやすくする」のような曖昧な変更は行わない');
  sections.push('- 各変更について、何を・なぜ・どう変えるかを明確にしてからコードを修正する');
  sections.push('- 既存の機能を壊さない');
  sections.push('');

  // 完了条件
  sections.push(`## 完了条件`);
  sections.push('- 上記の問題点がすべて対処されていること');
  sections.push('- 変更箇所ごとに、変更理由と期待される効果を説明できること');
  sections.push('- レスポンシブ対応が維持されていること');
  sections.push('');

  // 作業指示
  sections.push(`## 作業指示`);
  sections.push('1. まず問題点を優先度順に並べ替えてください');
  sections.push('2. 各問題について、具体的な修正方針を提示してください');
  sections.push('3. 優先度の高いものから順に修正してください');
  sections.push('4. 各修正後、変更内容と理由を簡潔に説明してください');

  return sections.join('\n');
}
