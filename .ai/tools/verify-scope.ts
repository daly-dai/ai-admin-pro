/**
 * verify-scope.ts -- 输出锁工程化软告警（O6）
 *
 * 功能: 检查 git diff 中的变更文件，跨模块修改或全局配置修改时输出告警
 * 用法: pnpm verify:scope
 *
 * 规则:
 * - 同一 src/pages/{module}/ + src/api/{module}/ 下的文件 → 允许
 * - 跨模块修改 → 告警（不阻断）
 * - 修改 src/plugins/ / src/router/ / 全局配置文件 → 告警（不阻断）
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const SENSITIVE_PREFIXES = ['src/plugins/', 'src/router/'];

const SENSITIVE_FILES = [
  'tsconfig.json',
  'package.json',
  'eslint.config',
  'rsbuild.config',
  '.env',
];

// ─── Helpers ────────────────────────────────────────────

function getChangedFiles(): string[] {
  const files = new Set<string>();

  // Unstaged changes
  try {
    const output = execSync('git diff --name-only', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    output
      .trim()
      .split('\n')
      .filter(Boolean)
      .forEach((f) => files.add(f.replace(/\\/g, '/')));
  } catch {
    /* no git or no changes */
  }

  // Staged changes
  try {
    const output = execSync('git diff --name-only --cached', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    output
      .trim()
      .split('\n')
      .filter(Boolean)
      .forEach((f) => files.add(f.replace(/\\/g, '/')));
  } catch {
    /* no git or no changes */
  }

  // Untracked files
  try {
    const output = execSync('git ls-files --others --exclude-standard', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    output
      .trim()
      .split('\n')
      .filter(Boolean)
      .forEach((f) => files.add(f.replace(/\\/g, '/')));
  } catch {
    /* ignore */
  }

  return Array.from(files);
}

/** 从文件路径提取业务模块名 (src/pages/xxx/ 或 src/api/xxx/) */
function extractModule(filePath: string): string | null {
  const match = filePath.match(/^src\/(?:pages|api)\/([^/]+)\//);
  return match ? match[1] : null;
}

function isSensitive(filePath: string): boolean {
  if (SENSITIVE_PREFIXES.some((p) => filePath.startsWith(p))) return true;
  if (SENSITIVE_FILES.some((f) => filePath.includes(f))) return true;
  return false;
}

// ─── Main ───────────────────────────────────────────────

const changedFiles = getChangedFiles();

if (changedFiles.length === 0) {
  console.log('Scope check: no changed files');
  process.exit(0);
}

// 按模块分组
const moduleFiles = new Map<string, string[]>();
const sensitiveHits: string[] = [];

for (const file of changedFiles) {
  const mod = extractModule(file);
  if (mod) {
    const list = moduleFiles.get(mod) || [];
    list.push(file);
    moduleFiles.set(mod, list);
  }

  if (isSensitive(file)) {
    sensitiveHits.push(file);
  }
}

let hasWarning = false;

// 跨模块告警
if (moduleFiles.size > 1) {
  hasWarning = true;
  console.log(
    `\nWARNING: cross-module changes detected (${moduleFiles.size} modules)`,
  );
  for (const [mod, files] of moduleFiles) {
    console.log(`  src/pages/${mod}/ (${files.length} files)`);
    for (const f of files) {
      console.log(`    - ${f}`);
    }
  }
}

// 全局配置告警
if (sensitiveHits.length > 0) {
  hasWarning = true;
  console.log('\nWARNING: global config changes detected');
  for (const f of sensitiveHits) {
    console.log(`  - ${f}`);
  }
}

if (!hasWarning) {
  const modNames = Array.from(moduleFiles.keys());
  if (modNames.length === 1) {
    console.log(`Scope check passed: changes in module "${modNames[0]}" only`);
  } else if (modNames.length === 0) {
    console.log(
      `Scope check passed: ${changedFiles.length} file(s), no page module changes`,
    );
  }
}

// 始终 exit 0（软告警，不阻断流程）
process.exit(0);
