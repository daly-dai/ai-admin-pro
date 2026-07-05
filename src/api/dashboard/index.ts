import { createRequest } from 'src/plugins/request';

import {
  mockGetChart,
  mockGetDonut,
  mockGetOverview,
  mockGetTable,
  mockGetYield,
} from './mock';
import type {
  ChartQuery,
  ChartVO,
  DonutQuery,
  DonutVO,
  OverviewQuery,
  OverviewVO,
  TableQuery,
  TableVO,
  YieldQuery,
  YieldVO,
} from './types';

// ==================== Mock 开关 ====================

/** 开启后所有接口走 mock 数据，不请求后端 */
const isMock = true;

// ==================== API 实例 ====================

const dashboardApi = createRequest();

// WHY: 大屏接口均为聚合查询 POST，非标准 CRUD
const BASE = '/dashboard/business-analysis';

// ==================== 接口方法 ====================

/** 总览指标查询 — 提供整体经营状况概览，支持同比环比分析 */
export const getOverviewByPost = (data: OverviewQuery): Promise<OverviewVO> => {
  if (isMock) {
    return mockGetOverview(data);
  }
  return dashboardApi.post<OverviewVO>(`${BASE}/overview`, data);
};

/** 图表指标查询 — 支持趋势分析，提供柱状图数据 */
export const getChartByPost = (data: ChartQuery): Promise<ChartVO> => {
  if (isMock) {
    return mockGetChart(data);
  }
  return dashboardApi.post<ChartVO>(`${BASE}/chart`, data);
};

/** 收益率查询 — 投资绩效分析，支持本币投资/本币交易收益率 */
export const getYieldByPost = (data: YieldQuery): Promise<YieldVO> => {
  if (isMock) {
    return mockGetYield(data);
  }
  return dashboardApi.post<YieldVO>(`${BASE}/yield`, data);
};

/** 环形图指标查询 — 业务结构分析，支持 6 种环形图类型 */
export const getDonutByPost = (data: DonutQuery): Promise<DonutVO> => {
  if (isMock) {
    return mockGetDonut(data);
  }
  return dashboardApi.post<DonutVO>(`${BASE}/donut`, data);
};

/** 表格指标查询 — 明细数据分析，支持多级分类和多种对比指标 */
export const getTableByPost = (data: TableQuery): Promise<TableVO> => {
  if (isMock) {
    return mockGetTable(data);
  }
  return dashboardApi.post<TableVO>(`${BASE}/table`, data);
};
