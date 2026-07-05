import { Card } from 'antd';
import { useMemo, useState } from 'react';

import type {
  ChartPoint,
  MetricKey,
  RateItem,
  StatItem,
  TimeGranularity,
} from 'src/pages/dashboard/store';
import { useDashboardStore } from 'src/pages/dashboard/store';
import GroupedBarChart from './GroupedBarChart';
import RatePanel from './RatePanel';
import StatCard from './StatCard';

interface CoreModuleProps {
  title: string;
  stats: StatItem[];
  rateTitle: string;
  rate: RateItem | null;
  chartDataMap: Record<string, ChartPoint[]>;
  metricOptions: readonly { value: string; label: string }[];
  defaultMetric: string;
  statKeys: readonly MetricKey[];
  onStatClick: (key: MetricKey) => void;
}

const CoreModule: React.FC<CoreModuleProps> = ({
  title,
  stats,
  rateTitle,
  rate,
  chartDataMap,
  metricOptions,
  defaultMetric,
  statKeys,
  onStatClick,
}) => {
  const unit = useDashboardStore((state) => state.filter.unit);
  const [granularity, setGranularity] = useState<TimeGranularity>('month');
  const [selectedMetric, setSelectedMetric] = useState(defaultMetric);

  const chartData = useMemo(
    () => chartDataMap[selectedMetric] ?? [],
    [chartDataMap, selectedMetric],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 标题 */}
      <Card
        size="small"
        styles={{ body: { padding: '6px 16px' } }}
        title={<span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>}
        extra={
          <span style={{ fontSize: 12, color: '#999' }}>单位：{unit}</span>
        }
      />

      {/* 统计卡片 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        {stats.map((item, index) => (
          <StatCard
            key={item.key}
            item={item}
            unit={unit}
            onClick={() => onStatClick(statKeys[index])}
          />
        ))}
      </div>

      {/* 收益率 */}
      <RatePanel title={rateTitle} rate={rate} />

      {/* 柱状图 */}
      <Card size="small" styles={{ body: { padding: 12 } }}>
        <GroupedBarChart
          data={chartData}
          unit={unit}
          granularity={granularity}
          onGranularityChange={setGranularity}
          metricOptions={metricOptions}
          metricValue={selectedMetric}
          onMetricChange={setSelectedMetric}
          currentLabel={granularity === 'month' ? '本年' : '本月'}
          previousLabel={granularity === 'month' ? '去年' : '上月'}
        />
      </Card>
    </div>
  );
};

export default CoreModule;
