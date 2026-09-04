/**
 * ExcelJS 解析封装：.xlsx → ExcelParseResult。
 * 覆盖：文本/数值/日期/布尔/错误/公式结果、样式快照（字体/填充/边框/对齐/数字格式）、
 * 合并区域、列宽；含文件头与体积校验、行列截断与降级 warnings。
 */

import type { Cell, Worksheet } from 'exceljs';
import { Workbook } from 'exceljs';

import {
  formatCellValue,
  isCommonNumberFormat,
  isDateLikeFormat,
} from './numFmt';
import type {
  CellHorizontal,
  CellVertical,
  ExcelCell,
  ExcelCellStyle,
  ExcelParseResult,
  ParsedSheet,
} from './types';

interface ParseOptions {
  maxRows?: number;
  maxCols?: number;
  maxFileSizeMb?: number;
}

interface MergeRegion {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface MergeInfo {
  masterRow: number;
  masterCol: number;
  rowSpan: number;
  colSpan: number;
}

interface CellValueInfo {
  text: string;
  kind: ExcelCell['kind'];
  link?: string;
}

interface ParseSheetContext {
  maxRows: number;
  maxCols: number;
  warnings: string[];
}

const DEFAULT_MAX_ROWS = 500;
const DEFAULT_MAX_COLS = 60;
const DEFAULT_MAX_SIZE_MB = 10;
const MAX_SHEETS = 5;

/** 校验扩展名与文件大小（在读取内容前快速失败） */
function assertFileShape(file: File, maxSizeMb: number): void {
  const isXlsx = file.name.toLowerCase().endsWith('.xlsx');
  if (!isXlsx) {
    throw new Error('仅支持 .xlsx 格式文件（.xls 老格式暂不支持）');
  }
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`文件超过 ${maxSizeMb}MB 限制，请精简后重试`);
  }
}

/** 校验 zip 魔数 PK（xlsx 本质是 zip） */
function assertZipMagic(buffer: ArrayBuffer): void {
  const head = new Uint8Array(buffer.slice(0, 4));
  const isZip = head[0] === 0x50 && head[1] === 0x4b;
  if (!isZip) {
    throw new Error('文件内容异常，请确认是有效的 .xlsx 文件');
  }
}

function pushOnce(warnings: string[], message: string): void {
  if (!warnings.includes(message)) {
    warnings.push(message);
  }
}

/** ARGB(#AARRGGBB) / RRGGBB → #RRGGBB */
function normalizeArgb(argb: string): string | undefined {
  if (argb.length === 8) {
    return `#${argb.slice(2)}`;
  }
  if (argb.length === 6) {
    return `#${argb}`;
  }
  return undefined;
}

// WHY: styles.xml 的 theme 索引遵循 Excel CT_Color 约定，与 theme1.xml 的
// clrScheme 子节点顺序不同：dk/lt 两对互换（0=lt1 白、1=dk1 黑、2=lt2、3=dk2），
// accent1-6(4-9)/hlink(10)/folHlink(11) 与 XML 顺序一致。
// 表头白字常被 Excel/WPS 存为 theme=0（lt1）——若误按 XML 顺序把 0 当 dk1 黑，
// 白字表头会被读出黑色（历史根因，已修正）。
const OFFICE_THEME_COLORS = [
  '#FFFFFF', // 0 lt1 背景1（白字表头通常走这里）
  '#000000', // 1 dk1 文字1
  '#E7E6E6', // 2 lt2 背景2
  '#44546A', // 3 dk2 文字2
  '#4472C4', // 4 accent1 蓝
  '#ED7D31', // 5 accent2 橙
  '#A5A5A5', // 6 accent3 灰
  '#FFC000', // 7 accent4 金
  '#5B9BD5', // 8 accent5 浅蓝
  '#70AD47', // 9 accent6 绿
  '#0563C1', // 10 超链接
  '#954F72', // 11 已访问超链接
];

// WHY: indexed 颜色引用 Excel 传统 64 色调色板（0-7 与 8-15 重复基础色；
// 16 起为经典固定色）。老工具/WPS 转存文件常带 8-63 的 indexed 色。
const INDEXED_PALETTE_COLORS = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF', // 0-7
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF', // 8-15
  '#800000',
  '#008000',
  '#000080',
  '#808000',
  '#800080',
  '#008080',
  '#C0C0C0',
  '#808080', // 16-23
  '#9999FF',
  '#993366',
  '#FFFFCC',
  '#CCFFFF',
  '#660066',
  '#FF8080',
  '#0066CC',
  '#CCCCFF', // 24-31
  '#000080',
  '#FF00FF',
  '#FFFF00',
  '#00FFFF',
  '#800080',
  '#800000',
  '#008080',
  '#0000FF', // 32-39
  '#00CCFF',
  '#CCFFFF',
  '#CCFFCC',
  '#FFFF99',
  '#99CCFF',
  '#FF99CC',
  '#CC99FF',
  '#FFCC99', // 40-47
  '#3366FF',
  '#33CCCC',
  '#99CC00',
  '#FFCC00',
  '#FF9900',
  '#FF6600',
  '#666699',
  '#969696', // 48-55
  '#003366',
  '#339966',
  '#003300',
  '#333300',
  '#993300',
  '#993366',
  '#333399',
  '#333333', // 56-63
];

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

// WHY: Excel 的 tint 为 -1..1：正值向白靠拢、负值向黑靠拢，近似线性混合
function applyTint(hex: string, tint: number): string {
  const rgb = hexToRgb(hex);
  const mixed = rgb.map((channel) => {
    if (tint > 0) {
      return channel + (255 - channel) * tint;
    }
    if (tint < 0) {
      return channel * (1 + tint);
    }
    return channel;
  }) as [number, number, number];
  return rgbToHex(mixed);
}

function themeColorToHex(theme: number, tint: unknown): string | undefined {
  const base = OFFICE_THEME_COLORS[theme];
  if (!base) {
    return undefined;
  }
  if (typeof tint === 'number' && tint !== 0) {
    return applyTint(base, tint);
  }
  return base;
}

function colorToHex(
  color: unknown,
  context: string,
  warnings: string[],
): string | undefined {
  if (!color) {
    return undefined;
  }
  if (typeof color === 'string') {
    return normalizeArgb(color);
  }
  const record = color as {
    argb?: unknown;
    theme?: unknown;
    tint?: unknown;
    indexed?: unknown;
  };
  if (typeof record.argb === 'string') {
    return normalizeArgb(record.argb);
  }
  if (typeof record.theme === 'number') {
    return themeColorToHex(record.theme, record.tint);
  }
  if (typeof record.indexed === 'number') {
    // WHY: 64/65 等系统色（auto/windowText…）随主题环境变化，无法固定解析 → undefined
    if (record.indexed >= 0 && record.indexed < INDEXED_PALETTE_COLORS.length) {
      return INDEXED_PALETTE_COLORS[record.indexed];
    }
    return undefined;
  }
  pushOnce(warnings, `${context}: 无法解析的颜色类型已忽略`);
  return undefined;
}

function alignHorizontal(value: unknown): CellHorizontal | undefined {
  switch (value) {
    case 'left':
      return 'left';
    case 'center':
      return 'center';
    case 'right':
      return 'right';
    case 'centerContinuous':
      return 'centerContinuous';
    case 'fill':
    case 'justify':
    case 'distributed':
      return 'justify';
    default:
      return undefined;
  }
}

function alignVertical(value: unknown): CellVertical | undefined {
  switch (value) {
    case 'top':
      return 'top';
    case 'middle':
      return 'middle';
    case 'bottom':
      return 'bottom';
    case 'justify':
    case 'distributed':
      return 'justify';
    default:
      return undefined;
  }
}

/** 解析对象型单元格值（公式/富文本/错误/超链接） */
function readRecordValue(
  record: Record<string, unknown>,
  numFmt: string | undefined,
  warnings: string[],
): CellValueInfo {
  if ('error' in record) {
    return { text: String(record.error), kind: 'error' };
  }
  if ('richText' in record) {
    const pieces = record.richText as Array<{ text?: unknown }>;
    const text = pieces
      .map((piece) => (piece.text === undefined ? '' : String(piece.text)))
      .join('');
    return { text, kind: 'string' };
  }
  if ('formula' in record && 'result' in record) {
    return readCellValue(record.result, numFmt, warnings);
  }
  if ('text' in record && 'hyperlink' in record) {
    const text = record.text === undefined ? '' : String(record.text);
    const link = String(record.hyperlink);
    const safeLink = /^https?:\/\//i.test(link) ? link : undefined;
    return { text, kind: 'string', link: safeLink };
  }
  return { text: String(record), kind: 'string' };
}

function readCellValue(
  value: unknown,
  numFmt: string | undefined,
  warnings: string[],
): CellValueInfo {
  if (value === null || value === undefined) {
    return { text: '', kind: 'empty' };
  }
  if (typeof value === 'string') {
    return { text: value, kind: 'string' };
  }
  if (typeof value === 'boolean') {
    return { text: value ? 'TRUE' : 'FALSE', kind: 'boolean' };
  }
  if (value instanceof Date) {
    const text = formatCellValue(value, numFmt);
    return { text, kind: 'date' };
  }
  if (typeof value === 'number') {
    const text = formatCellValue(value, numFmt);
    const kind = isDateLikeFormat(numFmt) ? 'date' : 'number';
    return { text, kind };
  }
  return readRecordValue(value as Record<string, unknown>, numFmt, warnings);
}

function fontStylePart(
  cell: Cell,
  warnings: string[],
): Partial<ExcelCellStyle> {
  const part: Partial<ExcelCellStyle> = {};
  const { font } = cell;
  if (!font) {
    return part;
  }
  if (font.name) {
    part.fontName = font.name;
  }
  if (typeof font.size === 'number') {
    part.fontSize = font.size;
  }
  if (font.bold) {
    part.isBold = true;
  }
  if (font.italic) {
    part.isItalic = true;
  }
  if (font.underline && font.underline !== 'none') {
    part.isUnderline = true;
  }
  if (font.strike) {
    part.isStrikethrough = true;
  }
  const fontColor = colorToHex(font.color, '字体颜色', warnings);
  if (fontColor) {
    part.fontColor = fontColor;
  }
  return part;
}

function fillStylePart(
  cell: Cell,
  warnings: string[],
): Partial<ExcelCellStyle> {
  const part: Partial<ExcelCellStyle> = {};
  const { fill } = cell;
  if (!fill || fill.type !== 'pattern') {
    return part;
  }
  if (fill.pattern === 'solid') {
    const background = colorToHex(fill.fgColor, '单元格底色', warnings);
    if (background) {
      part.backgroundColor = background;
    }
    return part;
  }
  if (fill.pattern !== 'none') {
    part.unsupportedFillPattern = fill.pattern;
    pushOnce(
      warnings,
      `图案填充(${fill.pattern})无法在邮件中保真，已按无底色处理`,
    );
  }
  return part;
}

function borderStylePart(
  cell: Cell,
  warnings: string[],
): Partial<ExcelCellStyle> {
  const part: Partial<ExcelCellStyle> = {};
  const { border } = cell;
  if (!border) {
    return part;
  }
  const borders: NonNullable<ExcelCellStyle['borders']> = {};
  const sides = ['top', 'bottom', 'left', 'right'] as const;
  sides.forEach((side) => {
    const sideBorder = border[side];
    if (!sideBorder) {
      return;
    }
    borders[side] = {
      style: sideBorder.style,
      color: colorToHex(sideBorder.color, '边框颜色', warnings),
    };
  });
  if (Object.keys(borders).length > 0) {
    part.borders = borders;
  }
  return part;
}

function alignmentStylePart(
  cell: Cell,
  warnings: string[],
): Partial<ExcelCellStyle> {
  const part: Partial<ExcelCellStyle> = {};
  const { alignment } = cell;
  if (!alignment) {
    return part;
  }
  const horizontal = alignHorizontal(alignment.horizontal);
  if (horizontal) {
    part.horizontal = horizontal;
  }
  const vertical = alignVertical(alignment.vertical);
  if (vertical) {
    part.vertical = vertical;
  }
  if (alignment.wrapText) {
    part.isWrapText = true;
  }
  if (typeof alignment.indent === 'number' && alignment.indent > 0) {
    part.indent = alignment.indent;
  }
  if (alignment.textRotation && alignment.textRotation !== 0) {
    pushOnce(warnings, '文本旋转无法在邮件中保真，已忽略');
  }
  return part;
}

function numFmtStylePart(
  cell: Cell,
  warnings: string[],
): Partial<ExcelCellStyle> {
  const part: Partial<ExcelCellStyle> = {};
  if (!cell.numFmt) {
    return part;
  }
  part.numFmt = cell.numFmt;
  if (
    cell.numFmt !== 'General' &&
    !isDateLikeFormat(cell.numFmt) &&
    !isCommonNumberFormat(cell.numFmt)
  ) {
    pushOnce(warnings, `数字格式「${cell.numFmt}」暂不支持，已按原文显示`);
  }
  return part;
}

function snapshotCellStyle(cell: Cell, warnings: string[]): ExcelCellStyle {
  return {
    ...fontStylePart(cell, warnings),
    ...fillStylePart(cell, warnings),
    ...borderStylePart(cell, warnings),
    ...alignmentStylePart(cell, warnings),
    ...numFmtStylePart(cell, warnings),
  };
}

function buildExcelCell(
  cell: Cell,
  span: { rowSpan: number; colSpan: number } | undefined,
  warnings: string[],
): ExcelCell {
  const valueInfo = readCellValue(cell.value, cell.numFmt, warnings);
  return {
    text: valueInfo.text,
    kind: valueInfo.kind,
    isMergedSlave: false,
    rowSpan: span?.rowSpan,
    colSpan: span?.colSpan,
    link: valueInfo.link,
    style: snapshotCellStyle(cell, warnings),
  };
}

function buildSlaveCell(masterRow: number, masterCol: number): ExcelCell {
  return {
    text: '',
    kind: 'empty',
    isMergedSlave: true,
    masterRow,
    masterCol,
    style: {},
  };
}

function extractMergeRegions(worksheet: Worksheet): MergeRegion[] {
  const model = worksheet.model as unknown as {
    merges?: MergeRegion[];
  };
  const regions = model.merges ?? [];
  return regions.filter(
    (region) =>
      region &&
      typeof region.top === 'number' &&
      typeof region.left === 'number',
  );
}

/** 把合并区域转成 1-based 坐标查找表（key: `${row},${col}`） */
function buildMergeLookup(regions: MergeRegion[]): Map<string, MergeInfo> {
  const lookup = new Map<string, MergeInfo>();
  regions.forEach((region) => {
    const masterRow = region.top;
    const masterCol = region.left;
    const rowSpan = region.bottom - region.top + 1;
    const colSpan = region.right - region.left + 1;
    for (let row = region.top; row <= region.bottom; row += 1) {
      for (let col = region.left; col <= region.right; col += 1) {
        lookup.set(`${row},${col}`, { masterRow, masterCol, rowSpan, colSpan });
      }
    }
  });
  return lookup;
}

function computeColWidths(worksheet: Worksheet, colEnd: number): number[] {
  const widths: number[] = [];
  for (let index = 0; index < colEnd; index += 1) {
    const column = worksheet.columns[index];
    const chars = typeof column?.width === 'number' ? column.width : 8.43;
    // WHY: Excel 列宽单位 ≈ 字符数，按默认字号粗估每字符 7px + 边距
    widths.push(Math.max(24, Math.round(chars * 7 + 5)));
  }
  return widths;
}

function buildRows(
  worksheet: Worksheet,
  context: {
    rowEnd: number;
    colEnd: number;
    lookup: Map<string, MergeInfo>;
    warnings: string[];
  },
): ExcelCell[][] {
  const { rowEnd, colEnd, lookup, warnings } = context;
  const rows: ExcelCell[][] = [];
  for (let rowIndex = 1; rowIndex <= rowEnd; rowIndex += 1) {
    const excelRow = worksheet.getRow(rowIndex);
    const outputRow: ExcelCell[] = [];
    for (let colIndex = 1; colIndex <= colEnd; colIndex += 1) {
      const merge = lookup.get(`${rowIndex},${colIndex}`);
      const cell = excelRow.getCell(colIndex);
      let outputCell: ExcelCell;
      if (
        merge &&
        (merge.masterRow !== rowIndex || merge.masterCol !== colIndex)
      ) {
        // 0-based 主坐标存入 slave，便于排查与后续扩展
        outputCell = buildSlaveCell(merge.masterRow - 1, merge.masterCol - 1);
      } else {
        outputCell = buildExcelCell(
          cell,
          merge
            ? { rowSpan: merge.rowSpan, colSpan: merge.colSpan }
            : undefined,
          warnings,
        );
      }
      outputRow.push(outputCell);
    }
    rows.push(outputRow);
  }
  return rows;
}

/**
 * 内容边界（1-based 行列数）：只统计「非空文本」单元格及其合并跨度。
 * WHY: Excel 清空内容后样式仍残留，exceljs 的 rowCount/columnCount 会把
 * 空但有样式的行列计入，需按内容边界裁掉尾部的空行/空列，避免渲染出空列。
 */
function contentBounds(rows: ExcelCell[][]): {
  rowCount: number;
  colCount: number;
} {
  let rowCount = 0;
  let colCount = 0;
  rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.isMergedSlave || cell.text === '') {
        return;
      }
      const rightEdge = colIndex + (cell.colSpan ?? 1);
      const bottomEdge = rowIndex + (cell.rowSpan ?? 1);
      if (rightEdge > colCount) {
        colCount = rightEdge;
      }
      if (bottomEdge > rowCount) {
        rowCount = bottomEdge;
      }
    });
  });
  return { rowCount, colCount };
}

function parseSheet(
  worksheet: Worksheet,
  context: ParseSheetContext,
): ParsedSheet | null {
  if (worksheet.state === 'hidden') {
    return null;
  }
  const rowEnd = Math.min(worksheet.rowCount, context.maxRows);
  const colEnd = Math.min(worksheet.columnCount, context.maxCols);
  if (rowEnd < 1 || colEnd < 1) {
    pushOnce(context.warnings, `工作表「${worksheet.name}」为空，已跳过`);
    return null;
  }
  if (worksheet.rowCount > context.maxRows) {
    pushOnce(
      context.warnings,
      `工作表「${worksheet.name}」超过 ${context.maxRows} 行，仅解析前 ${context.maxRows} 行`,
    );
  }
  const lookup = buildMergeLookup(extractMergeRegions(worksheet));
  const fullRows = buildRows(worksheet, {
    rowEnd,
    colEnd,
    lookup,
    warnings: context.warnings,
  });
  // WHY: 先按内容边界裁剪（见 contentBounds），避免渲染 Excel 里
  // "已清空但残留样式"的尾部空行/空列
  const bounds = contentBounds(fullRows);
  if (bounds.rowCount < 1 || bounds.colCount < 1) {
    pushOnce(context.warnings, `工作表「${worksheet.name}」无内容，已跳过`);
    return null;
  }
  const rows = fullRows
    .slice(0, bounds.rowCount)
    .map((row) => row.slice(0, bounds.colCount));
  const colWidthPx = computeColWidths(worksheet, bounds.colCount);
  return {
    name: worksheet.name,
    rowCount: bounds.rowCount,
    colCount: bounds.colCount,
    colWidthPx,
    rows,
  };
}

/** 解析 .xlsx 文件（纯前端，不上传） */
export async function parseExcelFile(
  file: File,
  options?: ParseOptions,
): Promise<ExcelParseResult> {
  const maxRows = options?.maxRows ?? DEFAULT_MAX_ROWS;
  const maxCols = options?.maxCols ?? DEFAULT_MAX_COLS;
  const maxFileSizeMb = options?.maxFileSizeMb ?? DEFAULT_MAX_SIZE_MB;
  assertFileShape(file, maxFileSizeMb);
  const buffer = await file.arrayBuffer();
  assertZipMagic(buffer);
  const workbook = new Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    throw new Error('文件解析失败，请确认是有效的 .xlsx 文件');
  }
  const warnings: string[] = [];
  if (workbook.worksheets.length > MAX_SHEETS) {
    pushOnce(
      warnings,
      `超过 ${MAX_SHEETS} 个工作表，仅解析前 ${MAX_SHEETS} 个`,
    );
  }
  const sheets: ParsedSheet[] = [];
  workbook.worksheets.slice(0, MAX_SHEETS).forEach((worksheet) => {
    const sheet = parseSheet(worksheet, { maxRows, maxCols, warnings });
    if (sheet) {
      sheets.push(sheet);
    }
  });
  if (sheets.length === 0) {
    throw new Error('文件中没有可用的工作表（可能全部为空或隐藏）');
  }
  return { fileName: file.name, sheets, warnings };
}

/** 供页面提示用的默认解析上限文案 */
export const PARSE_LIMITS_TEXT = `${DEFAULT_MAX_ROWS} 行 × ${DEFAULT_MAX_COLS} 列`;
