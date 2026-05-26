// ============================================================================
// chartConfig.ts — ECharts option 构建纯函数
//
// 职责：根据数据计算 Y轴动态范围 + 组装 ECharts option
// 支持 compact 模式（卡片内小图）和默认模式（弹框内大图）
// ============================================================================

import type * as echarts from 'echarts';

import {
  SCALE_AXIS_DECIMALS,
  Y_AXIS_MAX_RATIO,
  Y_AXIS_MIN_RATIO,
  YIELD_AXIS_DECIMALS,
} from './constants';
import type { TreasuryYield, TrendItem } from './types';

// ============================================================================
// 配色常量
// ============================================================================

const BLUE = '#3b82f6';
const AMBER = '#f59e0b';
const TEXT_SECONDARY = '#6b7280';
const TEXT_MUTED = '#9ca3af';
const BORDER = '#e5e7eb';
const SPLIT_LINE = '#f3f4f6';
const ZOOM_FILLER = 'rgba(59,130,246,0.08)';
const ZOOM_DATA_LINE = '#3b82f6';
const ZOOM_DATA_AREA = 'rgba(59,130,246,0.04)';
const ZOOM_SELECTED_AREA = 'rgba(59,130,246,0.12)';

// ============================================================================
// 配置选项
// ============================================================================

export interface ChartOptions {
  /** 紧凑模式：减少 padding / 字号，适配卡片内小尺寸 */
  compact?: boolean;
}

// ============================================================================
// 工具函数
// ============================================================================

const calcAxisRange = (
  values: number[],
  minRatio: number,
  maxRatio: number,
  decimals: number,
): { min: number; max: number } | undefined => {
  if (values.length === 0) return undefined;

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  if (dataMin === dataMax) {
    const halfRange = Math.abs(dataMin) * 0.1 || 1;
    return {
      min: roundDown(dataMin - halfRange, decimals),
      max: roundUp(dataMax + halfRange, decimals),
    };
  }

  const range = dataMax - dataMin;
  const paddingLow = range * (1 - minRatio);
  const paddingHigh = range * (maxRatio - 1);

  return {
    min: roundDown(dataMin - paddingLow, decimals),
    max: roundUp(dataMax + paddingHigh, decimals),
  };
};

const roundDown = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.floor(value * factor) / factor;
};

const roundUp = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.ceil(value * factor) / factor;
};

const formatScaleLabel = (value: number): string => {
  if (value == null) return '';
  if (value >= 10000) return `${(value / 1000).toFixed(0)}k`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
};

// ============================================================================
// 主函数
// ============================================================================

export const buildChartOption = (
  scaleData: TrendItem[],
  yieldData: TreasuryYield[],
  opts?: ChartOptions,
): echarts.EChartsOption => {
  const compact = opts?.compact ?? false;

  const dates = scaleData.map((d) => d.timePoint);
  const scaleValues = scaleData.map((d) => d.indicatorValue);
  const yieldValues = yieldData.map((d) => d.yieldRate);

  const scaleRange = calcAxisRange(
    scaleValues,
    Y_AXIS_MIN_RATIO,
    Y_AXIS_MAX_RATIO,
    SCALE_AXIS_DECIMALS,
  );
  const yieldRange = calcAxisRange(
    yieldValues,
    Y_AXIS_MIN_RATIO,
    Y_AXIS_MAX_RATIO,
    YIELD_AXIS_DECIMALS,
  );

  const grid = compact
    ? { left: 56, right: 60, top: 30, bottom: 68 }
    : { left: 72, right: 80, top: 40, bottom: 88 };

  const legendFontSize = compact ? 11 : 13;
  const axisLabelFontSize = compact ? 10 : 11;
  const nameFontSize = compact ? 10 : 12;

  // 根据数据量自动计算标签间隔，避免 x 轴重叠（最多显示 ~10 个标签）
  const labelInterval = dates.length > 10 ? Math.ceil(dates.length / 10) : 0;
  // 数据超过 20 条时倾斜标签防止重叠
  const labelRotate = dates.length > 20 ? 45 : 0;

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#fff',
      borderColor: '#e5e7eb',
      textStyle: { color: '#111827', fontSize: 13 },
      formatter: (params: echarts.TooltipComponentFormatterCallbackParams) => {
        if (!Array.isArray(params)) return '';
        return params
          .map((p) => {
            const unit = p.seriesName === '国债收益率' ? '%' : '';
            const value =
              typeof p.value === 'number' ? p.value.toLocaleString() : p.value;
            return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color as string};margin-right:6px;"></span>${p.seriesName}: ${value}${unit}`;
          })
          .join('<br/>');
      },
    },
    legend: {
      data: ['时点规模', '国债收益率'],
      top: compact ? 0 : 8,
      textStyle: { color: TEXT_SECONDARY, fontSize: legendFontSize },
    },
    grid,
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        color: TEXT_MUTED,
        fontSize: axisLabelFontSize,
        formatter: (v: string) => {
          if (!v) return '';
          return `${v.slice(0, 4)}\n${v.slice(5)}`;
        },
        rotate: labelRotate,
        interval: labelInterval,
      },
      axisLine: { lineStyle: { color: BORDER } },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: compact ? '规模' : '时点规模',
        nameTextStyle: {
          color: TEXT_SECONDARY,
          fontSize: nameFontSize,
          padding: [0, 0, 0, 4],
        },
        axisLabel: {
          color: TEXT_MUTED,
          fontSize: axisLabelFontSize,
          formatter: (v: number) => formatScaleLabel(v),
        },
        ...(scaleRange ? { min: scaleRange.min, max: scaleRange.max } : {}),
        splitLine: { lineStyle: { color: SPLIT_LINE, type: 'dashed' } },
      },
      {
        type: 'value',
        name: compact ? '收益率(%)' : '国债收益率(%)',
        nameTextStyle: {
          color: TEXT_SECONDARY,
          fontSize: nameFontSize,
          padding: [0, 4, 0, 0],
        },
        axisLabel: {
          color: TEXT_MUTED,
          fontSize: axisLabelFontSize,
          formatter: '{value}%',
        },
        ...(yieldRange ? { min: yieldRange.min, max: yieldRange.max } : {}),
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: compact ? 18 : 22,
        bottom: compact ? 8 : 12,
        borderColor: BORDER,
        backgroundColor: '#fafafa',
        fillerColor: ZOOM_FILLER,
        dataBackground: {
          lineStyle: { color: ZOOM_DATA_LINE, width: 0.5 },
          areaStyle: { color: ZOOM_DATA_AREA },
        },
        selectedDataBackground: {
          lineStyle: { color: ZOOM_DATA_LINE, width: 0.5 },
          areaStyle: { color: ZOOM_SELECTED_AREA },
        },
        handleStyle: { color: BLUE, borderColor: BLUE },
        textStyle: { color: TEXT_MUTED, fontSize: axisLabelFontSize },
      },
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
    ],
    series: [
      {
        name: '时点规模',
        type: 'line',
        data: scaleValues,
        yAxisIndex: 0,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: BLUE, width: 2 },
        itemStyle: { color: BLUE },
      },
      {
        name: '国债收益率',
        type: 'line',
        data: yieldValues,
        yAxisIndex: 1,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: AMBER, width: 2 },
        itemStyle: { color: AMBER },
      },
    ],
  };
};
