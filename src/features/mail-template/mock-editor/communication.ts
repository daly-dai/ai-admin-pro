/**
 * mock 在线编辑平台 通信纯函数（Task 5 seam）。
 *
 * 设计：跨 iframe 通信走 postMessage（模拟真实跨域平台，协议见 PRD「postMessage mock 协议」）。
 * 本模块只做**可独立验证的纯逻辑**，与 DOM/iframe 解耦：
 *   - parseFrameMessage：接收端解析/校验载荷，非法或未知消息返回 null（忽略兜底）；
 *   - collectCellEdits：编辑记录收集（单元格边界 + 值类型守卫）。
 * 不承担：iframe 页面渲染、实际 postMessage 收发、service 持久化（父页负责）。
 */

import type { CellEdit } from '../excel-to-html/applyCellEdits';
import type { ExcelCell } from '../excel-to-html/types';

/** mock 编辑模式（PRD：?mode=read|edit） */
export type MockEditorMode = 'read' | 'edit';

/** 父→子：加载时下发报表文件与模式、权限 */
export interface MockEditorInitMessage {
  type: 'init';
  reportId: string;
  fileBase64: string;
  mode: MockEditorMode;
  canEdit: boolean;
}

/** 父→子：发布，请求平台保存并导出 */
export interface MockEditorSaveRequestMessage {
  type: 'save-request';
}

/** 子→父：编辑内容就绪 */
export interface MockEditorReadyMessage {
  type: 'ready';
}

/** 子→父：保存完成，回传最新文件流 */
export interface MockEditorSavedMessage {
  type: 'saved';
  fileBase64: string;
  updatedAt: number;
}

/** 子→父：错误（无编辑权限等） */
export interface MockEditorErrorMessage {
  type: 'error';
  code: string;
}

/** postMessage 消息联合类型（父页面 ⇄ mock 编辑 iframe） */
export type MockEditorMessage =
  | MockEditorInitMessage
  | MockEditorSaveRequestMessage
  | MockEditorReadyMessage
  | MockEditorSavedMessage
  | MockEditorErrorMessage;

/** 校验并归一化 init 载荷 */
function parseInit(
  record: Record<string, unknown>,
): MockEditorInitMessage | null {
  const mode = record.mode;
  if (typeof record.reportId !== 'string') {
    return null;
  }
  if (typeof record.fileBase64 !== 'string') {
    return null;
  }
  if (mode !== 'read' && mode !== 'edit') {
    return null;
  }
  if (typeof record.canEdit !== 'boolean') {
    return null;
  }
  return {
    type: 'init',
    reportId: record.reportId,
    fileBase64: record.fileBase64,
    mode,
    canEdit: record.canEdit,
  };
}

/** 校验并归一化 saved 载荷 */
function parseSaved(
  record: Record<string, unknown>,
): MockEditorSavedMessage | null {
  if (typeof record.fileBase64 !== 'string') {
    return null;
  }
  if (typeof record.updatedAt !== 'number') {
    return null;
  }
  return {
    type: 'saved',
    fileBase64: record.fileBase64,
    updatedAt: record.updatedAt,
  };
}

/** 校验并归一化 error 载荷 */
function parseError(
  record: Record<string, unknown>,
): MockEditorErrorMessage | null {
  if (typeof record.code !== 'string') {
    return null;
  }
  return { type: 'error', code: record.code };
}

/**
 * 解析/校验一条 postMessage 载荷。
 * 非法或未知消息返回 null（调用方忽略，避免 unknown 载荷污染状态）。
 */
export function parseFrameMessage(raw: unknown): MockEditorMessage | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  if (record.type === 'init') {
    return parseInit(record);
  }
  if (record.type === 'save-request') {
    return { type: 'save-request' };
  }
  if (record.type === 'ready') {
    return { type: 'ready' };
  }
  if (record.type === 'saved') {
    return parseSaved(record);
  }
  if (record.type === 'error') {
    return parseError(record);
  }
  return null;
}

/** 一次待收集的单元格编辑（value 为输入框原生字符串，类型由 collect 按原格推导） */
export interface CellEditInput {
  /** 0 起行号 */
  row: number;
  /** 0 起列号 */
  col: number;
  /** 输入框当前文本（原始字符串） */
  input: string;
}

/**
 * 收集编辑记录：把输入框字符串按原格 kind 推导为 CellEdit（string|number）。
 * 守卫（PRD 功能四，仅单元格值可改）：
 *  - 越界（行/列超出网格）→ 抛可读错误；
 *  - 合并区从属单元格 → 抛可读错误（不可直接写）；
 *  - 数值格输入非数字 → 抛可读错误；清空数值格 → 落为字符串空串；
 *  - 其余（文本/日期/布尔等）→ 落为字符串。
 */
export function collectCellEdits(
  grid: ExcelCell[][],
  edits: CellEditInput[],
): CellEdit[] {
  return edits.map((edit) => {
    const rowIndex = edit.row;
    const colIndex = edit.col;
    const row = grid[rowIndex];
    const cell = row?.[colIndex];
    if (!row || !cell) {
      throw new Error(
        `编辑越界：第 ${rowIndex + 1} 行第 ${colIndex + 1} 列超出表格范围`,
      );
    }
    if (cell.isMergedSlave) {
      throw new Error(
        `编辑越界：第 ${rowIndex + 1} 行第 ${colIndex + 1} 列为合并区从属单元格，不能编辑`,
      );
    }
    if (cell.kind === 'number') {
      const trimmed = edit.input.trim();
      if (trimmed === '') {
        return { row: rowIndex, col: colIndex, value: '' };
      }
      const numeric = Number(trimmed);
      if (!Number.isFinite(numeric)) {
        throw new Error(
          `非法数值：第 ${rowIndex + 1} 行第 ${colIndex + 1} 列需填写数字`,
        );
      }
      return { row: rowIndex, col: colIndex, value: numeric };
    }
    return { row: rowIndex, col: colIndex, value: edit.input };
  });
}
