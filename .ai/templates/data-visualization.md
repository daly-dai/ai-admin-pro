# Prompt: 生成数据可视化页面

## 使用方式

提供数据接口定义和图表配置，AI 会生成完整的数据可视化页面。

## 模板

```markdown
请根据以下需求，生成数据可视化页面代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + Ant Design 5 + ahooks + Zustand
- 图表库: 使用 Chart.js + react-chartjs-2 (轻量级)

## 页面信息

页面名称: [PAGE_NAME]
页面路由: [PAGE_ROUTE]
页面描述: [PAGE_DESCRIPTION]

## 接口定义

### 接口列表

[接口列表，每个接口包含：方法、路径、参数、响应]

### 类型定义

[数据类型定义]

## 图表配置

### 图表1

- 图表类型: [line | bar | pie | doughnut | scatter | radar | polarArea]
- 图表标题: [CHART_TITLE]
- X轴字段: [X_AXIS_FIELD]
- Y轴字段: [Y_AXIS_FIELD]
- 系列字段: [SERIES_FIELD (可选)]
- 数据来源: [API_NAME]

### 图表2

- ... (可配置多个图表)

## 布局配置

- 布局方式: [grid | row-col | custom]
- 响应式: [true | false]
- 网格列数: [2 | 3 | 4]

## 功能要求

1. 数据加载状态
2. 错误处理和重试
3. 图表自适应容器大小
4. 支持数据刷新
5. 时间范围筛选（如需要）
6. 图表导出功能（可选）

## 生成要求

1. 创建文件:
   - `pages/[page-name]/index.tsx` - 主页面
   - `pages/[page-name]/components/[ChartName].tsx` - 图表组件（可选）
   - `hooks/use[PageName]Data.ts` - 数据 Hook（可选）

2. 代码规范:
   - 使用 TypeScript 严格模式
   - 使用路径别名导入
   - 使用 ahooks 的 useRequest
   - 使用 Ant Design 的 Card、Row、Col 等组件
   - 使用 react-chartjs-2 的图表组件
   - 类型定义完整，不使用 any
```

## 示例

```markdown
请根据以下需求，生成数据可视化页面代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + Ant Design 5 + ahooks + Zustand
- 图表库: 使用 Chart.js + react-chartjs-2
-路径引用: 使用相对路径 (src/)

## 页面信息

页面名称: 销售数据分析
页面路由: /analytics/sales
页面描述: 展示销售数据趋势、地区分布和产品销量

## 接口定义

### 接口列表

1. 获取销售趋势数据
   - 方法: GET
   - 路径: /api/analytics/sales-trend
   - 参数: startDate, endDate
   - 响应: { date: string, amount: number, orders: number }[]

2. 获取地区销售数据
   - 方法: GET
   - 路径: /api/analytics/sales-region
   - 参数: startDate, endDate
   - 响应: { region: string, amount: number, percentage: number }[]

3. 获取产品销量排行
   - 方法: GET
   - 路径: /api/analytics/product-ranking
   - 参数: startDate, endDate, limit
   - 响应: { productName: string, sales: number }[]

### 类型定义

SalesTrendItem {
date: string
amount: number
orders: number
}

SalesRegionItem {
region: string
amount: number
percentage: number
}

ProductRankingItem {
productName: string
sales: number
}

## 图表配置

### 图表1: 销售趋势图

- 图表类型: line
- 图表标题: 销售金额趋势
- X轴字段: date
- Y轴字段: amount
- 数据来源: getSalesTrend

### 图表2: 地区分布饼图

- 图表类型: doughnut
- 图表标题: 地区销售占比
- 数据字段: amount
- 名称字段: region
- 数据来源: getSalesRegion

### 图表3: 产品销量排行

- 图表类型: bar
- 图表标题: 产品销量 TOP10
- X轴字段: productName
- Y轴字段: sales
- 数据来源: getProductRanking

## 布局配置

- 布局方式: grid
- 响应式: true
- 网格列数: 2

## 功能要求

1. 数据加载状态
2. 错误处理和重试
3. 图表自适应容器大小
4. 支持数据刷新
5. 时间范围筛选（开始日期、结束日期）
```

## AI输出示例

AI会生成以下文件：

1. `pages/analytics/sales/index.tsx` - 主页面
2. `pages/analytics/sales/components/SalesTrendChart.tsx` - 趋势图组件
3. `pages/analytics/sales/components/RegionPieChart.tsx` - 饼图组件
4. `pages/analytics/sales/components/ProductRankingChart.tsx` - 柱状图组件

所有代码都遵循项目规范，可以直接使用。
