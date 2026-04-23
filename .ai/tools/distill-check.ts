/**
 * distill-check.ts -- 蒸馏漂移检测（AGENTS → LITE 知识覆盖度）
 *
 * 功能: 解析 distill-tracker.md 追踪表，对比 git 修改日期与确认日期，
 *       检测需要重新蒸馏的规则组，同时发现 .ai/ 下未追踪的新文件。
 * 用法: pnpm distill:check
 *
 * 设计: 所有配置从追踪表动态读取，不硬编码规则或文件路径，对架构演化免疫。
 *       软告警（exit 0），永远不修改任何文件。
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { globSync } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TRACKER_PATH = path.resolve(__dirname, '../distill-tracker.md');

// ─── 类型 ────────────────────────────────────────────────

interface TrackerRow {
  group: string;
  sourceRaw: string;
  filePath: string;
  isGlob: boolean;
  priority: string;
  verifiedDate: string;
}

interface DriftResult {
  row: TrackerRow;
  gitDate: string;
}

// ─── 解析 ────────────────────────────────────────────────

/** 从追踪表 Markdown 解析所有 G 行 */
function parseTracker(): TrackerRow[] {
  if (!fs.existsSync(TRACKER_PATH)) {
    console.log('错误：追踪表不存在 → ' + TRACKER_PATH);
    process.exit(1);
  }

  const content = fs.readFileSync(TRACKER_PATH, 'utf-8');
  const lines = content.split('\n');
  const rows: TrackerRow[] = [];

  // 匹配：| G01 | `源文件` | 主题 | 优先级 | ... | 确认日期 |
  const ROW_RE =
    /^\|\s*(G\d{2,})\s*\|\s*`([^`]+)`\s*\|[^|]*\|\s*([^|]*?)\s*\|[^|]*\|[^|]*\|\s*(\d{4}-\d{2}-\d{2})\s*\|/;

  for (const line of lines) {
    const m = line.match(ROW_RE);
    if (!m) continue;

    const [, group, sourceRaw, priority, verifiedDate] = m;
    const { file, isGlob } = resolveSource(sourceRaw);
    rows.push({
      group,
      sourceRaw,
      filePath: file,
      isGlob,
      priority: priority.trim(),
      verifiedDate,
    });
  }

  return rows;
}

/** 源文件路径解析：去掉 # 后缀，检测通配符 */
function resolveSource(raw: string): { file: string; isGlob: boolean } {
  const hashIdx = raw.indexOf('#');
  const filePart = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
  return { file: filePart, isGlob: filePart.includes('*') };
}

// ─── Git 日期 ────────────────────────────────────────────

/** 获取单个文件的 git 最后修改日期（ISO 格式） */
function getGitDate(file: string): string | null {
  try {
    const absPath = path.resolve(PROJECT_ROOT, file);
    if (!fs.existsSync(absPath)) return null;
    const output = execSync(`git log -1 --format=%aI -- "${file}"`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();
    return output || null;
  } catch {
    return null;
  }
}

/** 通配符源（如 .ai/pitfalls/*.md）：取目录下所有匹配文件的最大 git 日期 */
function getMaxGitDate(pattern: string): string | null {
  const matches = globSync(pattern, { cwd: PROJECT_ROOT });
  if (matches.length === 0) return null;

  let maxDate: string | null = null;
  for (const file of matches) {
    const date = getGitDate(file);
    if (date && (!maxDate || date > maxDate)) {
      maxDate = date;
    }
  }
  return maxDate;
}

/** 获取源文件的 git 修改日期（自动处理通配符） */
function getSourceGitDate(row: TrackerRow): string | null {
  return row.isGlob ? getMaxGitDate(row.filePath) : getGitDate(row.filePath);
}

// ─── 未追踪检测 ──────────────────────────────────────────

/** 扫描 .ai/ 下的规则文件，找出未在追踪表中的文件 */
function findUntrackedFiles(rows: TrackerRow[]): string[] {
  // 收集追踪表中已追踪的文件路径（去重，展开通配符）
  const tracked = new Set<string>();
  for (const row of rows) {
    if (row.isGlob) {
      const matches = globSync(row.filePath, { cwd: PROJECT_ROOT });
      matches.forEach((f) => tracked.add(f.replace(/\\/g, '/')));
    } else {
      tracked.add(row.filePath.replace(/\\/g, '/'));
    }
  }

  // 扫描范围：.ai/ 下的关键子目录 + 根目录 AGENTS 入口
  // 注意：AGENTS-LITE.md 是蒸馏目标，不作为源文件追踪
  const scanPatterns = [
    '.ai/modes/*.md',
    '.ai/conventions/*.md',
    '.ai/core/*.md',
    '.ai/pitfalls/*.md',
    'AGENTS.md',
  ];

  const allFiles = new Set<string>();
  for (const pattern of scanPatterns) {
    const matches = globSync(pattern, { cwd: PROJECT_ROOT });
    matches.forEach((f) => allFiles.add(f.replace(/\\/g, '/')));
  }

  // 过滤已追踪的
  return Array.from(allFiles)
    .filter((f) => !tracked.has(f))
    .sort();
}

// ─── 主流程 ──────────────────────────────────────────────

const rows = parseTracker();

if (rows.length === 0) {
  console.log('追踪表为空或格式不匹配，请检查 .ai/distill-tracker.md');
  process.exit(0);
}

// 检测漂移
const drifted: DriftResult[] = [];
const unknown: TrackerRow[] = [];
let normalCount = 0;

for (const row of rows) {
  const gitDate = getSourceGitDate(row);

  if (!gitDate) {
    unknown.push(row);
    continue;
  }

  // 比较：git 日期（取前 10 位 YYYY-MM-DD）与确认日期
  const gitDay = gitDate.slice(0, 10);
  if (gitDay > row.verifiedDate) {
    drifted.push({ row, gitDate: gitDay });
  } else {
    normalCount++;
  }
}

// 按优先级排序漂移组（P0 > P1 > -）
const priorityOrder: Record<string, number> = { P0: 0, P1: 1, '-': 2 };
drifted.sort(
  (a, b) =>
    (priorityOrder[a.row.priority] ?? 3) - (priorityOrder[b.row.priority] ?? 3),
);

// 检测未追踪文件
const untracked = findUntrackedFiles(rows);

// ─── 输出报告 ────────────────────────────────────────────

console.log('\n蒸馏漂移检测报告\n');

if (drifted.length > 0) {
  console.log('漂移（源文件在上次确认后有变更）：');
  for (const { row, gitDate } of drifted) {
    const p = row.priority === '-' ? '' : `  [${row.priority}]`;
    console.log(
      `  ${row.group}  ${row.sourceRaw.padEnd(40)}  修改: ${gitDate}  确认: ${row.verifiedDate}${p}`,
    );
  }
  console.log('');
}

if (unknown.length > 0) {
  console.log('未知（源文件无 git 记录或不存在）：');
  for (const row of unknown) {
    console.log(`  ${row.group}  ${row.sourceRaw}`);
  }
  console.log('');
}

if (untracked.length > 0) {
  console.log('未追踪（.ai/ 下的文件不在追踪表中）：');
  for (const f of untracked) {
    console.log(`  ${f}`);
  }
  console.log('');
}

// 汇总
const p0Count = drifted.filter((d) => d.row.priority === 'P0').length;
const p1Count = drifted.filter((d) => d.row.priority === 'P1').length;
const driftSummary =
  drifted.length > 0
    ? `${drifted.length} 组漂移（${p0Count} 个 P0 + ${p1Count} 个 P1）`
    : '0 组漂移';

console.log(
  `汇总：${normalCount}/${rows.length} 组正常 | ${driftSummary} | ${untracked.length} 个未追踪文件`,
);

if (drifted.length > 0) {
  console.log('操作：审查漂移组，按需更新 LITE，然后更新追踪表中的确认日期');
}

// 软告警，不阻断
process.exit(0);
