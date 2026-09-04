/**
 * Excel 数字格式（numFmt）→ 展示文本。
 * 覆盖常见子集：日期（y/m/d/h/m/s + am/pm）、百分比、千分位、货币前缀、整数/小数。
 * 冷门格式（科学计数/分数/会计括号）由调用方根据本模块的能力提示降级。
 */

import dayjs from 'dayjs';

// WHY: Excel 1900 日期系统把 1900-01-01 记作 1，且虚构了 1900-02-29，
// 因此 1899-12-30 是 JS 时间戳与 Excel 序列号之间的换算零点。
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 86_400_000;

/** 去掉格式代码中的引号字面量、方括号颜色/条件块与反斜杠转义 */
function stripLiterals(code: string): string {
  let cleaned = code;
  cleaned = cleaned.replace(/\[[^\]]*\]/g, '');
  cleaned = cleaned.replace(/"([^"]*)"/g, '$1');
  cleaned = cleaned.replace(/\\./g, '');
  return cleaned;
}

/** 是否日期/时间类格式 */
export function isDateLikeFormat(numFmt?: string): boolean {
  if (!numFmt || numFmt === 'General') {
    return false;
  }
  const cleaned = stripLiterals(numFmt);
  if (/AM\/PM|A\/P/i.test(cleaned)) {
    return true;
  }
  return /[yYmMdDhHsS]/.test(cleaned) && !cleaned.includes('[h]');
}

/** 是否百分比格式 */
export function isPercentFormat(numFmt?: string): boolean {
  if (!numFmt) {
    return false;
  }
  return stripLiterals(numFmt).includes('%');
}

/** 是否可识别的常见数值格式（含数字占位符 0/#/?），用于判定降级 */
export function isCommonNumberFormat(numFmt?: string): boolean {
  if (!numFmt || numFmt === 'General') {
    return true;
  }
  if (isDateLikeFormat(numFmt) || isPercentFormat(numFmt)) {
    return true;
  }
  const cleaned = stripLiterals(numFmt).split(';')[0];
  return /[0#?]/.test(cleaned);
}

/** Excel 序列号 → JS Date */
export function excelSerialToDate(serial: number): Date {
  return new Date(EXCEL_EPOCH_MS + serial * MS_PER_DAY);
}

interface DateRun {
  letter: string;
  length: number;
}

/** 判断某 'm' 片段前一个字母片段是否为 'h'（决定是分钟还是月份） */
function hasHourBefore(chars: string[], endIndex: number): boolean {
  let cursor = endIndex - 1;
  while (cursor >= 0 && !/[a-zA-Z]/.test(chars[cursor])) {
    cursor -= 1;
  }
  return cursor >= 0 && chars[cursor].toLowerCase() === 'h';
}

/** 判断某 'm' 片段后一个字母片段是否为 's'（决定是分钟还是月份） */
function hasSecondAfter(chars: string[], startIndex: number): boolean {
  let cursor = startIndex;
  while (cursor < chars.length && !/[a-zA-Z]/.test(chars[cursor])) {
    cursor += 1;
  }
  return cursor < chars.length && chars[cursor].toLowerCase() === 's';
}

const mapYearPart = (length: number): string => (length >= 4 ? 'YYYY' : 'YY');
const mapDayPart = (length: number): string => (length >= 2 ? 'DD' : 'D');
const mapSecondPart = (length: number): string => (length >= 2 ? 'ss' : 's');
const mapHourPart = (length: number, hasAmPm: boolean): string => {
  if (hasAmPm) {
    return length >= 2 ? 'hh' : 'h';
  }
  return length >= 2 ? 'HH' : 'H';
};
const mapMonthPart = (length: number, isMinute: boolean): string => {
  if (isMinute) {
    return length >= 2 ? 'mm' : 'm';
  }
  return length >= 2 ? 'MM' : 'M';
};

function mapDateRun(run: DateRun, hasAmPm: boolean, isMinute: boolean): string {
  switch (run.letter) {
    case 'y':
      return mapYearPart(run.length);
    case 'd':
      return mapDayPart(run.length);
    case 'h':
      return mapHourPart(run.length, hasAmPm);
    case 's':
      return mapSecondPart(run.length);
    case 'm':
      return mapMonthPart(run.length, isMinute);
    default:
      return run.letter;
  }
}

// WHY: dayjs 会把字母 A 当作 am/pm 令牌，这里用非字母标记占位，格式化后再替换
const AM_PM_MARKER = '|~|';

/** Excel 日期代码 → dayjs format 模板；am/pm 段占位为 |~| 标记 */
function toDayjsPattern(excelCode: string): {
  pattern: string;
  hasAmPm: boolean;
} {
  const hasAmPm = /AM\/PM|A\/P/i.test(excelCode);
  const withSuffix = excelCode.replace(/(AM\/PM|A\/P)/gi, AM_PM_MARKER);
  const cleaned = stripLiterals(withSuffix);
  const chars = cleaned.split('');
  let pattern = '';
  let index = 0;
  while (index < chars.length) {
    const char = chars[index].toLowerCase();
    if (!'ymdhs'.includes(char)) {
      pattern += chars[index];
      index += 1;
      continue;
    }
    let runEnd = index + 1;
    while (runEnd < chars.length && chars[runEnd].toLowerCase() === char) {
      runEnd += 1;
    }
    const run: DateRun = { letter: char, length: runEnd - index };
    const isMinute =
      char === 'm' &&
      (hasHourBefore(chars, index) || hasSecondAfter(chars, runEnd));
    pattern += mapDateRun(run, hasAmPm, isMinute);
    index = runEnd;
  }
  return { pattern, hasAmPm };
}

/** 日期值（Date 或 Excel 序列号）按格式输出文本 */
export function formatDateValue(value: Date | number, numFmt: string): string {
  const date = typeof value === 'number' ? excelSerialToDate(value) : value;
  const { pattern, hasAmPm } = toDayjsPattern(numFmt);
  const formatted = dayjs(date).format(pattern);
  if (!hasAmPm) {
    return formatted;
  }
  // WHY: Excel 的 AM/PM 是固定 ASCII 文案，不走 dayjs 的 locale 输出（zh-cn 会给 上午/下午）
  const suffix = date.getHours() < 12 ? 'AM' : 'PM';
  return formatted.replace(AM_PM_MARKER, ` ${suffix}`);
}

/** 格式代码主段的小数位数（0 的个数） */
function decimalCount(code: string): number {
  const match = stripLiterals(code)
    .split(';')[0]
    .match(/\.(0+)/);
  return match ? match[1].length : 0;
}

/** 是否带千分位占位符 */
function hasThousandSeparator(code: string): boolean {
  const cleaned = stripLiterals(code).split(';')[0];
  return /[#0?],/.test(cleaned) || /,[#0?]/.test(cleaned);
}

/** 货币/符号前缀（引号包裹或裸符号），取自未清洗的原始代码 */
function symbolPrefix(code: string): string {
  const quoted = code.match(/^(['"])([^'"]*)\1/);
  if (quoted) {
    return quoted[2];
  }
  const bare = code.match(/^([¥￥$€£])/);
  return bare ? bare[1] : '';
}

/** 数值按格式输出文本 */
export function formatNumberValue(value: number, numFmt: string): string {
  if (isPercentFormat(numFmt)) {
    const decimals = decimalCount(numFmt);
    return `${(value * 100).toFixed(decimals)}%`;
  }
  const decimals = decimalCount(numFmt);
  const digits = hasThousandSeparator(numFmt)
    ? value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : value.toFixed(decimals);
  return `${symbolPrefix(numFmt)}${digits}`;
}

/** 数值/日期类值的格式化（字符串与布尔由调用方直出） */
function formatNumericLike(value: Date | number, numFmt?: string): string {
  if (value instanceof Date) {
    if (numFmt && isDateLikeFormat(numFmt)) {
      return formatDateValue(value, numFmt);
    }
    return dayjs(value).format('YYYY-MM-DD');
  }
  if (numFmt && isDateLikeFormat(numFmt)) {
    return formatDateValue(value, numFmt);
  }
  if (numFmt && isCommonNumberFormat(numFmt) && numFmt !== 'General') {
    return formatNumberValue(value, numFmt);
  }
  return String(value);
}

/** 单元格值 + 格式代码 → 展示文本（兜底 String） */
export function formatCellValue(value: unknown, numFmt?: string): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  if (value instanceof Date || typeof value === 'number') {
    return formatNumericLike(value, numFmt);
  }
  return String(value);
}
