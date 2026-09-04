/**
 * ParsedSheet → 邮件安全 HTML（纯函数，无副作用）。
 * 输出约束：仅 table/tr/td + 全内联样式；不产出 <style>/<script>/div 布局，
 * 兼容 Outlook（Word 引擎）/ Gmail 等主流邮件客户端的安全子集。
 */

import type {
  EmailTableResult,
  ExcelCell,
  ExcelCellStyle,
  ParsedSheet,
} from './types';

/** 邮件正文推荐宽度（主流客户端内容区上限） */
export const EMAIL_BODY_WIDTH_PX = 600;

// WHY: 邮件客户端只认系统安全字体，中文场景统一走微软雅黑 + 回退栈
const FONT_FALLBACK =
  "'Microsoft YaHei','PingFang SC','Hiragino Sans GB','Helvetica Neue',Arial,sans-serif";

const BORDER_CSS: Record<string, string> = {
  thin: '1px solid',
  hair: '1px dotted',
  medium: '2px solid',
  thick: '3px solid',
  dashed: '1px dashed',
  dotted: '1px dotted',
  double: '3px double',
  mediumDashed: '2px dashed',
  mediumDotted: '1px dotted',
  dashDot: '1px dashed',
  mediumDashDot: '2px dashed',
  dashDotDot: '1px dotted',
  mediumDashDotDot: '2px dotted',
  slantDashDot: '1px dashed',
};

// WHY: 模拟 Excel 屏幕观感——单元格某边无显式边框时，补浅灰细网格线（Excel 默认网格线色）
const GRIDLINE_CSS = '1px solid #d9d9d9';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 换行转 <br/>（先转义再插标签） */
function cellBodyText(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br/>');
}

function defaultHorizontal(cell: ExcelCell): string {
  if (cell.kind === 'number' || cell.kind === 'date') {
    return 'right';
  }
  return 'left';
}

function textDecoration(style: ExcelCellStyle): string | undefined {
  const decorations: string[] = [];
  if (style.isUnderline) {
    decorations.push('underline');
  }
  if (style.isStrikethrough) {
    decorations.push('line-through');
  }
  if (decorations.length === 0) {
    return undefined;
  }
  return decorations.join(' ');
}

function pushFontAppearance(style: ExcelCellStyle, parts: string[]): void {
  if (typeof style.fontSize === 'number') {
    // WHY: Excel 字号单位 pt，CSS 用 px（1pt ≈ 4/3 px）
    const fontSizePx = Math.round((style.fontSize * 4) / 3);
    parts.push(`font-size:${fontSizePx}px`);
  }
  if (style.isBold) {
    parts.push('font-weight:bold');
  }
  if (style.isItalic) {
    parts.push('font-style:italic');
  }
  const decoration = textDecoration(style);
  if (decoration) {
    parts.push(`text-decoration:${decoration}`);
  }
  if (style.fontColor) {
    // WHY: 颜色完全忠于文件（含用户刻意做的黑字深底等低对比组合），不做可读性改写
    parts.push(`color:${style.fontColor}`);
  }
}

function pushBackground(style: ExcelCellStyle, parts: string[]): void {
  if (style.backgroundColor) {
    parts.push(`background-color:${style.backgroundColor}`);
  }
}

function pushBorders(style: ExcelCellStyle, parts: string[]): void {
  const { borders } = style;
  const sides = ['top', 'bottom', 'left', 'right'] as const;
  sides.forEach((side) => {
    const styleName = borders?.[side]?.style;
    // WHY: 无显式边框的边补 Excel 风格网格线（所见即 Excel 屏幕），显式边框优先
    if (!styleName || styleName === 'none' || !BORDER_CSS[styleName]) {
      parts.push(`border-${side}:${GRIDLINE_CSS}`);
      return;
    }
    const color = borders?.[side]?.color || '#000000';
    parts.push(`border-${side}:${BORDER_CSS[styleName]} ${color}`);
  });
}

function pushAlignments(cell: ExcelCell, parts: string[]): void {
  const { style } = cell;
  let horizontal = defaultHorizontal(cell);
  if (style.horizontal && style.horizontal !== 'general') {
    horizontal =
      style.horizontal === 'centerContinuous' ? 'center' : style.horizontal;
  }
  parts.push(`text-align:${horizontal}`);
  const vertical = style.vertical ? style.vertical : 'middle';
  parts.push(`vertical-align:${vertical}`);
}

function pushBox(style: ExcelCellStyle, parts: string[]): void {
  if (style.isWrapText) {
    parts.push('white-space:normal');
    parts.push('word-break:break-word');
  }
  if (typeof style.indent === 'number') {
    parts.push(`padding-left:${Math.min(style.indent * 8, 32)}px`);
  }
}

/** 单元格 → 内联样式串（尺寸/边框/颜色等全部内联） */
function cellInlineStyle(cell: ExcelCell, widthPx: number): string {
  const { style } = cell;
  const parts: string[] = [];
  const family = style.fontName
    ? `'${style.fontName.replace(/'/g, '')}', ${FONT_FALLBACK}`
    : FONT_FALLBACK;
  parts.push(`font-family:${family}`);
  pushFontAppearance(style, parts);
  pushBackground(style, parts);
  pushBorders(style, parts);
  pushAlignments(cell, parts);
  pushBox(style, parts);
  parts.push(`padding:3px 6px`);
  parts.push(`width:${widthPx}px`);
  return parts.join(';');
}

/** 该列在缩放后的像素宽；preserveWidth=true 时保留 Excel 原始列宽（编辑/预览画布用，不被 600px 邮件宽压缩） */
function scaledColWidths(
  sheet: ParsedSheet,
  preserveWidth?: boolean,
): {
  widths: number[];
  scaleApplied: boolean;
} {
  if (preserveWidth) {
    return { widths: [...sheet.colWidthPx], scaleApplied: false };
  }
  const rawTotal = sheet.colWidthPx.reduce((sum, width) => sum + width, 0);
  const scaleApplied = rawTotal > EMAIL_BODY_WIDTH_PX;
  const scale = scaleApplied ? EMAIL_BODY_WIDTH_PX / rawTotal : 1;
  const widths = sheet.colWidthPx.map((width) =>
    Math.max(8, Math.round(width * scale)),
  );
  return { widths, scaleApplied };
}

/** 主单元格覆盖宽度（colspan 合并的列宽之和） */
function coveredWidth(
  colIndex: number,
  colSpan: number | undefined,
  widths: number[],
): number {
  const span = colSpan ?? 1;
  let total = 0;
  for (let offset = 0; offset < span; offset += 1) {
    total += widths[colIndex + offset] ?? widths[colIndex] ?? 60;
  }
  return total;
}

function renderCell(
  cell: ExcelCell,
  colIndex: number,
  widths: number[],
): string {
  const attrs: string[] = [];
  if (cell.rowSpan && cell.rowSpan > 1) {
    attrs.push(`rowspan="${cell.rowSpan}"`);
  }
  if (cell.colSpan && cell.colSpan > 1) {
    attrs.push(`colspan="${cell.colSpan}"`);
  }
  const width = coveredWidth(colIndex, cell.colSpan, widths);
  const style = cellInlineStyle(cell, width);
  attrs.push(`style="${style}"`);
  const content = cell.link
    ? `<a href="${escapeHtml(cell.link)}" style="color:#1677ff;text-decoration:underline">${cellBodyText(cell.text)}</a>`
    : cellBodyText(cell.text);
  return `<td ${attrs.join(' ')}>${content}</td>`;
}

function renderRow(row: ExcelCell[], widths: number[]): string {
  const cells: string[] = [];
  row.forEach((cell, colIndex) => {
    if (cell.isMergedSlave) {
      return;
    }
    cells.push(renderCell(cell, colIndex, widths));
  });
  return `<tr>${cells.join('')}</tr>`;
}

/** buildSheetEmailHtml 选项 */
export interface SheetRenderOptions {
  /** 保留 Excel 原始列宽（编辑/预览画布用），不压缩到 600px 邮件宽 */
  preserveWidth?: boolean;
}

/** 工作表 → 邮件安全表格 HTML（options.preserveWidth 时保留原始列宽，供预览/编辑画布不挤压） */
export function buildSheetEmailHtml(
  sheet: ParsedSheet,
  options?: SheetRenderOptions,
): EmailTableResult {
  const warnings: string[] = [];
  const { widths, scaleApplied } = scaledColWidths(
    sheet,
    options?.preserveWidth,
  );
  if (scaleApplied) {
    warnings.push(
      `表格总宽超过 ${EMAIL_BODY_WIDTH_PX}px，已等比缩放至 ${EMAIL_BODY_WIDTH_PX}px 以内`,
    );
  }
  if (sheet.rows.length === 0) {
    warnings.push('该工作表没有可渲染的数据行');
    return {
      html:
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody><tr><td style="padding:8px;font-family:' +
        FONT_FALLBACK +
        ';color:#999;">（空表）</td></tr></tbody></table>',
      warnings,
    };
  }
  const bodyRows = sheet.rows.map((row) => renderRow(row, widths)).join('');
  const html =
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" ' +
    `style="border-collapse:collapse;font-family:${FONT_FALLBACK};font-size:14px;line-height:1.4;">` +
    `<tbody>${bodyRows}</tbody></table>`;
  return { html, warnings };
}
