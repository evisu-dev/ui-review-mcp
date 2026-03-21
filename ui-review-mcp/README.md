# ui-review-mcp

UIレビュー材料の整理と改善指示プロンプト生成を行うMCPサーバー。

スクリーンショットやURLを入力として受け取り、DOM情報・アクセシビリティ検査結果を収集し、
ホスト側LLMが解釈しやすい構造化レビュー入力を生成します。

このMCPサーバー自身はUIの問題を断定しません。レビュー材料の整理を担います。

## 提供ツール

| ツール | 説明 |
|---|---|
| `analyze_ui_image` | スクリーンショット画像を正規化し、レビュー用の構造化入力を生成 |
| `analyze_ui_url` | URLからスクリーンショット・DOM情報・axe結果を取得し、レビュー用入力を生成 |
| `generate_ui_fix_prompt` | レビュー結果から実装AIに渡せる改善指示プロンプトを生成 |

## セットアップ

### 前提条件

- Node.js 20以上
- npm

### インストール

```bash
cd ui-review-mcp
npm install
npx playwright install chromium
npm run build
```

## MCP設定

Kiro / Claude Desktop などのMCPクライアントに以下を設定してください。

### Kiro の場合（`.kiro/settings/mcp.json`）

```json
{
  "mcpServers": {
    "ui-review": {
      "command": "node",
      "args": ["/path/to/ui-review-mcp/dist/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Claude Desktop の場合

```json
{
  "mcpServers": {
    "ui-review": {
      "command": "node",
      "args": ["/path/to/ui-review-mcp/dist/index.js"]
    }
  }
}
```

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

## サンプル

`samples/` ディレクトリにサンプル入出力があります。

## 将来の拡張候補

- 改善前後の比較機能
- カスタム評価ルール（JSON/YAML定義）
- 複数ページ一括スキャン
- Lighthouse統合
- npm公開 + MCP Registry登録
- Docker化

## ライセンス

MIT
