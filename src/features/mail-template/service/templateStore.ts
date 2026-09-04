/**
 * localStorage 适配器（薄壳）：持久化整个 db 快照。
 * WHY(不单测): 纯 IO 薄壳，无业务逻辑；门面集成测试以 stub localStorage 覆盖其行为。
 * 容量守卫：写入失败（超限等）转可读错误，由调用方/页面提示换小文件。
 */
import type { MailDbState } from './types';

export const STORAGE_KEY = 'mail-template-db:v2';

function isDbState(value: unknown): value is MailDbState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return Array.isArray(record.templates) && Array.isArray(record.reports);
}

export function loadDb(): MailDbState | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isDbState(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDb(db: MailDbState): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    throw new Error('本地存储写入失败（可能超出容量），请精简报表文件后重试');
  }
}
