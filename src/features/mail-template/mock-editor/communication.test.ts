/**
 * mock 在线编辑通信纯函数之 seam 测试。
 *
 * 只测可独立于 DOM/iframe 验证的纯逻辑：
 *  1. parseFrameMessage —— postMessage 载荷解析与校验（非法/未知消息忽略，合法归一化）；
 *  2. collectCellEdits —— 编辑记录收集（单元格边界 + 值类型守卫：越界/非法值报错）。
 * 不测：mock 编辑页三态渲染（阅读/可编辑/无编辑权限错误页）、跨 frame 实际收发时序（走验收走查）。
 */
import { describe, expect, it } from 'vitest';

import type { ExcelCell } from '../excel-to-html/types';
import {
  collectCellEdits,
  parseFrameMessage,
  type MockEditorMessage,
} from './communication';

/** 构造一个可编辑单元格（文本/数值），便于测试从属合并与类型推导 */
function makeCell(
  text: string,
  kind: ExcelCell['kind'] = 'string',
  isMergedSlave = false,
): ExcelCell {
  return { text, kind, isMergedSlave, style: {} };
}

function makeGrid(): ExcelCell[][] {
  return [
    [makeCell('姓名'), makeCell('分数', 'number')],
    [makeCell('张三'), makeCell('95', 'number')],
    [makeCell('李四'), makeCell('88', 'number')],
  ];
}

describe('parseFrameMessage —— postMessage 载荷解析与校验', () => {
  it('解析合法 init 消息（read 模式）', () => {
    const raw = {
      type: 'init',
      reportId: 'r1',
      fileBase64: 'YWJj',
      mode: 'read',
      canEdit: true,
    };
    expect(parseFrameMessage(raw)).toEqual(raw);
  });

  it('解析合法 init 消息（edit 模式）', () => {
    const raw = {
      type: 'init',
      reportId: 'r2',
      fileBase64: 'eHl6',
      mode: 'edit',
      canEdit: false,
    };
    expect(parseFrameMessage(raw)).toEqual(raw);
  });

  it('解析合法 save-request', () => {
    expect(parseFrameMessage({ type: 'save-request' })).toEqual({
      type: 'save-request',
    });
  });

  it('解析合法 ready', () => {
    expect(parseFrameMessage({ type: 'ready' })).toEqual({ type: 'ready' });
  });

  it('解析合法 saved', () => {
    const raw = { type: 'saved', fileBase64: 'Zm9v', updatedAt: 123456 };
    expect(parseFrameMessage(raw)).toEqual(raw);
  });

  it('解析合法 error', () => {
    const raw = { type: 'error', code: 'NO_EDIT_PERMISSION' };
    expect(parseFrameMessage(raw)).toEqual(raw);
  });

  it('忽略非对象载荷（null/undefined/原始值/数组）', () => {
    expect(parseFrameMessage(null)).toBeNull();
    expect(parseFrameMessage(undefined)).toBeNull();
    expect(parseFrameMessage('hello')).toBeNull();
    expect(parseFrameMessage(123)).toBeNull();
    expect(parseFrameMessage(['init'])).toBeNull();
  });

  it('忽略未知 type', () => {
    expect(parseFrameMessage({ type: 'unknown' })).toBeNull();
  });

  it('忽略 init 中 mode 非法', () => {
    expect(
      parseFrameMessage({
        type: 'init',
        reportId: 'r1',
        fileBase64: 'a',
        mode: 'write',
        canEdit: true,
      }),
    ).toBeNull();
  });

  it('忽略 init 中 canEdit 非布尔', () => {
    expect(
      parseFrameMessage({
        type: 'init',
        reportId: 'r1',
        fileBase64: 'a',
        mode: 'read',
        canEdit: 'true',
      }),
    ).toBeNull();
  });

  it('忽略 saved 缺失 updatedAt', () => {
    expect(parseFrameMessage({ type: 'saved', fileBase64: 'a' })).toBeNull();
  });

  it('忽略 error 缺失 code', () => {
    expect(parseFrameMessage({ type: 'error' })).toBeNull();
  });
});

describe('collectCellEdits —— 编辑记录收集', () => {
  it('收集文本单元格编辑为字符串值', () => {
    const edits = collectCellEdits(makeGrid(), [
      { row: 1, col: 0, input: '王五' },
    ]);
    expect(edits).toEqual([{ row: 1, col: 0, value: '王五' }]);
  });

  it('数值单元格输入转换为 number 值', () => {
    const edits = collectCellEdits(makeGrid(), [
      { row: 1, col: 1, input: '99' },
    ]);
    expect(edits).toEqual([{ row: 1, col: 1, value: 99 }]);
  });

  it('数值单元格输入包含数字分隔符仍转 number', () => {
    const edits = collectCellEdits(makeGrid(), [
      { row: 1, col: 1, input: ' 88 ' },
    ]);
    expect(edits).toEqual([{ row: 1, col: 1, value: 88 }]);
  });

  it('清空数值单元格落为字符串空串', () => {
    const edits = collectCellEdits(makeGrid(), [
      { row: 1, col: 1, input: '   ' },
    ]);
    expect(edits).toEqual([{ row: 1, col: 1, value: '' }]);
  });

  it('越界行/列抛可读错误', () => {
    expect(() =>
      collectCellEdits(makeGrid(), [{ row: 99, col: 0, input: 'x' }]),
    ).toThrowError(/编辑越界/);
    expect(() =>
      collectCellEdits(makeGrid(), [{ row: 0, col: 99, input: 'x' }]),
    ).toThrowError(/编辑越界/);
  });

  it('合并区从属单元格抛可读错误', () => {
    const grid = makeGrid();
    grid[0][0] = makeCell('', 'empty', true);
    expect(() =>
      collectCellEdits(grid, [{ row: 0, col: 0, input: 'x' }]),
    ).toThrowError(/从属单元格/);
  });

  it('数值单元格输入非数字抛可读错误', () => {
    expect(() =>
      collectCellEdits(makeGrid(), [{ row: 1, col: 1, input: 'abc' }]),
    ).toThrowError(/非法数值/);
  });
});

describe('消息类型窄化（编译期形状保障，随用例兜底）', () => {
  it('parseFrameMessage 返回可判定为 MockEditorMessage', () => {
    const message: MockEditorMessage | null = parseFrameMessage({
      type: 'ready',
    });
    expect(message).toEqual({ type: 'ready' });
  });
});
