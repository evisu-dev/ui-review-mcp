#!/usr/bin/env node
/**
 * UIレビューMCPサーバー
 *
 * UIの問題を断定するのではなく、ホスト側LLMが解釈しやすい
 * 「構造化レビュー入力」を生成するMCPサーバー。
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { analyzeUiImageSchema, handleAnalyzeUiImage } from './tools/analyze-ui-image.js';
import { analyzeUiUrlSchema, handleAnalyzeUiUrl } from './tools/analyze-ui-url.js';
import { generateUiFixPromptSchema, handleGenerateUiFixPrompt } from './tools/generate-ui-fix-prompt.js';

const SERVER_NAME = 'ui-review-mcp';
const SERVER_VERSION = '0.1.0';

/** MCPサーバーを構築する */
function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // analyze_ui_image: 画像入力の正規化とレビュー用プロンプト生成
  server.tool(
    'analyze_ui_image',
    'スクリーンショット画像を正規化し、UIレビュー用の構造化入力を生成する。サーバー自身は問題を断定せず、ホスト側LLMが解釈しやすいレビュー材料を整理して返す。',
    analyzeUiImageSchema.shape,
    async (params) => handleAnalyzeUiImage(params),
  );

  // analyze_ui_url: URLからページ情報を取得しレビュー材料を整理
  server.tool(
    'analyze_ui_url',
    'URLからPlaywrightでスクリーンショット・DOM情報・アクセシビリティ検査結果を取得し、UIレビュー用の構造化入力を生成する。サーバー自身は問題を断定せず、レビュー材料の整理を担う。',
    analyzeUiUrlSchema.shape,
    async (params) => handleAnalyzeUiUrl(params),
  );

  // generate_ui_fix_prompt: 改善指示プロンプト生成
  server.tool(
    'generate_ui_fix_prompt',
    'レビュー結果と技術スタック情報から、実装AIにそのまま渡せる改善指示プロンプトを生成する。',
    generateUiFixPromptSchema.shape,
    async (params) => handleGenerateUiFixPrompt(params),
  );

  return server;
}

/** メイン処理 */
async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('サーバー起動に失敗しました:', error);
  process.exit(1);
});
