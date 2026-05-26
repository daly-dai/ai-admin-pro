// ============================================================================
// DualLineChart — ECharts 容器组件（纯 props 驱动）
//
// 职责：挂载/销毁 ECharts 实例、监听窗口 resize、数据变更时刷新图表。
// 不订阅全局 store，数据完全由父组件通过 props 传入。
// 可在卡片（compact 模式）和弹框（大尺寸模式）中复用。
// ============================================================================

import * as echarts from 'echarts';
import React, { useEffect, useRef } from 'react';

import { buildChartOption } from '../chartConfig';
import type { TreasuryYield, TrendItem } from '../types';

export interface DualLineChartProps {
  scaleData: TrendItem[];
  yieldData: TreasuryYield[];
  height?: number;
  compact?: boolean;
  className?: string;
}

const DualLineChart: React.FC<DualLineChartProps> = ({
  scaleData,
  yieldData,
  height = 420,
  compact = false,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    chartRef.current = echarts.init(containerRef.current, undefined, {
      renderer: 'canvas',
    });

    const handleResize = () => chartRef.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    const option = buildChartOption(scaleData, yieldData, { compact });
    chartRef.current.setOption(option, true);
  }, [scaleData, yieldData, compact]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height, background: 'transparent' }}
    />
  );
};

export default DualLineChart;
