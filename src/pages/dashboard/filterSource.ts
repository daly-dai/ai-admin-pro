// ============================================================================
// filterSource.ts — 全局筛选参数来源
//
// 大屏项目：替换为从全局 zustand store 读取 filterParams。
//   全局 store 可能异步初始化（URL 参数、本地存储等），首次渲染时
//   filterParams 可能为 null/undefined，消费方需做空值守卫。
//
//   import { useGlobalStore } from 'xxx';
//   export const useFilterParams = () => useGlobalStore(s => s.filterParams);
//   // 注意：返回类型为 DashboardFilters | null
//
// 当前项目：独立维护筛选参数，始终返回有效值（非 null）
// ============================================================================

import dayjs from 'dayjs';
import { create } from 'zustand';

import type { DashboardFilters } from './types';

interface FilterParamsState {
  filterParams: DashboardFilters;
  setFilterParams: (partial: Partial<DashboardFilters>) => void;
}

export const useFilterParamsStore = create<FilterParamsState>((set) => ({
  filterParams: {
    endDate: dayjs().format('YYYY-MM-DD'),
    accountType: 'all',
    debtType: 'all',
    currency: 'CNY',
  },
  setFilterParams: (partial) =>
    set((s) => ({ filterParams: { ...s.filterParams, ...partial } })),
}));

/** 各图表模块通过此 hook 获取全局筛选参数 */
export const useFilterParams = () =>
  useFilterParamsStore((s) => s.filterParams);
