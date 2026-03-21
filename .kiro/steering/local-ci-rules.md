---
inclusion: manual
---

# ローカルCI・テストルール

## 基本方針
- テスト作成後は必ず実行確認
- テストファイルはArtisanで雛形生成
- bash heredocによるテストファイル生成は禁止

## テスト作成フロー
1. `php artisan make:test <Name> --unit` or `--feature` で雛形生成
2. 内容編集は通常のファイル編集
3. テスト実行で動作確認
4. 失敗する場合は修正してから完了

## 検証方法
- `php artisan tinker --execute=...` は禁止
- 3行以上の検証ロジックはArtisan Command化
