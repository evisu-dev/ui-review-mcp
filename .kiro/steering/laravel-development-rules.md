---
inclusion: fileMatch
fileMatchPattern: "**/*.php"
---

# Laravel 開発ルール

## 基本原則
1. Laravel標準の機構を使い、過度な抽象化をしない
2. 各Controllerは単一アクション（`__invoke`）推奨
3. 全PHPファイル先頭に `declare(strict_types=1);`
4. コンストラクタ注入は `private readonly`
5. Controller・Service・Repository は `final class` 推奨
6. UIテキストは翻訳キー化

## アーキテクチャ
- Controller: 入出力の橋渡しのみ
- Service: ビジネスロジック
- Repository: データアクセス抽象化
- QueryService: 読み取り専用クエリ

## セキュリティ
- FormRequestでバリデーション
- Eloquent ORM / パラメータバインディングでSQLインジェクション対策
- Bladeの `{{ }}` で自動エスケープ
- 全フォームに `@csrf`
