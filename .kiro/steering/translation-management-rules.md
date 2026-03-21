---
inclusion: fileMatch
fileMatchPattern: "**/lang/**/*.php"
---

# 翻訳管理ルール

## 基本原則
- 重複キー禁止
- 命名規則: `section.subsection.key_name`
- キー追加時は全対応言語に同時追加

## 使用方法
```php
// Blade
{{ __('app.auth.login') }}
{{ __('app.messages.welcome', ['name' => $user->name]) }}

// PHP
__('app.errors.not_found')
```

## ハードコーディング禁止
- ユーザー向けテキストは翻訳キー化必須
- システム内部文字列は定数化
