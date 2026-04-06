# 阶段①：画 Demo

> **阶段定位**：开发生命周期的起点。用户有产品文档/原型图/口头描述，尚未有接口文档。
> 生成 demo 页面 + 占位 API，为后续阶段（②接口合并、③改造适配）奠定基础。

---

## 前置约束

> 本阶段必须遵循 AGENTS.md 中的硬约束：
>
> - 组件使用规则（sdesign 组件替换 antd）
> - 导入规则（路径别名、类型导入、API 命名）
> - 范围限定原则（响应不超过 200 词，单次最多 5 个新文件）
> - 风险操作确认（修改需确认，创建无需确认）

---

## 范围判断（单页面 vs 多页面）

> ⚠️ 先判断范围再执行，不要默认走多页面流程。

| 用户请求范围                               | 执行方式                                                       | 说明                 |
| ------------------------------------------ | -------------------------------------------------------------- | -------------------- |
| 「先画个列表页」「出个表单页骨架」         | **单页面**：直接生成一个页面 + 占位 API                        | 范围可控，快速交付   |
| 「根据产品文档画页面」（文档涵盖多页面）   | **多页面 Task 拆解**：创建 spec.md + progress.md，逐 Task 生成 | 每个 Task 仍为单页面 |
| 「根据文档做一整个模块」（列表+表单+详情） | **多页面 Task 拆解**                                           | 同上                 |

**判断规则**：如果用户提供的产品文档涵盖了完整 CRUD 功能（列表+新增/编辑+详情），且用户未明确只要求其中某个页面，应向用户确认：

> 「您的文档涵盖了多个页面（列表/表单/详情），我将按 Task 拆解逐页面生成以确保质量。如果只需要先出某个页面的骨架，请告诉我优先生成哪个页面。」

---

## 步骤

### 1. 读模板

根据页面类型读取**对应的**模板：

- 列表页 → `.ai/templates/crud-page.md`
- 表单页 → `.ai/templates/form-designer.md`
- 详情页 → `.ai/templates/detail-page.md`

多页面 Task 拆解时，还需读取：

- `.ai/specs/template.md`（Task 拆解格式）
- `.ai/specs/progress-template.md`（进度追踪格式）

### 2. 规范化 PRD

Read `.ai/specs/prd-checklist.md`，以其 9 个章节为提取清单，将用户提供的任意格式文档规范化为结构化信息：

- 以 prd-checklist 的章节结构为基准逐章提取
- 自由文本描述 → 标准表格格式（字段定义表、查询参数表、表格列表、表单字段表等）
- 缺失信息标 `[?]`，不猜测
- 此规范化结果将在后续阶段②中作为 PRD 输入使用

### 3. 判断范围

- **单页面**：用户明确只要求一个页面 → 跳过 Task 拆解，直接执行步骤 4-7
- **多页面**：需求涉及多个页面 → 创建 `specs/[feature]/spec.md` + `progress.md`
  - 拆解为独立 Task（一个 Task = 一个明确交付物）
  - 拆解顺序：先占位 API（一个 Task，覆盖所有页面需要的接口）→ 再逐页面生成
  - 每个 Task 遵循步骤 4-7 的完整流程

### 4. 读错题集 + sdesign 组件文档

- **读错题集**：Read `.ai/pitfalls/index.md`，按「适用场景」匹配当前页面类型，将匹配的核心规则作为硬性约束执行。不确定时再按需 Read 对应详情文件
- **读 sdesign 组件文档**：根据页面类型 Read 对应组件文档（未读文档的组件禁止使用）
  - 列表页 → `SSearchTable.md` + `SButton.md`
  - 表单页 → `SForm.md` + `SButton.md`
  - 详情页 → `SDetail.md`
  - 用到其他 sdesign 组件 → 读对应 `.ai/sdesign/components/{组件名}.md`

### 5. 生成占位 API

- **读 API 规范**：Read `.ai/conventions/api-conventions.md`（Demo 阶段精简版）
- `src/api/{module}/types.ts` — 根据规范化 PRD 定义临时类型，未确认字段加 `// TODO: 待接口确认`
- `src/api/{module}/index.ts` — **方法名必须使用 `{name}By{HTTP}` 后缀**（如 `getListByGet`、`createByPost`），URL 用 `'/api/TODO/{module}'` 占位
- 单页面模式：**只定义当前页面所需的接口方法**，不预生成其他页面的接口
- 多页面模式：定义所有页面需要的接口方法（一次性生成完整占位 API）

### 6. 生成页面代码

- **单页面模式**：基于占位类型生成**用户指定的那一个页面**，严格使用 sdesign 组件
- **多页面模式**：逐 Task 生成，**每个 Task 仍为单页面**
  - 每个页面 Task 完成后独立验证（不累积到最后一起验证）

### 7. 验证

`pnpm verify`，最多 3 轮修复。

### 8. 更新进度（多页面模式必选检查点）

> ⚠️ **阻断性要求**：多页面模式下，**每个 Task 的验证通过后必须立即执行此步骤**，然后才能开始下一个 Task。单页面模式跳过此步骤。

- 更新 `specs/[feature]/progress.md`，将当前 Task 状态标记为 `✅ 已完成`
- 如验证未通过，标记为 `🔧 修复中` 并记录问题
- **禁止累积多个 Task 后再批量更新**

---

## 约束

- **范围控制阀门**：多页面 Task 拆解时，每个 Task 仍遵循「一个 Task = 一个页面」的粒度，禁止一个 Task 生成多个页面文件
- 占位 API 的 URL 统一用 `'/api/TODO/{module}'` 前缀，方便后续全局替换
- 页面代码**必须符合硬约束**，不因为是临时代码就降低标准
- **单页面模式不生成 spec.md / progress.md**（信息不完整，写了也是占位）

---

## 输出锁

**单页面模式**：

> 🔒 仅允许创建 `src/api/{module}/types.ts`、`src/api/{module}/index.ts` 和**一个**页面文件（`src/pages/{module}/{pageName}.tsx`），禁止在一次执行中创建多个页面文件。

**多页面 Task 模式**：

> 🔒 允许创建 `src/api/{module}/types.ts`、`src/api/{module}/index.ts`、`src/pages/{module}/*.tsx`（逐 Task 生成）、`specs/[feature]/spec.md`、`specs/[feature]/progress.md`。每个 Task 的输出锁为该 Task 对应的单个页面文件。

---

## 会话交接（仅跨会话中断时）

多页面模式下，如需跨会话中断，按 `.ai/specs/session-template.md` 生成 session 文档。
同一会话内连续执行多个 Task 不需要每个都生成。
