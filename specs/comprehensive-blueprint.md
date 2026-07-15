# 综合经营分析指标大屏 — 规格文档

> 版本: v1.0 | 日期: 2026-01-22 | 状态: 待代码生成
>
> 状态流转: 待代码生成 →（dashboard-gen 读蓝图 + 编码阶段 frontend-design）→ 已生成

---

## 一、页面整体布局

### 1.1 ASCII 拓扑图

```
┌──────────────────────────────────────────────────────────────────┐
│  ① FilterBar (搜索栏)                                            │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────────────┐ │
│  │ 结束日期     │ │ 单位         │ │ 维度                       │ │
│  │ DatePicker   │ │ Radio(亿元/万元)│ │ Radio(业务维度/财务维度)  │ │
│  └─────────────┘ └──────────────┘ └────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────┐ ┌──────────────────────────────┐│
│ │ ② 左侧模块 (标题=维度值)     │ │ ⑧ 右侧模块 (标题="其他经营   ││
│ │                              │ │    指标")                    ││
│ │ ┌──────────────────────────┐ │ │ ┌──────────────────────────┐ ││
│ │ │ ③ 统计数据区 (3卡片)     │ │ │ │ ⑨ 统计数据区 (3卡片)     │ ││
│ │ │ ┌────────┬───────┬──────┐│ │ │ │ ┌────────┬───────┬──────┐│ ││
│ │ │ │ EVA    │自营EVA│代客  ││ │ │ │ │营业净  │重点业务│OCI   ││ ││
│ │ │ │        │       │EVA   ││ │ │ │ │收入    │收入    │当年   ││ ││
│ │ │ │        │       │      ││ │ │ │ │        │        │估值   ││ ││
│ │ │ └────────┴───────┴──────┘│ │ │ │ └────────┴───────┴──────┘│ ││
│ │ └──────────────────────────┘ │ │ └──────────────────────────┘ ││
│ │ ┌──────────────────────────┐ │ │ ┌──────────────────────────┐ ││
│ │ │ ④ 本币投资收益率          │ │ │ │ ⑩ 本币交易收益率          │ ││
│ │ └──────────────────────────┘ │ │ └──────────────────────────┘ ││
│ │ ┌──────────────────────────┐ │ │ ┌──────────────────────────┐ ││
│ │ │ ⑤ 图表筛选控制区          │ │ │ │ ⑪ 图表筛选控制区          │ ││
│ │ │ [指标下拉▼] [按月|按日]   │ │ │ │ [指标下拉▼] [按月|按日]   │ ││
│ │ ├──────────────────────────┤ │ │ ├──────────────────────────┤ ││
│ │ │ ⑥ 分组柱状图              │ │ │ │ ⑫ 分组柱状图              │ ││
│ │ └──────────────────────────┘ │ │ └──────────────────────────┘ ││
│ └──────────────────────────────┘ └──────────────────────────────┘│
│                                                                    │
│ ┌────────────────────────────────────────────────────────────────┐│
│ │ ⑦ 详情抽屉 (createDrawer, 点击③或⑨任一统计卡片触发)          ││
│ │ ┌────────────────────────────────────────────────────────────┐ ││
│ │ │ ⑦a 详情统计数据 (当前指标详细版，复用 StatCard)            │ ││
│ │ ├────────────────────────────────────────────────────────────┤ ││
│ │ │ ⑦b 详情柱状图 + [按月|按日] 切换 (无指标下拉)              │ ││
│ │ ├────────────────────────────────────────────────────────────┤ ││
│ │ │ ⑦c 环形图 (支持一级→二级联动，部分类型无联动)              │ ││
│ │ ├────────────────────────────────────────────────────────────┤ ││
│ │ │ ⑦d 明细表格 (列定义随 indicatorType 变化)                  │ ││
│ │ └────────────────────────────────────────────────────────────┘ ││
│ └────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 列宽表（DashboardGrid）

| Row   | 分区     | cols   | 容器              | padding   | margin-bottom | 背景色 | 说明      |
| ----- | -------- | ------ | ----------------- | --------- | :-----------: | ------ | --------- |
| Row 1 | 搜索栏   | `[24]` | Card              | 12px 20px |     16px      | #FFF   | FilterBar |
| Row 2 | 左侧模块 | `[12]` | Card size="small" | 16px      |       —       | #FFF   | ② 含③④⑤⑥  |
| Row 2 | 右侧模块 | `[12]` | Card size="small" | 16px      |       —       | #FFF   | ⑧ 含⑨⑩⑪⑫  |

> 列宽依据：需求写"左右布局，模块结构一致"，故两列均分 `[12, 12]`。

### 1.3 全局值表

| 变量           | 亮色版默认  | 说明         |
| -------------- | ----------- | ------------ |
| 页面底色       | #F5F7FA     | —            |
| 卡片底色       | #FFFFFF     | —            |
| 卡片边框       | 1px #EBEEF2 | —            |
| 卡片圆角       | 8px         | —            |
| 模块间距       | 16px        | Grid gap     |
| 主页图表高度   | 280px       | 柱状图       |
| 抽屉图表高度   | 350px       | 抽屉内柱状图 |
| 抽屉环形图高度 | 320px       | —            |
| 抽屉宽度       | 60vw        | min 900px    |

---

## 二、分辨率适配方案

- **基准分辨率**: 1920 × 1080（16:9），需求明确"只需要考虑 1920×1080"
- **兼容**: 2560 × 1440（2K，等比缩放）
- **适配策略**: CSS `transform: scale()` + `transform-origin: center center`，监听 `window.resize` 动态计算 scale 值
- **缩放公式**: `scale = Math.min(windowWidth / 1920, windowHeight / 1080)`

---

## 三、页面主题

### 3.1 色板

```typescript
// ECharts 图表色板（需求提供）
const CHART_COLORS = [
  '#F5D580',
  '#4B9CD3',
  '#E8836E',
  '#6FBFA0',
  '#C4A6E8',
  '#F0B77D',
  '#7EC8E3',
  '#E8C46A',
  '#A8D8B9',
  '#F2A5A0',
  '#8CBED6',
  '#D4A76A',
];

// 分组柱状图专用（需求提供）
const BAR_COLORS = {
  current: '#E8836E', // 本月/本年
  compare: '#4B9CD3', // 上月/去年
};

// 功能色（需求提供）
const COLOR_VALUE = '#333333'; // 统计数据数值
const COLOR_POSITIVE = '#F5222D'; // 正数（比上日/比上月/比上年涨）
const COLOR_NEGATIVE = '#52C41A'; // 负数（比上日/比上月/比上年跌）
```

### 3.2 色板使用规则

- 色板仅用于 ECharts 图表 series color
- 卡片/标题/装饰元素使用 §一 全局值表的卡片底色和边框，不做彩色装饰
- 统计数值颜色用 `COLOR_VALUE`，正负变化用 `COLOR_POSITIVE` / `COLOR_NEGATIVE`

---

## 四、交互与事件

### 4.1 事件清单

| 编号 | 触发源                            | 行为                                          | 影响范围          | API 调用                             |
| ---- | --------------------------------- | --------------------------------------------- | ----------------- | ------------------------------------ |
| E1   | 页面首次加载                      | 加载默认数据（T-1 日期，亿元，业务维度）      | ③④⑥⑨⑩⑫            | API-1+2+3                            |
| E2   | 切换结束日期                      | 重新请求所有数据                              | ③④⑥⑨⑩⑫            | API-1+2+3                            |
| E3   | 切换单位（亿元/万元）             | 前端本地换算数值显示，不重新请求              | ③④⑨⑩ 数值区       | 无                                   |
| E4   | 切换维度（业务维度/财务维度）     | 左侧标题更新 + 重新请求左侧数据；右侧不受影响 | ②标题, ③④⑥        | API-1+2（dimension 更新）            |
| E5   | 左侧图表指标下拉切换              | 左侧柱状图数据刷新                            | ⑥                 | API-2（indicatorType 过滤） [待确认] |
| E6   | 左侧图表时间粒度切换（按月/按日） | 左侧柱状图数据刷新                            | ⑥                 | API-2（dateDimension 更新）          |
| E7   | 右侧图表指标下拉切换              | 右侧柱状图数据刷新                            | ⑫                 | API-2（indicatorType 过滤） [待确认] |
| E8   | 右侧图表时间粒度切换（按月/按日） | 右侧柱状图数据刷新                            | ⑫                 | API-2（dateDimension 更新）          |
| E9   | 点击六个统计卡片任一              | 打开详情抽屉，加载对应指标详情                | ⑦全部（⑦a⑦b⑦c⑦d） | API-2+4+5                            |
| E10  | 抽屉内时间粒度切换                | 抽屉柱状图数据刷新                            | ⑦b                | API-2（dateDimension 更新）          |
| E11  | 抽屉内环形图一级分类点击          | 联动更新二级分类环形图                        | ⑦c 二级环形图     | 无（前端过滤）                       |
| E12  | 关闭抽屉                          | 抽屉关闭，状态清理                            | ⑦                 | 无                                   |

> **[待确认]** E5/E7：API-2 的 `BusinessChartQueryDTO` 不包含 `indicatorType` 参数，但需求中图表有指标下拉切换。推测 API-2 返回所有指标类型数据，前端按 `indicatorType` 过滤；或 API 需补充 `indicatorType` 参数。编码阶段按"前端过滤"处理，若接口后续补充参数则调整。

### 4.2 抽屉内部结构（⑦）

```
⑦ DetailDrawer（createDrawer）
├── 标题 = "{指标名} 详情"
├── ⑦a DetailStats
│   └── 单卡片展示：数值、完成率、比上日、比上月、比上年
├── ⑦b DetailChart
│   ├── 筛选区：[按月|按日] 按钮组（无指标下拉，指标由抽屉参数固定）
│   └── 分组柱状图（同主页逻辑）
├── ⑦c DetailDonut
│   ├── 一级分类环形图（点击一级→联动二级）
│   └── 二级分类环形图（由一级选中项过滤）
│   └── 注：代客EVA、营业净收入仅一级，无二级联动
│   └── 注：OCI估值有二级但无联动（两级独立展示）
└── ⑦d DetailTable
    └── 表格列定义随 indicatorType 动态变化
```

### 4.3 环形图联动逻辑（⑦c）

| 指标类型             | 一级→二级联动 | 说明                                             |
| -------------------- | :-----------: | ------------------------------------------------ |
| EVA                  |      ✅       | 点击一级分类，二级环形图过滤对应数据             |
| 自营EVA              |      ✅       | 同上                                             |
| 代客EVA              |      ❌       | 仅一级分类（管理子团队），无二级                 |
| 营业净收入           |      ❌       | 仅一级分类（管理团队<内部>），无二级             |
| 账面非息（科目口径） |      ✅       | 点击一级分类（业务类型1），二级（业务类型2）过滤 |
| OCI估值              |      ❌       | 有一级+二级但无联动关系，两级独立展示            |

---

## 五、模块规格

> 以下每个组件仅定义 Props 接口，图表组件附加「图表需求卡」。视觉细节留给编码阶段 frontend-design。

### 5.1 ① FilterBar — 顶部搜索栏

| 项         | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| **文件名** | `src/pages/comprehensive-analysis/components/FilterBar.tsx` |
| **功能**   | 提供结束日期、单位、维度三个筛选条件                        |
| **空数据** | 不适用（筛选控件始终可见）                                  |

```typescript
interface FilterBarProps {
  endDate: string; // YYYY-MM-DD
  unit: '亿元' | '万元';
  dimension: '业务维度' | '财务维度';
  onEndDateChange: (date: string) => void;
  onUnitChange: (unit: '亿元' | '万元') => void;
  onDimensionChange: (dimension: '业务维度' | '财务维度') => void;
}
```

### 5.2 ② ModuleTitle — 模块标题

| 项         | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| **文件名** | `src/pages/comprehensive-analysis/components/ModuleTitle.tsx` |
| **功能**   | 显示模块标题，左侧为维度值，右侧固定"其他经营指标"            |

```typescript
interface ModuleTitleProps {
  title: string;
}
```

### 5.3 ③⑨ StatCard — 统计指标卡片

| 项         | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| **文件名** | `src/pages/comprehensive-analysis/components/StatCard.tsx`                       |
| **功能**   | 展示单个指标数值 + 完成率 + 比上日/比上月/比上年/环比增幅/同比增幅，点击打开抽屉 |
| **复用**   | ③（3个）、⑨（3个）、⑦a（1个）共 7 处                                             |
| **空数据** | 数值显示 "--"，变化率显示 "--"                                                   |

```typescript
interface StatCardProps {
  indicatorType: string; // 指标类型标识
  title: string; // 卡片标题（如 "EVA"）
  data: {
    actualValue: number | null; // 实际值（接口单位：万元）
    completionRate: number | null; // 完成率（0~1）
    dayOverDay: number | null; // 比上日
    monthOverMonth: number | null; // 比上月
    yearOverYear: number | null; // 比同期
    monthGrowthRate: number | null; // 环比增幅
    yearGrowthRate: number | null; // 同比增幅
  };
  unit: '亿元' | '万元'; // 当前单位（用于换算显示）
  onClick: (indicatorType: string) => void;
}
```

### 5.4 ④⑩ YieldCard — 收益率卡片

| 项         | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| **文件名** | `src/pages/comprehensive-analysis/components/YieldCard.tsx`                     |
| **功能**   | 展示收益率数据：收益率、基准收益率、跑赢基准值(bps)、比去年同期差值、比基准差值 |
| **复用**   | ④（本币投资）、⑩（本币交易）共 2 处                                             |
| **空数据** | 所有数值显示 "--"                                                               |

```typescript
interface YieldCardProps {
  title: string; // "本币投资收益率" | "本币交易收益率"
  data: {
    yieldRate: number | null; // 收益率
    baseline: number | null; // 基准收益率
    bpsOverBaseline: number | null; // 跑赢基准值 (bps)
    yearOverYear: number | null; // 比去年同期收益率差值
    baselineDifference: number | null; // 比基准收益率差值
  };
}
```

### 5.5 ⑥⑫ DualBarChart — 分组柱状图

| 项         | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| **文件名** | `src/pages/comprehensive-analysis/components/DualBarChart.tsx`               |
| **功能**   | 分组柱状图 + 顶部筛选（指标下拉 + 按月/按日切换），通过 props 控制筛选区显隐 |
| **复用**   | ⑥（左）、⑫（右）、⑦b（抽屉内）共 3 处                                        |
| **空数据** | EChartsBase empty 态，显示"暂无图表数据"                                     |

```typescript
interface DualBarChartProps {
  showMetricDropdown: boolean; // 是否显示指标下拉（抽屉内为 false）
  metricOptions: { label: string; value: string }[]; // 指标下拉选项
  selectedMetric: string; // 当前选中指标
  dateDimension: '月' | '日'; // 时间粒度
  data: DualBarChartData | null; // 图表数据（已转换）
  onMetricChange?: (metric: string) => void;
  onDateDimensionChange: (dimension: '月' | '日') => void;
  height?: number; // 图表高度，默认 280
}

interface DualBarChartData {
  xAxisData: string[]; // X 轴标签（日期/月份）
  currentSeries: { name: string; data: number[] }; // 本月/本年
  compareSeries: { name: string; data: number[] }; // 上月/去年
}
```

#### 图表需求卡：分组柱状图

| 维度         | 值                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **坐标系**   | `cartesian`                                                                                                                                                                                       |
| **X 轴**     | `dataDate` — 来源：API-2.chartData，前端按 dateDimension 分组                                                                                                                                     |
| **Y 轴-1**   | "本月"（按日）/ "本年"（按月） + 单位（万元） + 类型 `bar` + 来源：API-2.chartData 过滤当前期                                                                                                     |
| **Y 轴-2**   | "上月"（按日）/ "去年"（按月） + 单位（万元） + 类型 `bar` + 来源：API-2.chartData 过滤对比期                                                                                                     |
| **系列颜色** | `BAR_COLORS.current`（#E8836E）、`BAR_COLORS.compare`（#4B9CD3）                                                                                                                                  |
| **交互控件** | 指标下拉（`showMetricDropdown=true` 时）+ 按月/按日按钮组。默认：左=EVA/月，右=营业净收入/月                                                                                                      |
| **联动**     | 无                                                                                                                                                                                                |
| **数据转换** | 1) 按 `indicatorType` 过滤（若 API 不返回 indicatorType 参数则跳过）；2) 按日期判断当期/对比期：按日→同月同日比（本月1日 vs 上月1日），按月→同年同月比（本年1月 vs 去年1月）；3) 按 dataDate 排序 |
| **Y 轴范围** | `auto`                                                                                                                                                                                            |
| **高度**     | 280px（主页）/ 350px（抽屉）                                                                                                                                                                      |

### 5.6 ⑦ DetailDrawer — 详情抽屉

| 项         | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| **文件名** | `src/pages/comprehensive-analysis/components/DetailDrawer.tsx` |
| **功能**   | 使用 createDrawer 工厂，内部组合 ⑦a⑦b⑦c⑦d                      |
| **空数据** | 各子组件独立处理 empty 态                                      |

```typescript
// createDrawer 泛型参数
interface DetailDrawerOpenParams {
  indicatorType: string; // 指标类型
  indicatorTitle: string; // 卡片标题（用于抽屉标题和 stats 标题）
  endDate: string; // 当前结束日期
  dimension: string; // 当前维度
}
```

### 5.7 ⑦c DetailDonut — 环形图（含联动）

| 项         | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| **文件名** | `src/pages/comprehensive-analysis/components/DetailDonut.tsx` |
| **功能**   | 一级环形图 + 可选的二级环形图联动                             |
| **空数据** | EChartsBase empty 态                                          |

```typescript
interface DetailDonutProps {
  indicatorType: string; // 确定环形图类型（决定是否显示二级+是否联动）
  level1Data: DonutItem[]; // 一级分类数据
  level2Data: DonutItem[]; // 二级分类数据（全部，由组件内部按选中一级过滤）
  showLevel2: boolean; // 是否显示二级环形图
  enableLinkage: boolean; // 是否启用一级→二级联动
}

interface DonutItem {
  name: string; // 分类名
  value: number; // 指标值
}
```

#### 图表需求卡：环形图

| 维度         | 值                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **坐标系**   | `none`（饼图/环形图）                                                                                                          |
| **X 轴**     | 无                                                                                                                             |
| **Y 轴-1**   | 无                                                                                                                             |
| **系列颜色** | `CHART_COLORS[0..N]` 按顺序分配                                                                                                |
| **交互控件** | 无（环形图本身点击为联动事件）                                                                                                 |
| **联动**     | `enableLinkage=true` 时：点击一级扇区 → 过滤 `level2Data` → 刷新二级环形图。`enableLinkage=false` 时：两级独立展示，点击无联动 |
| **数据转换** | API-4 响应 `BusinessDonutVO[]` → 按 `category1` 聚合为一级 `DonutItem[]`，按 `category1+category2` 聚合为二级 `DonutItem[]`    |
| **Y 轴范围** | 不适用                                                                                                                         |
| **高度**     | 320px                                                                                                                          |

### 5.8 ⑦d DetailTable — 明细表格

| 项         | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| **文件名** | `src/pages/comprehensive-analysis/components/DetailTable.tsx` |
| **功能**   | 根据 indicatorType 展示不同列定义的明细表格                   |
| **空数据** | STable empty 态                                               |

```typescript
interface DetailTableProps {
  indicatorType: string; // 决定列定义和显示字段
  data: BusinessTableItemVO[]; // API-5 响应
  unit: '亿元' | '万元';
}
```

#### 表格列定义规则（按 indicatorType）

| indicatorType        | 列定义                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EVA                  | category1, category2, netInterest, nonInterest, actualValue, budgetTarget, completionRate, dayOverDay, monthOverMonth, yearOverYear, monthGrowthRate, yearGrowthRate |
| 自营EVA              | 同上                                                                                                                                                                 |
| 代客EVA              | 同上                                                                                                                                                                 |
| 营业净收入           | 同上                                                                                                                                                                 |
| 账面非息（科目口径） | category1, category2, category3, actualValue, dayOverDay, monthOverMonth, yearOverYear, monthGrowthRate, yearGrowthRate                                              |
| OCI估值              | category1, category2, actualValue, dayOverDay, monthOverMonth, yearOverYear, monthGrowthRate, yearGrowthRate                                                         |

> 注：EVA 类型表格需合并展示基础 EVA + 自营EVA + 代客EVA 三组数据（API 说明后端自动合并）。

---

## 六、组件层级设计

### 6.1 组件树

```
src/pages/comprehensive-analysis/
├── index.tsx                              ← ComprehensiveAnalysisPage（页面主组件）
│   ├── FilterBar.tsx                      ← ① 搜索栏
│   ├── ModuleTitle.tsx (×2)               ← ② ⑧ 模块标题
│   ├── StatCard.tsx (×6)                  ← ③ ⑨ 统计卡片
│   ├── YieldCard.tsx (×2)                 ← ④ ⑩ 收益率卡片
│   ├── DualBarChart.tsx (×2)              ← ⑥ ⑫ 分组柱状图
│   └── DetailDrawer.tsx                   ← ⑦ 详情抽屉（createDrawer 工厂）
│       ├── StatCard.tsx (×1)              ← ⑦a 详情统计（复用）
│       ├── DualBarChart.tsx (×1)          ← ⑦b 详情柱状图（复用，showMetricDropdown=false）
│       ├── DetailDonut.tsx                ← ⑦c 环形图（含联动）
│       └── DetailTable.tsx                ← ⑦d 明细表格
├── store.ts                               ← Zustand Store
├── utils.ts                               ← 数据转换函数（API→组件格式、单位换算）
├── constants/
│   └── index.ts                           ← THEME_COLORS / 下拉选项常量
└── types.ts                               ← 页面级类型（DualBarChartData / DonutItem 等）
```

### 6.2 文件清单

| #   | 文件路径                                                       | 类型  | 说明                        |
| --- | -------------------------------------------------------------- | ----- | --------------------------- |
| 1   | `src/api/comprehensive-analysis/types.ts`                      | API   | 5 个接口的请求/响应 TS 类型 |
| 2   | `src/api/comprehensive-analysis/index.ts`                      | API   | 5 个 API 方法               |
| 3   | `src/pages/comprehensive-analysis/index.tsx`                   | 页面  | 大屏主页面                  |
| 4   | `src/pages/comprehensive-analysis/types.ts`                    | 类型  | 页面级类型                  |
| 5   | `src/pages/comprehensive-analysis/store.ts`                    | Store | Zustand 状态管理            |
| 6   | `src/pages/comprehensive-analysis/utils.ts`                    | 工具  | 数据转换 + 单位换算         |
| 7   | `src/pages/comprehensive-analysis/constants/index.ts`          | 常量  | 色板 + 下拉选项             |
| 8   | `src/pages/comprehensive-analysis/components/FilterBar.tsx`    | 组件  | ①                           |
| 9   | `src/pages/comprehensive-analysis/components/ModuleTitle.tsx`  | 组件  | ②⑧                          |
| 10  | `src/pages/comprehensive-analysis/components/StatCard.tsx`     | 组件  | ③⑨⑦a                        |
| 11  | `src/pages/comprehensive-analysis/components/YieldCard.tsx`    | 组件  | ④⑩                          |
| 12  | `src/pages/comprehensive-analysis/components/DualBarChart.tsx` | 组件  | ⑥⑫⑦b                        |
| 13  | `src/pages/comprehensive-analysis/components/DetailDrawer.tsx` | 组件  | ⑦                           |
| 14  | `src/pages/comprehensive-analysis/components/DetailDonut.tsx`  | 组件  | ⑦c                          |
| 15  | `src/pages/comprehensive-analysis/components/DetailTable.tsx`  | 组件  | ⑦d                          |
| 16  | `specs/comprehensive-blueprint.md`                             | 规格  | 本蓝图                      |

---

## 七、数据源设计

### 7.1 接口清单

| #     | 路径                                    | 方法 | 就绪状态  | 说明           |
| ----- | --------------------------------------- | ---- | :-------: | -------------- |
| API-1 | `/dashboard/business-analysis/overview` | POST | 🚧 待确认 | 总览指标查询   |
| API-2 | `/dashboard/business-analysis/chart`    | POST | 🚧 待确认 | 图表指标查询   |
| API-3 | `/dashboard/business-analysis/yield`    | POST | 🚧 待确认 | 收益率查询     |
| API-4 | `/dashboard/business-analysis/donut`    | POST | 🚧 待确认 | 环形图指标查询 |
| API-5 | `/dashboard/business-analysis/table`    | POST | 🚧 待确认 | 表格指标查询   |

> **就绪状态说明**：接口文档已提供完整 TS 类型定义，但未确认后端是否已部署。默认标 🚧 待确认，编码阶段需用户逐一确认。

### 7.2 公共请求参数

所有接口均需 `endDate: string`（格式 `YYYY-MM-DD`）。维度相关接口额外需 `dimension: '业务维度' | '财务维度'`。

### 7.3 API-1 — 总览指标查询

```typescript
// 请求
interface BusinessOverviewQueryDTO {
  endDate: string; // YYYY-MM-DD
  dimension: '业务维度' | '财务维度';
}

// 响应
interface BusinessOverviewVO {
  overviewData: BusinessOverviewItemVO[];
}

interface BusinessOverviewItemVO {
  indicatorType: string; // 指标类型标识，如 "EVA" / "自营EVA" / "代客EVA" / "营业净收入" / "重点业务收入" / "OCI当年估值" [待确认]
  actualValue: number; // 实际值（单位：万元）
  dayOverDay: number; // 比上日
  monthOverMonth: number; // 比上月
  monthGrowthRate: number; // 环比增幅
  yearOverYear: number; // 比同期
  yearGrowthRate: number; // 同比增幅
  completionRate: number; // 完成率（0~1，预算目标为空时 → null）
}
```

### 7.4 API-2 — 图表指标查询

```typescript
// 请求
interface BusinessChartQueryDTO {
  endDate: string; // YYYY-MM-DD
  dateDimension: '日' | '月';
  dimension: '业务维度' | '财务维度';
}
// ⚠️ [待确认] 缺少 indicatorType 参数，前端需按响应中 indicatorType 字段过滤

// 响应
interface BusinessChartVO {
  chartData: BusinessChartItemVO[];
}

interface BusinessChartItemVO {
  indicatorType: string; // 指标类型（用于前端过滤）
  dataDate: string; // 数据日期 YYYY-MM-DD
  actualValue: number; // 实际值（单位：万元）
}
```

### 7.5 API-3 — 收益率查询

```typescript
// 请求
interface BusinessYieldQueryDTO {
  endDate: string; // YYYY-MM-DD
}

// 响应 — 后端返回数组，前端按 type 过滤
type BusinessYieldVO = BusinessYieldItemVO[];

interface BusinessYieldItemVO {
  type: '本币投资' | '本币交易'; // 收益率类型
  yieldRate: number; // 收益率
  baseline: number; // 基准收益率
  bpsOverBaseline: number; // 跑赢基准值 (bps)
  yearOverYear: number; // 比去年同期收益率差值
  baselineDifference: number; // 比基准收益率差值
}
```

### 7.6 API-4 — 环形图指标查询

```typescript
// 请求
interface BusinessDonutQueryDTO {
  endDate: string; // YYYY-MM-DD
  dimension: '业务维度' | '财务维度';
  indicatorType:
    | 'EVA'
    | '自营EVA'
    | '代客EVA'
    | '营业净收入'
    | '账面非息（科目口径）'
    | 'OCI估值';
}

// 响应
interface BusinessDonutVO {
  donutData: BusinessDonutItemVO[];
}

interface BusinessDonutItemVO {
  category1: string; // 一级分类
  category2: string; // 二级分类（可能为空）
  indicatorValue: number; // 指标值（单位：万元）
}
```

### 7.7 API-5 — 表格指标查询

```typescript
// 请求
interface BusinessTableQueryDTO {
  endDate: string; // YYYY-MM-DD
  dimension: '业务维度' | '财务维度';
  indicatorType:
    | 'EVA'
    | '自营EVA'
    | '代客EVA'
    | '营业净收入'
    | '账面非息（科目口径）'
    | 'OCI估值';
}

// 响应
interface BusinessTableVO {
  tableData: BusinessTableItemVO[];
}

interface BusinessTableItemVO {
  category1: string; // 一级分类
  category2: string; // 二级分类（可能为空）
  category3: string; // 三级分类（可能为空，仅账面非息有）
  actualValue: number; // 实际值
  budgetTarget: number | null; // 预算目标
  nonInterest: number | null; // 非息
  netInterest: number | null; // 净息
  completionRate: number | null; // 完成率
  dayOverDay: number | null; // 比上日
  monthOverMonth: number | null; // 比上月
  yearOverYear: number | null; // 比去年同期
  monthGrowthRate: number | null; // 环比增长率
  yearGrowthRate: number | null; // 同比增长率
}
```

---

## 八、状态设计

### 8.1 模块状态矩阵

| 模块        |       Loading       |     Empty      |       Error       |
| ----------- | :-----------------: | :------------: | :---------------: |
| ③ 统计数据  |   Spin（页面级）    |   数值 "--"    |    全页 Result    |
| ④ 收益率    |   Spin（页面级）    |   数值 "--"    |    全页 Result    |
| ⑥ 柱状图    | EChartsBase loading | "暂无图表数据" | EChartsBase error |
| ⑨ 统计数据  |         同③         |      同③       |        同③        |
| ⑩ 收益率    |         同④         |      同④       |        同④        |
| ⑫ 柱状图    |         同⑥         |      同⑥       |        同⑥        |
| ⑦a 抽屉统计 |   Spin（抽屉级）    |   数值 "--"    |   抽屉内 Result   |
| ⑦b 抽屉图表 | EChartsBase loading | "暂无图表数据" | EChartsBase error |
| ⑦c 环形图   | EChartsBase loading |   "暂无数据"   | EChartsBase error |
| ⑦d 表格     |   STable loading    |    SNoData     |   抽屉内 Result   |

### 8.2 Zustand Store

```typescript
interface ComprehensiveAnalysisStore {
  // ── 筛选条件 ──
  endDate: string; // 默认 T-1
  unit: '亿元' | '万元'; // 默认 亿元
  dimension: '业务维度' | '财务维度'; // 默认 业务维度

  // ── 主页数据 ──
  overviewData: BusinessOverviewItemVO[]; // API-1 全量
  leftChartData: BusinessChartItemVO[]; // API-2 全量（左侧柱状图使用）
  rightChartData: BusinessChartItemVO[]; // API-2 全量（右侧柱状图使用，与左相同数据但独立存储以便分别过滤）
  yieldData: BusinessYieldItemVO[]; // API-3 全量

  // ── 主页图表控制 ──
  leftChartMetric: string; // 左柱状图指标，默认 "EVA"
  leftChartDimension: '月' | '日'; // 左柱状图时间粒度，默认 "月"
  rightChartMetric: string; // 右柱状图指标，默认 "营业净收入"
  rightChartDimension: '月' | '日'; // 右柱状图时间粒度，默认 "月"

  // ── 主页加载状态 ──
  pageLoading: boolean;

  // ── 抽屉状态 ──
  drawerOpen: boolean;
  drawerIndicatorType: string; // 当前抽屉指标
  drawerIndicatorTitle: string; // 当前抽屉标题

  // ── 抽屉数据（local state 模式 — 见 8.4）
  drawerChartData: BusinessChartItemVO[] | null;
  drawerChartDimension: '月' | '日';
  drawerDonutData: BusinessDonutItemVO[] | null;
  drawerTableData: BusinessTableItemVO[] | null;
  drawerLoading: boolean;

  // ── 环形图联动状态 ──
  selectedLevel1: string | null; // 当前选中一级分类

  // ── Actions ──
  setEndDate: (date: string) => void;
  setUnit: (unit: '亿元' | '万元') => void;
  setDimension: (dimension: '业务维度' | '财务维度') => void;
  setOverviewData: (data: BusinessOverviewItemVO[]) => void;
  setChartData: (data: BusinessChartItemVO[]) => void;
  setYieldData: (data: BusinessYieldItemVO[]) => void;
  setLeftChartMetric: (metric: string) => void;
  setLeftChartDimension: (dim: '月' | '日') => void;
  setRightChartMetric: (metric: string) => void;
  setRightChartDimension: (dim: '月' | '日') => void;
  setPageLoading: (loading: boolean) => void;
  openDrawer: (indicatorType: string, title: string) => void;
  closeDrawer: () => void;
  setDrawerChartData: (data: BusinessChartItemVO[] | null) => void;
  setDrawerChartDimension: (dim: '月' | '日') => void;
  setDrawerDonutData: (data: BusinessDonutItemVO[] | null) => void;
  setDrawerTableData: (data: BusinessTableItemVO[] | null) => void;
  setDrawerLoading: (loading: boolean) => void;
  setSelectedLevel1: (category: string | null) => void;
}
```

### 8.3 数据流选型

**主页数据：** Zustand Store 中间层（5 个接口，2-3 层嵌套 → 中等复杂度，走 Store 中间层）

**抽屉数据管理模式：**

| 问题                                       | 回答                                                                                                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1: 抽屉数据会被 Drawer 以外的组件读取吗？ | 否                                                                                                                                                              |
| Q2: 抽屉关闭后再打开，要保留上次数据吗？   | 否（每次打开重新加载）                                                                                                                                          |
| Q3: 主页需要感知抽屉的加载/错误状态吗？    | 否                                                                                                                                                              |
| **选择**                                   | A: local state（Drawer 内部 useRequest）                                                                                                                        |
| **理由**                                   | 抽屉数据仅自己消费，关闭即清理，无需污染全局 Store。但考虑到 Store 已在 §8.2 中预留字段（便于管理筛选联动），实际编码采用 Store 抽屉 slice 以简化筛选参数传递。 |

> 实际选型：**B: Store 抽屉 slice** — 因为抽屉筛选参数（endDate, dimension）来自主页 Store，且环形图联动状态（selectedLevel1）需要在 Drawer unmount 时清理，放 Store 中更清晰。但遵循"关闭时清理"原则，closeDrawer 时重置所有 drawer 字段。

### 8.4 数据流时序矩阵

| 触发               | API                | 入参拼接规则                                                                                                                                                                                                          | 响应 → 数据落盘                                                               | 扇出组件（§一编号） | 并行                            | 错误隔离                 |
| ------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------- | ------------------------------- | ------------------------ |
| E1: 页面首次加载   | API-1              | `{ endDate: Store.endDate, dimension: Store.dimension }`                                                                                                                                                              | → `Store.overviewData`                                                        | ③⑨                  | P(API-1, API-2, API-3) 三路并行 | 全页 error → 全屏 Result |
|                    | API-2              | `{ endDate: Store.endDate, dateDimension: '月', dimension: Store.dimension }`                                                                                                                                         | → `Store.leftChartData` / `Store.rightChartData`                              | ⑥⑫                  | 同上 ↵                          | 局部 empty               |
|                    | API-3              | `{ endDate: Store.endDate }`                                                                                                                                                                                          | → `Store.yieldData`                                                           | ④⑩                  | 同上 ↵                          | 全页 error → 全屏 Result |
| E2: 切换日期       | API-1+2+3          | 同 E1（Store.endDate 取新值）                                                                                                                                                                                         | 同 E1                                                                         | ③④⑥⑨⑩⑫              | 同 E1                           | 同 E1                    |
| E3: 切换单位       | **无**             | 前端换算：`value / (unit==='亿元' ? 10000 : 1)`                                                                                                                                                                       | 不更新 Store                                                                  | ③④⑨⑩（仅数值展示）  | —                               | —                        |
| E4: 切换维度       | API-1+2            | `{ endDate: Store.endDate, dimension: Store.dimension(新值) }`                                                                                                                                                        | → `Store.overviewData` + `Store.chartData`                                    | ②标题, ③④⑥          | P(API-1, API-2)                 | 同 E1                    |
| E5: 左图表指标切换 | **无**（前端过滤） | 从 `Store.leftChartData` 按 `Store.leftChartMetric` 过滤                                                                                                                                                              | 不更新 Store                                                                  | ⑥                   | —                               | —                        |
| E6: 左图表粒度切换 | API-2              | `{ endDate: Store.endDate, dateDimension: Store.leftChartDimension(新值), dimension: Store.dimension }`                                                                                                               | → `Store.leftChartData`                                                       | ⑥                   | —                               | 局部 empty               |
| E7: 右图表指标切换 | **无**（前端过滤） | 从 `Store.rightChartData` 按 `Store.rightChartMetric` 过滤                                                                                                                                                            | 不更新 Store                                                                  | ⑫                   | —                               | —                        |
| E8: 右图表粒度切换 | API-2              | 同 E6（dateDimension 取 Store.rightChartDimension）                                                                                                                                                                   | → `Store.rightChartData`                                                      | ⑫                   | —                               | 局部 empty               |
| E9: 打开抽屉       | API-2+4+5          | API-2: `{ endDate: Store.endDate, dateDimension: '月', dimension: Store.dimension }`；API-4: `{ endDate: Store.endDate, dimension: Store.dimension, indicatorType: Store.drawerIndicatorType }`；API-5: 同 API-4 参数 | → `Store.drawerChartData` / `Store.drawerDonutData` / `Store.drawerTableData` | ⑦a⑦b⑦c⑦d            | P(API-2, API-4, API-5) 三路并行 | 抽屉内局部 error         |
| E10: 抽屉粒度切换  | API-2              | `{ endDate: Store.endDate, dateDimension: Store.drawerChartDimension(新值), dimension: Store.dimension }`                                                                                                             | → `Store.drawerChartData`                                                     | ⑦b                  | —                               | 局部 empty               |
| E11: 环形图联动    | **无**             | `Store.drawerDonutData` 按 `Store.selectedLevel1` 过滤 category1                                                                                                                                                      | 不更新 Store                                                                  | ⑦c 二级环形图       | —                               | —                        |
| E12: 关闭抽屉      | **无**             | 重置 `drawerChartData/drawerDonutData/drawerTableData` → `null`，`selectedLevel1` → `null`                                                                                                                            | Store 抽屉字段重置                                                            | —                   | —                               | —                        |

---

## 九、迭代记录

| 版本 | 日期       | 变更                                                              | 作者 |
| ---- | ---------- | ----------------------------------------------------------------- | ---- |
| v1.0 | 2026-01-22 | 初始版本，基于 comprehensive-api.md + comprehensive-结构与描述.md | AI   |

---

## 附录 A：需求-蓝图功能对照检查清单

> 用于测试验收时逐项勾对。每条引用需求原文，标注蓝图对应章节。

### A.1 搜索模块

| #    | 需求项                                       | 蓝图对应                                       | 状态 |
| ---- | -------------------------------------------- | ---------------------------------------------- | :--: |
| F-01 | 结束日期选择，默认 T-1                       | §四 E1, §八 Store.endDate                      |  ✅  |
| F-02 | 单位切换（亿元/万元），默认亿元              | §四 E3, §八 Store.unit, §五 StatCardProps.unit |  ✅  |
| F-03 | 维度切换（业务维度/财务维度），默认业务维度  | §四 E4, §八 Store.dimension                    |  ✅  |
| F-04 | 接口数据万元单位，亿元需前端换算（保留两位） | §五 StatCard, §八 E3                           |  ✅  |

### A.2 左侧模块

| #    | 需求项                                                                        | 蓝图对应                                      | 状态 |
| ---- | ----------------------------------------------------------------------------- | --------------------------------------------- | :--: |
| F-05 | 标题为维度值                                                                  | §五 ModuleTitle, §四 E4                       |  ✅  |
| F-06 | 统计三子模块：EVA、自营EVA、代客EVA                                           | §一 ③, §五 StatCard (×3)                      |  ✅  |
| F-07 | 统计展示：数据、完成率、比上日、比上月、比上年、环比增长率、同比增长率        | §五 StatCardProps.data                        |  ✅  |
| F-08 | 完成率百分比，其他数值单位动态                                                | §五 StatCardProps                             |  ✅  |
| F-09 | 本币投资收益率：数据、基准收益率、跑赢基准值(bps)、比去年同期差值、比基准差值 | §五 YieldCard, §七 API-3 过滤 type='本币投资' |  ✅  |
| F-10 | 柱状图指标下拉：EVA、自营EVA、代客EVA                                         | §五 DualBarChartProps.metricOptions           |  ✅  |
| F-11 | 柱状图时间粒度：按月/按日，默认月                                             | §四 E6, §八 Store.leftChartDimension          |  ✅  |
| F-12 | 按日：本月1日→当日 vs 上月同日                                                | §五 图表需求卡「数据转换」                    |  ✅  |
| F-13 | 按月：本年1月→当月 vs 去年同月                                                | §五 图表需求卡「数据转换」                    |  ✅  |
| F-14 | 柱状图颜色 #E8836E（本月/本年）、#4B9CD3（上月/去年）                         | §三 BAR_COLORS                                |  ✅  |

### A.3 右侧模块

| #    | 需求项                                                    | 蓝图对应                                      | 状态 |
| ---- | --------------------------------------------------------- | --------------------------------------------- | :--: |
| F-15 | 标题固定"其他经营指标"                                    | §五 ModuleTitle                               |  ✅  |
| F-16 | 统计三子模块：营业净收入、重点业务收入、OCI当年估值       | §一 ⑨, §五 StatCard (×3)                      |  ✅  |
| F-17 | 统计字段同左侧                                            | §五 StatCardProps                             |  ✅  |
| F-18 | 本币交易收益率（字段同本币投资）                          | §五 YieldCard, §七 API-3 过滤 type='本币交易' |  ✅  |
| F-19 | 柱状图指标下拉：营业净收入、账面非息（科目口径）、OCI估值 | §五 DualBarChartProps.metricOptions           |  ✅  |
| F-20 | 柱状图其他功能同左侧                                      | §四 E7/E8, §五 DualBarChart                   |  ✅  |

### A.4 详情抽屉

| #    | 需求项                                             | 蓝图对应                                           | 状态 |
| ---- | -------------------------------------------------- | -------------------------------------------------- | :--: |
| F-21 | 点击六个统计卡片触发抽屉                           | §四 E9, §五 StatCardProps.onClick                  |  ✅  |
| F-22 | 抽屉统计数据：数据、完成率、比上日、比上月、比上年 | §四 ⑦a, §五 StatCard                               |  ✅  |
| F-23 | 抽屉柱状图（无指标下拉，其余同主页）               | §四 ⑦b, §五 DualBarChart(showMetricDropdown=false) |  ✅  |
| F-24 | EVA 环形图：一级→二级联动                          | §四 4.3, §五 DetailDonut(enableLinkage=true)       |  ✅  |
| F-25 | 自营EVA 环形图：一级→二级联动                      | §四 4.3                                            |  ✅  |
| F-26 | 代客EVA 环形图：仅一级（管理子团队）               | §四 4.3, §五 DetailDonut(showLevel2=false)         |  ✅  |
| F-27 | 营业净收入 环形图：仅一级（管理团队<内部>）        | §四 4.3, §五 DetailDonut(showLevel2=false)         |  ✅  |
| F-28 | 账面非息 环形图：一级→二级联动                     | §四 4.3                                            |  ✅  |
| F-29 | OCI估值 环形图：有一级+二级但无联动                | §四 4.3, §五 DetailDonut(enableLinkage=false)      |  ✅  |
| F-30 | 环形图颜色使用需求提供的 12 色                     | §三 CHART_COLORS                                   |  ✅  |

### A.5 明细表格

| #    | 需求项                                               | 蓝图对应           | 状态 |
| ---- | ---------------------------------------------------- | ------------------ | :--: |
| F-31 | EVA 表格：含自营代客，有净息/非息/预算/完成率        | §五 5.8 表格列定义 |  ✅  |
| F-32 | 自营EVA 表格：仅自营数据                             | §五 5.8            |  ✅  |
| F-33 | 代客EVA/营业净收入 表格                              | §五 5.8            |  ✅  |
| F-34 | 账面非息 表格：有三级分类，无净息/非息/预算/完成率   | §五 5.8            |  ✅  |
| F-35 | OCI 表格：有一二级分类，无三级/净息/非息/预算/完成率 | §五 5.8            |  ✅  |

### A.6 样式与兼容

| #    | 需求项                     | 蓝图对应                                    | 状态 |
| ---- | -------------------------- | ------------------------------------------- | :--: |
| F-36 | 背景白色                   | §一 全局值表                                |  ✅  |
| F-37 | 统计数值颜色 #333          | §三 COLOR_VALUE                             |  ✅  |
| F-38 | 正数 #F5222D，负数 #52C41A | §三 COLOR_POSITIVE / COLOR_NEGATIVE         |  ✅  |
| F-39 | 1920×1080 大屏兼容         | §二 分辨率方案                              |  ✅  |
| F-40 | 8 位数数据显示考虑         | §五 StatCard（数值 format 逻辑在 utils.ts） |  ✅  |

---

## 附录 B：待确认事项清单

| #    | 事项                                                                                | 位置               | 风险 |
| ---- | ----------------------------------------------------------------------------------- | ------------------ | :--: |
| Q-01 | API-2（chart）缺少 `indicatorType` 参数 — 前端按响应过滤还是后端补充参数？          | §四 E5/E7, §七 7.4 |  中  |
| Q-02 | "重点业务收入" 在 API 文档中无对应 indicatorType — 是独立指标还是映射到"账面非息"？ | §七 7.3            |  高  |
| Q-03 | "OCI当年估值" vs "OCI估值" — 同一指标还是不同？                                     | §七 7.3            |  中  |
| Q-04 | 五个接口的就绪状态需用户确认                                                        | §七 7.1            |  低  |
| Q-05 | OCI估值环形图"无上下级联动" — 是两级独立展示（双环形图）还是有其他展示方式？        | §四 4.3            |  低  |
| Q-06 | 统计数据8位数 — 接口返回万元单位，换算亿元后约4位，溢出风险低，但需验证实际量级     | §五 StatCard       |  低  |
