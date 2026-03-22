---
name: "ui-review"
displayName: "UI Review"
description: "Collect UI review materials from screenshots or URLs and generate structured fix prompts for implementation AI. Includes Playwright screenshots, DOM analysis, and axe-core accessibility checks."
keywords: ["ui","review","accessibility","screenshot","playwright","axe-core","ui-review"]
author: "Local"
---

# UI Review Power

## 概要

スクリーンショットやURLからUIレビュー材料を収集し、実装AIに渡せる改善指示プロンプトを生成するPowerです。
UI の問題を自動修正するのではなく、ホスト側LLMが解釈しやすい「構造化レビュー入力」を生成します。

主な機能:
- スクリーンショット画像からのUIレビュー材料生成
- URLからPlaywrightでページ情報を取得しレビュー材料を整理
- レビュー結果から実装AI向けの改善指示プロンプトを生成

## 利用可能なMCPサーバー

### ui-review

ローカルで動作するNode.js MCPサーバーです。

## ツール一覧

### analyze_ui_image

スクリーンショット画像を正規化し、UIレビュー用の構造化入力を生成します。
サーバー自身は問題を断定せず、ホスト側LLMが解釈しやすいレビュー材料を整理して返します。

パラメータ:
- `imageBase64` (必須): Base64エンコードされた画像データ
- `mimeType` (任意): 画像のMIMEタイプ（デフォルト: image/png）
- `purpose` (任意): 画面の目的（例: 会員登録、購入完了率改善）
- `device` (任意): 対象デバイス（mobile / desktop、デフォルト: desktop）

### analyze_ui_url

URLからPlaywrightでスクリーンショット・DOM情報・アクセシビリティ検査結果を取得し、
UIレビュー用の構造化入力を生成します。

パラメータ:
- `url` (必須): 対象URL
- `device` (任意): ビューポート種別（mobile / desktop、デフォルト: desktop）
- `purpose` (任意): 画面の目的

### generate_ui_fix_prompt

レビュー結果と技術スタック情報から、実装AIにそのまま渡せる改善指示プロンプトを生成します。

パラメータ:
- `reviewContext` (必須): レビュー結果（analyze_ui_image/url の出力テキスト、または手動で記述した問題一覧）
- `techStack` (必須): 対象技術スタック（例: "Laravel / Blade / Tailwind"）
- `constraints` (任意): 制約条件（例: "既存のコンポーネント構成を維持"）
- `screenName` (任意): 対象画面名（例: "会員登録画面"）
- `purpose` (任意): 画面の目的（例: "会員登録の完了率改善"）

## 推奨ワークフロー

### ワークフロー1: スクリーンショットからUIレビュー

1. `analyze_ui_image` にスクリーンショットを渡してレビュー材料を取得
2. レビュー結果を確認し、改善が必要な点を特定
3. `generate_ui_fix_prompt` で実装指示プロンプトを生成
4. 生成されたプロンプトを実装AIに渡して修正を実行

### ワークフロー2: URLからUIレビュー

1. `analyze_ui_url` に対象URLを渡してレビュー材料を取得（DOM情報・axe結果含む）
2. レビュー結果を確認し、改善が必要な点を特定
3. `generate_ui_fix_prompt` で実装指示プロンプトを生成
4. 生成されたプロンプトを実装AIに渡して修正を実行

### ワークフロー3: モバイル・デスクトップ両方のレビュー

1. `analyze_ui_url` を `device: "desktop"` で実行
2. `analyze_ui_url` を `device: "mobile"` で実行
3. 両方の結果を統合して `generate_ui_fix_prompt` に渡す

## セットアップ

### 前提条件

- Node.js >= 20.0.0
- Playwright（`npx playwright install chromium` でブラウザをインストール）

### ビルド

```bash
cd ui-review-mcp
npm install
npm run build
```

## トラブルシューティング

### Playwrightのブラウザが見つからない

```
Error: browserType.launch: Executable doesn't exist
```

対処: `npx playwright install chromium` を実行してください。

### 画像が大きすぎる

analyze_ui_image は内部で画像を最大1920px幅にリサイズし、PNG形式に変換します。
極端に大きな画像の場合、Base64エンコード前にリサイズすることを推奨します。

### URLにアクセスできない

analyze_ui_url はPlaywrightでページにアクセスします。
認証が必要なページや、ローカルホスト以外のプライベートネットワークのURLには対応していません。

## 技術スタック

- Node.js / TypeScript
- @modelcontextprotocol/sdk
- Playwright（スクリーンショット・DOM取得）
- axe-core（アクセシビリティ検査）
- sharp（画像正規化）
- zod（スキーマバリデーション）
