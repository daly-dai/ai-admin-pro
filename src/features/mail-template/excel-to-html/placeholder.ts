/**
 * 占位符工具：扫描/定位/替换编辑器 HTML 中的插槽与变量 token。
 * 全部为纯字符串操作（不解析 DOM），与 wangEditor 的 getHtml/setHtml 配合使用。
 */

/** 匹配表格插槽 token：{{table}} / {{table:1}} 等 */
const TABLE_TOKEN_PATTERN = /\{\{\s*table(?::\d+)?\s*\}\}/g;

/** 匹配表格插槽 token（非全局，仅用于单次测试，避免 lastIndex 状态污染） */
const TABLE_TOKEN_TEST = /\{\{\s*table(?::\d+)?\s*\}\}/;

/** 匹配任意变量/插槽 token */
const ALL_TOKEN_PATTERN = /\{\{\s*[\s\S]*?\s*\}\}/g;

/** 归一化 token 文本（去空白），用于比较 */
function normalizeToken(token: string): string {
  return token.replace(/\{\{\s*/, '{{').replace(/\s*\}\}/, '}}');
}

/** 扫描正文中的表格插槽 token（去重、保序） */
export function findTableTokens(html: string): string[] {
  const tokens: string[] = [];
  const seen = new Set<string>();
  const matches = html.matchAll(TABLE_TOKEN_PATTERN);
  for (const match of matches) {
    const normalized = normalizeToken(match[0]);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      tokens.push(normalized);
    }
  }
  return tokens;
}

/** 扫描正文中的变量 token（排除表格插槽），用于导出前残留提示 */
export function findVariableTokens(html: string): string[] {
  const tokens: string[] = [];
  const seen = new Set<string>();
  const matches = html.matchAll(ALL_TOKEN_PATTERN);
  for (const match of matches) {
    const normalized = normalizeToken(match[0]);
    if (TABLE_TOKEN_TEST.test(normalized)) {
      continue;
    }
    if (!seen.has(normalized)) {
      seen.add(normalized);
      tokens.push(normalized);
    }
  }
  return tokens;
}

/** 正文中是否仍存在某个 token */
export function hasToken(html: string, token: string): boolean {
  return html.includes(token);
}

/** 单次替换（target 不存在时返回 null），用于换表/移除的锚点替换 */
export function replaceOnce(
  html: string,
  target: string,
  replacement: string,
): string | null {
  if (!target || !html.includes(target)) {
    return null;
  }
  const index = html.indexOf(target);
  return html.slice(0, index) + replacement + html.slice(index + target.length);
}

/** 文档中 table 块的起止区间（逐个扫描 <table ...> ... </table>，无嵌套假设） */
export interface TableBlockRange {
  start: number;
  end: number;
}

/** 定位文档中所有表格块，按出现顺序返回 */
export function listTableBlockRanges(html: string): TableBlockRange[] {
  const ranges: TableBlockRange[] = [];
  let cursor = 0;
  while (cursor < html.length) {
    const start = html.indexOf('<table', cursor);
    if (start < 0) {
      break;
    }
    const closeTag = html.indexOf('</table>', start + 7);
    if (closeTag < 0) {
      break;
    }
    ranges.push({ start, end: closeTag + '</table>'.length });
    cursor = closeTag + '</table>'.length;
  }
  return ranges;
}

function isWhitespaceOnly(text: string): boolean {
  return text.trim().length === 0;
}

/**
 * 把 token 替换为表格 HTML：
 * - token 独立成段 → 整段替换为「表格 + 必要 <p>」包裹
 * - token 嵌在段落文字中 → 拆段（token 前后文字各自保留为段落）
 * - token 不在任何段落 → 直接原位替换
 * 返回 null 表示正文中找不到该 token。
 */
export function replaceSlotTokenWithHtml(
  html: string,
  token: string,
  tableHtml: string,
): string | null {
  const tokenIndex = html.indexOf(token);
  if (tokenIndex < 0) {
    return null;
  }

  const openParagraphIndex = html.lastIndexOf('<p', tokenIndex);
  const paragraphOpenEnd = html.indexOf('>', openParagraphIndex) + 1;
  const hasTrailingParagraphClose = html
    .slice(openParagraphIndex, tokenIndex)
    .includes('</p>');
  const inParagraph =
    openParagraphIndex >= 0 &&
    paragraphOpenEnd > 0 &&
    !hasTrailingParagraphClose;

  if (!inParagraph) {
    return replaceOnce(html, token, tableHtml);
  }

  const closeParagraphIndex = html.indexOf('</p>', tokenIndex);
  if (closeParagraphIndex < 0) {
    return replaceOnce(html, token, tableHtml);
  }

  const before = html.slice(paragraphOpenEnd, tokenIndex);
  const after = html.slice(tokenIndex + token.length, closeParagraphIndex);
  const beforeParagraph = isWhitespaceOnly(before) ? '' : `<p>${before}</p>`;
  const afterParagraph = isWhitespaceOnly(after) ? '' : `<p>${after}</p>`;
  const segmentStart = openParagraphIndex;
  const segmentEnd = closeParagraphIndex + '</p>'.length;
  const rebuilt = `${beforeParagraph}${tableHtml}${afterParagraph}`;
  return html.slice(0, segmentStart) + rebuilt + html.slice(segmentEnd);
}
