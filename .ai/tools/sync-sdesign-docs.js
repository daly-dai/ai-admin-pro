/**
 * 同步 @dalydb/sdesign 组件库 AI 文档
 * 从 node_modules 复制到 .ai/core/，解决 pnpm 软链接问题
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// 源文件路径（pnpm 实际存储位置）
const SOURCE_PATHS = [
  // pnpm 内容寻址存储路径
  path.join(PROJECT_ROOT, 'node_modules/.pnpm'),
];

// 目标文件
const TARGET_FILE = path.join(PROJECT_ROOT, '.ai/core/sdesign-docs.md');

/**
 * 在 pnpm 存储中查找 llms.txt
 */
function findSourceFile() {
  // 尝试直接读取软链接路径（某些环境支持）
  const symlinkPath = path.join(PROJECT_ROOT, 'node_modules/@dalydb/sdesign/ai/llms.txt');
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
  const sdesignDir = entries.find(e => e.startsWith('@dalydb+sdesign@'));
  
  if (!sdesignDir) {
    console.error('❌ 未找到 @dalydb/sdesign 安装包');
    return null;
  }

  const llmsPath = path.join(pnpmDir, sdesignDir, 'node_modules/@dalydb/sdesign/ai/llms.txt');
  
  if (fs.existsSync(llmsPath)) {
    return llmsPath;
  }

  console.error('❌ 未找到 llms.txt 文件');
  return null;
}

/**
 * 同步文档
 */
function syncDocs() {
  console.log('🔄 同步 @dalydb/sdesign AI 文档...\n');

  const sourcePath = findSourceFile();
  
  if (!sourcePath) {
    console.error('同步失败，请检查 @dalydb/sdesign 是否已安装');
    process.exit(1);
  }

  try {
    // 读取源文件
    const content = fs.readFileSync(sourcePath, 'utf8');
    
    // 添加文件头
    const header = `# @dalydb/sdesign 组件库文档

> ⚠️ 本文件由脚本自动生成，请勿手动修改
> 
> 源文件: node_modules/@dalydb/sdesign/ai/llms.txt
> 同步时间: ${new Date().toLocaleString()}
> 版本: ${extractVersion(content)}

---

`;

    const finalContent = header + content;
    
    // 确保目标目录存在
    const targetDir = path.dirname(TARGET_FILE);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // 写入目标文件
    fs.writeFileSync(TARGET_FILE, finalContent, 'utf8');
    
    console.log('✅ 同步成功！');
    console.log(`   源文件: ${sourcePath}`);
    console.log(`   目标文件: ${TARGET_FILE}`);
    console.log(`   文件大小: ${(finalContent.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ 同步失败:', error.message);
    process.exit(1);
  }
}

/**
 * 提取版本号
 */
function extractVersion(content) {
  const match = content.match(/@dalydb\/sdesign v([\d.]+)/);
  return match ? match[1] : 'unknown';
}

// 执行同步
syncDocs();
