# ui-review-mcp

UIレビュー材料の整理と改善指示プロンプト生成を行うMCPサーバー。

スクリーンショットやURLを入力として受け取り、DOM情報・アクセシビリティ検査結果を収集し、
ホスト側LLMが解釈しやすい構造化レビュー入力を生成します。

このMCPサーバー自身はUIの問題を断定しません。レビュー材料の整理を担います。

## クイックスタート

### npx で直接実行（インストール不要）

```bash
npx ui-review-mcp
```

初回実行時に Playwright の Chromium が必要です:

```bash
npx playwright install chromium
```

### MCP設定（Kiro / Claude Desktop）

`mcp.json` に以下を追加:

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

### グローバルインストール

```bash
npm install -g ui-review-mcp
npx playwright install chromium
```

## 提供ツール

| ツール | 説明 |
|---|---|
| `analyze_ui_image` | スクリーンショット画像を正規化し、レビュー用の構造化入力を生成 |
| `analyze_ui_url` | URLからスクリーンショット・DOM情報・axe結果を取得し、レビュー用入力を生成 |
| `generate_ui_fix_prompt` | レビュー結果から実装AIに渡せる改善指示プロンプトを生成 |

## Kiro Power としてインストール

リポジトリから直接インストールする場合:

```bash
git clone https://github.com/evisu-dev/ui-review-mcp.git
cd ui-review-mcp/ui-review-mcp
npm install
npx playwright install chromium
npm run build
bash power/install.sh
```

`install.sh` が `~/.kiro/powers/installed/ui-review/` にファイルをコピーし、
`mcp.json` を自動生成します。Kiro を再起動すれば Power として利用可能です。

## 使い方

### 1. 画像からレビュー材料を生成

```
analyze_ui_image を使って、この画面のUIレビュー材料を生成してください。
画面の目的は「会員登録の完了率改善」、デバイスは mobile です。
```

### 2. URLからレビュー材料を生成

```
analyze_ui_url を使って https://example.com/register のUIレビュー材料を生成してください。
モバイル表示で、目的は「会員登録の完了率改善」です。
```

### 3. 改善指示プロンプトを生成

```
generate_ui_fix_prompt を使って、上記のレビュー結果から改善指示を生成してください。
技術スタックは Laravel / Blade / Tailwind CSS です。
```

## 評価軸

レビュープロンプトでは以下の4軸での評価を指示します:

1. 視認性: コントラスト、フォントサイズ、色使い、可読性
2. 情報構造: 見出し階層、グルーピング、余白の一貫性
3. 操作導線: CTA配置、ナビゲーション、ユーザーフロー
4. 入力負荷: フォーム設計、ステップ数、ラベルの明確さ

## ディレクトリ構成

```
src/
├── index.ts                  # MCPサーバーエントリポイント
├── types.ts                  # 共通型定義
├── tools/
│   ├── analyze-ui-image.ts   # 画像正規化 + レビュープロンプト生成
│   ├── analyze-ui-url.ts     # Playwright取得 + レビュープロンプト生成
│   └── generate-ui-fix-prompt.ts  # 改善指示プロンプト生成
├── analyzer/
│   ├── image-normalizer.ts   # 画像リサイズ・正規化
│   └── prompt-builder.ts     # レビュー用プロンプト組み立て
└── browser/
    └── screenshot.ts         # Playwright操作・DOM取得・axe実行
```

## トラブルシューティング

### Playwright のブラウザが見つからない

```
Error: Executable doesn't exist at ...
```

```bash
npx playwright install chromium
```

### Node.js バージョンが古い

Node.js 20以上が必要です:

```bash
node --version
```

### `analyze_ui_url` がタイムアウトする

ページ読み込みのタイムアウトは30秒です。
SPA で `networkidle` に到達しにくいページでは失敗する可能性があります。

## 前提条件

- Node.js >= 20.0.0
- Playwright Chromium（`npx playwright install chromium`）

## ライセンス

MIT
