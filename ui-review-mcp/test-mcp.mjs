/**
 * MCPサーバーの疎通確認スクリプト
 *
 * JSON-RPCでサーバーにリクエストを送り、応答を確認する。
 */
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

let stdout = '';
let stderr = '';

server.stdout.on('data', (data) => {
  stdout += data.toString();
});

server.stderr.on('data', (data) => {
  stderr += data.toString();
});

/** JSON-RPCリクエストを送信する */
function send(message) {
  const json = JSON.stringify(message);
  server.stdin.write(json + '\n');
}

/** 指定ミリ秒待つ */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 結果を出力して終了する */
function finish(label) {
  console.log(`\n=== ${label} ===`);
  console.log('stdout:', stdout);
  if (stderr) console.log('stderr:', stderr);
  stdout = '';
  stderr = '';
}

async function main() {
  // 1. initialize
  console.log('--- テスト1: initialize ---');
  send({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '0.1.0' },
    },
  });
  await wait(2000);
  finish('initialize応答');

  // initialized通知
  send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  await wait(500);

  // 2. tools/list
  console.log('\n--- テスト2: tools/list ---');
  send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
  await wait(2000);
  finish('tools/list応答');

  // 3. generate_ui_fix_prompt 疎通確認
  console.log('\n--- テスト3: generate_ui_fix_prompt ---');
  send({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'generate_ui_fix_prompt',
      arguments: {
        reviewContext: 'CTAボタンのコントラスト比が2.1:1でWCAG AA基準を下回る',
        techStack: 'Laravel / Blade / Tailwind CSS',
        screenName: '会員登録画面',
        purpose: '会員登録の完了率改善',
      },
    },
  });
  await wait(2000);
  finish('generate_ui_fix_prompt応答');

  // 4. analyze_ui_image（小さなテスト画像）
  console.log('\n--- テスト4: analyze_ui_image（1x1 PNG） ---');
  // 1x1 赤ピクセルのPNG（最小限のテスト画像）
  const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  send({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'analyze_ui_image',
      arguments: {
        imageBase64: tinyPngBase64,
        mimeType: 'image/png',
        purpose: 'テスト用',
        device: 'desktop',
      },
    },
  });
  await wait(3000);
  finish('analyze_ui_image応答');

  // 5. analyze_ui_url
  console.log('\n--- テスト5: analyze_ui_url ---');
  send({
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'analyze_ui_url',
      arguments: {
        url: 'https://example.com',
        device: 'desktop',
        purpose: 'テスト疎通確認',
      },
    },
  });
  await wait(15000);
  finish('analyze_ui_url応答');

  // 終了
  server.kill();
  console.log('\n=== 全テスト完了 ===');
  process.exit(0);
}

main().catch((err) => {
  console.error('テストエラー:', err);
  server.kill();
  process.exit(1);
});
