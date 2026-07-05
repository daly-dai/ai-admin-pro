import { useRequest } from 'ahooks';
import { useCallback, useRef } from 'react';

import type { DrawerContainerRef } from '@dalydb/sdesign';
import { Card } from 'antd';
import {
  getChartByPost,
  getDonutByPost,
  getOverviewByPost,
  getTableByPost,
  getYieldByPost,
} from 'src/api/dashboard';
import DashboardGrid from 'src/components/DashboardGrid';
import {
  LEFT_CHART_OPTIONS,
  LEFT_STAT_KEYS,
  METRIC_LABELS,
  RIGHT_CHART_OPTIONS,
  RIGHT_STAT_KEYS,
} from 'src/pages/dashboard/constants';
import type {
  ChartPoint,
  DetailData,
  MetricKey,
  StatItem,
} from 'src/pages/dashboard/store';
import { useDashboardStore } from 'src/pages/dashboard/store';
import {
  pivotChartPoints,
  transformChartToPoints,
  transformDonutToPieNodes,
  transformOverviewToStats,
  transformTableToRows,
  transformYieldToRateItems,
} from 'src/pages/dashboard/utils';
import CoreModule from './components/CoreModule';
import DetailDrawer from './components/DetailDrawer';
import TopFilter from './components/TopFilter';

/** MetricKey → tableType 映射 */
const TABLE_TYPE_MAP: Record<MetricKey, DetailData['tableType']> = {
  eva: 'eva',
  selfEva: 'selfEva',
  clientEva: 'clientEva',
  netIncome: 'netIncome',
  keyBusinessIncome: 'oci',
  ociValuation: 'oci',
  bookNonInterest: 'bookNonInterest',
};

/**
 * 从左右 stats 中查找指标值
 * leftStats 和 rightStats 分别对应左侧/右侧指标面板
 */
const findStatValue = (
  stats: { left: StatItem[]; right: StatItem[] },
  key: MetricKey,
  field: keyof Pick<
    StatItem,
    'value' | 'completionRate' | 'vsYesterday' | 'vsLastMonth' | 'vsLastYear'
  >,
): number =>
  stats.left.find((st) => st.key === key)?.[field] ??
  stats.right.find((st) => st.key === key)?.[field] ??
  0;

/** 左右列比例（各占一半） */
const GRID_COLS = [12, 12];

const DashboardPage: React.FC = () => {
  const filter = useDashboardStore((state) => state.filter);
  const setOverviewData = useDashboardStore((state) => state.setOverviewData);
  const setYieldData = useDashboardStore((state) => state.setYieldData);
  const setChartData = useDashboardStore((state) => state.setChartData);
  const setDetailData = useDashboardStore((state) => state.setDetailData);
  const leftStats = useDashboardStore((state) => state.leftStats);
  const rightStats = useDashboardStore((state) => state.rightStats);
  const investmentRate = useDashboardStore((state) => state.investmentRate);
  const tradingRate = useDashboardStore((state) => state.tradingRate);
  const leftChartData = useDashboardStore((state) => state.leftChartData);
  const rightChartData = useDashboardStore((state) => state.rightChartData);

  const drawerRef = useRef<DrawerContainerRef<{ metricKey: MetricKey }>>(null);

  // ==================== 数据获取 ====================

  // 总览 + 收益率
  useRequest(
    async () => {
      const [overviewRes, yieldRes] = await Promise.all([
        getOverviewByPost({
          endDate: filter.endDate,
          dimension: filter.dimension,
        }),
        getYieldByPost({ endDate: filter.endDate }),
      ]);
      return { overviewRes, yieldRes };
    },
    {
      refreshDeps: [filter.endDate, filter.dimension],
      onSuccess: ({ overviewRes, yieldRes }) => {
        const left = transformOverviewToStats(
          overviewRes.overviewData,
          METRIC_LABELS,
          LEFT_STAT_KEYS,
        );
        const right = transformOverviewToStats(
          overviewRes.overviewData,
          METRIC_LABELS,
          RIGHT_STAT_KEYS,
        );
        setOverviewData(left, right);

        const { investmentRate: inv, tradingRate: tra } =
          transformYieldToRateItems(yieldRes);
        setYieldData(inv, tra);
      },
    },
  );

  // 图表数据（按 dimension 变化时刷新）
  useRequest(
    async () => {
      const [monthRes, dayRes] = await Promise.all([
        getChartByPost({
          endDate: filter.endDate,
          dateDimension: '月',
          dimension: filter.dimension,
        }),
        getChartByPost({
          endDate: filter.endDate,
          dateDimension: '日',
          dimension: filter.dimension,
        }),
      ]);
      return { monthRes, dayRes };
    },
    {
      refreshDeps: [filter.endDate, filter.dimension],
      onSuccess: ({ monthRes }) => {
        // 左侧指标：selfEva, clientEva, netIncome
        const leftMonth = transformChartToPoints(
          monthRes.chartData,
          LEFT_CHART_OPTIONS.map((opt) => opt.value),
        );
        // pivot 为 current/previous
        const leftPivoted: Record<string, ChartPoint[]> = {};
        for (const [key, points] of Object.entries(leftMonth)) {
          leftPivoted[key] = pivotChartPoints(points, 'month', filter.endDate);
        }
        setChartData('left', leftPivoted);

        // 右侧指标：keyBusinessIncome, bookNonInterest, ociValuation
        const rightMonth = transformChartToPoints(
          monthRes.chartData,
          RIGHT_CHART_OPTIONS.map((opt) => opt.value),
        );
        const rightPivoted: Record<string, ChartPoint[]> = {};
        for (const [key, points] of Object.entries(rightMonth)) {
          rightPivoted[key] = pivotChartPoints(points, 'month', filter.endDate);
        }
        setChartData('right', rightPivoted);
      },
    },
  );

  // ==================== 交互处理 ====================

  const handleStatClick = useCallback(
    async (key: MetricKey) => {
      // 先打开抽屉（loading 态由各组件内部处理）
      drawerRef.current?.open({ metricKey: key });

      try {
        const [donutRes, tableRes] = await Promise.all([
          getDonutByPost({
            endDate: filter.endDate,
            dimension: filter.dimension,
            indicatorType: key,
          }),
          getTableByPost({
            endDate: filter.endDate,
            dimension: filter.dimension,
            indicatorType: key,
          }),
        ]);

        // 获取图表数据用于详情
        const chartRes = await getChartByPost({
          endDate: filter.endDate,
          dateDimension: '月',
          dimension: filter.dimension,
        });
        const chartPoints = transformChartToPoints(chartRes.chartData, [key])[
          key
        ];

        setDetailData(key, {
          stat: {
            value: findStatValue(
              { left: leftStats, right: rightStats },
              key,
              'value',
            ),
            completionRate: findStatValue(
              { left: leftStats, right: rightStats },
              key,
              'completionRate',
            ),
            vsYesterday: findStatValue(
              { left: leftStats, right: rightStats },
              key,
              'vsYesterday',
            ),
            vsLastMonth: findStatValue(
              { left: leftStats, right: rightStats },
              key,
              'vsLastMonth',
            ),
            vsLastYear: findStatValue(
              { left: leftStats, right: rightStats },
              key,
              'vsLastYear',
            ),
          },
          chart: chartPoints ?? [],
          pie: transformDonutToPieNodes(donutRes),
          table: transformTableToRows(tableRes.tableData),
          tableType: TABLE_TYPE_MAP[key],
        });
      } catch {
        // 接口失败由 request 插件统一处理 toast
      }
    },
    [filter.endDate, filter.dimension, leftStats, rightStats, setDetailData],
  );

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        padding: '12px 16px',
        background: '#fff',
      }}
    >
      {/* 顶部筛选 */}
      <Card
        size="small"
        styles={{ body: { padding: '8px 16px' } }}
        style={{ marginBottom: 12 }}
      >
        <TopFilter />
      </Card>

      {/* 核心区域：左右双模块 */}
      <DashboardGrid cols={GRID_COLS} gap={12}>
        <CoreModule
          title={filter.dimension}
          stats={leftStats}
          rateTitle="本币投资收益率"
          rate={investmentRate}
          chartDataMap={leftChartData}
          metricOptions={LEFT_CHART_OPTIONS}
          defaultMetric="selfEva"
          statKeys={LEFT_STAT_KEYS as unknown as MetricKey[]}
          onStatClick={handleStatClick}
        />

        <CoreModule
          title="其他经营指标"
          stats={rightStats}
          rateTitle="本币交易收益率"
          rate={tradingRate}
          chartDataMap={rightChartData}
          metricOptions={RIGHT_CHART_OPTIONS}
          defaultMetric="keyBusinessIncome"
          statKeys={RIGHT_STAT_KEYS as unknown as MetricKey[]}
          onStatClick={handleStatClick}
        />
      </DashboardGrid>

      {/* 详情抽屉 */}
      <DetailDrawer ref={drawerRef} />
    </div>
  );
};

export default DashboardPage;
