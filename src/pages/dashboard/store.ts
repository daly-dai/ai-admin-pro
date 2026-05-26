// ============================================================================
// store.ts — 多模块仪表盘状态管理（纯 zustand，零中间件）
//
// 架构：
//   - pageSize: 全局共享
//   - modules: 每个 ModuleType 独立维护 scaleData / hasMore / loading
//   - scaleCache: 时点规模缓存，key 含 moduleType（模块间隔离）
//   - yieldCache: 国债收益率缓存，key 不含 moduleType（模块间共享）
//   - yieldData: 全局国债收益率累积数据
//
// 筛选参数由 filterSource.ts 提供（大屏项目接入全局 filterParams）
// ============================================================================

import { create } from 'zustand';

import type {
  DashboardFilters,
  ModuleState,
  ModuleType,
  PageSize,
  TreasuryYield,
  TrendItem,
} from './types';

// ---- 初始状态工厂 ----

const createInitialModuleState = (): ModuleState => ({
  scaleData: [],
  hasMore: true,
  loading: false,
});

const createInitialModules = (): Record<ModuleType, ModuleState> => ({
  spotSize: createInitialModuleState(),
  dv01: createInitialModuleState(),
  modifiedDuration: createInitialModuleState(),
  ytm: createInitialModuleState(),
});

// ---- 缓存 Key 生成 ----

export const scaleCacheKey = (
  endDate: string,
  pageSize: PageSize,
  filters: DashboardFilters,
  moduleType: ModuleType,
): string =>
  `${endDate}_${pageSize}_${filters.accountType}_${filters.debtType}_${filters.currency}_${moduleType}`;

export const yieldCacheKey = (endDate: string, pageSize: PageSize): string =>
  `${endDate}_${pageSize}`;

// ---- Store 类型 ----

interface DashboardState {
  pageSize: PageSize;

  scaleCache: Record<string, TrendItem[]>;
  yieldCache: Record<string, TreasuryYield[]>;

  modules: Record<ModuleType, ModuleState>;
  yieldData: TreasuryYield[];

  setPageSize: (size: PageSize) => void;

  setScaleCache: (key: string, data: TrendItem[]) => void;
  setYieldCache: (key: string, data: TreasuryYield[]) => void;

  appendModuleData: (
    moduleType: ModuleType,
    scale: TrendItem[],
    yields: TreasuryYield[],
  ) => void;
  resetModule: (moduleType: ModuleType) => void;
  resetAllModules: () => void;
  setModuleLoading: (moduleType: ModuleType, v: boolean) => void;
  setModuleHasMore: (moduleType: ModuleType, v: boolean) => void;
}

// ============================================================================
// Store 实例
// ============================================================================

export const useDashboardStore = create<DashboardState>()((set) => ({
  pageSize: 30,
  scaleCache: {},
  yieldCache: {},
  modules: createInitialModules(),
  yieldData: [],

  setPageSize: (size) => set(() => ({ pageSize: size })),

  setScaleCache: (key, data) =>
    set((s) => ({ scaleCache: { ...s.scaleCache, [key]: data } })),

  setYieldCache: (key, data) =>
    set((s) => ({ yieldCache: { ...s.yieldCache, [key]: data } })),

  appendModuleData: (moduleType, scale, yields) =>
    set((s) => ({
      modules: {
        ...s.modules,
        [moduleType]: {
          ...s.modules[moduleType],
          scaleData: [...scale, ...s.modules[moduleType].scaleData],
        },
      },
      yieldData: [...yields, ...s.yieldData],
    })),

  resetModule: (moduleType) =>
    set((s) => ({
      modules: {
        ...s.modules,
        [moduleType]: createInitialModuleState(),
      },
    })),

  resetAllModules: () =>
    set(() => ({
      modules: createInitialModules(),
      yieldData: [],
    })),

  setModuleLoading: (moduleType, v) =>
    set((s) => ({
      modules: {
        ...s.modules,
        [moduleType]: { ...s.modules[moduleType], loading: v },
      },
    })),

  setModuleHasMore: (moduleType, v) =>
    set((s) => ({
      modules: {
        ...s.modules,
        [moduleType]: { ...s.modules[moduleType], hasMore: v },
      },
    })),
}));
