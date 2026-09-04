/**
 * service 门面集成测试（第二环）：stub localStorage，
 * 覆盖 模板 CRUD 往返 / 校验防御 / 级联删除 / 报表上传冲突→覆盖 /
 * 权限过滤（接口语义）/ 发布回写。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  downloadReportByPost,
  getReportListByPost,
  triggerReportSaveByPost,
  uploadReportByPost,
} from './reportService';
import {
  createTemplateByPost,
  deleteTemplateByPost,
  getTemplateListByPost,
  SAMPLE_TEMPLATE_ID,
  updateTemplateByPost,
} from './templateService';
import { loadDb, saveDb } from './templateStore';
import type { MailTemplateInput } from './types';

let storage = new Map<string, string>();

function installLocalStorageStub(): void {
  storage = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
  });
}

function validInput(): MailTemplateInput {
  return {
    name: '月度经营报告',
    recipients: ['a@x.com', 'b@y.cn'],
    cc: [],
    bodyHtml: '<p>{{table}}</p>',
  };
}

beforeEach(() => {
  installLocalStorageStub();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('模板 CRUD 往返（经门面 + localStorage）', () => {
  it('首访自动预置 1 个示例模板（Q25，不含报表）', () => {
    const list = getTemplateListByPost();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(SAMPLE_TEMPLATE_ID);
    expect(getReportListByPost(SAMPLE_TEMPLATE_ID)).toEqual([]);
  });

  it('create → 列表含新模板；重读（刷新）不丢；keyword 搜索', () => {
    const created = createTemplateByPost(validInput());
    const list = getTemplateListByPost();
    expect(list).toHaveLength(2);
    // 排序按 updatedAt 倒序，但毫秒级可能并列——不断言具体次序，只断言都在
    expect(list.map((template) => template.id)).toEqual(
      expect.arrayContaining([SAMPLE_TEMPLATE_ID, created.id]),
    );
    // 每次调用都从 localStorage 重读 = 模拟刷新后数据不丢
    const hit = getTemplateListByPost({ keyword: '月度' });
    expect(hit.map((template) => template.id)).toEqual([created.id]);
    expect(getTemplateListByPost({ keyword: '不存在的' })).toEqual([]);
  });

  it('校验失败抛 PRD 口径错误（门面防御）', () => {
    expect(() =>
      createTemplateByPost({ ...validInput(), bodyHtml: '<p>没有表格</p>' }),
    ).toThrow('正文必须包含占位符');
    expect(() =>
      createTemplateByPost({ ...validInput(), bodyHtml: '{{table}}{{table}}' }),
    ).toThrow('不允许存在多个占位符');
    expect(() =>
      createTemplateByPost({ ...validInput(), recipients: ['oops'] }),
    ).toThrow('收件人包含非法邮箱：oops');
  });

  it('update 改名刷新 updatedAt；未命中抛错', () => {
    const created = createTemplateByPost(validInput());
    const updated = updateTemplateByPost(created.id, { name: '新名称' });
    expect(updated.name).toBe('新名称');
    expect(updated.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);
    expect(() => updateTemplateByPost('no-such-id', { name: 'x' })).toThrow(
      '模板不存在或已被删除',
    );
  });

  it('delete 级联删除其文件夹/全部报表', () => {
    const created = createTemplateByPost(validInput());
    const uploaded = uploadReportByPost({
      templateId: created.id,
      name: '报表.xlsx',
      fileBase64: 'UEs=',
    });
    if (uploaded.status === 'created') {
      expect(getReportListByPost(created.id)).toHaveLength(1);
      deleteTemplateByPost(created.id);
      expect(getTemplateListByPost({ keyword: '月度' })).toEqual([]);
      expect(getReportListByPost(created.id)).toEqual([]);
      expect(downloadReportByPost(uploaded.report.id)).toBeUndefined();
    }
  });
});

describe('报表：上传 / 冲突覆盖 / 权限过滤 / 发布回写', () => {
  function createHostTemplate(): string {
    return createTemplateByPost(validInput()).id;
  }

  it('异名上传 → created；列表项不下发 fileBase64', () => {
    const templateId = createHostTemplate();
    const result = uploadReportByPost({
      templateId,
      name: '报表A.xlsx',
      fileBase64: 'UEs=',
    });
    expect(result.status).toBe('created');
    if (result.status === 'created') {
      expect(result.report).toMatchObject({
        name: '报表A.xlsx',
        canView: true,
        canEdit: true,
      });
      expect(result.report).not.toHaveProperty('fileBase64');
    }
    const list = getReportListByPost(templateId);
    expect(list).toHaveLength(1);
    expect(list[0]).not.toHaveProperty('fileBase64');
  });

  it('同名未带 overwrite → conflict；带 overwrite → 覆盖且保留原 id', () => {
    const templateId = createHostTemplate();
    const first = uploadReportByPost({
      templateId,
      name: '报表.xlsx',
      fileBase64: 'AAAA',
    });
    expect(first.status).toBe('created');
    if (first.status !== 'created') {
      return;
    }
    const second = uploadReportByPost({
      templateId,
      name: '报表.xlsx',
      fileBase64: 'BBBB',
    });
    expect(second.status).toBe('conflict');
    const third = uploadReportByPost({
      templateId,
      name: '报表.xlsx',
      fileBase64: 'CCCC',
      overwrite: true,
    });
    expect(third.status).toBe('overwritten');
    if (third.status === 'overwritten') {
      expect(third.report.id).toBe(first.report.id);
    }
    expect(getReportListByPost(templateId)).toHaveLength(1);
    expect(downloadReportByPost(first.report.id)?.fileBase64).toBe('CCCC');
  });

  it('canView=false 的报表：列表不出现、download 不给文件（Q17 语义）', () => {
    const templateId = createHostTemplate();
    const uploaded = uploadReportByPost({
      templateId,
      name: '隐藏报表.xlsx',
      fileBase64: 'UEs=',
    });
    if (uploaded.status !== 'created') {
      return;
    }
    const db = loadDb();
    if (!db) {
      throw new Error('db 未初始化');
    }
    db.reports = db.reports.map((report) =>
      report.id === uploaded.report.id ? { ...report, canView: false } : report,
    );
    saveDb(db);
    expect(getReportListByPost(templateId)).toEqual([]);
    expect(downloadReportByPost(uploaded.report.id)).toBeUndefined();
  });

  it('发布回写 fileBase64 + 刷新 updatedAt；无编辑权限抛错', () => {
    const templateId = createHostTemplate();
    const uploaded = uploadReportByPost({
      templateId,
      name: '待发布.xlsx',
      fileBase64: 'AAAA',
    });
    if (uploaded.status !== 'created') {
      return;
    }
    const saved = triggerReportSaveByPost(uploaded.report.id, 'ZZZZ');
    expect(saved.updatedAt).toBeGreaterThanOrEqual(uploaded.report.updatedAt);
    expect(downloadReportByPost(uploaded.report.id)?.fileBase64).toBe('ZZZZ');
    // 置为只读后发布被拦截（PRD 功能五：无编辑权限 = 平台侧拦截）
    const db = loadDb();
    if (!db) {
      throw new Error('db 未初始化');
    }
    db.reports = db.reports.map((report) =>
      report.id === uploaded.report.id ? { ...report, canEdit: false } : report,
    );
    saveDb(db);
    expect(() => triggerReportSaveByPost(uploaded.report.id, 'YYYY')).toThrow(
      '无编辑权限，无法发布',
    );
  });
});
