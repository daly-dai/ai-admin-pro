/**
 * sync-sdesign-docs.ts -- 同步 @dalydb/sdesign 组件库 AI 文档
 *
 * 将 node_modules 内 @dalydb/sdesign 包自带的 ai/ 目录镜像复制到 .ai/sdesign/，
 * 保持 AGENTS.md 检查清单依赖的组件文档与真实安装版本一致。
 *
 * 历史：原同名脚本于 2026-06-07 提交 f51ca16 被删除（连同 postinstall 钩子），
 * 导致 .ai/sdesign 停留在 v1.11.0 拷贝而依赖已升至 1.15.0。
 * 2026-09-07 按原语义恢复重建（只恢复手动命令，不恢复 postinstall 自动钩子）。
 *
 * 用法（package.json scripts）:
 *   pnpm sync-ai-docs            # 全量镜像同步（覆盖 .ai/sdesign，删除本地多余文件）
 *   pnpm sync-ai-docs --check    # 只校验差异：有漂移则退出码 1（供 pnpm verify 前置调用）
 *   # 退出码: 0=一致/同步成功  1=有漂移(--check)  2=未找到 @dalydb/sdesign 的 ai 目录
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TARGET_DIR = path.join(PROJECT_ROOT, '.ai', 'sdesign');

/** 查找包内 ai 目录：优先 node_modules 软链直读，其次在 .pnpm 存储中定位 */
function findAiDir(): string | null {
  const direct = path.join(PROJECT_ROOT, 'node_modules', '@dalydb', 'sdesign', 'ai');
  if (fs.existsSync(direct)) return direct;

  const pnpmDir = path.join(PROJECT_ROOT, 'node_modules', '.pnpm');
  if (!fs.existsSync(pnpmDir)) return null;

  const entry = fs.readdirSync(pnpmDir).find((e) => e.startsWith('@dalydb+sdesign@'));
  if (!entry) return null;

  const candidate = path.join(pnpmDir, entry, 'node_modules', '@dalydb', 'sdesign', 'ai');
  return fs.existsSync(candidate) ? candidate : null;
}

/** 收集目录下所有文件，返回 Map<相对路径(/分隔), 绝对路径> */
function collectFiles(root: string): Map<string, string> {
  const result = new Map<string, string>();
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.isFile()) {
        const rel = path.relative(root, abs).split(path.sep).join('/');
        result.set(rel, abs);
      }
    }
  };
  if (fs.existsSync(root)) walk(root);
  return result;
}

function md5(file: string): string {
  return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
}

function main(): void {
  const checkOnly = process.argv.includes('--check');
  const src = findAiDir();
  if (!src) {
    console.error('[sync-ai-docs] 未找到 @dalydb/sdesign 的 ai 文档目录，请先执行 pnpm install');
    process.exit(2);
  }

  const srcFiles = collectFiles(src);
  const localFiles = collectFiles(TARGET_DIR);

  const diffs: string[] = [];
  for (const [rel, abs] of srcFiles) {
    const local = localFiles.get(rel);
    if (!local) diffs.push('缺失: ' + rel);
    else if (md5(abs) !== md5(local)) diffs.push('不一致: ' + rel);
  }
  for (const rel of localFiles.keys()) {
    if (!srcFiles.has(rel)) diffs.push('多余(本地独有): ' + rel);
  }

  if (checkOnly) {
    if (diffs.length > 0) {
      console.error('[sync-ai-docs] .ai/sdesign 与 @dalydb/sdesign ai/ 存在 ' + diffs.length + ' 处差异：');
      diffs.slice(0, 20).forEach((d) => console.error('  - ' + d));
      if (diffs.length > 20) console.error('  ...（其余 ' + (diffs.length - 20) + ' 处略）');
      console.error('请先运行: pnpm sync-ai-docs');
      process.exit(1);
    }
    console.log('[sync-ai-docs] 文档与包内 ai/ 一致（' + srcFiles.size + ' 份）');
    process.exit(0);
  }

  // 镜像同步：覆盖复制 + 删除本地多余文件
  for (const [rel, abs] of srcFiles) {
    const dest = path.join(TARGET_DIR, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(abs, dest);
  }
  for (const rel of localFiles.keys()) {
    if (!srcFiles.has(rel)) fs.rmSync(path.join(TARGET_DIR, rel), { force: true });
  }
  console.log('[sync-ai-docs] 已同步 ' + srcFiles.size + ' 份文档到 .ai/sdesign（镜像自 @dalydb/sdesign 包内 ai/）');
  process.exit(0);
}

main();
