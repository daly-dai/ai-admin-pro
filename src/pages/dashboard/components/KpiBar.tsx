// ============================================================================
// KpiBar — 4-KPI 概览栏
// ============================================================================

import { Flex } from 'antd';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Wallet,
} from 'lucide-react';
import React, { useMemo } from 'react';

import styles from '../index.module.css';
import { useDashboardStore } from '../store';
import type { KpiData } from '../types';

const formatCurrency = (value: number): string => {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value.toFixed(0)}`;
};

const KpiBar: React.FC = () => {
  const modules = useDashboardStore((s) => s.modules);
  const yieldData = useDashboardStore((s) => s.yieldData);

  const kpi = useMemo<KpiData>(() => {
    const scaleData = modules.spotSize.scaleData;
    const latestScale =
      scaleData.length > 0
        ? scaleData[scaleData.length - 1].indicatorValue
        : null;

    const yields = yieldData.map((d) => d.yieldRate);
    const avgYield =
      yields.length > 0
        ? yields.reduce((s, v) => s + v, 0) / yields.length
        : null;

    const dailyChange =
      yields.length >= 2
        ? yields[yields.length - 1] - yields[yields.length - 2]
        : null;

    const allDates = scaleData.map((d) => d.timePoint);
    const dateRange =
      allDates.length > 0
        ? { start: allDates[0], end: allDates[allDates.length - 1] }
        : null;

    return { totalScale: latestScale, avgYield, dailyChange, dateRange };
  }, [modules.spotSize.scaleData, yieldData]);

  return (
    <div className={styles.kpiStrip}>
      {/* 总规模 */}
      <div className={styles.kpiCard} style={{ animationDelay: '0.05s' }}>
        <Flex
          align="flex-start"
          justify="space-between"
          className={styles.kpiTop}
        >
          <div
            className={styles.kpiIcon}
            style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}
          >
            <Wallet size={16} />
          </div>
        </Flex>
        <div className={styles.kpiValue}>
          {kpi.totalScale != null ? formatCurrency(kpi.totalScale) : '--'}
        </div>
        <div className={styles.kpiLabel}>总规模 (最新)</div>
      </div>

      {/* 平均收益率 */}
      <div className={styles.kpiCard} style={{ animationDelay: '0.1s' }}>
        <Flex
          align="flex-start"
          justify="space-between"
          className={styles.kpiTop}
        >
          <div
            className={styles.kpiIcon}
            style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}
          >
            <Activity size={16} />
          </div>
        </Flex>
        <div className={styles.kpiValue}>
          {kpi.avgYield != null ? `${kpi.avgYield.toFixed(2)}%` : '--'}
        </div>
        <div className={styles.kpiLabel}>平均收益率</div>
        {kpi.dailyChange != null && (
          <Flex
            align="center"
            gap={3}
            className={`${styles.kpiChange} ${
              kpi.dailyChange >= 0 ? styles.kpiChangeUp : styles.kpiChangeDown
            }`}
          >
            {kpi.dailyChange >= 0 ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {kpi.dailyChange >= 0 ? '+' : ''}
            {kpi.dailyChange.toFixed(2)}%
          </Flex>
        )}
      </div>

      {/* 日变动 */}
      <div className={styles.kpiCard} style={{ animationDelay: '0.15s' }}>
        <Flex
          align="flex-start"
          justify="space-between"
          className={styles.kpiTop}
        >
          <div
            className={styles.kpiIcon}
            style={{
              background:
                kpi.dailyChange != null && kpi.dailyChange >= 0
                  ? 'rgba(16,185,129,0.08)'
                  : 'rgba(244,63,94,0.08)',
              color:
                kpi.dailyChange != null && kpi.dailyChange >= 0
                  ? '#10b981'
                  : '#f43f5e',
            }}
          >
            {kpi.dailyChange != null && kpi.dailyChange >= 0 ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
          </div>
        </Flex>
        <div className={styles.kpiValue}>
          {kpi.dailyChange != null
            ? `${kpi.dailyChange >= 0 ? '+' : ''}${kpi.dailyChange.toFixed(2)}%`
            : '--'}
        </div>
        <div className={styles.kpiLabel}>日变动</div>
      </div>

      {/* 数据范围 */}
      <div className={styles.kpiCard} style={{ animationDelay: '0.2s' }}>
        <Flex
          align="flex-start"
          justify="space-between"
          className={styles.kpiTop}
        >
          <div
            className={styles.kpiIcon}
            style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}
          >
            <Calendar size={16} />
          </div>
        </Flex>
        <div className={styles.kpiValue} style={{ fontSize: 18 }}>
          {kpi.dateRange
            ? `${kpi.dateRange.start.slice(5)} ~ ${kpi.dateRange.end.slice(5)}`
            : '--'}
        </div>
        <div className={styles.kpiLabel}>数据范围</div>
        <div className={styles.kpiDateRange}>
          {kpi.dateRange
            ? `${kpi.dateRange.start} ~ ${kpi.dateRange.end}`
            : '暂无数据'}
        </div>
      </div>
    </div>
  );
};

export default KpiBar;
