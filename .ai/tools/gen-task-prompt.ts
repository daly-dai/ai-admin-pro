/**
 * Task Prompt 生成器
 * 从 spec.md + progress.md 自动组装自包含 prompt，用于 DeepSeek-V3 分步执行
 *
 * 用法:
 *   pnpm task:prompt <feature>            # 自动找下一个 Level 1 = ⬜ 的 Task
 *   pnpm task:prompt <feature> --task 3   # 指定 Task 编号
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const AI_DIR = path.join(PROJECT_ROOT, '.ai');

// ─── 类型定义 ───

interface TaskInfo {
  number: number;
  title: string;
  type: string;
  rawContent: string;
}

interface FileMapping {
  templates: string[];
  sdesign: string[];
}

// ─── Task 类型到文件的映射表 ───

const TYPE_FILE_MAP: Record<string, FileMapping> = {
  api: {
    templates: ['templates/api-module.md'],
    sdesign: [],
  },
  'page-list': {
    templates: ['templates/crud-page.md'],
    sdesign: [
      'sdesign/components/SSearchTable.md',
      'sdesign/components/SButton.md',
    ],
  },
  'page-form': {
    templates: ['templates/form-page.md'],
    sdesign: ['sdesign/components/SForm.md', 'sdesign/components/SButton.md'],
  },
  'page-detail': {
    templates: ['templates/detail-page.md'],
    sdesign: ['sdesign/components/SDetail.md', 'sdesign/components/SButton.md'],
  },
};

// ─── 工具函数 ───

function readFileOrNull(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function readAiFile(relativePath: string): string | null {
  return readFileOrNull(path.join(AI_DIR, relativePath));
}

function readProjectFile(relativePath: string): string | null {
  return readFileOrNull(path.join(PROJECT_ROOT, relativePath));
}

function fail(message: string): never {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

// ─── Step 1: 解析 spec.md ───

function parseTasks(specContent: string): TaskInfo[] {
  const tasks: TaskInfo[] = [];
  // 按 ### Task N: 分割
  const taskRegex = /### Task (\d+):\s*(.+)/g;
  const matches = [...specContent.matchAll(taskRegex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const number = parseInt(match[1], 10);
    const title = match[2].trim();

    // 截取从当前 Task 标题到下一个 Task 标题（或文件末尾）之间的内容
    const startIdx = match.index!;
    const endIdx =
      i + 1 < matches.length ? matches[i + 1].index! : specContent.length;
    const rawContent = specContent.slice(startIdx, endIdx).trim();

    // 提取类型
    const typeMatch = rawContent.match(/\*\*类型\*\*:\s*(\S+)/);
    const type = typeMatch ? typeMatch[1] : 'unknown';

    tasks.push({ number, title, type, rawContent });
  }

  return tasks;
}

function extractModule(specContent: string): string {
  // 从文件清单路径推断模块名: src/api/contract/ → contract
  const pathMatch = specContent.match(/src\/api\/(\w+)\//);
  return pathMatch ? pathMatch[1] : 'unknown';
}

// ─── Step 2: 解析 progress.md ───

interface ProgressInfo {
  targetTask: number | null;
  total: number;
  completed: number;
  remaining: number;
}

function parseProgress(
  progressContent: string,
  specifiedTask?: number,
): ProgressInfo {
  const lines = progressContent.split('\n');
  let total = 0;
  let completed = 0;
  let firstPending: number | null = null;

  for (const line of lines) {
    const rowMatch = line.match(
      /^\|\s*(\d+)\s*\|.*?\|\s*(⬜|🟡|🟢|✅|🔴)\s*\|/,
    );
    if (!rowMatch) continue;

    total++;
    const taskNum = parseInt(rowMatch[1], 10);
    const status = rowMatch[2];

    if (status !== '⬜') {
      completed++;
    } else if (firstPending === null) {
      firstPending = taskNum;
    }
  }

  const targetTask = specifiedTask !== undefined ? specifiedTask : firstPending;
  return { targetTask, total, completed, remaining: total - completed };
}

// ─── Step 3-5: 收集文件内容 ───

function collectContext(
  task: TaskInfo,
  module: string,
  feature: string,
  progress: ProgressInfo,
): string {
  const sections: string[] = [];

  // --- Task 信息 ---
  sections.push(`## Task 信息\n\n${task.rawContent}`);

  // --- 约束规则 ---
  const pitfalls = readAiFile('pitfalls/index.md');
  const codingStandards = readAiFile('core/coding-standards.md');
  const constraintParts: string[] = [];

  if (pitfalls) {
    constraintParts.push(pitfalls);
  }
  if (codingStandards) {
    constraintParts.push(codingStandards);
  }

  // api 类型额外包含 api-conventions.md
  if (task.type === 'api') {
    const apiConventions = readAiFile('conventions/api-conventions.md');
    if (apiConventions) {
      constraintParts.push(apiConventions);
    }
  }

  if (constraintParts.length > 0) {
    sections.push(`## 约束规则\n\n${constraintParts.join('\n\n---\n\n')}`);
  }

  // --- 代码模板 ---
  const mapping = TYPE_FILE_MAP[task.type];
  if (mapping) {
    for (const tpl of mapping.templates) {
      const content = readAiFile(tpl);
      if (content) {
        sections.push(`## 代码模板（${path.basename(tpl)}）\n\n${content}`);
      }
    }

    // --- 组件 API 文档 ---
    const sdesignParts: string[] = [];
    for (const doc of mapping.sdesign) {
      const content = readAiFile(doc);
      if (content) {
        sdesignParts.push(`### ${path.basename(doc, '.md')}\n\n${content}`);
      }
    }
    if (sdesignParts.length > 0) {
      sections.push(`## 组件 API 文档\n\n${sdesignParts.join('\n\n')}`);
    }
  } else {
    console.warn(`⚠️  未识别的 Task 类型 "${task.type}"，跳过模板和组件文档`);
  }

  // --- 已有源码 ---
  const typesContent = readProjectFile(`src/api/${module}/types.ts`);
  if (typesContent) {
    sections.push(`## 已有类型定义\n\n\`\`\`typescript\n${typesContent}\`\`\``);
  }

  const apiContent = readProjectFile(`src/api/${module}/index.ts`);
  if (apiContent) {
    sections.push(`## 已有 API 定义\n\n\`\`\`typescript\n${apiContent}\`\`\``);
  }

  // --- 验证清单 ---
  const verification = readAiFile('conventions/verification.md');
  if (verification) {
    sections.push(`## 验证清单\n\n${verification}`);
  }

  // --- 执行要求 ---
  const remainingAfter = progress.remaining - 1;
  const nextHint =
    remainingAfter > 0
      ? `\n7. 完成后告知用户：「Task ${task.number} 已完成，剩余 ${remainingAfter} 个 Task。请在新对话中继续执行 pnpm task:prompt ${feature}」`
      : `\n7. 完成后告知用户：「所有 Task 已完成，建议在新对话中执行全量 pnpm verify 做最终验证」`;

  sections.push(`## 执行要求

1. 严格按文件清单生成文件，不多不少
2. 严格遵守上方「约束规则」和「代码模板」中的模式
3. 使用 sdesign 组件，禁止直接使用 antd Table/Form/Button/Descriptions
4. 生成后运行 \`pnpm verify\`，最多 3 轮修复
5. verify 通过后，按上方「验证清单」Level 2 自检清单逐条检查，发现问题立即修复
6. 全部通过后更新 \`specs/${feature}/progress.md\` 的 Task ${task.number} Level 1 为 🟡${nextHint}`);

  return sections.join('\n\n');
}

// ─── Step 6: 组装并输出 ───

function assembleAndPrint(context: string, progress: ProgressInfo): void {
  const header = `请根据以下上下文生成代码。所有必要信息已包含在本消息中，无需读取任何文件。`;

  const prompt = `${header}\n\n${context}`;

  const charCount = prompt.length;
  const tokenEstimate = Math.round(charCount * 0.6);
  const remainingAfter = progress.remaining - 1;

  console.log('\n═══════════════ TASK PROMPT START ═══════════════\n');
  console.log(prompt);
  console.log('\n═══════════════ TASK PROMPT END ═══════════════\n');
  console.log(`📋 字数统计: ${charCount} 字符 / 约 ${tokenEstimate} tokens`);
  console.log(
    `📊 当前进度: ${progress.completed}/${progress.total} 已完成，本次执行后剩余 ${remainingAfter} 个 Task`,
  );
  console.log(`💡 使用方式: AI 执行此命令后将根据输出直接生成代码\n`);
}

// ─── 主函数 ───

function main(): void {
  const args = process.argv.slice(2);

  // 解析参数
  const feature = args.find((a) => !a.startsWith('--'));
  if (!feature) {
    fail('请指定 feature 名称\n  用法: pnpm task:prompt <feature> [--task N]');
  }

  let specifiedTask: number | undefined;
  const taskFlagIdx = args.indexOf('--task');
  if (taskFlagIdx !== -1 && args[taskFlagIdx + 1]) {
    specifiedTask = parseInt(args[taskFlagIdx + 1], 10);
    if (isNaN(specifiedTask)) {
      fail('--task 参数必须是数字');
    }
  }

  // 检查 feature 目录
  const specDir = path.join(PROJECT_ROOT, 'specs', feature);
  if (!fs.existsSync(specDir)) {
    fail(`specs/${feature}/ 目录不存在`);
  }

  // 读取 spec.md
  const specPath = path.join(specDir, 'spec.md');
  const specContent = readFileOrNull(specPath);
  if (!specContent) {
    fail(`specs/${feature}/spec.md 不存在`);
  }

  // 读取 progress.md
  const progressPath = path.join(specDir, 'progress.md');
  const progressContent = readFileOrNull(progressPath);
  if (!progressContent) {
    fail(`specs/${feature}/progress.md 不存在`);
  }

  // 解析
  const tasks = parseTasks(specContent);
  if (tasks.length === 0) {
    fail('spec.md 中未找到任何 Task（格式应为 ### Task N: 标题）');
  }

  const module = extractModule(specContent);
  const progress = parseProgress(progressContent, specifiedTask);

  if (progress.targetTask === null) {
    console.log('\n✅ 所有 Task 的 Level 1 均已完成，无待执行 Task。');
    console.log(
      '   如需重新生成某个 Task 的 prompt，请使用 --task N 指定编号。\n',
    );
    process.exit(0);
  }

  const targetTask = tasks.find((t) => t.number === progress.targetTask);
  if (!targetTask) {
    fail(`spec.md 中未找到 Task ${progress.targetTask}`);
  }

  console.log(`\n🔧 Feature: ${feature}`);
  console.log(
    `📌 Task ${targetTask.number}: ${targetTask.title} (${targetTask.type})`,
  );
  console.log(`📦 Module: ${module}`);
  console.log(
    `📊 进度: ${progress.completed}/${progress.total} 已完成，剩余 ${progress.remaining} 个 Task`,
  );

  // 收集上下文并输出
  const context = collectContext(targetTask, module, feature, progress);
  assembleAndPrint(context, progress);
}

main();
