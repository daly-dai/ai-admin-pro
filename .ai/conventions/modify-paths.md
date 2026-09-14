# 修改路径（B 档入口）

> **适用**：只改已有文件、不新建文件。**本文件自足**——按本表改即可，不需预读其他 `.ai/` 文件；仅 `pnpm verify` 报错时查 `.ai/pitfalls/verify-errors.md`。
> **最小修改**：≤20 行（改）/ ≤50 行（调整）/ >50 行暂停报告。已有风格优先，**禁止顺手重构**。

**第 0 步（必做）**：开跑前 `git status --porcelain` 记基线，改完再比对。**出现新文件 → 停手，升级 A 档**（改读 `AGENTS.md` §零），不许硬撑。

## 锚点表

- **T1｜加表格列** — `pages/{module}/index.tsx` → `columns`
- **T2｜加搜索字段** — 同上 → `searchItems`
- **T3｜加表单字段** — `pages/{module}/components/` → `formItems`
- **T4｜加详情字段** — 同上 → `items`
- **T5｜加 API 方法** — `api/{module}/index.ts` → API 对象
- **T6｜改类型定义** — `api/{module}/types.ts` → `Entity`/`Query`/`FormData`
- **T7｜改文案/样式** — 对应文件 → 目标位置
- **T8｜加删除确认** — `pages/{module}/index.tsx` → 操作列
- **D1｜加/换图表** — `pages/{module}/index.tsx` → Grid 区域
- **D2｜改图表配置** — `components/{ChartName}.tsx` → `option` 定义处
- **D3｜改主题/颜色** — 主题文件或组件 `option` → 色值引用
- **D4｜加筛选条件** — `store.ts` → `index.tsx` → Store filter → FilterBar
- **D5｜加/减指标卡片** — `pages/{module}/index.tsx` → 指标卡 Grid
- **D6｜改数据源/字段** — `types.ts` → `api/index.ts` → 组件 → 字段链路
- D1-D6 详情 → `.ai/conventions/dashboard-conventions.md` §九

## 硬约束

> 组件替换 / 导入规则 / API 命名 / 未使用参数 **见 `AGENTS.md` §二**——它始终在上下文里，本入口**不复述**（避免第二处需要同步的规定）。

- **布局**：禁 `position:absolute; inset:*` 撑满；优先 `<Flex>`，细粒度再 CSS Modules
- **类型注解**：`columns: SColumnsType<Entity>`、`searchItems`/`formItems: SFormItems[]` 都要注解，禁 `as const` 绕开。**例外**：条件展开 `...(cond ? [{…}] : [])` 内注解不生效，必需 `as const`
- **操作列**：`SButton.Group items={[{ actionType, compact: true, onClick }]}`，禁手动排列多个 `SButton`
- **字典**：列/表单项显式给 `dictKey`，禁硬编码 `options` 或 `{1:'启用'}`
- **确认弹窗**：`Modal.confirm`，禁 `SConfirm`
- **字段联动**：`SForm.useWatch` + 条件展开，禁 `type:'dependency'`

## 收尾

`pnpm verify`（tsc + eslint + prettier）。报错只修本次动过的文件；范围外跳过并报告。
