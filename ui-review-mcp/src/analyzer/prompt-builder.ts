/**
 * レビュー用プロンプト生成
 *
 * ホスト側LLMが画像やDOM情報を解釈するための
 * 構造化されたプロンプトを組み立てる。
 * このモジュール自身はUIの問題を断定しない。
 */
import type {
  DeviceType,
  DomSnapshot,
  AccessibilityViolation,
} from '../types.js';

/** レビュープロンプト生成の入力 */
interface ReviewPromptParams {
  device: DeviceType;
  purpose?: string;
  domSnapshot?: DomSnapshot;
  accessibilityViolations?: AccessibilityViolation[];
}

/**
 * 画像レビュー用のプロンプトを生成する
 *
 * ホスト側LLMに「何を見て、何を出力すべきか」を指示する。
 */
export function buildReviewPrompt(params: ReviewPromptParams): string {
  const sections: string[] = [];

  // 基本指示
  sections.push(buildBaseInstruction(params.device, params.purpose));

  // DOM情報がある場合は補足として追加
  if (params.domSnapshot) {
    sections.push(buildDomSection(params.domSnapshot));
  }

  // アクセシビリティ違反がある場合は補足として追加
  if (params.accessibilityViolations && params.accessibilityViolations.length > 0) {
    sections.push(buildAccessibilitySection(params.accessibilityViolations));
  }

  // 出力フォーマット指示
  sections.push(buildOutputFormatInstruction());

  return sections.join('\n\n');
}

/**
 * 基本指示セクション
 */
function buildBaseInstruction(device: DeviceType, purpose?: string): string {
  const deviceLabel = device === 'mobile' ? 'モバイル' : 'デスクトップ';
  const purposeText = purpose
    ? `この画面の目的は「${purpose}」です。`
    : 'この画面の目的は明示されていません。画面内容から推測してください。';

  return `## UIレビュー指示

添付されたスクリーンショットを分析し、UIの問題点を整理してください。

- 対象デバイス: ${deviceLabel}（${device === 'mobile' ? '375x812' : '1440x900'}）
- ${purposeText}

### 評価軸（以下の4軸で評価してください）
1. **視認性**: コントラスト、フォントサイズ、色使い、可読性
2. **情報構造**: 見出し階層、グルーピング、余白の一貫性、情報の優先度
3. **操作導線**: CTA配置、ナビゲーション、ユーザーフロー、タップ/クリック領域
4. **入力負荷**: フォーム設計、ステップ数、ラベルの明確さ、エラー表示`;
}

/**
 * DOM情報セクション
 */
function buildDomSection(dom: DomSnapshot): string {
  const headingList = dom.headings.length > 0
    ? dom.headings.map((h) => `  - h${h.level}: ${h.text}`).join('\n')
    : '  - 見出しなし';

  const formList = dom.forms.length > 0
    ? dom.forms.map((f) => `  - action="${f.action}" フィールド数: ${f.fields}`).join('\n')
    : '  - フォームなし';

  return `## 補足: DOM情報（自動取得）

- ページタイトル: ${dom.title || '(なし)'}
- lang属性: ${dom.lang || '(未設定)'}
- meta viewport: ${dom.metaViewport || '(未設定)'}
- リンク数: ${dom.links}
- ボタン数: ${dom.buttons}
- 画像: 全${dom.images.total}件 / alt未設定${dom.images.withoutAlt}件

### 見出し構造
${headingList}

### フォーム
${formList}`;
}

/**
 * アクセシビリティ検査結果セクション
 */
function buildAccessibilitySection(violations: AccessibilityViolation[]): string {
  const violationList = violations
    .slice(0, 10) // 上位10件に絞る
    .map((v) => `  - [${v.impact}] ${v.id}: ${v.description}（該当${v.nodes}箇所）`)
    .join('\n');

  return `## 補足: アクセシビリティ検査結果（axe-core）

検出された違反（上位10件）:
${violationList}`;
}

/**
 * 出力フォーマット指示
 */
function buildOutputFormatInstruction(): string {
  return `## 出力フォーマット

以下の2つの形式で出力してください。

### 1. 人間向け要約
- 重大な問題を3件程度に絞って記述
- 各問題に優先度（critical / major / minor）を付与
- なぜ直すべきかの理由を簡潔に
- まず着手すべき改善を明示

### 2. 実装AI向け改善プロンプト
以下の項目を含む、そのまま実装AIに渡せる粒度の指示を生成してください:
- 対象画面
- 目的
- 問題点（具体的な場所と内容）
- 修正方針（抽象的でなく、変更対象・意図・期待結果が分かる形）
- 制約
- 完了条件

「見やすくしてください」「使いやすくしてください」のような曖昧な表現は避け、
変更対象・意図・制約・期待結果が明確な指示にしてください。`;
}
