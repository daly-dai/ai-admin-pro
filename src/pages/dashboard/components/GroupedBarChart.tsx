import { Select } from 'antd';
import { useMemo } from 'react';

import type { EChartsOption } from 'echarts';
import EChartsBase from 'src/components/EChartsBase';
import { BAR_COLORS } from 'src/pages/dashboard/constants';
import type {
  ChartPoint,
  TimeGranularity,
  Unit,
} from 'src/pages/dashboard/store';
import { convertUnit } from 'src/pages/dashboard/utils';

interface GroupedBarChartProps {
  data: ChartPoint[];
  unit: Unit;
  granularity: TimeGranularity;
  onGranularityChange: (value: TimeGranularity) => void;
  /** 指标下拉选项（主页面模式），不传则不显示 */
  metricOptions?: readonly { value: string; label: string }[];
  metricValue?: string;
  onMetricChange?: (value: string) => void;
  currentLabel?: string;
  previousLabel?: string;
}

/**
 * 分组柱状图 — 基于 EChartsBase。
 *
 * 支持按月/按日切换 + 指标选择下拉。
 * 柱色：本期 #4B9CD3 | 对比期 #E8836E
 */
const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  unit,
  granularity,
  onGranularityChange,
  metricOptions,
  metricValue,
  onMetricChange,
  currentLabel = '本期',
  previousLabel = '对比期',
}) => {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        label: point.label,
        current: convertUnit(point.current, unit),
        previous: convertUnit(point.previous, unit),
      })),
    [data, unit],
  );

  const option = useMemo<EChartsOption | null>(() => {
    if (chartData.length === 0) {
      return null;
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value: unknown) =>
          `${(value as number).toLocaleString('zh-CN', { maximumFractionDigits: 2 })} ${unit}`,
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 12 },
        itemWidth: 12,
        itemHeight: 8,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.map((point) => point.label),
        axisLabel: { fontSize: 11, rotate: granularity === 'day' ? 45 : 0 },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 11,
          formatter: (value: number) =>
            value >= 10000 ? `${(value / 10000).toFixed(0)}万` : String(value),
        },
      },
      series: [
        {
          name: currentLabel,
          type: 'bar',
          data: chartData.map((point) => point.current),
          itemStyle: { color: BAR_COLORS.current, borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 24,
        },
        {
          name: previousLabel,
          type: 'bar',
          data: chartData.map((point) => point.previous),
          itemStyle: {
            color: BAR_COLORS.previous,
            borderRadius: [2, 2, 0, 0],
          },
          barMaxWidth: 24,
        },
      ],
    };
  }, [chartData, currentLabel, granularity, previousLabel, unit]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        {/* 粒度切换 */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['month', 'day'] as TimeGranularity[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onGranularityChange(item)}
              style={{
                padding: '2px 12px',
                fontSize: 12,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                cursor: 'pointer',
                background: granularity === item ? '#4B9CD3' : '#fff',
                color: granularity === item ? '#fff' : '#333',
              }}
            >
              {item === 'month' ? '按月' : '按日'}
            </button>
          ))}
        </div>

        {/* 指标选择 */}
        {metricOptions && metricValue !== undefined && onMetricChange ? (
          <Select
            value={metricValue}
            onChange={onMetricChange}
            style={{ width: 160 }}
            size="small"
            options={metricOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        ) : null}
      </div>

      <EChartsBase
        option={option}
        height={230}
        empty={chartData.length === 0}
        emptyText="暂无数据"
      />
    </div>
  );
};

export default GroupedBarChart;
