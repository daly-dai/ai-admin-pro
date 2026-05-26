import dayjs from 'dayjs';

import type { ModuleType, PageSize, TreasuryYield, TrendItem } from './types';

// ============================================================================
// 各模块 mock 数据范围配置（让不同模块的数据看起来不同）
// ============================================================================

/** 模块 → { 基准值, 振幅 } */
const MODULE_RANGE: Record<ModuleType, { base: number; amp: number }> = {
  spotSize: { base: 3000, amp: 500 },
  dv01: { base: 800, amp: 200 },
  modifiedDuration: { base: 4, amp: 2 },
  ytm: { base: 3.5, amp: 1.5 },
};

// ============================================================================
// Mock 数据生成器
// ============================================================================

/**
 * 按 endDate 确定性生成时点规模数据
 * 同一组参数始终返回相同数据（用于模拟后端幂等性 + 缓存验证）
 */
export const mockScaleData = (
  endDate: string,
  pageSize: PageSize,
  accountType: string,
  debtType: string,
  currency: string,
  moduleType: ModuleType,
): TrendItem[] => {
  const end = dayjs(endDate);
  const result: TrendItem[] = [];
  const { base, amp } = MODULE_RANGE[moduleType];
  // 通过参数字符生成稳定种子
  const seedBase =
    endDate.charCodeAt(0) +
    accountType.length +
    debtType.length +
    currency.length +
    moduleType.length;

  for (let i = pageSize - 1; i >= 0; i--) {
    const date = end.subtract(i, 'day').format('YYYY-MM-DD');
    const seed = (seedBase + i) % 100;
    result.push({
      timePoint: date,
      indicatorValue: +(
        base +
        seed * (amp / 20) +
        Math.sin(i * 0.3) * amp
      ).toFixed(2),
    });
  }

  return result;
};

/**
 * 按 endDate 确定性生成国债收益率数据
 */
export const mockTreasuryYieldData = (
  endDate: string,
  pageSize: PageSize,
): TreasuryYield[] => {
  const end = dayjs(endDate);
  const result: TreasuryYield[] = [];
  const base = endDate.charCodeAt(0);

  for (let i = pageSize - 1; i >= 0; i--) {
    const date = end.subtract(i, 'day').format('YYYY-MM-DD');
    const seed = (base + i) % 100;
    result.push({
      dataDate: date,
      yieldRate: +(2.5 + seed * 0.02 + Math.sin(i * 0.2) * 0.3).toFixed(4),
    });
  }

  return result;
};

// ============================================================================
// 模拟异步请求
// ============================================================================

const delay = <T>(data: T, ms = 200): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

// ============================================================================
// Mock API
// ============================================================================

/** Mock API：获取时点规模（按模块类型返回不同范围的数据） */
export const fetchScaleData = async (params: {
  endDate: string;
  pageSize: PageSize;
  accountType: string;
  debtType: string;
  currency: string;
  moduleType: ModuleType;
}): Promise<TrendItem[]> => {
  const data = mockScaleData(
    params.endDate,
    params.pageSize,
    params.accountType,
    params.debtType,
    params.currency,
    params.moduleType,
  );
  return delay(data);
};

/** Mock API：获取国债收益率（4个模块共用，参数不含 moduleType） */
export const fetchTreasuryYieldData = async (params: {
  endDate: string;
  pageSize: PageSize;
}): Promise<TreasuryYield[]> => {
  const data = mockTreasuryYieldData(params.endDate, params.pageSize);
  return delay(data);
};
