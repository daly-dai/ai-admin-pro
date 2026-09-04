/**
 * 模板数组纯函数操作（不可变，返回新数组）。
 * WHY: 数据处理与存储/门面解耦（P017 精神）——id/时间戳由调用方注入，纯函数可测；
 * 接真实后端时门面替换为 HTTP，本组函数随测试原样保留或弃用均不影响签名。
 */
import type { MailTemplate, MailTemplateInput } from './types';

export function createTemplateRecord(
  templates: MailTemplate[],
  input: MailTemplateInput,
  meta: { id: string; now: number },
): MailTemplate[] {
  const entity: MailTemplate = {
    id: meta.id,
    name: input.name,
    // WHY 拷贝: 防外部改 input 污染已存实体
    recipients: [...input.recipients],
    cc: [...input.cc],
    bodyHtml: input.bodyHtml,
    ...(input.presetId ? { presetId: input.presetId } : {}),
    canUpload: input.canUpload ?? true,
    updatedAt: meta.now,
  };
  return [...templates, entity];
}

export interface UpdateTemplateRequest {
  id: string;
  patch: Partial<MailTemplateInput>;
  now: number;
}

export function updateTemplateRecord(
  templates: MailTemplate[],
  request: UpdateTemplateRequest,
): MailTemplate[] {
  const { id, patch, now } = request;
  let touched = false;
  const next = templates.map((template) => {
    if (template.id !== id) {
      return template;
    }
    touched = true;
    return {
      ...template,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.recipients !== undefined
        ? { recipients: [...patch.recipients] }
        : {}),
      ...(patch.cc !== undefined ? { cc: [...patch.cc] } : {}),
      ...(patch.bodyHtml !== undefined ? { bodyHtml: patch.bodyHtml } : {}),
      ...(patch.presetId !== undefined ? { presetId: patch.presetId } : {}),
      ...(patch.canUpload !== undefined ? { canUpload: patch.canUpload } : {}),
      updatedAt: now,
    };
  });
  // WHY 引用相等: 未命中时返回原数组，调用方可用 === 判断"不存在"
  return touched ? next : templates;
}

export function removeTemplateRecord(
  templates: MailTemplate[],
  id: string,
): MailTemplate[] {
  return templates.filter((template) => template.id !== id);
}

export function filterTemplatesByKeyword(
  templates: MailTemplate[],
  keyword?: string,
): MailTemplate[] {
  const key = keyword?.trim().toLowerCase() ?? '';
  if (!key) {
    return templates;
  }
  return templates.filter((template) =>
    template.name.toLowerCase().includes(key),
  );
}
