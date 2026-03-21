---
inclusion: manual
---

# パフォーマンス最適化

## データベース
- N+1問題対策: Eager Loading（`with()`）
- 必要なカラムのみ取得（`select()`）
- 大量データはチャンク処理（`chunk()`）
- 適切なインデックス設計

## キャッシュ
- `Cache::remember()` でクエリ結果キャッシュ
- モデル更新時にキャッシュクリア

## メモリ
- Generator で大量データ処理
- LazyCollection 活用
- 不要な変数の解放

## 非同期処理
- 重い処理はQueue化（Job dispatch）
