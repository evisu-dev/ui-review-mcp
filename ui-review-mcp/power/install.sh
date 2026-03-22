#!/bin/bash
# ui-review Power インストールスクリプト
# 使い方: bash ui-review-mcp/power/install.sh

set -e

POWER_DIR="$HOME/.kiro/powers/installed/ui-review"
POWER_SRC="$(dirname "$0")"

echo "=== ui-review Power インストール ==="

# 1. Power ディレクトリにコピー
echo "[1/3] Power ファイルをコピー中..."
mkdir -p "$POWER_DIR/steering" "$POWER_DIR/icons"
cp "$POWER_SRC/mcp.json" "$POWER_DIR/mcp.json"
cp "$POWER_SRC/POWER.md" "$POWER_DIR/POWER.md"
cp "$POWER_SRC/steering/ui-review-best-practices.md" "$POWER_DIR/steering/ui-review-best-practices.md"
cp "$POWER_SRC/icons/ui-review.png" "$POWER_DIR/icons/ui-review.png"

# 2. installed.json を更新
echo "[2/3] installed.json を更新中..."
INSTALLED_JSON="$HOME/.kiro/powers/installed.json"
if [ -f "$INSTALLED_JSON" ]; then
  # ui-review がまだ登録されていなければ追加
  if ! grep -q '"ui-review"' "$INSTALLED_JSON"; then
    # jq が使えれば jq で、なければ python で
    if command -v jq &> /dev/null; then
      jq '.installedPowers += [{"name": "ui-review", "registryId": "local"}]' "$INSTALLED_JSON" > "$INSTALLED_JSON.tmp"
      mv "$INSTALLED_JSON.tmp" "$INSTALLED_JSON"
    elif command -v python3 &> /dev/null; then
      python3 -c "
import json, sys
with open('$INSTALLED_JSON') as f:
    data = json.load(f)
data['installedPowers'].append({'name': 'ui-review', 'registryId': 'local'})
with open('$INSTALLED_JSON', 'w') as f:
    json.dump(data, f, indent=2)
"
    else
      echo "警告: jq も python3 も見つかりません。installed.json を手動で更新してください。"
    fi
  else
    echo "  → 既に登録済みです"
  fi
fi

# 3. registry.json を更新
echo "[3/3] registry.json を更新中..."
REGISTRY_JSON="$HOME/.kiro/powers/registry.json"
if [ -f "$REGISTRY_JSON" ]; then
  if ! grep -q '"ui-review"' "$REGISTRY_JSON"; then
    if command -v python3 &> /dev/null; then
      python3 -c "
import json
with open('$REGISTRY_JSON') as f:
    data = json.load(f)
data['powers']['ui-review'] = {
    'name': 'ui-review',
    'description': 'UIレビュー材料の整理と改善指示プロンプト生成 - スクリーンショットやURLからUIの問題点を構造化し、実装AIに渡せる改善指示を生成',
    'mcpServers': ['ui-review'],
    'author': 'Local',
    'license': 'MIT',
    'keywords': ['ui', 'review', 'accessibility', 'screenshot', 'playwright', 'axe-core', 'ui-review'],
    'displayName': 'UI Review',
    'iconUrl': 'https://raw.githubusercontent.com/evisu-dev/ui-review-mcp/main/ui-review-mcp/power/icons/ui-review.png',
    'installed': True,
    'installPath': '$POWER_DIR',
    'source': {'type': 'local'}
}
with open('$REGISTRY_JSON', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
"
    elif command -v jq &> /dev/null; then
      jq '.powers[\"ui-review\"] = {
        \"name\": \"ui-review\",
        \"description\": \"UIレビュー材料の整理と改善指示プロンプト生成\",
        \"mcpServers\": [\"ui-review\"],
        \"author\": \"Local\",
        \"license\": \"MIT\",
        \"keywords\": [\"ui\", \"review\", \"accessibility\", \"screenshot\", \"playwright\"],
        \"displayName\": \"UI Review\",
        \"installed\": true,
        \"installPath\": \"'$POWER_DIR'\",
        \"source\": {\"type\": \"local\"}
      }' "$REGISTRY_JSON" > "$REGISTRY_JSON.tmp"
      mv "$REGISTRY_JSON.tmp" "$REGISTRY_JSON"
    else
      echo "警告: python3 も jq も見つかりません。registry.json を手動で更新してください。"
    fi
  else
    echo "  → 既に登録済みです"
  fi
fi

echo ""
echo "=== インストール完了 ==="
echo "Kiro を再起動すると ui-review Power が利用可能になります。"
echo ""
echo "ワークスペースの mcp.json から ui-review の設定を削除しても、"
echo "Power 経由で自動的にMCPサーバーが接続されます。"
