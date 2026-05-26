# 4模块双轴折线图仪表盘 — 功能文档

## 1. 概述

4 个独立模块（时点规模 / DV01风险 / 修正久期 / YTM收益率）的 2×2 大屏仪表盘。每个模块拥有独立的时点规模数据和翻页进度，国债收益率数据跨模块共享（同一 endDate 只请求一次）。

**技术栈**：React 18 + TypeScript + ECharts 6 + Zustand + dayjs + antd 5

---

## 2. 文件结构

```
src/pages/dashboard/
├── types.ts           # 类型定义（ModuleType, TrendItem, TreasuryYield...）
├── constants.ts       # 常量（MODULE_LIST, 筛选选项, 图表尺寸...）
├── api.ts             # API 统一入口（mock ↔ 真实接口切换点）
├── mock.ts            # Mock 数据生成器（按模块生成不同范围数据）
├── store.ts           # Zustand 多模块状态（modules + 共享 yieldCache）
├── chartConfig.ts     # 纯函数：数据 → ECharts option（compact/默认模式）
├── DualLineChart.tsx  # ECharts 容器（props 驱动，无 store 依赖）
├── useChartData.ts    # 数据 Hook（参数化：useChartData(moduleType)）
├── ModuleCard.tsx     # 模块卡片（标题栏 + 图表 + 弹框）
├── index.tsx          # 主页面（全局筛选栏 + 2×2 网格）
└── README.md          # 本文档
```

---

## 3. 模块类型

| 模块      | ModuleType | 左Y轴    | 右Y轴      | 时点规模数据范围（mock） |
| --------- | ---------- | -------- | ---------- | ------------------------ |
| 时点规模  | `scale`    | 时点规模 | 国债收益率 | 3000~5000                |
| DV01风险  | `dv01`     | 时点规模 | 国债收益率 | 500~1500                 |
| 修正久期  | `duration` | 时点规模 | 国债收益率 | 2~8                      |
| YTM收益率 | `ytm`      | 时点规模 | 国债收益率 | 2~6                      |

---

## 4. 接口约定

### 时点规模接口

| 参数          | 类型         | 说明                                  |
| ------------- | ------------ | ------------------------------------- |
| `endDate`     | `string`     | 截止日期                              |
| `pageSize`    | `30\|60\|90` | 返回条数                              |
| `accountType` | `string`     | 账户类型                              |
| `debtType`    | `string`     | 债权类型                              |
| `currency`    | `string`     | 币种                                  |
| `moduleType`  | `string`     | 模块类型 `scale\|dv01\|duration\|ytm` |

### 国债收益率接口（不变）

| 参数       | 类型         |
| ---------- | ------------ |
| `endDate`  | `string`     |
| `pageSize` | `30\|60\|90` |

---

## 5. 缓存策略

```
scaleCache[`${endDate}_${pageSize}_${accountType}_${debtType}_${currency}_${moduleType}`]
  → 按模块隔离，各模块互不影响

yieldCache[`${endDate}_${pageSize}`]
  → 不含 moduleType，4个模块共享
  → 首个模块请求后写入，其余模块直接命中
```

---

## 6. 交互规格

### 全局筛选栏

- 任一筛选项变更 → `setFilters` → 遍历重置所有模块 → 各自重新加载
- 筛选变更不清除缓存，翻回已加载区间可命中

### 模块卡片

- 标题栏：模块名 + 「上一页」按钮 + 已加载条数 + 展开按钮
- 「上一页」：计算当前最早日期 -1 天，请求更早数据，追加到图表头部
- dataZoom：默认展示全部数据，用户自行缩放

### 弹框放大

- 点击「⛶」打开 Modal（90vw 宽度）
- 弹框内图表更大（500px vs 260px），操作更精细
- 弹框内「上一页」按钮直接操作模块数据，关闭后卡片同步更新
- 弹框和卡片共享同一 store 数据，无需额外请求

### 翻页独立

- 4个模块各自独立翻页，互不影响
- 时点规模翻到 60 天，DV01 仍可以是 30 天

---

## 7. 接入真实接口

修改 `api.ts` 的 import 源即可：

```ts
export { fetchScaleData, fetchTreasuryYieldData } from './real-api';
```

两个函数的签名：

```ts
fetchScaleData(params: {
  endDate, pageSize, accountType, debtType, currency, moduleType
}): Promise<TrendItem[]>

fetchTreasuryYieldData(params: {
  endDate, pageSize
}): Promise<TreasuryYield[]>
```

---

## 8. 迁移指南

1. 复制 `src/pages/dashboard/` 整个目录
2. 依赖：`echarts`, `dayjs`, `zustand`, `antd`（项目通常已有）
3. 路由注册：`{ path: '/dashboard', element: <DashboardPage /> }`
4. 替换 `api.ts` 中的 import 来源
5. 调整 `constants.ts` 中的 `DEFAULT_PAGE_SIZE` 匹配后端字典
