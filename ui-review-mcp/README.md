# ui-review-mcp

[![npm version](https://img.shields.io/npm/v/ui-review-mcp.svg)](https://www.npmjs.com/package/ui-review-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

UIレビュー材料の整理と改善指示プロンプト生成を行うMCPサーバー。

スクリーンショットやURLからDOM情報・アクセシビリティ検査結果を収集し、
ホスト側LLMが解釈しやすい構造化レビュー入力を生成します。
サーバー自身はUIの問題を断定せず、レビュー材料の整理を担います。

## Quick Start

npx で直接実行:

```bash
npx ui-review-mcp
```

MCP クライアント設定（Kiro / Claude Desktop）:

```json
{
  "mcpServers": {
    "ui-review": {
      "command": "npx",
      "args": ["-y", "ui-review-mcp"]
    }
  }
}
```

グローバルインストール:

```bash
npm install -g ui-review-mcp
```

## 前提条件

- Node.js >= 20.0.0
- Playwright Chromium（初回のみ）:

```bash
npx playwright install chromium
```

## 提供ツール

| ツール | 説明 |
|---|---|
| `analyze_ui_image` | スクリーンショット画像を正規化し、レビュー用の構造化入力を生成 |
| `analyze_ui_url` | URLからスクリーンショット・DOM情報・axe結果を取得し、レビュー用入力を生成 |
| `generate_ui_fix_prompt` | レビュー結果から実装AIに渡せる改善指示プロンプトを生成 |

## 使い方

### 画像からレビュー材料を生成

```
analyze_ui_image を使って、この画面のUIレビュー材料を生成してください。
画面の目的は「会員登録の完了率改善」、デバイスは mobile です。
```

### URLからレビュー材料を生成

```
analyze_ui_url を使って https://example.com/register のUIレビュー材料を生成してください。
モバイル表示で、目的は「会員登録の完了率改善」です。
```

### 改善指示プロンプトを生成

```
generate_ui_fix_prompt を使って、上記のレビュー結果から改善指示を生成してください。
技術スタックは Laravel / Blade / Tailwind CSS です。
```

## 評価軸

レビュープロンプトでは以下の4軸で評価を指示します:

1. 視認性: コントラスト、フォントサイズ、色使い、可読性
2. 情報構造: 見出し階層、グルーピング、余白の一貫性
3. 操作導線: CTA配置、ナビゲーション、ユーザーフロー
4. 入力負荷: フォーム設計、ステップ数、ラベルの明確さ

## ローカル開発

リポジトリからビルドして使う場合:

```bash
git clone https://github.com/evisu-dev/ui-review-mcp.git
cd ui-review-mcp/ui-review-mcp
npm install
npx playwright install chromium
npm run build
```

ローカルビルドのMCP設定:

```json
{
  "mcpServers": {
    "ui-review": {
      "command": "node",
      "args": ["<絶対パス>/ui-review-mcp/dist/index.js"]
    }
  }
}
```

### Kiro Power としてインストール

```bash
bash power/install.sh
```

## トラブルシューティング

### Playwright のブラウザが見つからない

```bash
npx playwright install chromium
```

### `analyze_ui_url` がタイムアウトする

ページ読み込みのタイムアウトは30秒です。
SPA で `networkidle` に到達しにくいページでは失敗する可能性があります。

## ライセンス

MIT
