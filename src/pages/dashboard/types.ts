// ============================================================================
// 类型定义
// ============================================================================

/** 模块类型枚举 */
export type ModuleType = 'spotSize' | 'dv01' | 'modifiedDuration' | 'ytm';

/** 模块元数据 */
export interface ModuleMeta {
  key: ModuleType;
  label: string;
}

/** API 返回的时点规模数据项 */
export interface TrendItem {
  timePoint: string;
  indicatorValue: number;
}

/** API 返回的国债收益率数据项 */
export interface TreasuryYield {
  dataDate: string;
  yieldRate: number;
}

/** 全局筛选条件 */
export interface DashboardFilters {
  endDate: string;
  accountType: string;
  debtType: string;
  currency: string;
}

/** 后端字典控制的分页大小 */
export type PageSize = 30 | 60 | 90;

/** 单个模块的运行时状态 */
export interface ModuleState {
  scaleData: TrendItem[];
  hasMore: boolean;
  loading: boolean;
}

/** 筛选选项字典 */
export interface FilterOptions {
  accountTypes: { label: string; value: string }[];
  debtTypes: { label: string; value: string }[];
  currencies: { label: string; value: string }[];
}

/** KPI 概览数据 */
export interface KpiData {
  totalScale: number | null;
  avgYield: number | null;
  dailyChange: number | null;
  dateRange: { start: string; end: string } | null;
}
