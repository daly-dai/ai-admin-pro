# AI Frontend App

> React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + Zustand + Rsbuild
>
> **这是 AI 进入本项目的唯一入口。所有开发必须遵循本文件定义的流程和约束。**

---

## 核心目标

1. **边界清晰** — 不变的给模板（填空），变化的给规约（约束怎么写才方便改和删），AI 在线内填空不越界
2. **活得久** — 生成的代码不只是能跑，是客户改需求时能改、能删、组件不互相拖累
3. **按需唤醒** — 小改（调样式、改字段、修文案）人手写更快；大改（新建图表、新模块、新组件）AI 生成骨架更快。不是越用越少，是按改动类型切换

> 所有规约、闸门、模板、修改路径、验证体系都是为这三条服务。加新东西前先问：它强化了哪一条？

---

## 零、新会话第一步

新会话先读 `.ai/project-brief.md`（认知底座），然后回到下方第一节阶段判断。

---

## 静态变量表

| 变量        | 说明                     | 示例              |
| ----------- | ------------------------ | ----------------- |
| `{module}`  | 当前模块名（小写）       | `user`、`order`   |
| `{Entity}`  | 当前实体名（大写驼峰）   | `User`、`Order`   |
| `{feature}` | 当前功能名（中划线连接） | `user-management` |

> 使用示例：`src/api/{module}/types.ts` → `src/api/user/types.ts`

---

## 一、阶段判断（AI 接到请求后第一步）

> ⚠️ **阶段判断阶段不读取任何文件**，仅根据用户消息中的关键词和上下文判断。判断完成后再按对应阶段的步骤执行。

### 生命周期总览

```
PRD 到达 → ⓪ PRD→Spec ─┬─ ⓪a 单PRD (CRUD) ─┐ → ① 画 Demo → ② 接口合并（可多轮）→ ③ 改造适配 → ④ 接口对接 → ⑤ 迭代修复
                       └─ ⓪b 双PRD (任意页面类型) ─┘
                             ↻ 分批到位                                        ↕
                                                                         自测 / 测试 / 上线

         ↑__________________↑_______________↑________________↑_______________↑
                               PRD 变更 → 回到受影响的最早阶段
```

| 阶段 | 名称      | 触发信号                                | 做什么                                                               | ⚠️ 进入后必须 读取                                        | 🔒 输出锁（仅允许写这些路径）                                               | ✅ 必须产出                                                              |
| ---- | --------- | --------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ⓪a   | PRD→Spec  | 拿到 PRD + "拆前端范围/生成spec/出Task" | 从 PRD 提取前端范围 → 生成 spec.md + progress.md                     | `modes/prd-to-spec.md`                                    | `.ai/specs/{feature}/`                                                      | spec.md + progress.md                                                    |
| ⓪b   | 双PRD蓝图 | 两份PRD + "生成蓝图/blueprint/前端SDD"  | 产品PRD+后端SDD交叉对比 → 页面类型分类 → 生成蓝图spec.md+progress.md | `modes/blueprint.md` + `templates/page-classification.md` | `.ai/specs/{feature}/`                                                      | spec.md + progress.md                                                    |
| ①    | 画 Demo   | PRD/需求 + "画页面/出骨架/demo"         | 规范化PRD → Task拆解 → 生成demo页面+占位API                          | `modes/demo.md`                                           | `src/api/{module}/` + `src/pages/{module}/` + `specs/{feature}/`            | 占位API + 页面文件；多页面时加 spec.md + progress.md                     |
| ②    | 接口合并  | 用户提供 Swagger/接口文档（部分或全部） | **条件分支**：有PRD→完整合并+feature-spec；无PRD→仅生成API层         | `modes/api-merge.md`                                      | 分支A: `src/api/{module}/` + `specs/{feature}/`；分支B: `src/api/{module}/` | 分支A: **feature-spec.md（阻断性——未产出则阶段未完成）**；分支B: API代码 |
| ③    | 改造适配  | feature-spec就绪 + "改造/对齐规格"      | 根据feature-spec改造已有demo页面                                     | `modes/demo-refine.md` + 已有 feature-spec                | `src/api/{module}/` + `src/pages/{module}/`（仅修改，禁止新建文件）         | 变更清单 → 用户确认 → 执行修改                                           |
| ④    | 接口对接  | 真实接口就绪 + "对接/联调/替换mock"     | 占位URL→真实URL，删除TODO注释                                        | `modes/api-connect.md`                                    | `src/api/{module}/` + 用户确认的页面文件                                    | diff对比 → 确认 → 替换                                                   |
| ⑤    | 迭代修复  | "改一下/加字段/修复/调整"               | 最小范围修改                                                         | `modes/incremental.md`                                    | 仅用户指定的目标文件及其直接关联的类型文件                                  | 最小范围改动                                                             |

### 阶段判断

| 用户信号                                   | 进入阶段                                     |
| ------------------------------------------ | -------------------------------------------- |
| "到此为止/先这样/不用继续了"               | 确认结束，列出已产出文件清单，告知可随时恢复 |
| 拿到 PRD + "拆前端范围/生成spec"           | ⓪a PRD→Spec                                  |
| 提供两份PRD + "生成蓝图/blueprint/前端SDD" | ⓪b 双PRD蓝图                                 |
| 提供 PRD/需求 + 要求画页面                 | ① 画 Demo                                    |
| 提供 Swagger/接口文档                      | ② 接口合并（自动检测是否有 PRD 走不同分支）  |
| 已有 feature-spec + demo + 要求改造        | ③ 改造适配                                   |
| 要求对接真实接口/联调/替换mock             | ④ 接口对接                                   |
| PRD 有更新/需求变更                        | 需求变更回溯（见下方决策表）                 |
| 小修改/加字段/改bug/调整                   | ⑤ 迭代修复                                   |
| 无法判断                                   | 向用户确认当前阶段                           |

> 匹配规则：优先匹配最具体阶段；用户可直接指定阶段；同时提供 Swagger+PRD → ②分支A；无法判断时向用户确认。

### 需求变更回溯（PRD 有更新时）

| 变更类型                       | 回到阶段                                                   | 处理范围                           |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------------- |
| 新增页面/模块级功能            | ① 画 Demo                                                  | 仅新增部分，已有页面不动           |
| 修改数据模型/字段定义/业务规则 | ② 接口合并（有 feature-spec 时）或 ①（无 feature-spec 时） | 更新 feature-spec → ③ 改造适配     |
| 修改页面交互/表单字段/表格列   | ③ 改造适配                                                 | 仅变更的页面，API 不动             |
| 删减功能或字段                 | ③ 改造适配 + ⑤ 清理                                        | 删除页面元素 + 清理 API 层无用代码 |
| 文案调整/样式小改              | ⑤ 迭代修复                                                 | 仅目标文件                         |

> 混合变更取最早阶段，仅对变更部分执行，已完成且未受影响的部分不重做。

---

## 二、硬约束（所有模式通用，不可违反）

### 作用域

> **新代码**（①②）严格遵守硬约束。**修改已有代码**（③④⑤）以已有代码风格为准，新增片段沿用同文件风格。发现不符规范时告知用户，不自行重构。

### 组件使用

> ⛔ **阻断性要求**（仅新代码）：生成包含 SSearchTable / SForm / SButton / SDetail 的代码前，**必须执行** `读取 .ai/sdesign/components/{组件名}.md`。未执行此步骤的代码视为无效，必须回滚重做。

| 禁止直接使用      | 必须替换为            | Why                         |
| ----------------- | --------------------- | --------------------------- |
| antd Table        | STable / SSearchTable | 内置分页/搜索/loading 联动  |
| antd Form         | SForm / SForm.Search  | 配置式，减 50% 样板代码     |
| antd Button       | SButton               | actionType 预设统一操作交互 |
| antd Descriptions | SDetail               | 配置式分组，dataSource 驱动 |

| 场景                                                  | 处理方式                         |
| ----------------------------------------------------- | -------------------------------- |
| login/error/layouts/router 目录                       | 可使用 antd 原生组件             |
| sdesign 不支持的复杂交互（拖拽排序等）或 用户明确要求 | 可使用 antd 原生组件，需说明原因 |

> 可直接用: Modal / Modal.confirm / Tag / message / Card / Spin / InputNumber（不在 ESLint 禁止名单中）

### 导入规则

| 规则       | 正确写法                                              | Why                            |
| ---------- | ----------------------------------------------------- | ------------------------------ |
| HTTP 请求  | `import { createRequest } from 'src/plugins/request'` | 统一拦截/鉴权/错误处理         |
| 类型安全   | `Record<string, unknown>`                             | any 绕过类型检查，隐患累积     |
| 类型导入   | `import type { User } from './types'`                 | 树摇优化，运行时零残留         |
| 路径别名   | `import { X } from 'src/components/X'`                | 重构安全，路径不因移动断裂     |
| 状态管理   | `import { create } from 'zustand'`                    | 轻量零 boilerplate，immer 友好 |
| API 命名   | `getListByGet()` / `createByPost()`                   | 一眼识别 HTTP 方法             |
| 未使用参数 | `(_, record) => ...`                                  | ESLint no-unused-vars          |

> **保底类型**: `Record<string, unknown>`，优先从已有实体推导（`Partial<Entity>`）。API 命名 SSOT → `.ai/conventions/api-conventions.md`

### 全局类型（`src/types/index.ts`，禁止重复定义）

> 拦截器已自动解包 `ApiResponse`，`request.get<T>()` 直接返回 `T`。

- `PageData<T>` — 分页响应（`request.get<PageData<Entity>>('/api/xxx', { params })`）
- `PageQuery` — 分页查询基类（`interface XxxQuery extends PageQuery { ... }`）

模块 `types.ts` 只定义：`{Entity}` + `{Entity}Query extends PageQuery` + `{Entity}FormData`。

### 验证

`pnpm verify`（tsc+eslint+prettier，自动追加错误到 `.ai/error-log/raw.jsonl`） | `pnpm verify:fix`（自动修复） | `pnpm verify:scope`（跨模块修改告警） | `pnpm lint` | `pnpm type-check`
git hooks: commit → lint-staged | push → type-check

### 阶段验收闸门 + 输出锁

> ⛔ **每个 Task 执行时必须遵守两层闸门。** 全局闸门（所有Task通用）+ Task闸门（按Task类型确定，含输出锁）。
> 详细清单 → `.ai/conventions/task-gates.md`
>
> **验证边界**：`pnpm verify` 报错时，只修本 Task 输出锁内文件的错误。范围外报错 → 跳过，不修，不提。超出输出锁的文件修改 → 必须向用户确认。

### 范围限定原则

> AI 输出范围必须严格匹配用户请求边界。未提及的不生成。**量化**: ≤10 新文件 / ≤10 修改文件（超出时先列清单确认）

### 引用深度规则

- 沿引用链按需读取直到获得足够信息，同一会话内已读过的文件不重复读取
- 遇到循环引用（A→B→A）时停止
- 当文件读取量显著增大时，暂停并告知用户当前已读文件清单，确认是否继续

### 风险操作确认

| 分类           | 示例                                                                                     | AI 行为        |
| -------------- | ---------------------------------------------------------------------------------------- | -------------- |
| **自由操作**   | 读取文件、搜索代码、pnpm verify、创建新模块文件                                          | 直接执行       |
| **需确认操作** | 删除已有文件、修改 package.json/eslint/rsbuild/tsconfig、修改 `.ai/` 规范文件            | 告知+等待确认  |
| **禁止操作**   | 修改输出锁范围外文件、自行安装依赖、修改 src/plugins/ 或 src/router/（除非用户明确要求） | 拒绝并说明原因 |

| 等级       | 触发词             | 规则摘要                      |
| ---------- | ------------------ | ----------------------------- |
| 保守模式   | 「使用保守模式」   | 所有写操作前必须确认          |
| 标准模式   | 默认               | 修改/删除需确认，创建无需确认 |
| 全自主模式 | 「使用全自主模式」 | 仅删除和修改全局配置需确认    |

> 原则：暂停确认的代价很低，超出范围的修改代价非常高。类型报错处理 → `.ai/conventions/verification.md`

---

## 三、通用验证规则

> 验证阶段仅用于检查修复，禁止创建新文件。生成页面代码前必须 读取 `.ai/pitfalls/index.md` 对照错题集。

### Level 1：自动化验证

```bash
pnpm verify  # tsc + eslint + prettier（错误自动追加到 .ai/error-log/raw.jsonl）
```

有错误 → **先查 `.ai/pitfalls/verify-errors.md` 速查表匹配签名** → 匹配则执行修复方法 → 未匹配则按优先级修复（tsc > eslint > prettier）→ 再次 verify → 最多 3 轮。连续 2 轮错误数量不减少 → 停止并报告当前状态。仅处理当前输出锁范围内文件的错误。

> 跨模块修改时执行 `pnpm verify:scope` 检查范围（软告警，不阻断）。

### Level 2：AI 自检清单

> Level 1 通过后对照 `.ai/conventions/verification.md` Level 2 自检清单逐条检查。

> 详细验证流程（三级体系、失败处理） → `.ai/conventions/verification.md`

## 四、项目结构

> 新建模块时 读取 `.ai/core/architecture.md` 确认目录结构。

## 五、纠错沉淀（用户纠正时触发）

当用户指出写法错误/过时时，**必须** 读取 `.ai/conventions/correction-workflow.md` 并按纠错沉淀流程执行。禁止只口头应答而不落实到文件。

## 六、扩展新阶段

新页面模式（可编辑表格等）→ `.ai/modes/` 新增模式文件 + `.ai/templates/` 新增模板（可选）+ 第一节阶段表增行。
