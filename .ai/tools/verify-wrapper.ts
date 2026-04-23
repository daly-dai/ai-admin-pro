/**
 * verify-wrapper.ts -- pnpm verify 增强包装器（O2 第一层飞轮）
 *
 * 功能: 执行 tsc + eslint + prettier，同时将错误自动追加到 .ai/error-log/raw.jsonl
 * 用法: pnpm verify（已替换原始 verify 脚本）
 *
 * 设计原则:
 * - 对开发者和 AI 完全透明（输出与原 verify 一致）
 * - 错误日志追加是零成本副作用，不影响原有流程
 * - raw.jsonl 仅追加，不修改已有记录
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const ERROR_LOG_DIR = path.join(PROJECT_ROOT, '.ai', 'error-log');
const RAW_JSONL = path.join(ERROR_LOG_DIR, 'raw.jsonl');

// ─── Types ──────────────────────────────────────────────

interface ErrorEntry {
  timestamp: string;
  file: string;
  line?: number;
  col?: number;
  rule: string;
  message: string;
  tool: 'tsc' | 'eslint' | 'prettier';
}

// ─── Helpers ────────────────────────────────────────────

function ensureLogDir(): void {
  if (!fs.existsSync(ERROR_LOG_DIR)) {
    fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

function appendErrors(entries: ErrorEntry[]): void {
  if (entries.length === 0) return;
  ensureLogDir();
  const lines = entries.map((e) => JSON.stringify(e)).join('\n') + '\n';
  fs.appendFileSync(RAW_JSONL, lines, 'utf-8');
}

// ─── Parsers ────────────────────────────────────────────

/** 解析 tsc 错误: src/file.tsx(10,5): error TS2322: message */
function parseTscErrors(output: string): ErrorEntry[] {
  const entries: ErrorEntry[] = [];
  const ts = today();
  const re = /^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(output)) !== null) {
    entries.push({
      timestamp: ts,
      file: normalizePath(m[1].trim()),
      line: parseInt(m[2], 10),
      col: parseInt(m[3], 10),
      rule: m[4],
      message: m[5].trim(),
      tool: 'tsc',
    });
  }
  return entries;
}

/** 解析 eslint stylish 格式输出 */
function parseEslintErrors(output: string): ErrorEntry[] {
  const entries: ErrorEntry[] = [];
  const ts = today();
  let currentFile = '';

  for (const line of output.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 跳过汇总行
    if (trimmed.startsWith('\u2716') || /^\d+\s+problem/.test(trimmed))
      continue;

    // 文件路径行: 不以空格开头、不是汇总
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      currentFile = normalizePath(trimmed);
      // 转为相对路径
      const projectPrefix = normalizePath(PROJECT_ROOT) + '/';
      if (currentFile.startsWith(projectPrefix)) {
        currentFile = currentFile.slice(projectPrefix.length);
      }
      continue;
    }

    // 错误行:   10:5  error  message  rule-name
    const errorMatch = trimmed.match(
      /^(\d+):(\d+)\s+(error|warning)\s+(.+?)\s{2,}(\S+)$/,
    );
    if (errorMatch && currentFile) {
      entries.push({
        timestamp: ts,
        file: currentFile,
        line: parseInt(errorMatch[1], 10),
        col: parseInt(errorMatch[2], 10),
        rule: errorMatch[5],
        message: errorMatch[4].trim(),
        tool: 'eslint',
      });
    }
  }
  return entries;
}

/** 解析 prettier --check 输出: [warn] src/file.tsx */
function parsePrettierErrors(output: string): ErrorEntry[] {
  const entries: ErrorEntry[] = [];
  const ts = today();
  const re = /^\[warn\]\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(output)) !== null) {
    entries.push({
      timestamp: ts,
      file: normalizePath(m[1].trim()),
      rule: 'prettier/format',
      message: 'File is not formatted',
      tool: 'prettier',
    });
  }
  return entries;
}

// ─── Main ───────────────────────────────────────────────

const commands: Array<{
  name: string;
  cmd: string;
  parser: (output: string) => ErrorEntry[];
}> = [
  { name: 'tsc', cmd: 'tsc --noEmit', parser: parseTscErrors },
  { name: 'eslint', cmd: 'eslint src/', parser: parseEslintErrors },
  {
    name: 'prettier',
    cmd: 'prettier --check src/',
    parser: parsePrettierErrors,
  },
];

let hasError = false;

for (const { cmd, parser } of commands) {
  try {
    const result = execSync(cmd, {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    // 成功时转发输出（与原 verify 行为一致）
    if (result) process.stdout.write(result);
  } catch (err: unknown) {
    hasError = true;
    const execErr = err as { stdout?: string; stderr?: string };
    const stdout = execErr.stdout || '';
    const stderr = execErr.stderr || '';

    // 转发输出到终端（与原 verify 行为一致）
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);

    // 解析并记录错误（静默副作用）
    try {
      const entries = parser(stdout + '\n' + stderr);
      appendErrors(entries);
    } catch {
      // 日志写入失败不应影响 verify 本身
    }

    // 第一个失败即停止（复制 && 链行为）
    break;
  }
}

if (hasError) {
  // 输出日志统计提示
  try {
    if (fs.existsSync(RAW_JSONL)) {
      const lineCount = fs
        .readFileSync(RAW_JSONL, 'utf-8')
        .trim()
        .split('\n')
        .filter(Boolean).length;
      console.log(
        `\n[verify-wrapper] errors appended to .ai/error-log/raw.jsonl (total: ${lineCount})`,
      );
    }
  } catch {
    // ignore
  }
  process.exit(1);
}
