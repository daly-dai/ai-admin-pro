/**
 * Excel → 邮件 HTML 转换链路的公共类型。
 * 设计约束：零 any；样式快照与 exceljs 解耦，便于纯函数测试。
 */

/** 单元格水平对齐（含 Excel 的 general 默认态） */
export type CellHorizontal =
  | 'left'
  | 'center'
  | 'right'
  | 'justify'
  | 'centerContinuous'
  | 'general';

/** 单元格垂直对齐 */
export type CellVertical = 'top' | 'middle' | 'bottom' | 'justify';

/** 解析后的单元格样式快照（已转成可直出 CSS 的形式） */
export interface ExcelCellStyle {
  /** 字体名，如 微软雅黑 / Calibri */
  fontName?: string;
  /** 字号（pt） */
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  /** 字体色 #RRGGBB */
  fontColor?: string;
  /** 纯色填充背景 #RRGGBB */
  backgroundColor?: string;
  /** 非 solid 图案填充类型名（仅用于降级警告） */
  unsupportedFillPattern?: string;
  /** 四边边框：style 为 exceljs 边框样式名，color 为 #RRGGBB */
  borders?: Partial<
    Record<
      'top' | 'bottom' | 'left' | 'right',
      { style?: string; color?: string }
    >
  >;
  horizontal?: CellHorizontal;
  vertical?: CellVertical;
  isWrapText?: boolean;
  /** 缩进（Excel 单位，约等于空格数） */
  indent?: number;
  /** Excel 数字格式代码 */
  numFmt?: string;
}

/** 解析后的单元格 */
export interface ExcelCell {
  /** 展示文本（已应用数字格式） */
  text: string;
  /** 原始值类别，用于默认对齐等推导 */
  kind: 'string' | 'number' | 'date' | 'boolean' | 'error' | 'empty';
  /** 是否是被合并区域覆盖的非主单元格（渲染时跳过） */
  isMergedSlave: boolean;
  /** 合并主单元格坐标（0 起），非 slave 时为空 */
  masterRow?: number;
  masterCol?: number;
  /** 主单元格合并跨度 */
  rowSpan?: number;
  colSpan?: number;
  /** http(s) 超链接地址 */
  link?: string;
  style: ExcelCellStyle;
}

/** 解析后的单个工作表 */
export interface ParsedSheet {
  name: string;
  rowCount: number;
  colCount: number;
  /** 每列宽（px，已近似换算），与 colCount 对齐 */
  colWidthPx: number[];
  rows: ExcelCell[][];
}

/** 整个 Excel 文件的解析结果 */
export interface ExcelParseResult {
  fileName: string;
  sheets: ParsedSheet[];
  warnings: string[];
}

/** 转换器输出 */
export interface EmailTableResult {
  /** 邮件安全 HTML（仅 table/tr/td + 内联样式） */
  html: string;
  warnings: string[];
}

/** 已注入编辑器的表格插槽（与正文 token 绑定） */
export interface MailTableSlot {
  /** 插槽 token 原文，如 {{table}} */
  token: string;
  /** 原始保真的邮件 HTML（导出/换表时替换用，不经编辑器样式稀释） */
  sourceHtml: string;
  fileName: string;
  sheetName: string;
}
