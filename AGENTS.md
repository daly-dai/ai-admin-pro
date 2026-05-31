# AI Frontend App

> React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + Zustand + Rsbuild
>
> **这是 AI 进入本项目的唯一入口。所有开发必须遵循本文件定义的流程和约束。**

---

## 核心目标

1. **边界清晰** — 不变的给模板（填空），变化的给规约（约束怎么写才方便改和删），AI 在线内填空不越界
2. **活得久** — 生成的代码不只是能跑，是客户改需求时能改、能删、组件不互相拖累
3. **按需唤醒** — 小改（调样式、改字段、修文案）人手写更快；大改（新建图表、新模块、新组件）AI 生成骨架更快

> 所有规约、闸门、模板、修改路径、验证体系都是为这三条服务。加新东西前先问：它强化了哪一条？

---

## 核心原则（所有决策必须对照）

> 深度理解 → `.ai/core/principles.md`。碰撞时：⑨ > ① > ③ > ② > ④ > ⑦ > ⑧ > ⑤ > ⑥

| #   | 原则                                                    | 判断             |
| --- | ------------------------------------------------------- | ---------------- |
| ①   | **复杂度不灭** — 加任何东西前问：理解成本变短还是变长？ | 终极目标         |
| ②   | **为修改而设计** — 删这个模块牵连几个地方？             |                  |
| ③   | **边界是宪法** — 换一个决策只改一个模块吗？             |                  |
| ④   | **假设一切会炸** — 随便一个依赖挂了，系统会怎样？       |                  |
| ⑤   | **先跑通再跑对再跑快** — 有端到端骨架还是还在纸上？     |                  |
| ⑥   | **代码是给人读的** — 陌生人十分钟能看懂吗？             |                  |
| ⑦   | **能观测才存在** — 凌晨出问题你能先知道吗？             |                  |
| ⑧   | **技术债是债务不是犯罪** — 有意识 tradeoff + 还款计划？ |                  |
| ⑨   | **人是最终责任者** — 画得出完整数据流吗？               | 底座，最高优先级 |

---

## 零、新会话第一步

新会话先读 `.ai/project-brief.md`（认知底座）。

---

## 静态变量表

| 变量        | 说明                     | 示例              |
| ----------- | ------------------------ | ----------------- |
| `{module}`  | 当前模块名（小写）       | `user`、`order`   |
| `{Entity}`  | 当前实体名（大写驼峰）   | `User`、`Order`   |
| `{feature}` | 当前功能名（中划线连接） | `user-management` |

---

## 一、执行策略（前置判断，不推理，纯匹配）

> 收到需求后第一步——判断走哪条 Lane，不猜不推理。

| 用户意图                              | 走什么                                |
| ------------------------------------- | ------------------------------------- |
| 小修改（改字段/修bug/调样式，≤20行）  | → **修改路径**（§五），不经过 Lane    |
| 新建/新模块 + 列表/CRUD/增删改查/管理 | → **CRUD Lane**（§二.1）              |
| 新建 + 大屏/仪表盘/监控/统计          | → **大屏 Lane**（§二.2）              |
| 新建 + 详情（含多Tab）                | → **多Tab详情 Lane**（§二.3）         |
| 无法匹配任何场景                      | → **非标 Lane**（§二.4，走 PRD 兜底） |

---

## 二、场景匹配与 Lane 分发

### 2.1 CRUD Lane（快车道，不生成 PRD）

**适用**：列表管理、增删改查、数据维护类页面。

**输入**：后端 MD 接口文档（完整） / 仅字段名列表

**流程**：

1. 后端 MD 字段 → `types.ts`（Entity + Query + FormData），接口 → `api/index.ts`（五方法），查询参数 → searchItems，返回字段 → columns
2. Task 默认序列：api → page-list → page-form → page-detail
3. 信息完整 → 直接模板填空生成。信息不完整 → 匹配照常，缺的标 `[待补充]`，占位 URL `/api/TODO/{module}`
4. 接口文档后来补上时 → 按 §五 T1-T8 修改路径覆盖

**PRD 规则**：不生成 PRD。CRUD 场景下后端 MD 到代码的映射是机械的。

### 2.2 大屏 Lane（迭代车道，不生成 PRD）

**适用**：数据大屏、仪表盘、实时监控。

**输入**：后端 MD 接口文档（数据源）+ 布局/交互描述

**硬约束**：

- `echarts` → 统一使用 `src/components/EChartsBase` 基座（内置 loading/error/empty/resize），**禁止直接 import echarts-for-react**

**模板（给骨架）**：

- `dashboard-page.md` — 页面结构 + Grid 布局 + 数据流模式（简单/中等/复杂，查表确定）
- Store 模板 — 筛选条件集中 + selector 订阅 + 不存派生数据
- data-transform 模板 — 纯函数签名（API响应 → 图表格式），不混在组件里

**AI 生成（内容层）**：

- 具体图表 option 配置（折线/柱状/饼图等，AI 直接生成 option 对象）
- 字段映射、颜色/主题

**规约约束**（见 `.ai/conventions/dashboard-conventions.md`）：

- 图表组件不互相 import，只被 page 引用
- 数据与展示分离：组件内部禁止调用 API
- option 外提为独立变量，禁止内联 JSX
- 颜色集中在 theme 文件，禁止硬编码色值
- 一个文件只导出一个组件

**修改**：大屏核心在迭代 → 按 §五 D1-D6 修改路径

### 2.3 多Tab详情 Lane（增量车道，不生成 PRD）

**适用**：主实体详情页 + 多个 Tab，每个 Tab 内容类型不同（表格/详情/自定义）。

**流程**：

1. 初始生成同 CRUD——主实体 API + 每个 Tab 内容独立匹配模板
2. Tab 内容类型：表格 → crud-page 模板 / 详情 → detail-page 模板 / 自定义 → 规约约束

**增量规则**：

- 加 Tab 不改已有 Tab 代码
- 新 Tab 数据源独立，不共享父页面 API 调用
- 接口分批到时，每次只加新 Tab，不重构已有

### 2.4 非标 Lane（兜底，生成 PRD）

**适用**：工作流、审批流、自定义交互等无模板覆盖的场景。

**流程**：

1. 加载 `.ai/templates/prd/prd-fallback.md`
2. 逐项提取：能推导的填，不能的标 `[待补充]`
3. 暂停，列出 `[待补充]` 清单，人工一次性补齐
4. 产出 `.ai/specs/{feature}/prd.md`
5. prd.md → Task 拆解（尽量匹配已有模板；无匹配的走规约约束 + 闸门兜底）

**PRD 规则**：**只有 Task 匹配不到任何模板时，才走 PRD。**

---

## 三、硬约束（所有 Lane 通用，不可违反）

### 作用域

> **新代码**严格遵守硬约束。**修改已有代码**以已有代码风格为准，新增片段沿用同文件风格。发现不符规范时告知用户，不自行重构。

### 组件使用

> ⛔ 生成包含 SSearchTable / SForm / SButton / SDetail 的代码前，**必须**读取 `.ai/sdesign/components/{组件名}.md`。

| 禁止直接使用      | 必须替换为                       | Why                             |
| ----------------- | -------------------------------- | ------------------------------- |
| antd Table        | STable / SSearchTable            | 内置分页/搜索/loading 联动      |
| antd Form         | SForm / SForm.Search             | 配置式，减 50% 样板代码         |
| antd Button       | SButton                          | actionType 预设统一操作交互     |
| antd Descriptions | SDetail                          | 配置式分组，dataSource 驱动     |
| echarts-for-react | EChartsBase（`src/components/`） | 内置 loading/error/empty/resize |

| 场景                                     | 处理方式                         |
| ---------------------------------------- | -------------------------------- |
| login/error/layouts/router 目录          | 可使用 antd 原生组件             |
| sdesign 不支持的复杂交互 or 用户明确要求 | 可使用 antd 原生组件，需说明原因 |

> 可直接用: Modal / Modal.confirm / Tag / message / Card / Spin / InputNumber

### 导入规则

| 规则       | 正确写法                                              | Why                    |
| ---------- | ----------------------------------------------------- | ---------------------- |
| HTTP 请求  | `import { createRequest } from 'src/plugins/request'` | 统一拦截/鉴权/错误处理 |
| 类型安全   | `Record<string, unknown>`                             | any 绕过类型检查       |
| 类型导入   | `import type { User } from './types'`                 | 树摇优化               |
| 路径别名   | `import { X } from 'src/components/X'`                | 重构安全               |
| 状态管理   | `import { create } from 'zustand'`                    | 轻量零 boilerplate     |
| API 命名   | `getListByGet()` / `createByPost()`                   | 一眼识别 HTTP 方法     |
| 未使用参数 | `(_, record) => ...`                                  | ESLint no-unused-vars  |

### 全局类型（`src/types/index.ts`，禁止重复定义）

> 拦截器已自动解包 `ApiResponse`，`request.get<T>()` 直接返回 `T`。

- `PageData<T>` — 分页响应
- `PageQuery` — 分页查询基类

模块 `types.ts` 只定义：`{Entity}` + `{Entity}Query extends PageQuery` + `{Entity}FormData`。

### 输出锁 + 闸门

> ⛔ 每个 Task 遵守两层闸门：全局闸门（所有Task通用）+ Task闸门（按Task类型确定，含输出锁）。
> 详细 → `.ai/conventions/task-gates.md`
>
> `pnpm verify` 报错时只修本 Task 输出锁内文件的错误。范围外报错跳过。超出输出锁的文件修改 → 必须向用户确认。

### 范围限定

> ≤10 新文件 / ≤10 修改文件。超出时先列清单确认。

### 风险操作确认

| 分类         | 示例                                                                                     | AI 行为        |
| ------------ | ---------------------------------------------------------------------------------------- | -------------- |
| **自由操作** | 读取文件、搜索代码、pnpm verify、创建新模块文件                                          | 直接执行       |
| **需确认**   | 删除已有文件、修改 package.json/eslint/rsbuild/tsconfig、修改 `.ai/` 规范文件            | 告知+等待确认  |
| **禁止**     | 修改输出锁范围外文件、自行安装依赖、修改 src/plugins/ 或 src/router/（除非用户明确要求） | 拒绝并说明原因 |

---

## 四、生成流程

```
读需求 → 匹配 Lane（§二） → 确定 Task 列表 → 逐 Task 执行：

  1. 读模板（按 Lane 和 Task 类型选择）
  2. 读组件文档（涉及 SSearchTable/SForm/SButton/SDetail/EChartsBase 时）
  3. 读错题集（.ai/pitfalls/index.md）
  4. 填空生成
  5. pnpm verify（最多 3 轮）

信息不完整时：Task 正常匹配，缺的标 [待补充]，占位 URL/TODO，不阻塞流程。
接口文档后到：按修改路径（§五）覆盖。
```

---

## 五、修改路径

> 匹配修改场景 → 定位锚点 → 按已有模式修改 → pnpm verify。
> 最小修改原则。≤20行(改)/≤50行(调整)/>50行暂停。已有代码风格优先，不做规范化重构。禁止顺手重构。

### T1-T8（CRUD 修改）

| 模板 | 场景        | 目标文件                     | 锚点                  |
| ---- | ----------- | ---------------------------- | --------------------- |
| T1   | 加表格列    | `pages/{module}/index.tsx`   | columns 数组          |
| T2   | 加搜索字段  | `pages/{module}/index.tsx`   | searchItems 数组      |
| T3   | 加表单字段  | `pages/{module}/components/` | formItems 数组        |
| T4   | 加详情字段  | `pages/{module}/components/` | items 数组            |
| T5   | 加 API 方法 | `api/{module}/index.ts`      | API 对象              |
| T6   | 改类型定义  | `api/{module}/types.ts`      | Entity/Query/FormData |
| T7   | 改文案/样式 | 对应文件                     | 目标文案/样式位置     |
| T8   | 加删除确认  | `pages/{module}/index.tsx`   | 操作列                |

> D1-D6（大屏修改路径）→ `.ai/conventions/dashboard-conventions.md` §七

---

## 六、验证

`pnpm verify`（tsc+eslint+prettier）。最多 3 轮修复。

有错误 → **先查 `.ai/pitfalls/verify-errors.md` 速查表匹配签名** → 匹配则执行修复 → 未匹配按优先级（tsc > eslint > prettier）→ 连续 2 轮不减少则停止报告。只处理当前输出锁内文件的错误。

> 详细验证流程 → `.ai/conventions/verification.md`

---

## 七、资产索引

| 需要                  | 读取                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------- |
| 核心原则深度理解      | `.ai/core/principles.md`                                                                      |
| 架构规范 + 项目结构   | `.ai/core/architecture.md`                                                                    |
| 代码规范              | `.ai/core/coding-standards.md`                                                                |
| 技术栈                | `.ai/core/tech-stack.md`                                                                      |
| API 规范（SSOT）      | `.ai/conventions/api-conventions.md`                                                          |
| Task 闸门 + 输出锁    | `.ai/conventions/task-gates.md`                                                               |
| 大屏规约              | `.ai/conventions/dashboard-conventions.md`                                                    |
| 验证三级体系          | `.ai/conventions/verification.md`                                                             |
| 代码模板              | `.ai/templates/{crud-page,form-page,detail-page,dashboard-page,api-module,editable-table}.md` |
| 页面分类              | `.ai/templates/page-classification.md`                                                        |
| PRD 模板（标准/兜底） | `.ai/templates/prd/prd-standard.md` / `prd-fallback.md`                                       |
| 组件文档              | `.ai/sdesign/components/{Name}.md`                                                            |
| 错题集                | `.ai/pitfalls/index.md`                                                                       |
| 非标 PRD→Task 拆解    | `AGENTS.md` §二.4 非标 Lane                                                                   |
| Swagger→API 合并流程  | `.ai/conventions/api-conventions.md` § Swagger/接口文档 → 合并规则                            |
| 迭代修改详细规则      | `AGENTS.md` §五 修改路径                                                                      |
| 项目认知速览          | `.ai/project-brief.md`                                                                        |
