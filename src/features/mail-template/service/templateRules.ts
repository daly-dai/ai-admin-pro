/**
 * 模板规则纯函数：占位符计数、正文占位符校验、收件人/抄送解析校验。
 * WHY: 校验逻辑与表单/存储/页面解耦——service（防御）+ T3 表单（展示）共用此单一来源，
 * 禁止在两处各自实现一份。
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 收件人/抄送分隔符：英文/中文逗号、分号、换行、回车、制表 */
const DELIMITER_PATTERN = /[,;，；\r\n\t]+/;

export type EmailsParseResult =
  | { ok: true; emails: string[] }
  | { ok: false; message: string };

export type PlaceholderCheckResult =
  | { ok: true }
  | { ok: false; message: string };

/** 正文占位符个数（精确匹配 {{table}}；残缺/变形 token 不计） */
export function countBodyPlaceholders(bodyHtml: string): number {
  return bodyHtml.split('{{table}}').length - 1;
}

/** 正文占位符校验：恰好 1 个（0 个或缺省 / ≥2 个均拒绝，PRD Q14 口径） */
export function validateBodyPlaceholderCount(
  bodyHtml: string,
): PlaceholderCheckResult {
  const count = countBodyPlaceholders(bodyHtml);
  if (count === 0) {
    return { ok: false, message: '正文必须包含占位符' };
  }
  if (count >= 2) {
    return { ok: false, message: '不允许存在多个占位符' };
  }
  return { ok: true };
}

function splitEmails(raw: string): string[] {
  return raw
    .split(DELIMITER_PATTERN)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/** 数组形态校验（service 收到的是已规范化数组时用） */
export function validateEmailList(
  emails: string[],
  field: '收件人' | '抄送',
  required: boolean,
): EmailsParseResult {
  if (emails.length === 0) {
    if (required) {
      return { ok: false, message: `${field}不能为空，至少填写一个邮箱` };
    }
    return { ok: true, emails: [] };
  }
  const invalid = emails.filter((email) => !EMAIL_PATTERN.test(email));
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `${field}包含非法邮箱：${invalid.join('、')}`,
    };
  }
  return { ok: true, emails: [...emails] };
}

/** 原始字符串解析 + 校验（表单输入形态） */
export function parseRecipientsInput(raw: string): EmailsParseResult {
  return validateEmailList(splitEmails(raw), '收件人', true);
}

/** 抄送：可选；填了必须全合法 */
export function parseCcInput(raw: string): EmailsParseResult {
  return validateEmailList(splitEmails(raw), '抄送', false);
}
