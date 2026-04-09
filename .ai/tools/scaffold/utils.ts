/**
 * Scaffold CLI — 工具函数
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/** camelCase → UPPER_SNAKE_CASE: contractStatus → CONTRACT_STATUS */
export function toUpperSnake(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}

/** 首字母小写: Contract → contract */
export function lcFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** HTTP 方法 → 后缀: 'GET' → 'ByGet' */
export function httpSuffix(method: string): string {
  const m = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
  return `By${m}`;
}

/** 生成枚举 options 代码: 'ContractStatus' → Object.entries(CONTRACT_STATUS_MAP).map(...) */
export function enumOptionsCode(enumName: string): string {
  const mapName = `${toUpperSnake(enumName)}_MAP`;
  return `Object.entries(${mapName}).map(([value, label]) => ({ value, label }))`;
}

/** 缩进每一行 */
export function indent(code: string, level: number): string {
  const prefix = '  '.repeat(level);
  return code
    .split('\n')
    .map((line) => (line.trim() ? prefix + line : ''))
    .join('\n');
}

/** 生成 JSDoc 注释 */
export function jsdoc(desc: string): string {
  return `/** ${desc} */`;
}

/** 自动创建目录并写入文件 */
export function writeFileWithDir(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

/** 尝试用 prettier 格式化（失败不阻断） */
export function tryPrettier(filePath: string): boolean {
  try {
    execSync(`npx prettier --write "${filePath}"`, {
      stdio: 'pipe',
      timeout: 10000,
    });
    return true;
  } catch {
    return false;
  }
}
