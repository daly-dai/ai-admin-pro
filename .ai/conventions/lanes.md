# Lane 详细流程

> AGENTS.md §一 只做匹配，本文档是每个 Lane 的完整执行 SOP。
>
> **⚠️ 所有 Lane（含 CRUD）都必须先拆 Task 到 `specs/{feature}-tasks.md`，再逐 Task 执行。**
> "不生成 PRD"≠"不拆 Task"。PRD 是需求文档，Task 是执行计划——两者独立。

---

## 自重构（Lane 新建文件通用，强模型专属）

以下三个 Lane（CRUD / 大屏 / 多Tab详情）在**新建文件**场景下，生成代码 → `pnpm verify` 通过后，必须执行自重构：

1. **回读整个文件**（不改动，理解全局结构）
2. **对照语义化命名**：逐变量检查是否违反 `.ai/core/coding-standards.md` 禁止项（缩写/拼音/编号/占位/回调缩写/布尔无前缀）
3. **逻辑函数拆分**：超过 40 行的逻辑函数提取为子函数（⚠️ 声明式配置如 option/columns/formItems 不计入）
4. **else 消除**：if/else 嵌套改为 early return
5. **注释补全**：复杂逻辑（正则、算法、业务规则）加 `// WHY` 注释
6. **一次性 rewrite 整个函数/组件**（⛔ 禁止逐行 edit_file）
7. 再次 `pnpm verify`
8. ⚠️ 重写后逐项验证：props 传递链不变、条件分支逻辑不变、API 调用参数不变

> 仅适用于 Lane 新建文件。修改路径、已有文件、样式调整、配置文件 → 跳过。

---

## CRUD Lane

**适用**：列表管理、增删改查、数据维护类页面。

**输入**：后端 MD 接口文档 / 仅字段名列表

**流程**：

1. 字段 → `types.ts`（Entity + Query + FormData），接口 → `api/index.ts`（五方法），查询参数 → searchItems，返回字段 → columns
2. Task 序列：api → page-list → page-form → page-detail
3. 信息完整 → 模板填空生成。不完整 → 标 `[待补充]`，占位 URL `/api/TODO/{module}`
4. 接口后到 → 按修改路径覆盖

**模板**：`.ai/templates/crud-page.md` `.ai/templates/form-page.md` `.ai/templates/detail-page.md`

**PRD 规则**：不生成 PRD。CRUD 到代码的映射是机械的。

---

## 大屏 Lane

**适用**：数据大屏、仪表盘、实时监控。

**硬约束**：`echarts` → `EChartsBase`（`src/components/`），禁止直接 import echarts-for-react。

**模板**：`.ai/templates/dashboard-page.md` — 页面结构 + Grid 布局 + 数据流模式（查表确定）

**规约**：图表组件不互相 import、数据与展示分离、option 外提为独立变量、颜色集中在 theme → `.ai/conventions/dashboard-conventions.md`

---

## 多Tab详情 Lane

**适用**：主实体详情页 + 多 Tab。

**流程**：初始生成同 CRUD。Tab 内容：表格 → crud-page / 详情 → detail-page / 自定义 → 规约约束。

**增量规则**：加 Tab 不改已有 Tab、新 Tab 数据源独立、接口分批到时不重构已有。

---

## 非标 Lane

**适用**：工作流、审批流、自定义交互等无模板覆盖的场景。

**流程**：

1. 加载 `.ai/templates/prd/prd-fallback.md`
2. 逐项提取 → 标 `[待补充]` → 暂停等人工补齐
3. 产出 `specs/{feature}/prd.md`
4. prd.md → Task 拆解（尽量匹配已有模板；无匹配走规约 + 闸门兜底）
