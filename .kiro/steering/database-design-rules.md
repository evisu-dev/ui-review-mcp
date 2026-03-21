---
inclusion: fileMatch
fileMatchPattern: "**/{migrations,models,seeders}/**/*.php"
---

# データベース設計ルール

## 命名規則
- テーブル名: 複数形、スネークケース（`users`, `user_profiles`）
- カラム名: スネークケース（`created_at`, `user_id`）
- 外部キー: `{参照テーブル単数形}_id`
- インデックス名: `idx_{テーブル名}_{カラム名}`

## Migration
- 全カラムにコメント記述
- 適切なデータ型選択
- 外部キー制約の設定
- インデックスはクエリパターンに基づいて設計

## Model
- `$fillable` でホワイトリスト方式
- `$casts` で型キャスト定義
- リレーションメソッドに戻り値型宣言
- N+1問題対策（Eager Loading活用）
