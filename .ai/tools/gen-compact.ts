/**
 * gen-compact.ts — 自动生成 compact 指令文件
 *
 * 用法: pnpm compact:gen
 * 从源文件自动合并去重，生成 .ai/compact/manual-{crud,form,detail}.md
 * Compact 文件是构建产物，勿手动编辑。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AI_DIR = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(AI_DIR, '..');
const COMPACT_DIR = path.join(AI_DIR, 'compact');

// ─── Helpers ────────────────────────────────────────────

function readSource(relativePath: string): string {
  const base = relativePath === 'AGENTS.md' ? PROJECT_ROOT : AI_DIR;
  return fs.readFileSync(path.join(base, relativePath), 'utf-8');
}

/** 提取 markdown 中某个 heading 到下一个同级/更高级 heading 之间的内容 */
function extractSection(
  content: string,
  heading: string,
  level: number,
): string {
  const prefix = '#'.repeat(level) + ' ';
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^${prefix}${escaped}[^\n]*$`, 'm');
  const m = content.match(re);
  if (!m || m.index === undefined) return '';

  const start = m.index;
  const after = content.slice(start + m[0].length);
  // 找同级或更高级 heading
  const endRe = new RegExp(`^#{1,${level}} [^#]`, 'm');
  const endM = after.match(endRe);
  const end =
    endM?.index !== undefined
      ? start + m[0].length + endM.index
      : content.length;
  return content.slice(start, end).trim();
}

/** 从组件文档中提取核心 Props 行 */
function extractComponentQuickRef(
  componentFile: string,
  coreProps: string[],
): string {
  const content = readSource(`sdesign/components/${componentFile}`);
  const lines = content.split('\n');

  // 组件标题（第一行）
  const title = (lines[0] || '').replace(/^#\s*/, '').trim();

  // 匹配 "- propName" 或 "- propName?" 开头的行，按 prop 名称去重
  const propLines: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) continue;
    for (const prop of coreProps) {
      if (
        (trimmed.startsWith(`- ${prop}:`) ||
          trimmed.startsWith(`- ${prop}?:`)) &&
        !seen.has(prop)
      ) {
        propLines.push(trimmed);
        seen.add(prop);
        break;
      }
    }
  }

  return `**${title}**\n${propLines.join('\n')}`;
}

/** 提取 AGENTS.md §II 硬约束的精简版本 */
function extractRulesCompact(): string {
  const content = readSource('AGENTS.md');
  const parts: string[] = [];

  // 作用域（1 行引用）
  parts.push(
    '> **新代码**严格遵守硬约束。**修改已有代码**以已有风格为准，新增片段沿用同文件风格。',
  );
  parts.push('');

  // 阻断性要求
  parts.push(
    '> ⛔ 生成 SSearchTable/SForm/SButton/SDetail 代码前，**必须读取** `.ai/sdesign/components/{组件名}.md`。',
  );
  parts.push('');

  // 组件替换表
  const compSection = extractSection(content, '组件使用', 3);
  const compTable = compSection.match(
    /\| 禁止直接使用[\s\S]*?(?=\n\n|\n\|[^|]*场景)/,
  );
  if (compTable) parts.push(compTable[0].trim());
  parts.push('');
  parts.push(
    '> 可直接用: Modal / Modal.confirm / Tag / message / Card / Spin / InputNumber',
  );
  parts.push('');

  // 导入规则表
  const importSection = extractSection(content, '导入规则', 3);
  const importTable = importSection.match(/\| 规则[\s\S]*?(?=\n\n|\n>)/);
  if (importTable) parts.push(importTable[0].trim());
  parts.push('');
  parts.push(
    '> 保底类型: `Record<string, unknown>`，优先推导 `Partial<Entity>`。',
  );
  parts.push('');

  // 全局类型
  parts.push('**全局类型**（`src/types/index.ts`，禁止重复定义）');
  parts.push('- `PageData<T>` — 分页响应 | `PageQuery` — 分页查询基类');
  parts.push(
    '- 模块 types.ts 只定义：`{Entity}` + `{Entity}Query extends PageQuery` + `{Entity}FormData`',
  );
  parts.push('');

  // 验证命令
  parts.push(
    '`pnpm verify`（tsc+eslint+prettier） | `pnpm verify:fix`（自动修复）',
  );

  return parts.join('\n');
}

/** 从错题集中按场景关键词过滤行 */
function extractPitfallsForScene(sceneKeywords: string[]): string {
  const content = readSource('pitfalls/index.md');
  const lines = content.split('\n');
  const result: string[] = [];

  let headerDone = false;
  for (const line of lines) {
    // 表头行
    if (line.startsWith('| 编号')) {
      result.push(line);
      headerDone = false;
      continue;
    }
    if (!headerDone && line.startsWith('| ----')) {
      result.push(line);
      headerDone = true;
      continue;
    }
    // 数据行：按关键词过滤
    if (headerDone && line.startsWith('| P')) {
      if (sceneKeywords.some((kw) => line.includes(kw))) {
        // 去掉"详情"列（最后一列），节省空间
        const cells = line.split('|').filter(Boolean);
        if (cells.length >= 3) {
          result.push(
            `| ${cells
              .slice(0, 3)
              .map((c) => c.trim())
              .join(' | ')} |`,
          );
        }
      }
    }
  }

  return result.length > 2 ? result.join('\n') : '';
}

/** 提取 Level 2 AI 自检清单 */
function extractVerifyChecklist(): string {
  const content = readSource('conventions/verification.md');
  const section = extractSection(content, 'Level 2：AI 自检清单', 3);
  // 只保留 checklist 行
  const lines = section.split('\n').filter((l) => l.startsWith('- ['));
  return lines.join('\n');
}

// ─── Compact 配置 ────────────────────────────────────────

interface CompactConfig {
  pageType: string;
  title: string;
  outputFile: string;
  templateFile: string;
  components: { file: string; coreProps: string[] }[];
  pitfallKeywords: string[];
  outputLock: string;
  fileList: string;
  tokenLimit: number;
}

const CONFIGS: CompactConfig[] = [
  {
    pageType: 'CRUD 列表页',
    title: 'CRUD 列表页一站式指令',
    outputFile: 'manual-crud.md',
    templateFile: 'crud-page.md',
    components: [
      {
        file: 'SSearchTable.md',
        coreProps: [
          'headTitle',
          'tableTitle',
          'requestFn',
          'formProps',
          'tableProps',
          'options',
        ],
      },
      {
        file: 'SForm.md',
        coreProps: ['items', 'columns', 'onFinish', 'required', 'readonly'],
      },
      {
        file: 'SButton.md',
        coreProps: ['actionType', 'compact'],
      },
    ],
    pitfallKeywords: ['列表页', 'Modal', 'Drawer', '所有页面', '确认弹窗'],
    outputLock:
      '`src/api/{module}/` + `src/pages/{module}/` + `specs/{feature}/`',
    fileList:
      'types.ts, api/index.ts, index.tsx, components/{Entity}FormModal.tsx (+ DetailDrawer)',
    tokenLimit: 5000,
  },
  {
    pageType: '独立表单页',
    title: '独立表单页一站式指令',
    outputFile: 'manual-form.md',
    templateFile: 'form-page.md',
    components: [
      {
        file: 'SForm.md',
        coreProps: ['items', 'columns', 'onFinish', 'required', 'readonly'],
      },
      {
        file: 'SButton.md',
        coreProps: ['actionType', 'compact'],
      },
    ],
    pitfallKeywords: ['表单页', '字段联动', '所有页面'],
    outputLock:
      '`src/api/{module}/` + `src/pages/{module}/create.tsx` + `edit.tsx`',
    fileList: 'types.ts, api/index.ts, create.tsx, edit.tsx',
    tokenLimit: 3000,
  },
  {
    pageType: '详情页',
    title: '详情页一站式指令',
    outputFile: 'manual-detail.md',
    templateFile: 'detail-page.md',
    components: [
      {
        file: 'SDetail.md',
        coreProps: [
          'dataSource',
          'items',
          'column',
          'loading',
          'title',
          'desc',
        ],
      },
      {
        file: 'SButton.md',
        coreProps: ['actionType', 'compact'],
      },
    ],
    pitfallKeywords: ['所有页面'],
    outputLock: '`src/api/{module}/` + `src/pages/{module}/detail.tsx`',
    fileList: 'types.ts, api/index.ts, detail.tsx',
    tokenLimit: 2200,
  },
];

// ─── Builder ─────────────────────────────────────────────

function buildCompact(config: CompactConfig): string {
  const date = new Date().toISOString().slice(0, 10);
  const out: string[] = [];

  // Header
  out.push(`# ${config.title}（自动生成 ${date}，勿手动编辑）`);
  out.push('');
  out.push(`> 页面类型: ${config.pageType}`);
  out.push(
    `> 源文件: AGENTS.md§II, templates/${config.templateFile}, sdesign/components/, pitfalls, verification`,
  );
  out.push('');

  // §1 输出锁 + 文件清单
  out.push('## 1. 输出锁 + 文件清单');
  out.push('');
  out.push(`🔒 ${config.outputLock}`);
  out.push('');
  out.push(`文件: ${config.fileList}`);
  out.push('');

  // §2 代码模板
  out.push('## 2. 代码模板');
  out.push('');
  const template = readSource(`templates/${config.templateFile}`);
  // 去掉第一行标题和组件文档引用行，保留实质内容
  const templateContent = template
    .split('\n')
    .filter(
      (l) =>
        !l.startsWith('# ') &&
        !l.match(/^>\s*组件库文档/) &&
        !l.match(/^>\s*完整 Props/),
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  out.push(templateContent);
  out.push('');

  // §3 组件 API 速查
  out.push('## 3. 组件 API 速查');
  out.push('');
  for (const comp of config.components) {
    out.push(extractComponentQuickRef(comp.file, comp.coreProps));
    out.push('');
  }

  // §4 核心规则
  out.push('## 4. 核心规则（AGENTS.md 硬约束摘要）');
  out.push('');
  out.push(extractRulesCompact());
  out.push('');

  // §5 验证清单
  out.push('## 5. 验证清单');
  out.push('');
  const pitfalls = extractPitfallsForScene(config.pitfallKeywords);
  if (pitfalls) {
    out.push('### 错题集');
    out.push('');
    out.push(pitfalls);
    out.push('');
  }
  const checklist = extractVerifyChecklist();
  if (checklist) {
    out.push('### AI 自检');
    out.push('');
    out.push(checklist);
    out.push('');
  }

  out.push('---');
  out.push('> `pnpm verify` 通过后完成。详细信息 → 读取对应源文件。');
  out.push('');

  return out.join('\n');
}

/** 粗略 Token 估算（CJK≈1.5字/token，英文≈4字符/token，混合取 chars/2.5） */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 2.5);
}

// ─── Main ────────────────────────────────────────────────

function main(): void {
  if (!fs.existsSync(COMPACT_DIR)) {
    fs.mkdirSync(COMPACT_DIR, { recursive: true });
  }

  console.log('📦 Generating compact instruction files...\n');

  let allOk = true;
  for (const config of CONFIGS) {
    const content = buildCompact(config);
    const outputPath = path.join(COMPACT_DIR, config.outputFile);
    fs.writeFileSync(outputPath, content, 'utf-8');

    const tokens = estimateTokens(content);
    const status = tokens <= config.tokenLimit ? '✅' : '⚠️ OVER';
    if (tokens > config.tokenLimit) allOk = false;

    console.log(
      `${status} ${config.outputFile} — ${content.length} chars (~${tokens} tokens, limit ${config.tokenLimit})`,
    );
  }

  console.log(`\n📁 Output: .ai/compact/`);
  if (!allOk) {
    console.log('⚠️  部分文件超过 Token 预算，需要进一步精简源文件内容。');
  }
}

main();
