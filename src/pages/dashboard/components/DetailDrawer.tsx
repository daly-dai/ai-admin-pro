import { createDrawer } from '@dalydb/sdesign';
import { Card, Drawer } from 'antd';
import { useMemo, useState } from 'react';

import { METRIC_LABELS } from 'src/pages/dashboard/constants';
import type { MetricKey, TimeGranularity } from 'src/pages/dashboard/store';
import { useDashboardStore } from 'src/pages/dashboard/store';
import {
  formatNumber,
  formatPercent,
  formatSigned,
  pivotChartPoints,
} from 'src/pages/dashboard/utils';
import DetailTable from './DetailTable';
import DonutChart from './DonutChart';
import GroupedBarChart from './GroupedBarChart';

const LINKED_METRICS: MetricKey[] = ['eva', 'selfEva', 'bookNonInterest'];

/** 统计数值单元格 */
const StatCell: React.FC<{
  label: string;
  value: string;
  color?: string;
}> = ({ label, value, color }) => (
  <div>
    <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>{label}</div>
    <div
      style={{
        fontSize: 16,
        fontWeight: 600,
        color: color ?? '#333',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </div>
  </div>
);

/** 指标详情抽屉 — 使用 createDrawer 工厂 */
const DetailDrawer = createDrawer<{ metricKey: MetricKey }>(
  ({ params, open, onClose }) => {
    const metricKey = params.metricKey;
    const unit = useDashboardStore((state) => state.filter.unit);
    const detail = useDashboardStore((state) => state.detailCache[metricKey]);
    const [granularity, setGranularity] = useState<TimeGranularity>('month');

    const title = METRIC_LABELS[metricKey] ?? metricKey;

    // pivot chart data for granularity
    const chartData = useMemo(() => {
      if (!detail?.chart.length) {
        return [];
      }
      return pivotChartPoints(detail.chart, granularity, '');
    }, [detail, granularity]);

    if (!detail) {
      return null;
    }

    const { stat } = detail;

    return (
      <Drawer
        open={open}
        onClose={onClose}
        title={`${title} 详情`}
        width={680}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 统计数据 */}
          <Card
            size="small"
            title={
              <span style={{ fontSize: 13, fontWeight: 500 }}>统计数据</span>
            }
            styles={{ body: { padding: '12px 16px' } }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 8,
              }}
            >
              <StatCell label="数据" value={formatNumber(stat.value, unit)} />
              <StatCell
                label="完成率"
                value={formatPercent(stat.completionRate)}
              />
              <StatCell
                label="比上日"
                value={formatSigned(stat.vsYesterday, unit)}
                color={stat.vsYesterday >= 0 ? '#F5222D' : '#52C41A'}
              />
              <StatCell
                label="比上月"
                value={formatSigned(stat.vsLastMonth, unit)}
                color={stat.vsLastMonth >= 0 ? '#F5222D' : '#52C41A'}
              />
              <StatCell
                label="比上年"
                value={formatSigned(stat.vsLastYear, unit)}
                color={stat.vsLastYear >= 0 ? '#F5222D' : '#52C41A'}
              />
            </div>
          </Card>

          {/* 双柱状图 */}
          <Card
            size="small"
            title={
              <span style={{ fontSize: 13, fontWeight: 500 }}>双柱状图</span>
            }
            styles={{ body: { padding: 12 } }}
          >
            <GroupedBarChart
              data={chartData}
              unit={unit}
              granularity={granularity}
              onGranularityChange={setGranularity}
              currentLabel={granularity === 'month' ? '本年' : '本月'}
              previousLabel={granularity === 'month' ? '去年' : '上月'}
            />
          </Card>

          {/* 环形图 */}
          <Card
            size="small"
            title={
              <span style={{ fontSize: 13, fontWeight: 500 }}>环形图</span>
            }
            styles={{ body: { padding: 12 } }}
          >
            <DonutChart
              data={detail.pie}
              unit={unit}
              linked={LINKED_METRICS.includes(metricKey)}
            />
          </Card>

          {/* 明细表格 */}
          <Card
            size="small"
            title={
              <span style={{ fontSize: 13, fontWeight: 500 }}>明细表格</span>
            }
            styles={{ body: { padding: 0 } }}
          >
            <DetailTable
              rows={detail.table}
              unit={unit}
              tableType={detail.tableType}
            />
          </Card>
        </div>
      </Drawer>
    );
  },
);

export default DetailDrawer;
