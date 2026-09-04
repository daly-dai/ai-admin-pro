/**
 * 报表文件上传校验纯函数（prd 功能三口径）：扩展名 .xlsx / ≤10MB / PK 文件头。
 * WHY 纯函数可测：headerBytes 由调用方读取前 2 字节注入（File.slice 是浏览器 IO，不进被测 seam）。
 */
export type ReportFileCheckResult =
  | { ok: true }
  | { ok: false; message: string };

/** 上传上限（prd：≤10MB） */
export const REPORT_SIZE_LIMIT = 10 * 1024 * 1024;

export function validateReportFile(
  fileName: string,
  fileSize: number,
  headerBytes: Uint8Array | undefined,
): ReportFileCheckResult {
  if (!fileName.toLowerCase().endsWith('.xlsx')) {
    return { ok: false, message: '仅支持 .xlsx 格式的 Excel 文件' };
  }
  if (fileSize > REPORT_SIZE_LIMIT) {
    return { ok: false, message: '文件超过 10MB 上限，请选择更小的文件' };
  }
  // xlsx = zip 容器，文件头固定为 'PK'（0x50 0x4B）
  const isPkHeader =
    headerBytes !== undefined &&
    headerBytes.length >= 2 &&
    headerBytes[0] === 0x50 &&
    headerBytes[1] === 0x4b;
  if (!isPkHeader) {
    return { ok: false, message: '文件内容不是有效的 Excel（.xlsx）文件' };
  }
  return { ok: true };
}
