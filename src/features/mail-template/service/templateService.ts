/**
 * 模板 service 门面：组合 纯规则（templateRules/templateCrud）+ localStorage 适配器，
 * 方法签名按真实后端形状（PRD 接口表），接后端时只替换实现。
 * 门面本身薄——业务规则全部下沉纯函数（P017 精神），此处仅做 装载→校验→组合→落库。
 */
import {
  createTemplateRecord,
  filterTemplatesByKeyword,
  removeTemplateRecord,
  updateTemplateRecord,
} from './templateCrud';
import {
  validateBodyPlaceholderCount,
  validateUserList,
} from './templateRules';
import { loadDb, saveDb } from './templateStore';
import type { MailDbState, MailTemplate, MailTemplateInput } from './types';

/** 预置示例模板（Q25：1 个，不含报表，可删除；讲解演示起点） */
export const SAMPLE_TEMPLATE_ID = 'sample-template-001';

function buildSeedDb(now: number): MailDbState {
  return {
    templates: [
      {
        id: SAMPLE_TEMPLATE_ID,
        name: '经营数据周报（示例模板）',
        recipients: ['张三/112233'],
        cc: [],
        bodyHtml:
          '<p>各位同事：</p><p>本周经营数据如下，请查收。</p><p>{{table}}</p>',
        canUpload: true,
        updatedAt: now,
      },
    ],
    reports: [],
  };
}

function readDb(): MailDbState {
  const existing = loadDb();
  if (existing) {
    return existing;
  }
  const seeded = buildSeedDb(Date.now());
  saveDb(seeded);
  return seeded;
}

function newId(): string {
  return crypto.randomUUID();
}

function throwIfInvalidUserList(
  users: string[] | undefined,
  field: '收件人' | '抄送',
  required: boolean,
): void {
  if (users === undefined) {
    return;
  }
  const check = validateUserList(users, field, required);
  if (!check.ok) {
    throw new Error(check.message);
  }
}

function throwIfInvalidBody(bodyHtml: string | undefined): void {
  if (bodyHtml === undefined) {
    return;
  }
  const check = validateBodyPlaceholderCount(bodyHtml);
  if (!check.ok) {
    throw new Error(check.message);
  }
}

/** 模板列表（演示无分页返回全量；keyword 名称搜索）——新模板排前 */
export function getTemplateListByPost(query?: {
  keyword?: string;
}): MailTemplate[] {
  const db = readDb();
  return [...filterTemplatesByKeyword(db.templates, query?.keyword)].sort(
    (left, right) => right.updatedAt - left.updatedAt,
  );
}

/** 模板详情（按 id；不存在返回 undefined，工作台页做空态/404 提示） */
export function getTemplateByIdByGet(id: string): MailTemplate | undefined {
  const db = readDb();
  return db.templates.find((template) => template.id === id);
}

export function createTemplateByPost(input: MailTemplateInput): MailTemplate {
  throwIfInvalidUserList(input.recipients, '收件人', true);
  throwIfInvalidUserList(input.cc, '抄送', false);
  throwIfInvalidBody(input.bodyHtml);
  const db = readDb();
  const now = Date.now();
  const nextTemplates = createTemplateRecord(db.templates, input, {
    id: newId(),
    now,
  });
  const entity = nextTemplates[nextTemplates.length - 1];
  saveDb({ templates: nextTemplates, reports: db.reports });
  return entity;
}

export function updateTemplateByPost(
  id: string,
  patch: Partial<MailTemplateInput>,
): MailTemplate {
  const db = readDb();
  if (!db.templates.some((template) => template.id === id)) {
    throw new Error('模板不存在或已被删除');
  }
  throwIfInvalidUserList(patch.recipients, '收件人', true);
  throwIfInvalidUserList(patch.cc, '抄送', false);
  throwIfInvalidBody(patch.bodyHtml);
  const nextTemplates = updateTemplateRecord(db.templates, {
    id,
    patch,
    now: Date.now(),
  });
  saveDb({ templates: nextTemplates, reports: db.reports });
  return nextTemplates.find((template) => template.id === id) as MailTemplate;
}

/** 删除模板：级联删除其文件夹/全部报表（PRD Q4/Q9 口径） */
export function deleteTemplateByPost(id: string): void {
  const db = readDb();
  const nextTemplates = removeTemplateRecord(db.templates, id);
  if (nextTemplates === db.templates) {
    throw new Error('模板不存在或已被删除');
  }
  const nextReports = db.reports.filter((report) => report.templateId !== id);
  saveDb({ templates: nextTemplates, reports: nextReports });
}
