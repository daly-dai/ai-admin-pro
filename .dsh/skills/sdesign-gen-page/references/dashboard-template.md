# 大屏页代码模板

> 适用：数据大屏 / 仪表盘 / 实时监控 / 统计页面
> 组件库文档: `{project}/.ai/sdesign/components/` | 大屏规约: `{project}/.ai/conventions/dashboard-conventions.md`

## 决策点

| 场景         | 布局                 | 刷新方式         | 数据流                  | 渲染模式         | 数据来源        |
| ------------ | -------------------- | ---------------- | ----------------------- | ---------------- | --------------- |
| 静态数据概览 | DashboardGrid 响应式 | 无 / 手动刷新    | 页面集中（props 传入）  | 嵌入 MainLayout  | Mock（默认）    |
| 实时监控大屏 | CSS Grid 全屏 16:9   | useInterval 轮询 | Store 中间层            | 独立全屏         | Mock（默认）    |
| 交互式仪表盘 | DashboardGrid + 联动 | 按需加载         | Store 中间层 + 分片订阅 | 嵌入 MainLayout  | Mock（默认）    |

> 用户未指定时：默认嵌入 MainLayout + Mock 数据。

## 文件结构

```
src/api/{module}/types.ts              — 统计数据类型（按规格文档 §七 响应结构定义）
src/api/{module}/index.ts              — 统计 API（createRequest + ByGet）
src/pages/{module}/index.tsx           — 大屏主页面（Grid 布局 + 数据获取）
src/pages/{module}/store.ts            — 大屏数据状态（Zustand，filter + data + loading）
src/pages/{module}/components/         — 图表组件（从规格文档 §五 动态生成，非固定模板）
src/pages/{module}/hooks/              — 数据请求 hooks（按规格文档 §六 文件清单）
src/pages/{module}/utils/              — 工具函数（formatUnit 等）
src/pages/{module}/mock.ts             — Mock 数据生成器（后端就绪后删除）
```

> 图表组件不内置死模板。步骤 5 根据规格文档 §五 每个模块的「图表类型」「数据映射」「图表配置」「Props」动态生成。

## 核心组件

| 用途     | 组件                          | 来源              | 禁止替代               |
| -------- | ----------------------------- | ----------------- | ---------------------- |
| 网格布局 | `DashboardGrid`               | `src/components`  | 禁止 antd Row/Col      |
| 图表渲染 | `EChartsBase`                 | `src/components`  | 禁止 echarts-for-react |
| 卡片容器 | antd `Card`                   | `antd`            | —                      |
| 加载态   | antd `Spin`                   | `antd`            | —                      |
| 时间筛选 | antd `DatePicker.RangePicker` | `antd`            | —                      |
| 空数据   | `SNoData`                     | `@dalydb/sdesign` | —                      |
| 定时轮询 | `useInterval`                 | `ahooks`          | 禁止手动 setInterval   |
| 容器尺寸 | `useSize`                     | `ahooks`          | EChartsBase 内已封装   |

## 硬约束（来自大屏规约）

| #   | 规则                                                     | 禁止                                         |
| --- | -------------------------------------------------------- | -------------------------------------------- |
| H1  | 图表组件间不互相 import，只能被 page 引用                | 图表组件 import 另一个图表组件               |
| H2  | 图表组件内禁止调用 useRequest / createRequest / API hook | 组件内直接调接口                             |
| H3  | 图表 option 必须外提为独立变量/函数，禁止内联 JSX        | `echarts={ <EChartsBase option={{...}} /> }` |
| H4  | 禁止硬编码色值，颜色集中在页面级常量                     | `color: '#1890ff'`                           |
| H5  | 一个文件只导出一个组件                                   | 一个文件导出多个图表组件                     |
| H6  | 数据转换逻辑放独立 `utils.ts`，不混在组件里              | 组件内写 API→图表格式转换                    |
| H7  | DashboardGrid 同屏内多行两列必须用相同 col 比例          | Row1 `[9,15]` + Row2 `[8,16]`                |
| H8  | col 数组定义为页面级常量，不内联数字                     | `<DashboardGrid cols={[9, 15]}>`             |

---

## 步骤 1-2：生成类型和 API 文件（使用 api-template.md）

> 类型和 API 生成使用 `api-template.md` 的填空模板。大屏接口的特殊规则：

| 规则 | 说明 |
|---|---|
| 不套 `PageQuery` | 大屏聚合查询不分页 |
| 类型按图表/模块定义 | 不硬套 Entity/Query/FormData 三元组 |
| 方法后缀 `ByGet` | 大屏只读，全用 GET |
| 后端未到位 | mock 返回，标注 `// TODO: 替换为真实接口` |

**生成前必须读取：**
- `references/api-template.md` — 掌握 types.ts 和 api/index.ts 的填空模板
- `src/plugins/request/presets.ts` — 了解 `createRequest` 的配置项（prefix/dataKey/codeKey）

**产出：**
- `src/api/{module}/types.ts`
- `src/api/{module}/index.ts`

---

## 步骤 1.5：生成 Mock 数据（后端未就绪时）

> ⛔ **机械映射，禁止 AI 推断字段语义。** 本步骤的目标是类型安全 + 可运行，不是数据真实。

### 文件：`src/pages/{module}/mock.ts`

### 生成规则（逐类型映射，不推断语义）

| TypeScript 类型    | 生成值                    | 示例                          |
| ------------------ | ------------------------- | ----------------------------- |
| `number`           | `rand(1000, 100000)`      | `value: rand(1000, 100000)`   |
| `string`           | `'mock_' + 字段名`        | `title: 'mock_title'`         |
| `boolean`          | `Math.random() > 0.5`     | —                             |
| 嵌套对象 `{ ... }` | 递归应用上表              | —                             |
| 数组 `T[]`         | 生成 10 项                | `Array.from({length:10},...)` |
| 联合类型 `'a'|'b'` | 取第一个字面量            | `status: 'a'`                 |

### 生成流程

1. 扫描 `src/api/{module}/types.ts` 中所有 Response 接口
2. 为每个 Response 生成同名 mock 函数，返回类型严格匹配
3. 同时为 DetailDrawer 生成 `getMockDrawerData()` 聚合函数
4. 生成 `rand(min, max)` 和 `randRate(min, max)` 工具函数

### 用户可调参数

用户只需修改关键字段的 rand 范围让数据看起来合理：

```ts
// AI 生成：value: rand(1000, 100000)
// 用户改为：value: rand(800000, 1500000)
```

### 集成规则

- `useDashboardData.ts` 默认 import mock，API 调用注释保留在代码中
- 切换 API 时：取消注释 API 调用行，删除 mock import，**改动 ≤2 行**

---

## 步骤 3：生成 Store（仅中等/复杂数据流需要）

### 文件：`src/pages/{module}/store.ts`

> 简单数据流（≤5 接口）跳过此步骤。直接在页面组件用 `useRequest` + props 传入。

```typescript
// src/pages/{module}/store.ts
import { create } from 'zustand';

interface @FILL_DashboardStore {
  filter: {
    dateRange: [string, string];
    // @FILL: 可选筛选字段
  };
  stats: @FILL_DashboardData | null;
  loading: boolean;
  setFilter: (filter: Partial<@FILL_DashboardStore['filter']>) => void;
  setStats: (stats: @FILL_DashboardData) => void;
  setLoading: (loading: boolean) => void;
}

// ⚠️ set 回调内禁止写 for/if/filter/map，数据处理在 set 外纯函数完成
export const use@FILL_DashboardStore = create<@FILL_DashboardStore>((set) => ({
  filter: {
    dateRange: [
      '', // @FILL: 默认开始日期，如 dayjs().subtract(7, 'day').format('YYYY-MM-DD')
      '', // @FILL: 默认结束日期
    ],
  },
  stats: null,
  loading: false,
  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}));
```

---

## 步骤 4：生成主页面

> ⛔ **生成前必须先读取源码**：
> - `src/components/DashboardGrid/index.tsx` — 掌握 `cols`/`gap`/`style`/`gridColumn` 等 Props
> - 蓝图 `specs/{feature}-blueprint.md` — §一 列宽表、§四 事件清单、§六 组件树
> - 不要猜布局，从蓝图提取

### 文件：`src/pages/{module}/index.tsx`

### 生成规则（蓝图驱动，不内置死布局）

1. **筛选栏**：扫描蓝图 §六 组件树，若存在 FilterBar → 在页面顶部渲染，props 来自 Store
2. **Grid 布局**：扫描蓝图 §一 列宽表，每个 Row 生成一个 `<DashboardGrid cols={...}>` ，cols 值取自列宽表的 `cols 数组` 列
3. **组件挂载**：扫描蓝图 §六 组件树，在每个 Grid 区域内渲染对应组件。组件名和文件路径取自蓝图 §五 的文件名
4. **图表区域统一结构**：
   ```tsx
   <Card size="small">
     <ComponentName data={...} ... />  {/* 组件名从蓝图 §五 取 */}
   </Card>
   ```
5. **非图表组件**（纯数字卡片/标签行）按蓝图 §五 Props 直接渲染，不套 Card+EChartsBase
6. **数据来源**：按蓝图 §八 数据流规则 —— 页面集中获取或 Store 中间层
7. **事件绑定**：按蓝图 §四 事件清单，每个 E 编号对应一个 handler

### 生成流程

```
蓝图 §一 列宽表 → 确定几行、每行几列
蓝图 §六 组件树 → 确定每行内有哪些组件
蓝图 §五 组件名 → 确定 import 路径和 JSX 标签名
蓝图 §四 事件   → 确定 props 中的回调
蓝图 §八 数据流 → 确定数据获取方式（useState vs Store）
  │
  ▼
index.tsx（无硬编码组件名，无死布局）
```

### 示例（仅示意结构，实际产出由蓝图决定）

```tsx
// src/pages/{module}/index.tsx
import { Spin } from 'antd';
import DashboardGrid from 'src/components/DashboardGrid';
// 以下 import 全部来自蓝图 §六 组件树 + §五 文件名
// import FilterBar from './components/FilterBar';
// import StatCard from './components/StatCard';
// import DualAxisChart from './components/DualAxisChart';
// ...

const @FILL_DashboardPage: React.FC = () => {
  // 数据获取方式来自蓝图 §八 数据流
  // 事件处理来自蓝图 §四 事件清单

  return (
    <div>
      {/* 筛选栏：来自蓝图 §六 组件树 */}
      {/* <FilterBar ... /> */}

      {/* Grid 行：来自蓝图 §一 列宽表，逐 Row 生成 */}
      {/* <DashboardGrid cols={[@FILL]}> */}
      {/*   组件：来自蓝图 §六 组件树，逐组件渲染 */}
      {/* </DashboardGrid> */}
    </div>
  );
};

export default @FILL_DashboardPage;
```

> ⛔ **禁止写死的组件名**：不出现 `TrendChart`、`PiePanel`、`BarPanel` 等未在蓝图中定义的组件。所有组件名从蓝图 §五 提取。

---

## 步骤 5：生成图表组件（基于 EChartsBase 动态生成）

> ⛔ **生成前必须先读取源码**：
> - `src/components/EChartsBase/index.tsx` — 掌握 Props：`option`/`height`/`empty`/`emptyText`/`loading`/`error`/`events`/`style`
> - 不要猜 EChartsBase 的 API，从源码确认
>
> ⛔ **不内置任何死图表。** 图表组件根据需求描述动态生成，不限定图表类型。

### 图表组件的职责

```
图表组件 = 接收 data props → 构造 ECharts option 对象 → 交给 <EChartsBase option={option} />
```

图表组件**只负责**构造 option，**不负责**渲染、resize、loading/empty/error 状态——这些由 EChartsBase 内置。

### 生成流程

对需求中列出的每个图表/模块：

```
需求描述（图表类型 + 数据字段 + 展示要求）
  │
  ├─ 确定 ECharts series.type
  │   根据需求中的图表描述选择：line / bar / pie / scatter / ...
  │   复合图表用多个 series
  │
  ├─ 构造 option 对象
  │   tooltip / legend / grid / xAxis / yAxis / series
  │   数据映射：需求中的字段 → series[].data
  │   双 Y 轴：yAxis 数组 + series 各自指定 yAxisIndex
  │
  ├─ 生成 TypeScript Props interface
  │   data 类型从需求的数据字段推导
  │   交互回调（onClick/onChange）从需求的事件描述推导
  │
  └─ 输出 → src/pages/{module}/components/{ComponentName}.tsx
```

### 质量约束

| #   | 规则                                                      |
| --- | --------------------------------------------------------- |
| Q1  | option 必须外提为独立变量/useMemo，**禁止内联在 JSX**     |
| Q2  | 禁止硬编码色值，颜色使用页面级 CSS 变量或常量             |
| Q3  | 必须传 `empty` prop 给 EChartsBase，emptyText 按需求填写  |
| Q4  | height 按需求设置，无指定时默认 300px                      |
| Q5  | 一个文件只导出一个图表组件                                |
| Q6  | 图表组件内禁止调用 useRequest / createRequest / API hook  |
| Q7  | 非图表组件（纯数字卡片/标签行）不套 EChartsBase，直接 JSX |

### 逐图循环规则（可恢复）

> ⛔ **禁止一次生成所有图表。** 每轮只生成一个图表组件文件。

```
对需求中的每个图表/模块，按顺序循环：

1. 检查 src/pages/{module}/components/{Name}.tsx 是否已存在
   → 已存在 → 跳过（已完成的图表不重生成）
   → 不存在 → 进入步骤 2

2. 生成单个组件的 .tsx 文件

3. 立即 pnpm verify
   → 通过 → 继续下一个图表
   → 失败 → 查 .ai/pitfalls/verify-errors.md，修复，再 verify
   → 同一图表累计 3 轮 verify 仍失败 → 标注 `// TODO: 该图表 verify 失败，请人工检查`
     → 跳过，继续下一个图表

4. 全部图表处理完后，汇总：通过/跳过/@TODO 清单
```

> 会话中断后可恢复：重跑 skill 时步骤 7 检查已有文件，已完成的不重生成。

### 非图表组件

需求中标注为「纯数字卡片」「标签行」等非图表类型时，不生成 ECharts option，直接写 React JSX。数值格式化遵循 `formatUnit(value, unit)` 规则（渲染层换算，Store 存原值）。

---

## 全屏 16:9 大屏布局（可选）

仅当用户明确要求"全屏大屏"时使用，替代 DashboardGrid 方案：

```tsx
// 全屏 16:9 大屏，居中缩放适配
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
    {/* @FILL: 标题行 | 指标行 | 图表区 | 排行区 */}
  </div>
</div>
```

## 验证清单

- [ ] `pnpm verify` 通过（0 error）
- [ ] 图表 option 外提为独立变量（非 JSX 内联）
- [ ] 同一大屏内两列行的 cols 比例一致
- [ ] cols 定义为页面级常量（非内联数字数组）
- [ ] 图表组件不互相 import
- [ ] 图表组件内无 API 调用（useRequest / createRequest）
- [ ] 未使用参数加 `_` 前缀
- [ ] 无 `any` 类型
- [ ] useInterval 来自 ahooks（非手动 setInterval）
- [ ] 数据为空时传了 `empty` prop
