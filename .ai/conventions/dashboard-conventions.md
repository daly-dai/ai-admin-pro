# 大屏/仪表盘规约

> 适用场景：数据大屏、实时监控大屏、统计仪表盘。
> 目标：让 AI 生成的代码**好改、好删、好替换**——大屏的核心开发发生在迭代阶段（D1-D6），不在初始生成。
>
> **视觉设计委托：** 颜色变量在规格文档中定义，间距/字体/卡片/图表美化等视觉细节由 `frontend-design` + `web-design-guidelines` skill 接管。本文件不重复定义视觉 token。

---

## 一、组件独立性 — "删掉它，别的能不能跑"

- 图表/小组件之间不互相 import，只能被 page 组件引用
- 组件不依赖父组件的内部状态（只通过 props 或 Store 订阅获取数据）
- 删掉一个图表组件 → 删 JSX 一行 + 删文件，页面其余部分不受影响

## 二、数据与展示分离 — "改数据源，要不要动 UI"

- 图表组件内部**禁止**调用 `useRequest` / `createRequest` / 任何 API hook
- 数据转换逻辑（API 响应 → 图表格式）放在独立文件（`utils.ts`），不混在组件里
- 组件 props 的 data 类型和 API 响应类型解耦，不直接透传 API 响应对象

## 三、能快速定位 — "我要改的东西在哪个文件"

- 图表 option 必须抽取为独立变量或函数，**禁止内联在 JSX 中**
- 颜色/主题集中在 theme 文件，组件只引用不定义，**禁止硬编码色值**
- 图表类型（line/bar/pie）通过 prop 或配置对象控制，**禁止硬编码在组件内部**
- resize 逻辑统一使用 `ahooks/useSize` + ref，**禁止 copy-paste resize 代码**
- 一个文件只导出一个组件

## 四、ECharts 基座

- 统一使用 `src/components/EChartsBase`，**禁止直接 import echarts-for-react**
- 基座提供：loading / error / empty 三态 + resize 自适应
- 图表组件基于基座封装，传入 option 配置即可
- **Drawer 内含 ECharts 时**：禁止 `destroyOnClose`，外部用 `{open && <Drawer>}` 条件渲染。抽屉关闭时组件保持挂载，ECharts 实例不销毁，避免重新初始化时容器尺寸为 0

## 五、数据流模式

| 大屏复杂度                  | 推荐模式            | 数据获取位置        | 组件接收数据方式      |
| --------------------------- | ------------------- | ------------------- | --------------------- |
| 简单（≤5接口，≤2层嵌套）    | 页面集中            | 页面组件 useRequest | props 传入            |
| 中等（5-15接口，2-3层嵌套） | Store 中间层        | 页面写入 Store      | 组件自订阅 Store      |
| 复杂（>15接口，>3层嵌套）   | Store 中间层 + 分片 | 页面/模块写入 Store | 组件自订阅 Store 切片 |

> 数据流模式选定后，同一大屏内所有组件遵循同一模式，不混用。

## 六、Store 规约

- Store 文件路径：`src/pages/{module}/store.ts`
- 筛选条件集中存储，使用 selector 精确订阅避免不必要渲染
- 不存储派生/计算数据（在组件中通过 selector 派生）
- Store 的 action 不包含 API 调用逻辑（API 调用在页面或 hooks 中）

## 七、颜色管理

- 页面级颜色常量统一定义在 `src/pages/{module}/constants/index.ts` 的 `THEME_COLORS` 对象中
- 所有组件通过 `import { THEME_COLORS } from '../constants'` 引用，**禁止组件内硬编码色值**
- `chartSeries` 数组长度 ≥10，覆盖 ECharts 环形图/柱状图的多系列场景
- 切换主题只需修改 `THEME_COLORS` 一处（包括 `bgPrimary`/`bgCard`/`textPrimary`/`textSecondary`）

## 八、option 构造规范

> 图表组件的 ECharts option 不自由发挥，严格按 sdesign-gen-page 的「option 构造流程」生成：
> 确定坐标系 → 组装 xAxis → 组装 yAxis[] → 组装 series[] → 填充通用默认值 → 填颜色 → 写数据转换。
>
> 数据来源从蓝图的「图表需求卡」取，不自行推断。需求卡没写的配置项使用通用默认值。
>
> 图表 option 必须抽取为独立变量或函数，**禁止内联在 JSX 中**。

## 九、D1-D6 修改路径

> 匹配修改场景 → 定位锚点 → 按已有模式修改 → 不改变既定数据流方式。

| 模板 | 场景              | 目标文件                           | 锚点                                  |
| ---- | ----------------- | ---------------------------------- | ------------------------------------- |
| D1   | 加/换图表         | `pages/{module}/index.tsx`         | Grid 区域，替换或新增图表组件         |
| D2   | 改图表配置        | `components/{ChartName}.tsx`       | option 变量定义处                     |
| D3   | 改主题/颜色       | 主题文件 or 各组件的 option        | 色值/主题引用                         |
| D4   | 加筛选条件        | `store.ts` → `index.tsx`           | Store filter 字段 → 页面 FilterBar    |
| D5   | 加/减指标卡片     | `pages/{module}/index.tsx`         | 指标卡 Grid 区域                      |
| D6   | 改数据源/接口字段 | `types.ts` → `api/index.ts` → 组件 | Entity 字段 → API 签名 → 组件数据绑定 |

## 十、Grid 布局对齐规约

> **核心原则：同一大屏内，多行之间的列边界必须对齐。不允许每行独立选列宽。**

### 为什么需要这个规约

大屏最常见的布局是 2×2（两行两列）或 3×2（两行三列）。如果第一行左右分界在 37.5% 处（`lg={9}`），第二行分界在 33.3% 处（`lg={8}`），视觉上会产生明显的"错位感"——卡片边缘对不齐，看起来很乱。

### 规则

| #   | 规则                       | 说明                                                                                                          |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| G1  | **同屏同列宽**             | 同一大屏内，相同列数的 Row 必须使用相同的 `lg` 比例。Row2 用 `lg={9}+lg={15}`，Row3 也必须用 `lg={9}+lg={15}` |
| G2  | **列宽用常量，不内联数字** | `lg` 值必须定义为页面级常量（如 `const LEFT = 9; const RIGHT = 15`），所有 Row 引用同一常量                   |
| G3  | **推荐比例**               | 两列优先从以下比例选：`7:17`、`8:16`、`9:15`、`10:14`、`12:12`。选定后在整页内保持一致                        |
| G4  | **不同列数不同行**         | 如果 Row2 是两列、Row3 是三列，列边界不必对齐（结构不同），但每个列数组内必须遵守 G1                          |

### 正确示例

```tsx
// ✅ 列宽定义为语义化常量，所有 Row 引用
const LEFT_COL = 9;
const RIGHT_COL = 15;

return (
  <>
    {/* Row 1: 两列，9:15 */}
    <Row gutter={[16, 16]}>
      <Col lg={LEFT_COL}>
        <Chart1 />
      </Col>
      <Col lg={RIGHT_COL}>
        <Chart2 />
      </Col>
    </Row>
    {/* Row 2: 两列，同样 9:15 — 列边界对齐 */}
    <Row gutter={[16, 16]}>
      <Col lg={LEFT_COL}>
        <Chart3 />
      </Col>
      <Col lg={RIGHT_COL}>
        <Chart4 />
      </Col>
    </Row>
  </>
);
```

### 错误示例（禁止）

```tsx
// ❌ 每行独立选 lg 值 — 列边界不对齐
<Row gutter={[16, 16]}>
  <Col lg={9}><Chart1 /></Col>
  <Col lg={15}><Chart2 /></Col>
</Row>
<Row gutter={[16, 16]}>
  <Col lg={8}><Chart3 /></Col>   {/* ← 9→8，分界线偏移 */}
  <Col lg={16}><Chart4 /></Col>
</Row>
```

### CSS Grid 替代方案

优先使用 `DashboardGrid` 组件（`src/components/common/DashboardGrid`）替代 antd Row/Col。该组件底层使用 CSS Grid，`grid-template-columns` 天然保证对齐，无需 G1-G4。

## 十一、组件拆分决策 — "这个东西要不要独立成一个文件"

> **核心原则：不要凭感觉拆。** 每次犹豫"要不要拆文件"时，按以下决策表判断。满足任一条件即拆，都不满足则不拆。

### 决策表

| #   | 判断条件                                                                    | 拆成独立文件？        | 示例                                                   |
| --- | --------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------ |
| S1  | 有独立状态（`useState` / `useRef` / `useReducer`）或副作用（`useEffect`）？ | ✅ 拆                 | DualAxisChart 有内部 mode 状态 → 拆                    |
| S2  | 被 ≥2 个父组件引用（复用）？                                                | ✅ 拆                 | StatCard 被 LeftModule 和 RightModule 共用 → 拆        |
| S3  | Props ≥3 个且内部有非展示型逻辑（条件判断 / 数据转换 / 事件处理）？         | ✅ 拆                 | FilterBar 有 onChange 回调 + 多个搜索项 → 拆           |
| S4  | 对应布局拓扑图中一个编号区域（§一）？                                       | ✅ 拆（模板规则）     | ①~⑬ 每个编号 → 一个组件文件                            |
| S5  | 以上都不满足？                                                              | ❌ 不拆，内联在父组件 | StatCardRow（纯 flex 容器，~10行）→ 写在 LeftModule 里 |

### 反例：不该拆的情况

```tsx
// ❌ 过度拆分：StatCardRow 只是一个 flex 容器，无状态、无逻辑、不跨组件复用
const StatCardRow: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', gap: 12 }}>{children}</div>
);

// ✅ 正确：直接内联在父组件
<div style={{ display: 'flex', gap: 12 }}>
  <StatCard title="EVA" ... />
  <StatCard title="自营EVA" ... />
  <StatCard title="代客EVA" ... />
</div>
```

### 抽屉/弹窗内组件的处理

抽屉（Drawer）和弹窗（Modal）**不在主页面拓扑图中**，但仍按 S1-S5 规则判断：

| 抽屉内部区域           | 判断                                             | 理由                                        |
| ---------------------- | ------------------------------------------------ | ------------------------------------------- |
| 统计区（单指标详细版） | 复用 StatCard，不新增组件                        | S2：StatCard 已在主页复用                   |
| 折线柱状图             | 复用 DualAxisChart（`showMetricDropdown=false`） | S2：与主页共用，通过 prop 控制差异          |
| 环形图                 | 新增 DonutChart.tsx                              | S1：有内部联动状态（一级→二级）             |
| 表格                   | 新增 DetailTable.tsx                             | S3：列定义随 indicatorType 变化，有转换逻辑 |
| 抽屉容器               | 新增 DetailDrawer.tsx                            | S1：管理 open/close + indicatorType 状态    |

### 判据优先级

按 S1 → S2 → S3 → S4 → S5 顺序判断。一旦命中 S1-S4 中任一条件，立即拆分，不再继续判断后续条件。
