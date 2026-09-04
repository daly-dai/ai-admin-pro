/**
 * reportAccess 纯函数测试。期望值来自 PRD 接口语义（功能五/Q17/Q26）。
 */
import { describe, expect, it } from 'vitest';

import {
  filterViewableReports,
  findNameConflict,
  listReportsOfTemplate,
} from './reportAccess';
import type { Report } from './types';

function makeReport(overrides: Partial<Report>): Report {
  return {
    id: 'report-1',
    templateId: 'template-1',
    name: '报表.xlsx',
    type: 'xlsx',
    fileBase64: 'UEsFBg==',
    canView: true,
    canEdit: true,
    updatedAt: 1000,
    ...overrides,
  };
}

describe('filterViewableReports', () => {
  it('只返回 canView=true，无权限文件不进返回（接口过滤语义）', () => {
    const reports = [
      makeReport({ id: 'a', canView: true }),
      makeReport({ id: 'b', canView: false }),
      makeReport({ id: 'c', canView: true }),
    ];
    expect(filterViewableReports(reports).map((report) => report.id)).toEqual([
      'a',
      'c',
    ]);
  });

  it('空列表 → 空数组', () => {
    expect(filterViewableReports([])).toEqual([]);
  });
});

describe('listReportsOfTemplate', () => {
  it('只返回指定模板的文件', () => {
    const reports = [
      makeReport({ id: 'a', templateId: 't1' }),
      makeReport({ id: 'b', templateId: 't2' }),
      makeReport({ id: 'c', templateId: 't1' }),
    ];
    expect(
      listReportsOfTemplate(reports, 't1').map((report) => report.id),
    ).toEqual(['a', 'c']);
  });
});

describe('findNameConflict', () => {
  it('同模板同名（忽略大小写，文件系统语义）→ 命中', () => {
    const reports = [makeReport({ id: 'a', name: '月度报表.XLSX' })];
    expect(findNameConflict(reports, 'template-1', '月度报表.xlsx')?.id).toBe(
      'a',
    );
  });

  it('不同模板同名 → 不冲突（文件夹隔离）', () => {
    const reports = [makeReport({ id: 'a', templateId: 'other' })];
    expect(
      findNameConflict(reports, 'template-1', '报表.xlsx'),
    ).toBeUndefined();
  });

  it('异名 → 不冲突', () => {
    const reports = [makeReport({ id: 'a', name: '报表A.xlsx' })];
    expect(
      findNameConflict(reports, 'template-1', '报表B.xlsx'),
    ).toBeUndefined();
  });

  it('文件名前后空白容忍', () => {
    const reports = [makeReport({ id: 'a', name: '报表.xlsx' })];
    expect(findNameConflict(reports, 'template-1', '  报表.xlsx  ')?.id).toBe(
      'a',
    );
  });
});
