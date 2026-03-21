---
inclusion: fileMatch
fileMatchPattern: "**/*.{blade.php,vue,js,ts,css,scss,html}"
---

# フロントエンド開発ルール

## 見出し階層
- h1 → h2 → h3 の順序厳守（レベルスキップ禁止）
- 1ページ1つのh1

## アクセシビリティ
- キーボードナビゲーション対応
- 適切なalt属性・ARIA属性
- フォーカス状態の明確な表示

## パフォーマンス
- 画像の遅延読み込み（`loading="lazy"`）
- 不要なライブラリを避ける
- WebP形式優先

## セキュリティ
- ユーザー入力の適切なエスケープ
- フォームでのCSRFトークン使用
