import { create } from 'zustand';

// ==================== 基础类型 ====================

export type Unit = '亿元' | '万元';
export type Dimension = '业务维度' | '财务维度';
export type TimeGranularity = 'month' | 'day';

// ==================== 筛选状态 ====================

interface DashboardFilter {
  endDate: string;
  unit: Unit;
  dimension: Dimension;
}

// ==================== Store ====================

interface DashboardStore {
  // 筛选
  filter: DashboardFilter;

  // 总览数据
  leftStats: StatItem[];
  rightStats: StatItem[];

  // 收益率
  investmentRate: RateItem | null;
  tradingRate: RateItem | null;

  // 图表数据
  leftChartData: Record<string, ChartPoint[]>;
  rightChartData: Record<string, ChartPoint[]>;

  // 详情（按需加载后缓存）
  detailCache: Partial<Record<MetricKey, DetailData>>;

  // 加载状态
  overviewLoading: boolean;
  yieldLoading: boolean;
  chartLoading: boolean;

  // Actions
  setFilter: (partial: Partial<DashboardFilter>) => void;
  setOverviewData: (leftStats: StatItem[], rightStats: StatItem[]) => void;
  setYieldData: (investmentRate: RateItem, tradingRate: RateItem) => void;
  setChartData: (
    side: 'left' | 'right',
    data: Record<string, ChartPoint[]>,
  ) => void;
  setDetailData: (key: MetricKey, data: DetailData) => void;
  setOverviewLoading: (loading: boolean) => void;
  setYieldLoading: (loading: boolean) => void;
  setChartLoading: (loading: boolean) => void;
  reset: () => void;
}

// ==================== 展示类型 ====================

export interface StatItem {
  key: string;
  label: string;
  value: number;
  completionRate: number;
  vsYesterday: number;
  vsLastMonth: number;
  vsLastYear: number;
  momGrowth: number;
  yoyGrowth: number;
}

export interface RateItem {
  label: string;
  value: number;
  benchmark: number;
  beatBenchmark: number;
  vsLastYearDiff: number;
  vsBenchmarkDiff: number;
}

export interface ChartPoint {
  label: string;
  current: number;
  previous: number;
}

export interface PieNode {
  name: string;
  value: number;
  children?: PieNode[];
}

export interface TableRow {
  l1: string;
  l2: string;
  l3?: string;
  netInterest?: number;
  nonInterest?: number;
  actual: number;
  budget?: number;
  completionRate?: number;
  vsYesterday: number;
  vsLastMonth: number;
  vsLastYear: number;
  momGrowth: number;
  yoyGrowth: number;
}

export type MetricKey =
  | 'eva'
  | 'selfEva'
  | 'clientEva'
  | 'netIncome'
  | 'keyBusinessIncome'
  | 'ociValuation'
  | 'bookNonInterest';

export interface DetailData {
  stat: Pick<
    StatItem,
    'value' | 'completionRate' | 'vsYesterday' | 'vsLastMonth' | 'vsLastYear'
  >;
  chart: ChartPoint[];
  pie: PieNode[];
  table: TableRow[];
  tableType:
    | 'eva'
    | 'selfEva'
    | 'clientEva'
    | 'netIncome'
    | 'bookNonInterest'
    | 'oci';
}

// ==================== 初始状态 ====================

const getYesterday = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialState = {
  filter: {
    endDate: getYesterday(),
    unit: '亿元' as Unit,
    dimension: '业务维度' as Dimension,
  },
  leftStats: [] as StatItem[],
  rightStats: [] as StatItem[],
  investmentRate: null as RateItem | null,
  tradingRate: null as RateItem | null,
  leftChartData: {} as Record<string, ChartPoint[]>,
  rightChartData: {} as Record<string, ChartPoint[]>,
  detailCache: {} as Partial<Record<MetricKey, DetailData>>,
  overviewLoading: false,
  yieldLoading: false,
  chartLoading: false,
};

// ==================== Store 创建 ====================

export const useDashboardStore = create<DashboardStore>((set) => ({
  ...initialState,

  setFilter: (partial) =>
    set((state) => ({ filter: { ...state.filter, ...partial } })),

  setOverviewData: (leftStats, rightStats) => set({ leftStats, rightStats }),

  setYieldData: (investmentRate, tradingRate) =>
    set({ investmentRate, tradingRate }),

  setChartData: (side, data) =>
    set(side === 'left' ? { leftChartData: data } : { rightChartData: data }),

  setDetailData: (key, data) =>
    set((state) => ({
      detailCache: { ...state.detailCache, [key]: data },
    })),

  setOverviewLoading: (overviewLoading) => set({ overviewLoading }),
  setYieldLoading: (yieldLoading) => set({ yieldLoading }),
  setChartLoading: (chartLoading) => set({ chartLoading }),

  reset: () => set({ ...initialState }),
}));
