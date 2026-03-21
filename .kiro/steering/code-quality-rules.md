---
inclusion: manual
---

# コード品質ルール

## 基本原則
- 複雑な条件分岐は意味のある変数に分割
- 早期リターン（Guard句）でネストを浅く
- 1メソッド1責任
- `declare(strict_types=1);` 必須
- コンストラクタ注入は `private readonly`

## リファクタリング指標
- Cyclomatic Complexity < 10
- メソッド行数 < 20行
- ネスト深度 < 3
- 引数個数 < 4個

## PHP型宣言
- 全メソッドに引数・戻り値の型宣言
- プロパティに型宣言
- 複雑な型はPHPDocで明示
- Nullable型は明示的に `?Type` で記述
