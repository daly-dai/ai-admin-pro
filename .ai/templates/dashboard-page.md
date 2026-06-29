# Dashboard 大屏页面代码模板

> 适用场景：数据大屏、实时监控大屏、统计仪表盘。
> 数据只读、多图表聚合、定时刷新。非 CRUD 模式。

## 决策点

| 场景         | 布局                | 刷新方式      | 图表库  |
| ------------ | ------------------- | ------------- | ------- |
| 静态数据概览 | antd Row/Col 响应式 | 无 / 手动刷新 | ECharts |
| 实时监控大屏 | CSS Grid 全屏 16:9  | 轮询 (5-30s)  | ECharts |
| 交互式仪表盘 | 可折叠面板 + 下钻   | 按需加载      | ECharts |

> 📋 可读性约束（R1-R5）→ `.ai/core/coding-standards.md`

## 文件结构

```
src/api/{module}/types.ts              — 统计数据接口类型
src/api/{module}/index.ts              — 统计 API (get{Stats}ByGet / get{Trend}ByGet)
src/pages/{module}/index.tsx           — 大屏主页面 (Grid 布局)
src/pages/{module}/components/
  StatCard.tsx                          — 指标卡片 (数值 + 环比 + 迷你趋势)
  TrendChart.tsx                        — 趋势折线图
  PiePanel.tsx                          — 占比饼图/环形图
  BarPanel.tsx                          — 柱状图/排行榜
  FilterBar.tsx                         — 时间范围 + 维度筛选
src/pages/{module}/store.ts            — 大屏数据状态 (Zustand + 刷新控制)
```

## 核心组件

| 组件                        | 来源                  | 用途                                        |
| --------------------------- | --------------------- | ------------------------------------------- |
| DashboardGrid               | src/components/common | 大屏网格布局（替代 Row/Col，强制列对齐）    |
| EChartsBase                 | src/components        | 图表渲染（内置 loading/error/empty/resize） |
| antd Card                   | antd                  | 图表容器                                    |
| antd DatePicker.RangePicker | antd                  | 时间范围筛选                                |
| antd Spin                   | antd                  | 加载态                                      |
| SNoData                     | @dalydb/sdesign       | 空数据占位                                  |
| ahooks useInterval          | ahooks                | 定时轮询                                    |
| ahooks useSize              | ahooks                | 容器尺寸监听 (ECharts resize)               |

## 数据流模式

```
                     ┌─────────────┐
                     │  FilterBar   │  用户选择时间范围/维度
                     └──────┬──────┘
                            │ 更新 store.filter
                            ▼
                     ┌─────────────┐
                     │   Store      │  filter + data + loading
                     │  (Zustand)   │
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        StatCard      TrendChart     PiePanel
              │             │             │
              └─────────────┼─────────────┘
                            │ useInterval 定时触发
                            ▼
                     ┌─────────────┐
                     │  API 层      │  createRequest().get(url, { params })
                     └─────────────┘
```

## API 模式

大屏接口通常为非标准接口（聚合查询），不走标准 CRUD 五方法：

```typescript
// src/api/{module}/index.ts
import { createRequest } from 'src/plugins/request';

const {module}Api = createRequest();

// 统计数据概览
export const getStatsByGet = (params: StatsQuery): Promise<DashboardStats> =>
  {module}Api.get('/api/{module}/stats', { params });

// 趋势数据
export const getTrendByGet = (params: TrendQuery): Promise<TrendItem[]> =>
  {module}Api.get('/api/{module}/trend', { params });
```

## Store 模式

```typescript
// src/pages/{module}/store.ts
import { create } from 'zustand';

interface DashboardStore {
  filter: { dateRange: [string, string]; dimension?: string };
  stats: DashboardStats | null;
  trend: TrendItem[];
  loading: boolean;
  setFilter: (filter: Partial<DashboardStore['filter']>) => void;
  setStats: (stats: DashboardStats) => void;
  setTrend: (trend: TrendItem[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  filter: {
    dateRange: [
      dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      dayjs().format('YYYY-MM-DD'),
    ],
  },
  stats: null,
  trend: [],
  loading: false,
  setFilter: (filter) => set((s) => ({ filter: { ...s.filter, ...filter } })),
  setStats: (stats) => set({ stats }),
  setTrend: (trend) => set({ trend }),
  setLoading: (loading) => set({ loading }),
}));
```

## 代码示例

### 大屏主页面

```tsx
// src/pages/{module}/index.tsx
import { Card, DatePicker, Spin } from 'antd';
import { useInterval } from 'ahooks';
import DashboardGrid from 'src/components/common/DashboardGrid';
import { getStatsByGet, getTrendByGet } from 'src/api/{module}';
import { useDashboardStore } from './store';
import StatCard from './components/StatCard';
import TrendChart from './components/TrendChart';
import PiePanel from './components/PiePanel';

const { RangePicker } = DatePicker;

// ⚠️ 列宽定义为页面级常量，所有 Grid 行共享同一套列定义，保证跨行对齐
const CHART_GRID_COLS: [number, number] = [9, 15]; // 左右列 37.5% : 62.5%

const DashboardPage: React.FC = () => {
  const {
    filter,
    stats,
    trend,
    loading,
    setFilter,
    setStats,
    setTrend,
    setLoading,
  } = useDashboardStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendRes] = await Promise.all([
        getStatsByGet(filter),
        getTrendByGet(filter),
      ]);
      setStats(statsRes);
      setTrend(trendRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter.dateRange, filter.dimension]);

  useInterval(() => {
    fetchData();
  }, 30000);

  return (
    <Spin spinning={loading}>
      <RangePicker
        value={filter.dateRange as any}
        onChange={(_, dateStrings) =>
          setFilter({ dateRange: dateStrings as [string, string] })
        }
        style={{ marginBottom: 16 }}
      />

      {/* KPI 行：4 等分 */}
      <DashboardGrid cols={[6, 6, 6, 6]} gap={16} style={{ marginBottom: 16 }}>
        {stats && <StatCard data={stats.summary} />}
        {stats && <StatCard data={stats.revenue} />}
        {stats && <StatCard data={stats.users} />}
        {stats && <StatCard data={stats.conversion} />}
      </DashboardGrid>

      {/* 图表行：两列 9:15 — 用同一常量 CHART_GRID_COLS */}
      <DashboardGrid
        cols={CHART_GRID_COLS}
        gap={16}
        style={{ marginBottom: 16 }}
      >
        <Card title="趋势图" size="small">
          <TrendChart data={trend} />
        </Card>
        <Card title="分布图" size="small">
          <PiePanel data={stats?.distribution} />
        </Card>
      </DashboardGrid>

      {/* 更多图表行：仍然两列 9:15 — 列边界自动对齐 */}
      <DashboardGrid cols={CHART_GRID_COLS} gap={16}>
        <Card title="排行榜" size="small">
          {/* ... */}
        </Card>
        <Card title="明细表" size="small">
          {/* ... */}
        </Card>
      </DashboardGrid>
    </Spin>
  );
};

export default DashboardPage;
```

### StatCard 指标卡片

```tsx
// src/pages/{module}/components/StatCard.tsx
import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  data: { label: string; value: number; unit?: string; trend: number };
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const isUp = data.trend > 0;
  return (
    <Card size="small">
      <div style={{ color: '#8c8c8c', fontSize: 14 }}>{data.label}</div>
      <div style={{ fontSize: 30, fontWeight: 600, margin: '8px 0' }}>
        {data.value.toLocaleString()}
        {data.unit && (
          <span style={{ fontSize: 14, marginLeft: 4 }}>{data.unit}</span>
        )}
      </div>
      <div style={{ color: isUp ? '#cf1322' : '#3f8600' }}>
        {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        {Math.abs(data.trend)}%
      </div>
    </Card>
  );
};

export default StatCard;
```

### TrendChart 趋势图

```tsx
// src/pages/{module}/components/TrendChart.tsx
import EChartsBase from 'src/components/common/EChartsBase';
import { Card } from 'antd';

interface TrendChartProps {
  data: { x: string[]; series: { name: string; data: number[] }[] };
  title?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, title }) => {
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: data.x },
    yAxis: { type: 'value' },
    series: data.series.map((s) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      data: s.data,
    })),
  };

  return (
    <Card title={title} size="small">
      <EChartsBase
        option={option}
        height={300}
        empty={!data.x.length}
        emptyText="暂无趋势数据"
      />
    </Card>
  );
};

export default TrendChart;
```

## 全屏大屏布局

```tsx
// 全屏16:9大屏，居中缩放适配
<div
  style={{
    width: '100vw',
    height: '100vh',
    background: '#0a0e17',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }}
>
  <div
    style={{
      width: 1920,
      height: 1080,
      transform: 'scale(var(--scale))',
      transformOrigin: 'center center',
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gridTemplateRows: 'repeat(8, 1fr)',
      gap: 12,
      padding: 12,
    }}
  >
    {/* 标题行 | 指标行 | 图表区 | 排行区 */}
  </div>
</div>
```

## 验证清单

- [ ] `pnpm verify` 通过
- [ ] 图表在容器 resize 时正确重绘
- [ ] useInterval 在组件卸载时自动清除（ahooks 默认行为）
- [ ] 数据为空时显示 Empty 或 SNoData 占位
- [ ] 全屏模式下滚动条隐藏
- [ ] filter 变化时重新请求，旧数据不残留
- [ ] 接口报错时图表区显示错误状态而非空白
