---
inclusion: fileMatch
fileMatchPattern: "**/*Test.php"
---

# テストガイドライン

## テスト命名
```
test_[動作]_[条件]_[期待結果]
```

## 構造
- AAA パターン: Arrange, Act, Assert
- Unit Tests: 単一クラス・メソッドの検証
- Feature Tests: Controller・API統合テスト

## 基本ルール
- テスト作成後は必ず実行確認
- Factory でテストデータ生成
- 外部依存はモックで分離
- エラーメッセージ検証でも翻訳キーを使用
