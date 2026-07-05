import { RightOutlined } from '@ant-design/icons';
import { Card } from 'antd';

import type { StatItem, Unit } from 'src/pages/dashboard/store';
import {
  formatNumber,
  formatPercent,
  formatSigned,
  formatSignedPercent,
} from 'src/pages/dashboard/utils';

interface StatCardProps {
  item: StatItem;
  unit: Unit;
  onClick: () => void;
  /** 底部指标网格列数，默认 2 */
  indicatorCols?: number;
}

const DELTA_STYLE: React.CSSProperties = { fontSize: 12, fontWeight: 500 };

const DeltaValue: React.FC<{
  value: number;
  unit?: Unit;
  isPercent?: boolean;
}> = ({ value, unit, isPercent }) => {
  const text = isPercent
    ? formatSignedPercent(value)
    : formatSigned(value, unit ?? '亿元');
  return (
    <span
      style={{
        ...DELTA_STYLE,
        color: value >= 0 ? '#F5222D' : '#52C41A',
      }}
    >
      {text}
    </span>
  );
};

/** 小标签 + 值 */
const MetricLabel: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div>
    <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>{label}</div>
    {children}
  </div>
);

const StatCard: React.FC<StatCardProps> = ({
  item,
  unit,
  onClick,
  indicatorCols = 2,
}) => {
  return (
    <Card
      size="small"
      hoverable
      onClick={onClick}
      styles={{ body: { padding: '12px 16px' } }}
      extra={<RightOutlined style={{ fontSize: 12, color: '#999' }} />}
      title={
        <span style={{ fontSize: 13, fontWeight: 500, color: '#666' }}>
          {item.label}
        </span>
      }
    >
      {/* 主数值 */}
      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#333',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatNumber(item.value, unit)}
        </span>
        <span style={{ fontSize: 13, color: '#999', marginLeft: 4 }}>
          {unit}
        </span>
      </div>

      {/* 6 指标网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${indicatorCols}, 1fr)`,
          gap: '4px 12px',
        }}
      >
        <MetricLabel label="完成率">
          <span style={{ ...DELTA_STYLE, color: '#333' }}>
            {formatPercent(item.completionRate)}
          </span>
        </MetricLabel>
        <MetricLabel label="比上日">
          <DeltaValue value={item.vsYesterday} unit={unit} />
        </MetricLabel>
        <MetricLabel label="比上月">
          <DeltaValue value={item.vsLastMonth} unit={unit} />
        </MetricLabel>
        <MetricLabel label="比上年">
          <DeltaValue value={item.vsLastYear} unit={unit} />
        </MetricLabel>
        <MetricLabel label="环比">
          <DeltaValue value={item.momGrowth} isPercent />
        </MetricLabel>
        <MetricLabel label="同比">
          <DeltaValue value={item.yoyGrowth} isPercent />
        </MetricLabel>
      </div>
    </Card>
  );
};

export default StatCard;
