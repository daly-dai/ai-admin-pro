/**
 * 报表 service 门面：组合 纯规则（reportAccess）+ localStorage 适配器。
 * 方法签名按真实后端形状（PRD 接口表）；列表只返回 canView 文件（接口过滤语义）。
 */
import {
  filterViewableReports,
  findNameConflict,
  listReportsOfTemplate,
} from './reportAccess';
import { loadDb, saveDb } from './templateStore';
import type {
  MailDbState,
  Report,
  ReportMeta,
  UploadReportResult,
} from './types';

function readDb(): MailDbState {
  return (
    loadDb() ?? {
      templates: [],
      reports: [],
    }
  );
}

function newId(): string {
  return crypto.randomUUID();
}

function toMeta(report: Report): ReportMeta {
  // WHY 显式列举: Omit 只表类型，运行时需真正剥掉 fileBase64（列表不下发文件体）
  return {
    id: report.id,
    templateId: report.templateId,
    name: report.name,
    type: report.type,
    canView: report.canView,
    canEdit: report.canEdit,
    updatedAt: report.updatedAt,
  };
}

export interface UploadReportInput {
  templateId: string;
  /** 含 .xlsx 扩展名（附件名 = 报表名） */
  name: string;
  fileBase64: string;
  /** true = 前端已确认同名覆盖（Q26） */
  overwrite?: boolean;
}

/** 报表列表（按模板）：只返回 canView；按更新时间新→旧 */
export function getReportListByPost(templateId: string): ReportMeta[] {
  const db = readDb();
  return filterViewableReports(listReportsOfTemplate(db.reports, templateId))
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .map(toMeta);
}

/**
 * 上传 xlsx：同名且未带 overwrite → conflict（前端弹确认）；
 * 同名 + overwrite → 覆盖（保留原 id、刷新文件体与更新时间）；
 * 异名 → 新增。上传者视角默认可查看/可编辑（PRD 功能三）。
 */
export function uploadReportByPost(
  input: UploadReportInput,
): UploadReportResult {
  const db = readDb();
  if (!db.templates.some((template) => template.id === input.templateId)) {
    throw new Error('模板不存在，无法上传报表');
  }
  const conflict = findNameConflict(db.reports, input.templateId, input.name);
  if (conflict && !input.overwrite) {
    return { status: 'conflict' };
  }
  const now = Date.now();
  let nextReports: Report[];
  let report: Report;
  if (conflict) {
    report = {
      ...conflict,
      fileBase64: input.fileBase64,
      updatedAt: now,
    };
    nextReports = db.reports.map((item) =>
      item.id === conflict.id ? report : item,
    );
  } else {
    report = {
      id: newId(),
      templateId: input.templateId,
      name: input.name,
      type: 'xlsx',
      fileBase64: input.fileBase64,
      canView: true,
      canEdit: true,
      updatedAt: now,
    };
    nextReports = [...db.reports, report];
  }
  saveDb({ templates: db.templates, reports: nextReports });
  return {
    status: conflict ? 'overwritten' : 'created',
    report: toMeta(report),
  };
}

/** 获取报表文件（xlsx base64，供阅读/预览/编辑）；无查看权限不给文件（接口语义） */
export function downloadReportByPost(reportId: string): Report | undefined {
  const db = readDb();
  const report = db.reports.find((item) => item.id === reportId);
  if (!report || !report.canView) {
    return undefined;
  }
  return report;
}

/**
 * 发布（mock 平台保存编辑并导出文件流）：回写 fileBase64、刷新 updatedAt。
 * 仅编辑权限可发布（无编辑权限 = 平台侧拦截，PRD 功能五）。
 */
export function triggerReportSaveByPost(
  reportId: string,
  fileBase64: string,
): ReportMeta {
  const db = readDb();
  const report = db.reports.find((item) => item.id === reportId);
  if (!report) {
    throw new Error('报表不存在或已被删除');
  }
  if (!report.canEdit) {
    throw new Error('无编辑权限，无法发布');
  }
  const updated: Report = { ...report, fileBase64, updatedAt: Date.now() };
  const nextReports = db.reports.map((item) =>
    item.id === reportId ? updated : item,
  );
  saveDb({ templates: db.templates, reports: nextReports });
  return toMeta(updated);
}
