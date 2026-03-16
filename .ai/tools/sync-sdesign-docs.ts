/**
 * 同步 @dalydb/sdesign 组件库 AI 文档
 * 从 node_modules 复制到 .ai/sdesign/，镜像 ai/ 目录的完整结构
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// 目标目录
const TARGET_DIR = path.join(PROJECT_ROOT, '.ai/sdesign');

/**
 * 在 pnpm 存储中查找 @dalydb/sdesign 的 ai 目录
 */
function findAiDir(): string | null {
  // 尝试直接读取软链接路径
  const symlinkPath = path.join(
    PROJECT_ROOT,
    'node_modules/@dalydb/sdesign/ai',
  );
  if (fs.existsSync(symlinkPath)) {
    return symlinkPath;
  }

  // 在 .pnpm 目录中搜索
  const pnpmDir = path.join(PROJECT_ROOT, 'node_modules/.pnpm');
  if (!fs.existsSync(pnpmDir)) {
    console.error('❌ 未找到 pnpm 存储目录');
    return null;
  }

  // 查找 @dalydb+sdesign@ 开头的目录
  const entries = fs.readdirSync(pnpmDir);
  const sdesignDir = entries.find((e) => e.startsWith('@dalydb+sdesign@'));

  if (!sdesignDir) {
    console.error('❌ 未找到 @dalydb/sdesign 安装包');
    return null;
  }

  const aiDir = path.join(
    pnpmDir,
    sdesignDir,
    'node_modules/@dalydb/sdesign/ai',
  );

  if (fs.existsSync(aiDir)) {
    return aiDir;
  }

  console.error('❌ 未找到 ai 文档目录');
  return null;
}

/**
 * 递归复制目录
 */
function copyDirSync(src: string, dest: string): number {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  let fileCount = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fileCount += copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      fileCount++;
    }
  }

  return fileCount;
}

/**
 * 提取版本号
 */
function extractVersion(aiDir: string): string {
  const llmsPath = path.join(aiDir, 'llms.txt');
  if (!fs.existsSync(llmsPath)) return 'unknown';
  const content = fs.readFileSync(llmsPath, 'utf8');
  const match = content.match(/@dalydb\/sdesign v([\d.]+)/);
  return match ? match[1] : 'unknown';
}

/**
 * 同步文档
 */
function syncDocs(): void {
  console.log('🔄 同步 @dalydb/sdesign AI 文档...\n');

  const aiDir = findAiDir();

  if (!aiDir) {
    console.error('同步失败，请检查 @dalydb/sdesign 是否已安装');
    process.exit(1);
  }

  console.log(`   源目录: ${aiDir}`);

  try {
    // 清理旧的目标目录，确保完全同步
    if (fs.existsSync(TARGET_DIR)) {
      fs.rmSync(TARGET_DIR, { recursive: true });
    }

    // 递归复制整个 ai 目录到 .ai/sdesign/
    const fileCount = copyDirSync(aiDir, TARGET_DIR);

    console.log(`   目标目录: ${TARGET_DIR}`);
    console.log(`   同步文件数: ${fileCount}`);
    console.log(`   版本: ${extractVersion(aiDir)}`);

    console.log('\n✅ 同步成功！');
  } catch (error) {
    console.error('❌ 同步失败:', (error as Error).message);
    process.exit(1);
  }
}

// 执行同步
syncDocs();
