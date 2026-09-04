/**
 * 报表文件上传校验纯函数测试（prd 功能三口径：扩展名 .xlsx / ≤10MB / PK 文件头）。
 */
import { describe, expect, it } from 'vitest';

import { validateReportFile } from './reportFileValidation';

const PK_HEADER = new Uint8Array([0x50, 0x4b]); // 'PK'

describe('validateReportFile', () => {
  it('合法 .xlsx（含 PK 头、未超限）→ ok', () => {
    expect(validateReportFile('报表.xlsx', 1024, PK_HEADER)).toEqual({
      ok: true,
    });
  });

  it('扩展名大小写不敏感（.XLSX）', () => {
    expect(validateReportFile('报表.XLSX', 1024, PK_HEADER)).toEqual({
      ok: true,
    });
  });

  it('非 .xlsx 扩展名 → 拒绝', () => {
    expect(validateReportFile('报表.xls', 1024, PK_HEADER)).toEqual({
      ok: false,
      message: '仅支持 .xlsx 格式的 Excel 文件',
    });
  });

  it('超过 10MB → 拒绝', () => {
    expect(
      validateReportFile('报表.xlsx', 10 * 1024 * 1024 + 1, PK_HEADER),
    ).toEqual({ ok: false, message: '文件超过 10MB 上限，请选择更小的文件' });
  });

  it('恰好 10MB → ok（边界允许）', () => {
    expect(
      validateReportFile('报表.xlsx', 10 * 1024 * 1024, PK_HEADER),
    ).toEqual({ ok: true });
  });

  it('头部不是 PK → 拒绝（非有效 xlsx）', () => {
    expect(
      validateReportFile('报表.xlsx', 1024, new Uint8Array([0x00, 0x01])),
    ).toEqual({
      ok: false,
      message: '文件内容不是有效的 Excel（.xlsx）文件',
    });
  });

  it('读不到头部字节（undefined）→ 拒绝', () => {
    expect(validateReportFile('报表.xlsx', 1024, undefined)).toEqual({
      ok: false,
      message: '文件内容不是有效的 Excel（.xlsx）文件',
    });
  });
});
