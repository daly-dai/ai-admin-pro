/**
 * pitfall-scan.ts -- 错误模式聚合器（O2 第二层飞轮）
 *
 * 功能: 读取 .ai/error-log/raw.jsonl，统计高频错误模式，生成 pitfall 草稿
 * 用法: pnpm pitfall:scan
 *
 * 规则: 同一 rule 出现 >= 3 次且不在已有错题集中 → 自动生成草稿到 .ai/error-log/pending/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const ERROR_LOG_DIR = path.join(PROJECT_ROOT, '.ai', 'error-log');
const RAW_JSONL = path.join(ERROR_LOG_DIR, 'raw.jsonl');
const PENDING_DIR = path.join(ERROR_LOG_DIR, 'pending');
const PITFALLS_INDEX = path.join(PROJECT_ROOT, '.ai', 'pitfalls', 'index.md');

const THRESHOLD = 3; // 同一 rule >= 3 次才生成草稿

// ─── Types ──────────────────────────────────────────────

interface ErrorEntry {
  timestamp: string;
  file: string;
  line?: number;
  col?: number;
  rule: string;
  message: string;
  tool: string;
}

interface AggregatedError {
  rule: string;
  tool: string;
  count: number;
  exampleMessage: string;
  exampleFiles: string[];
  latestDate: string;
}

// ─── Helpers ────────────────────────────────────────────

function readRawLog(): ErrorEntry[] {
  if (!fs.existsSync(RAW_JSONL)) return [];
  return fs
    .readFileSync(RAW_JSONL, 'utf-8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as ErrorEntry;
      } catch {
        return null;
      }
    })
    .filter((e): e is ErrorEntry => e !== null);
}

/** 从 pitfalls/index.md 提取已有的规则关键词 */
function getExistingRules(): Set<string> {
  if (!fs.existsSync(PITFALLS_INDEX)) return new Set();
  const content = fs.readFileSync(PITFALLS_INDEX, 'utf-8');
  const rules = new Set<string>();
  // 提取反引号中的标识符（rule name, TS code, component name 等）
  const re = /`([^`]+)`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    rules.add(m[1]);
  }
  return rules;
}

/** 获取当前 pitfalls 中最大的编号 */
function getMaxPitfallId(): number {
  if (!fs.existsSync(PITFALLS_INDEX)) return 0;
  const content = fs.readFileSync(PITFALLS_INDEX, 'utf-8');
  const ids = [...content.matchAll(/P(\d{3})/g)].map((m) => parseInt(m[1], 10));
  return ids.length > 0 ? Math.max(...ids) : 0;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Aggregation ────────────────────────────────────────

function aggregate(entries: ErrorEntry[]): AggregatedError[] {
  const groups = new Map<
    string,
    {
      tool: string;
      count: number;
      message: string;
      files: Set<string>;
      latestDate: string;
    }
  >();

  for (const entry of entries) {
    const key = entry.rule;
    const group = groups.get(key);
    if (group) {
      group.count++;
      group.files.add(entry.file);
      if (entry.timestamp > group.latestDate) {
        group.latestDate = entry.timestamp;
      }
    } else {
      groups.set(key, {
        tool: entry.tool,
        count: 1,
        message: entry.message,
        files: new Set([entry.file]),
        latestDate: entry.timestamp,
      });
    }
  }

  return Array.from(groups.entries())
    .map(([rule, g]) => ({
      rule,
      tool: g.tool,
      count: g.count,
      exampleMessage: g.message,
      exampleFiles: Array.from(g.files).slice(0, 3),
      latestDate: g.latestDate,
    }))
    .sort((a, b) => b.count - a.count);
}

// ─── Draft Generation ───────────────────────────────────

function scenarioLabel(tool: string): string {
  switch (tool) {
    case 'tsc':
      return '类型相关页面';
    case 'prettier':
      return '所有文件';
    default:
      return '所有页面';
  }
}

function generateDraftRow(error: AggregatedError, id: string): string {
  const scenario = scenarioLabel(error.tool);
  const msgPreview =
    error.exampleMessage.length > 50
      ? error.exampleMessage.slice(0, 47) + '...'
      : error.exampleMessage;

  return `| ${id} | ${scenario} | **\`${error.rule}\`** 违反 (${error.count}x): ${msgPreview} | 根据具体场景修复 | -- |`;
}

// ─── Main ───────────────────────────────────────────────

const entries = readRawLog();

if (entries.length === 0) {
  console.log('raw.jsonl is empty, nothing to scan');
  process.exit(0);
}

const existingRules = getExistingRules();
const aggregated = aggregate(entries);

// 输出统计
console.log(`Error log stats (${entries.length} total entries):\n`);
console.log('Top 10 by frequency:');
for (const e of aggregated.slice(0, 10)) {
  const tag = existingRules.has(e.rule) ? ' [in pitfalls]' : '';
  console.log(`  ${String(e.count).padStart(4)}x  ${e.rule}${tag}`);
}

// 筛选候选: 达到阈值 + 不在已有错题集中
const candidates = aggregated.filter(
  (e) => e.count >= THRESHOLD && !existingRules.has(e.rule),
);

if (candidates.length === 0) {
  console.log(
    `\nNo new high-frequency errors (threshold: >= ${THRESHOLD}x, not in pitfalls)`,
  );
  process.exit(0);
}

// 生成草稿
if (!fs.existsSync(PENDING_DIR)) {
  fs.mkdirSync(PENDING_DIR, { recursive: true });
}

let nextId = getMaxPitfallId() + 1;

console.log(`\n${candidates.length} new candidate(s) for pitfalls:\n`);

const draftRows: string[] = [];
for (const candidate of candidates) {
  const id = `P${String(nextId).padStart(3, '0')}`;
  const row = generateDraftRow(candidate, id);
  draftRows.push(row);
  nextId++;

  console.log(`  ${id}: ${candidate.rule} (${candidate.count}x)`);
  console.log(`       files: ${candidate.exampleFiles.join(', ')}`);
  console.log(`       latest: ${candidate.latestDate}`);
}

// 写入草稿文件
const dateStr = today();
const draftFile = path.join(PENDING_DIR, `${dateStr}-draft.md`);
const draftContent = `# Pitfall Draft (${dateStr})

> Auto-generated by \`pnpm pitfall:scan\`. Review and move approved rows to \`.ai/pitfalls/index.md\`.

## Pending Rows

${draftRows.join('\n')}

## Stats

- Total log entries: ${entries.length}
- Frequency threshold: >= ${THRESHOLD}
- New candidates: ${candidates.length}
`;

fs.writeFileSync(draftFile, draftContent, 'utf-8');
console.log(`\nDraft written to: ${path.relative(PROJECT_ROOT, draftFile)}`);
console.log('Review and copy approved rows into .ai/pitfalls/index.md table.');
