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

## 出力例

### analyze_ui_url の出力（テキスト部分抜粋）

```
## UIレビュー指示

添付されたスクリーンショットを分析し、UIの問題点を整理してください。

- 対象デバイス: モバイル（375x812）
- この画面の目的は「会員登録の完了率改善」です。

### 評価軸
1. 視認性: コントラスト、フォントサイズ、色使い、可読性
2. 情報構造: 見出し階層、グルーピング、余白の一貫性
3. 操作導線: CTA配置、ナビゲーション、ユーザーフロー
4. 入力負荷: フォーム設計、ステップ数、ラベルの明確さ

## 補足: DOM情報（自動取得）
- ページタイトル: 会員登録 | Example
- リンク数: 12 / ボタン数: 3 / 画像: 全5件（alt未設定2件）
- 見出し: h1: 会員登録 → h2: 基本情報 → h2: パスワード設定
- フォーム: action="/register" フィールド数: 6

## 補足: アクセシビリティ検査結果（axe-core）
- [serious] color-contrast: コントラスト不足（3箇所）
- [moderate] label: ラベル未設定（1箇所）
```

実際の出力にはスクリーンショット画像（base64 PNG）も含まれます。

### generate_ui_fix_prompt の出力

```
# UI改善指示プロンプト

## 対象画面: 会員登録画面
## 技術スタック: Laravel / Blade / Tailwind CSS

## 修正すべき問題点
1. CTAボタンのコントラスト比が2.1:1（WCAG AA基準4.5:1を下回る）
2. フォームラベルと入力欄の距離が遠く関連性が弱い
3. エラーメッセージが色のみで伝達（色覚多様性への配慮不足）

## 作業指示
1. 問題点を優先度順に並べ替え
2. 各問題の具体的な修正方針を提示
3. 優先度の高いものから順に修正
4. 各修正後、変更内容と理由を説明
```

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
