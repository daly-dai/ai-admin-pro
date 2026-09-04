/**
 * 报表规则纯函数：查看权限过滤 / 模板内列表 / 同名冲突判定。
 * WHY(接口语义, PRD 功能五/Q17): 无查看权限的文件不进入任何返回——
 * 过滤必须在 service 层做，页面/列表永远看不到被过滤项。
 */
import type { Report } from './types';

/** 只返回有查看权限的文件（canView=false 从列表消失） */
export function filterViewableReports(reports: Report[]): Report[] {
  return reports.filter((report) => report.canView);
}

/** 取某模板文件夹内的全部文件（含无查看权限项——冲突判定需看到真实文件） */
export function listReportsOfTemplate(
  reports: Report[],
  templateId: string,
): Report[] {
  return reports.filter((report) => report.templateId === templateId);
}

/**
 * 同名冲突判定：限定在模板文件夹内（报表不跨模板共享）；
 * WHY(忽略大小写): 文件名语义等同文件系统（Windows 大小写不敏感）。
 */
export function findNameConflict(
  reports: Report[],
  templateId: string,
  name: string,
): Report | undefined {
  const target = name.trim().toLowerCase();
  return reports.find(
    (report) =>
      report.templateId === templateId &&
      report.name.trim().toLowerCase() === target,
  );
}
