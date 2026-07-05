import { Card } from 'antd';

import type { RateItem } from 'src/pages/dashboard/store';
import { formatBps, formatPercent } from 'src/pages/dashboard/utils';

interface RatePanelProps {
  title: string;
  rate: RateItem | null;
}

const METRIC_STYLE: React.CSSProperties = {
  fontSize: 12,
  color: '#999',
  marginBottom: 2,
};

const VALUE_STYLE: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: '#333',
  fontVariantNumeric: 'tabular-nums',
};

const RatePanel: React.FC<RatePanelProps> = ({ title, rate }) => {
  return (
    <Card
      size="small"
      styles={{ body: { padding: '8px 16px' } }}
      title={<span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>}
      extra={<span style={{ fontSize: 12, color: '#999' }}>单位：%</span>}
    >
      {rate ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 8,
          }}
        >
          <div>
            <div style={METRIC_STYLE}>数据</div>
            <div style={VALUE_STYLE}>{formatPercent(rate.value)}</div>
          </div>
          <div>
            <div style={METRIC_STYLE}>基准收益率</div>
            <div style={VALUE_STYLE}>{formatPercent(rate.benchmark)}</div>
          </div>
          <div>
            <div style={METRIC_STYLE}>跑赢基准值</div>
            <div style={VALUE_STYLE}>{formatBps(rate.beatBenchmark)}</div>
          </div>
          <div>
            <div style={METRIC_STYLE}>比去年同期差值</div>
            <div style={VALUE_STYLE}>{formatPercent(rate.vsLastYearDiff)}</div>
          </div>
          <div>
            <div style={METRIC_STYLE}>比基准收益率差值</div>
            <div style={VALUE_STYLE}>{formatPercent(rate.vsBenchmarkDiff)}</div>
          </div>
        </div>
      ) : (
        <div style={{ color: '#999', fontSize: 13, padding: '8px 0' }}>
          暂无数据
        </div>
      )}
    </Card>
  );
};

export default RatePanel;
