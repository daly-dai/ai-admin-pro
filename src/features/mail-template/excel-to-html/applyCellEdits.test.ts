/**
 * applyCellEdits 测试（Task 2 · TDD）。
 * 期望值来源：.debug 夹具原始解析结果（独立已知答案）——回写后除目标单元格值外，
 * 文本与样式必须 100% 不变（PRD 功能四/七：在线编辑仅改值、样式保真）。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { applyCellEdits, type CellEdit } from './applyCellEdits';
import { parseExcelFile } from './parseExcel';
import type { ExcelCell, ExcelParseResult } from './types';

const FIXTURES_DIR = resolve(process.cwd(), '.debug');

function readFixtureBuffer(name: string): ArrayBuffer {
  const buffer = readFileSync(resolve(FIXTURES_DIR, name));
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

async function parseFile(
  fileBuffer: ArrayBuffer,
  name: string,
): Promise<ExcelParseResult> {
  return parseExcelFile(
    new File([fileBuffer], name, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  );
}

/** 单格比对（抽取以控嵌套深度）：样式必须全等；文本仅在标注格不同 */
function expectCellAsExpected(
  expectedCell: ExcelCell,
  actualCell: ExcelCell,
  change: { text: string; kind?: ExcelCell['kind'] } | undefined,
): void {
  expect(actualCell.style).toEqual(expectedCell.style);
  if (change) {
    expect(actualCell.text).toBe(change.text);
    if (change.kind) {
      expect(actualCell.kind).toBe(change.kind);
    }
    return;
  }
  expect(actualCell.text).toBe(expectedCell.text);
}

/** 全表比对：样式逐格相等；文本仅在 changed 标注格不同（changed 值 = 期望新文本/kind） */
function assertTextAndStyleUnchanged(
  expected: ExcelParseResult,
  actual: ExcelParseResult,
  changed: Map<string, { text: string; kind?: ExcelCell['kind'] }>,
): void {
  const expectedSheet = expected.sheets[0];
  const actualSheet = actual.sheets[0];
  expect(actualSheet.rowCount).toBe(expectedSheet.rowCount);
  expect(actualSheet.colCount).toBe(expectedSheet.colCount);
  for (let row = 0; row < expectedSheet.rows.length; row += 1) {
    for (let col = 0; col < expectedSheet.rows[row].length; col += 1) {
      expectCellAsExpected(
        expectedSheet.rows[row][col],
        actualSheet.rows[row][col],
        changed.get(`${row},${col}`),
      );
    }
  }
}

describe('applyCellEdits（exceljs 值回写，样式保真）', () => {
  it('文本+数值双编辑：仅目标格值变，样式全表 100% 保留（测试工具.xlsx）', async () => {
    const name = '测试工具.xlsx';
    const original = await parseFile(readFixtureBuffer(name), name);
    const edited = await applyCellEdits(readFixtureBuffer(name), [
      { row: 0, col: 0, value: '改后' },
      { row: 0, col: 1, value: 2024 },
    ]);
    const after = await parseFile(edited, name);
    assertTextAndStyleUnchanged(
      original,
      after,
      new Map([
        ['0,0', { text: '改后' }],
        ['0,1', { text: '2024', kind: 'number' }],
      ]),
    );
    expect(after.warnings).toEqual([]);
    // 表头样式抽查：红底白字仍在
    expect(after.sheets[0].rows[0][0].style).toMatchObject({
      backgroundColor: '#C00000',
      fontColor: '#FFFFFF',
    });
  });

  it('红底黑字.xlsx：黑字样式回写后不变（v1 颜色翻车点回归）', async () => {
    const name = '红底黑字.xlsx';
    const original = await parseFile(readFixtureBuffer(name), name);
    const edited = await applyCellEdits(readFixtureBuffer(name), [
      { row: 0, col: 0, value: '黑字改后' },
    ]);
    const after = await parseFile(edited, name);
    assertTextAndStyleUnchanged(
      original,
      after,
      new Map([['0,0', { text: '黑字改后' }]]),
    );
    expect(after.sheets[0].rows[0][0].style).toMatchObject({
      backgroundColor: '#C00000',
      fontColor: '#000000',
    });
  });

  it('空编辑列表：导出往返后与原始完全一致', async () => {
    const name = '标准答案.xlsx';
    const original = await parseFile(readFixtureBuffer(name), name);
    const roundTrip = await applyCellEdits(readFixtureBuffer(name), []);
    const after = await parseFile(roundTrip, name);
    assertTextAndStyleUnchanged(original, after, new Map());
  });

  it('越界编辑（行/列）→ 抛可读错误', async () => {
    const name = '测试工具.xlsx';
    const buffer = readFixtureBuffer(name);
    await expect(
      applyCellEdits(buffer, [{ row: 99, col: 0, value: 'x' }]),
    ).rejects.toThrow('越界');
    await expect(
      applyCellEdits(buffer, [{ row: 0, col: 99, value: 'x' }]),
    ).rejects.toThrow('越界');
  });

  it('非法类型值（非文本/数值）→ 抛错', async () => {
    const name = '测试工具.xlsx';
    const buffer = readFixtureBuffer(name);
    await expect(
      applyCellEdits(buffer, [
        { row: 0, col: 0, value: true } as unknown as CellEdit,
      ]),
    ).rejects.toThrow('仅支持文本或数值');
  });
});
