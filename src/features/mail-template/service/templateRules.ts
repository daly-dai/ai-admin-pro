/**
 * 模板规则纯函数：占位符计数、正文占位符校验、收件人/抄送列表校验（通讯录多选 userInfo 口径）。
 * WHY: 校验逻辑与表单/存储/页面解耦——service（防御）+ 表单（展示）共用此单一来源，
 * 禁止在两处各自实现一份。
 * 收件人/抄送语义（修订）：值为通讯录选中的 userInfo（如「张三/112233」），真实后端据此换邮件地址；
 * 前端不再做邮箱格式校验，仅校验「必填/非空 + 清洗去重」。
 */

/** 收件人/抄送列表校验结果（users = 清洗去重后的 userInfo 列表） */
export type UserListCheckResult =
  | { ok: true; users: string[] }
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

/**
 * 收件人/抄送列表校验：必填时至少 1 项；逐项 trim、去重；
 * 值均来自通讯录下拉（userInfo），天然合法，不再校验邮箱格式。
 */
export function validateUserList(
  users: string[] | undefined,
  field: '收件人' | '抄送',
  required: boolean,
): UserListCheckResult {
  const cleaned = [
    ...new Set(
      (users ?? [])
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  ];
  if (cleaned.length === 0) {
    if (required) {
      return { ok: false, message: `${field}不能为空，至少选择一名用户` };
    }
    return { ok: true, users: [] };
  }
  return { ok: true, users: cleaned };
}

export type PlaceholderCheckResult =
  | { ok: true }
  | { ok: false; message: string };
