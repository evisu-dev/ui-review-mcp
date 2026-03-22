#!/bin/bash
# ui-review Power インストールスクリプト
# 使い方: bash ui-review-mcp/power/install.sh
# リポジトリルートから実行してください

set -e

POWER_DIR="$HOME/.kiro/powers/installed/ui-review"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
POWER_SRC="$(dirname "$0")"

echo "=== ui-review Power インストール ==="

# 0. ビルド済みファイルの存在確認
if [ ! -f "$REPO_ROOT/dist/index.js" ]; then
  echo "エラー: dist/index.js が見つかりません。先に npm run build を実行してください。"
  echo "  cd $REPO_ROOT && npm install && npm run build"
  exit 1
fi

# 1. Power ディレクトリにファイルをコピー
echo "[1/4] Power ファイルをコピー中..."
mkdir -p "$POWER_DIR/steering" "$POWER_DIR/icons" "$POWER_DIR/dist"
cp "$POWER_SRC/POWER.md" "$POWER_DIR/POWER.md"
cp "$POWER_SRC/steering/ui-review-best-practices.md" "$POWER_DIR/steering/ui-review-best-practices.md"
cp "$POWER_SRC/icons/ui-review.png" "$POWER_DIR/icons/ui-review.png"

# 2. ランタイムファイルをコピー（dist + node_modules + package.json）
echo "[2/4] ランタイムファイルをコピー中..."
cp -R "$REPO_ROOT/dist/"* "$POWER_DIR/dist/"
cp "$REPO_ROOT/package.json" "$POWER_DIR/package.json"
if [ -d "$REPO_ROOT/node_modules" ]; then
  cp -R "$REPO_ROOT/node_modules" "$POWER_DIR/node_modules"
else
  echo "  node_modules が見つかりません。インストール先で npm install を実行します..."
  (cd "$POWER_DIR" && npm install --omit=dev)
fi

# 3. mcp.json を動的生成（インストール先のパスを使用）
echo "[3/4] mcp.json を生成中..."
cat > "$POWER_DIR/mcp.json" << MCPJSON
{
  "mcpServers": {
    "ui-review": {
      "command": "node",
      "args": [
        "$POWER_DIR/dist/index.js"
      ]
    }
  }
}
MCPJSON

# 4. installed.json を更新
echo "[4/4] installed.json を更新中..."
INSTALLED_JSON="$HOME/.kiro/powers/installed.json"
if [ -f "$INSTALLED_JSON" ]; then
  if ! grep -q '"ui-review"' "$INSTALLED_JSON"; then
    if command -v jq &> /dev/null; then
      jq '.installedPowers += [{"name": "ui-review", "registryId": "user-added"}]' "$INSTALLED_JSON" > "$INSTALLED_JSON.tmp"
      mv "$INSTALLED_JSON.tmp" "$INSTALLED_JSON"
    elif command -v python3 &> /dev/null; then
      python3 -c "
import json
with open('$INSTALLED_JSON') as f:
    data = json.load(f)
data['installedPowers'].append({'name': 'ui-review', 'registryId': 'user-added'})
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

echo ""
echo "=== インストール完了 ==="
echo "MCPサーバーパス: $POWER_DIR/dist/index.js"
echo "Kiro を再起動すると ui-review Power が利用可能になります。"
