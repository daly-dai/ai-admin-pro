/**
 * 解析内核冒烟用例：用 .debug/ 三份回归夹具锁定「已知正确答案」。
 * 期望值来自 2026-06 探针实测（独立于实现的来源：文件字节本身）——
 * 禁止改为从实现推导（防 tautological 用例）。
 * 回归点：theme/indexed 颜色映射保真（v1 曾翻车：白字表头读成黑色）。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseExcelFile } from './parseExcel';

// 测试一律从仓库根运行（npm script / npx vitest），用 cwd 锚定 .debug 夹具目录
const FIXTURES_DIR = resolve(process.cwd(), '.debug');

function readFixture(name: string): File {
  const buffer = readFileSync(resolve(FIXTURES_DIR, name));
  return new File([buffer], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/** 表头首行首格样式快照（独立已知答案的比对点） */
async function headerCell(name: string) {
  const result = await parseExcelFile(readFixture(name));
  return { result, cell: result.sheets[0].rows[0][0] };
}

describe('parseExcelFile 冒烟（.debug 夹具回归）', () => {
  it('测试工具.xlsx：红底白字、等线 14pt，32×15', async () => {
    const { result, cell } = await headerCell('测试工具.xlsx');
    expect(result.fileName).toBe('测试工具.xlsx');
    expect(result.sheets[0].name).toBe('Sheet1');
    expect(result.sheets[0].rowCount).toBe(32);
    expect(result.sheets[0].colCount).toBe(15);
    expect(result.warnings).toEqual([]);
    expect(cell.text).toBe('测试1');
    expect(cell.style.backgroundColor).toBe('#C00000');
    expect(cell.style.fontColor).toBe('#FFFFFF');
    expect(cell.style.fontName).toBe('等线');
    expect(cell.style.fontSize).toBe(14);
  });

  it('标准答案.xlsx：红底白字、等线 11pt，11×3', async () => {
    const { result, cell } = await headerCell('标准答案.xlsx');
    expect(result.sheets[0].colCount).toBe(3);
    expect(cell.style.backgroundColor).toBe('#C00000');
    expect(cell.style.fontColor).toBe('#FFFFFF');
    expect(cell.style.fontSize).toBe(11);
  });

  it('红底黑字.xlsx：黑字 #000000 保真（v1 颜色映射翻车点）', async () => {
    const { result, cell } = await headerCell('红底黑字.xlsx');
    expect(result.sheets[0].colCount).toBe(3);
    expect(cell.style.backgroundColor).toBe('#C00000');
    expect(cell.style.fontColor).toBe('#000000');
    expect(cell.style.fontSize).toBe(11);
  });
});
