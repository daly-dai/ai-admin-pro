// ==================== 请求参数 ====================

/** 总览指标查询 */
export interface OverviewQuery {
  endDate: string;
  dimension: string; // '业务维度' | '财务维度'
}

/** 图表指标查询 */
export interface ChartQuery {
  endDate: string;
  dateDimension: string; // '日' | '月'
  dimension: string;
}

/** 收益率查询 */
export interface YieldQuery {
  endDate: string;
}

/** 环形图指标查询 */
export interface DonutQuery {
  endDate: string;
  dimension: string;
  indicatorType: string;
}

/** 表格指标查询 */
export interface TableQuery {
  endDate: string;
  dimension: string;
  indicatorType: string;
}

// ==================== 响应类型 ====================

/** 总览指标项 */
export interface OverviewItemVO {
  indicatorType: string;
  actualValue: number;
  dayOverDay: number;
  monthOverMonth: number;
  monthGrowthRate: number;
  yearOverYear: number;
  yearGrowthRate: number;
  completionRate: number;
}

/** 总览响应 */
export interface OverviewVO {
  overviewData: OverviewItemVO[];
}

/** 图表指标项 */
export interface ChartItemVO {
  indicatorType: string;
  dataDate: string;
  actualValue: number;
}

/** 图表响应 */
export interface ChartVO {
  chartData: ChartItemVO[];
}

/** 收益率项 */
export interface YieldItemVO {
  type: string;
  yield: number;
  baseline: number;
  bpsOverBaseline: number;
  yearOverYear: number;
  baselineDifference: number;
}

/** 收益率响应 */
export type YieldVO = YieldItemVO[];

/** 环形图项 */
export interface DonutItemVO {
  category1: string;
  category2: string;
  indicatorValue: number;
}

/** 环形图响应 */
export type DonutVO = DonutItemVO[];

/** 表格项 */
export interface TableItemVO {
  category1: string;
  category2: string;
  category3?: string;
  actualValue: number;
  budgetTarget?: number;
  nonInterest?: number;
  netInterest?: number;
  completionRate?: number;
  dayOverDay: number;
  monthOverMonth: number;
  yearOverYear: number;
  monthGrowthRate: number;
  yearGrowthRate: number;
}

/** 表格响应 */
export interface TableVO {
  tableData: TableItemVO[];
}
