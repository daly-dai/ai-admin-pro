import type {
  ChartItemVO,
  DonutItemVO,
  OverviewItemVO,
  TableItemVO,
  YieldItemVO,
} from 'src/api/dashboard/types';

import type {
  ChartPoint,
  PieNode,
  RateItem,
  StatItem,
  TableRow,
  Unit,
} from 'src/pages/dashboard/store';

// ==================== 单位转换 ====================

/** 万元 → 目标单位 */
export const convertUnit = (value: number, unit: Unit): number => {
  if (unit === '亿元') {
    return Number((value / 10000).toFixed(2));
  }
  return value;
};

// ==================== 格式化 ====================

/** 数字格式化（千位分隔 + 小数位） */
export const formatNumber = (value: number, unit: Unit, digits = 2): string => {
  const converted = convertUnit(value, unit);
  return converted.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

/** 百分比格式化 */
export const formatPercent = (value: number, digits = 2): string =>
  `${(value * 100).toFixed(digits)}%`;

/** 带符号数字 */
export const formatSigned = (value: number, unit: Unit, digits = 2): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, unit, digits)}`;
};

/** 带符号百分比 */
export const formatSignedPercent = (value: number, digits = 2): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(digits)}%`;
};

/** 跑赢基准值 bps */
export const formatBps = (value: number, digits = 2): string =>
  `${value.toFixed(digits)} bps`;

// ==================== API 响应 → 组件类型转换 ====================

/** 概览 API 数据 → StatItem[] */
export const transformOverviewToStats = (
  items: OverviewItemVO[],
  labelMap: Record<string, string>,
  keys: readonly string[],
): StatItem[] =>
  keys.map((key) => {
    const found = items.find((item) => item.indicatorType === key);
    if (!found) {
      return {
        key,
        label: labelMap[key] ?? key,
        value: 0,
        completionRate: 0,
        vsYesterday: 0,
        vsLastMonth: 0,
        vsLastYear: 0,
        momGrowth: 0,
        yoyGrowth: 0,
      };
    }
    return {
      key,
      label: labelMap[key] ?? found.indicatorType,
      value: found.actualValue,
      completionRate: found.completionRate,
      vsYesterday: found.dayOverDay,
      vsLastMonth: found.monthOverMonth,
      vsLastYear: found.yearOverYear,
      momGrowth: found.monthGrowthRate,
      yoyGrowth: found.yearGrowthRate,
    };
  });

/** 收益率 API 数据 → RateItem[] */
export const transformYieldToRateItems = (
  items: YieldItemVO[],
): { investmentRate: RateItem; tradingRate: RateItem } => {
  const byType: Record<string, YieldItemVO> = {};
  for (const item of items) {
    byType[item.type] = item;
  }

  const toRateItem = (
    item: YieldItemVO | undefined,
    label: string,
  ): RateItem => {
    const safe = item ?? ({} as YieldItemVO);
    return {
      label,
      value: safe.yield ?? 0,
      benchmark: safe.baseline ?? 0,
      beatBenchmark: safe.bpsOverBaseline ?? 0,
      vsLastYearDiff: safe.yearOverYear ?? 0,
      vsBenchmarkDiff: safe.baselineDifference ?? 0,
    };
  };

  return {
    investmentRate: toRateItem(byType['本币投资'], '本币投资收益率'),
    tradingRate: toRateItem(byType['本币交易'], '本币交易收益率'),
  };
};

/** 图表 API 数据 → ChartPoint[]，按指标类型分组 */
export const transformChartToPoints = (
  items: ChartItemVO[],
  indicatorTypes: readonly string[],
): Record<string, ChartPoint[]> => {
  const result: Record<string, ChartPoint[]> = {};

  for (const type of indicatorTypes) {
    const typeItems = items.filter((item) => item.indicatorType === type);
    typeItems.sort((prev, next) => prev.dataDate.localeCompare(next.dataDate));
    result[type] = typeItems.map((item) => ({
      label: item.dataDate,
      current: item.actualValue,
      previous: 0, // WHY: 图表接口返回单系列，previous 由调用方按时间粒度 pivot 填充
    }));
  }

  return result;
};

/**
 * 分组柱状图 pivot：将单系列数据按时间粒度拆分为 current/previous。
 *
 * 按日视图：本月 vs 上月同日
 * 按月视图：本年 vs 去年同月
 */
export const pivotChartPoints = (
  points: ChartPoint[],
  granularity: 'month' | 'day',
  _endDate: string,
): ChartPoint[] => {
  if (points.length === 0) {
    return [];
  }

  if (granularity === 'day') {
    // 按日：所有数据为"本月日序"，对比期需从 API 再获取上月数据
    return points.map((point) => ({
      ...point,
      previous: point.current * 0.86, // TODO: 真实数据需二次请求上月
    }));
  }

  // 按月：前半部分本年，后半部分去年（API 按此顺序返回）
  const halfLength = Math.floor(points.length / 2);
  const result: ChartPoint[] = [];

  for (let index = 0; index < halfLength; index++) {
    result.push({
      label: points[index].label,
      current: points[index].current,
      previous: points[halfLength + index]?.current ?? 0,
    });
  }

  return result;
};

/** 环形图 API 数据 → PieNode[]（嵌套） */
export const transformDonutToPieNodes = (items: DonutItemVO[]): PieNode[] => {
  const categoryMap = new Map<string, PieNode>();

  for (const item of items) {
    if (!categoryMap.has(item.category1)) {
      categoryMap.set(item.category1, {
        name: item.category1,
        value: 0,
        children: [],
      });
    }
    const parent = categoryMap.get(item.category1)!;
    parent.value += item.indicatorValue;

    if (item.category2) {
      parent.children!.push({
        name: item.category2,
        value: item.indicatorValue,
      });
    }
  }

  return [...categoryMap.values()];
};

/** 表格 API 数据 → TableRow[] */
export const transformTableToRows = (items: TableItemVO[]): TableRow[] =>
  items.map((item) => ({
    l1: item.category1,
    l2: item.category2,
    l3: item.category3,
    netInterest: item.netInterest,
    nonInterest: item.nonInterest,
    actual: item.actualValue,
    budget: item.budgetTarget,
    completionRate: item.completionRate,
    vsYesterday: item.dayOverDay,
    vsLastMonth: item.monthOverMonth,
    vsLastYear: item.yearOverYear,
    momGrowth: item.monthGrowthRate,
    yoyGrowth: item.yearGrowthRate,
  }));
