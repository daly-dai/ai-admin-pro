/**
 * exceljs 值回写（Task 2）：原 xlsx buffer + 单元格编辑记录 → 写回原 workbook →
 * 重新导出 buffer。样式 100% 保留（仅目标单元格值变化），供 mock 在线编辑「发布」链路使用。
 *
 * WHY(坐标 0 起): 编辑记录来自解析网格（ExcelCell[][] 0 起坐标），与渲染坐标一致；
 * exceljs 内部按 1 起处理，此处 +1 换算。
 * WHY(仅首个工作表): 与 v1 渲染链路取 sheet[0] 对齐；演示场景单表为主，多表编辑属真实平台能力外。
 * 边界：不做增删行列/样式编辑（PRD 功能四明确——那是真实平台能力，非本 demo mock 范围）。
 */
import { Workbook } from 'exceljs';

export interface CellEdit {
  /** 0 起行号 */
  row: number;
  /** 0 起列号 */
  col: number;
  /** 仅文本/数值可写（PRD 功能四） */
  value: string | number;
}

function assertSupportedValue(
  value: unknown,
): asserts value is CellEdit['value'] {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error('单元格值仅支持文本或数值');
  }
}

export async function applyCellEdits(
  fileBuffer: ArrayBuffer,
  edits: CellEdit[],
): Promise<ArrayBuffer> {
  const workbook = new Workbook();
  try {
    await workbook.xlsx.load(fileBuffer);
  } catch {
    throw new Error('文件解析失败，请确认是有效的 .xlsx 文件');
  }
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('文件中没有可用的工作表');
  }
  for (const edit of edits) {
    assertSupportedValue(edit.value);
    const rowIndex = edit.row + 1;
    const colIndex = edit.col + 1;
    // WHY 守卫: exceljs getRow/getCell 会自动扩表——必须先做边界检查再写，防越界静默扩行
    if (
      rowIndex < 1 ||
      colIndex < 1 ||
      rowIndex > worksheet.rowCount ||
      colIndex > worksheet.columnCount
    ) {
      throw new Error(
        `编辑越界：第 ${rowIndex} 行第 ${colIndex} 列超出表格范围（${worksheet.rowCount} 行 × ${worksheet.columnCount} 列）`,
      );
    }
    const row = worksheet.getRow(rowIndex);
    const cell = row.getCell(colIndex);
    cell.value = edit.value;
  }
  const output = await workbook.xlsx.writeBuffer();
  // WHY: exceljs 类型与运行时(node Buffer)不一致，统一经 Uint8Array 拷贝成独立 ArrayBuffer
  const view = new Uint8Array(output as unknown as ArrayBuffer);
  return view.buffer.slice(
    view.byteOffset,
    view.byteOffset + view.byteLength,
  ) as ArrayBuffer;
}
