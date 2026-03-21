---
inclusion: fileMatch
fileMatchPattern: "**/{api,resources,requests}/**/*.php"
---

# API設計ガイドライン

## RESTful設計
- 適切なHTTPメソッド・ステータスコード使用
- URL設計: `/api/v1/{resource}`
- リソース名は複数形

## Controller
- 1Controller1Action（`__invoke`）
- FormRequestでバリデーション
- API Resourceでレスポンス整形

## エラーハンドリング
- 統一されたエラーレスポンス形式
- 適切なHTTPステータスコード
- バリデーションエラーは422

## 認証・認可
- Sanctum認証
- Policy活用
- Rate Limiting設定
