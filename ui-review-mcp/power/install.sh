#!/bin/bash
# ui-review Power インストールスクリプト
# 使い方: bash ui-review-mcp/power/install.sh
# リポジトリルートから実行してください

set -e

POWER_DIR="$HOME/.kiro/powers/installed/ui-review"
POWER_SRC="$(dirname "$0")"

echo "=== ui-review Power インストール ==="

# 1. Power ディレクトリにファイルをコピー
echo "[1/3] Power ファイルをコピー中..."
mkdir -p "$POWER_DIR/steering" "$POWER_DIR/icons"
cp "$POWER_SRC/POWER.md" "$POWER_DIR/POWER.md"
cp "$POWER_SRC/steering/ui-review-best-practices.md" "$POWER_DIR/steering/ui-review-best-practices.md"
cp "$POWER_SRC/icons/ui-review.png" "$POWER_DIR/icons/ui-review.png"

# 2. mcp.json を生成（npx 経由で npm パッケージを実行）
echo "[2/3] mcp.json を生成中..."
cp "$POWER_SRC/mcp.json" "$POWER_DIR/mcp.json"

# 3. registry.json / user-added.json の iconUrl をローカルパスに更新、installed.json を登録
echo "[3/3] Powers 設定を更新中..."
ICON_PATH="$POWER_DIR/icons/ui-review.png"
REGISTRY_JSON="$HOME/.kiro/powers/registry.json"
USER_ADDED_JSON="$HOME/.kiro/powers/registries/user-added.json"
INSTALLED_JSON="$HOME/.kiro/powers/installed.json"

if command -v python3 &> /dev/null; then
  python3 -c "
import json, os

icon_path = '$ICON_PATH'

# registry.json の iconUrl 更新
reg_path = '$REGISTRY_JSON'
if os.path.exists(reg_path):
    with open(reg_path) as f:
        data = json.load(f)
    if 'ui-review' in data.get('powers', {}):
        data['powers']['ui-review']['iconUrl'] = icon_path
        with open(reg_path, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print('  → registry.json 更新完了')

# user-added.json の iconUrl 更新
ua_path = '$USER_ADDED_JSON'
if os.path.exists(ua_path):
    with open(ua_path) as f:
        data = json.load(f)
    for p in data.get('powers', []):
        if p.get('name') == 'ui-review':
            p['iconUrl'] = icon_path
    with open(ua_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print('  → user-added.json 更新完了')

# installed.json に ui-review を登録
inst_path = '$INSTALLED_JSON'
if os.path.exists(inst_path):
    with open(inst_path) as f:
        data = json.load(f)
    names = [p.get('name') for p in data.get('installedPowers', [])]
    if 'ui-review' not in names:
        data['installedPowers'].append({'name': 'ui-review', 'registryId': 'user-added'})
        with open(inst_path, 'w') as f:
            json.dump(data, f, indent=2)
        print('  → installed.json 登録完了')
    else:
        print('  → installed.json: 既に登録済み')
"
else
  echo "警告: python3 が見つかりません。Powers 設定を手動で更新してください。"
fi

echo ""
echo "=== インストール完了 ==="
echo "npx ui-review-mcp で MCP サーバーが起動します。"
echo "Kiro を再起動すると ui-review Power が利用可能になります。"
