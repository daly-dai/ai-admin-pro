# AI Frontend App

> React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + Zustand + Rsbuild
>
> **这是 AI 进入本项目的唯一入口。所有开发必须遵循本文件定义的流程和约束。**

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
PRD 到达 → ① 画 Demo → ② 接口合并（可多轮）→ ③ 改造适配 → ④ 接口对接 → ⑤ 迭代修复
                            ↻ 分批到位                                        ↕
                                                                        自测 / 测试 / 上线

           ↑_______________↑________________↑_______________↑
                     PRD 变更 → 回到受影响的最早阶段
```

| 阶段 | 名称     | 触发信号                                | 做什么                                                       | ⚠️ 进入后必须 读取                               | 🔒 输出锁（仅允许写这些路径）                                               | ✅ 必须产出                                                              |
| ---- | -------- | --------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ①    | 画 Demo  | PRD/需求 + "画页面/出骨架/demo"         | 规范化PRD → Task拆解 → 生成demo页面+占位API                  | `modes/demo.md` + **`compact/manual-{类型}.md`** | `src/api/{module}/` + `src/pages/{module}/` + `specs/{feature}/`            | 占位API + 页面文件；多页面时加 spec.md + progress.md                     |
| ②    | 接口合并 | 用户提供 Swagger/接口文档（部分或全部） | **条件分支**：有PRD→完整合并+feature-spec；无PRD→仅生成API层 | `modes/api-merge.md`                             | 分支A: `src/api/{module}/` + `specs/{feature}/`；分支B: `src/api/{module}/` | 分支A: **feature-spec.md（阻断性——未产出则阶段未完成）**；分支B: API代码 |
| ③    | 改造适配 | feature-spec就绪 + "改造/对齐规格"      | 根据feature-spec改造已有demo页面                             | `modes/demo-refine.md` + 已有 feature-spec       | `src/api/{module}/` + `src/pages/{module}/`（仅修改，禁止新建文件）         | 变更清单 → 用户确认 → 执行修改                                           |
| ④    | 接口对接 | 真实接口就绪 + "对接/联调/替换mock"     | 占位URL→真实URL，删除TODO注释                                | `modes/api-connect.md`                           | `src/api/{module}/` + 用户确认的页面文件                                    | diff对比 → 确认 → 替换                                                   |
| ⑤    | 迭代修复 | "改一下/加字段/修复/调整"               | 最小范围修改                                                 | `modes/incremental.md`                           | 仅用户指定的目标文件及其直接关联的类型文件                                  | 最小范围改动                                                             |

### 工具能力：Scaffold 场景化生成（阶段判断前优先匹配）

> 需求匹配下表任一场景时，**优先使用 scaffold**，不进入阶段判断。

| 需求特征                  | scene  | 生成内容                   |
| ------------------------- | ------ | -------------------------- |
| 新增弹框表单 / 独立表单页 | form   | FormModal 或 Create+Edit   |
| 新增详情抽屉 / 详情页     | detail | DetailDrawer 或 DetailPage |
| 新增列表页                | list   | index.tsx (SSearchTable)   |
| 只需类型定义              | types  | types.ts                   |
| 只需 API 层               | api    | api/index.ts               |
| 完整 CRUD（新模块）       | crud   | 全部 5-6 个文件            |

**步骤**：生成 `temp/scaffold/{module}.json`（含 `"scene"` 字段，参考 `.ai/tools/scaffold/types.ts`）→ `pnpm scaffold {module}` → `pnpm verify`

**不匹配时**：进入下方阶段判断，走对应阶段流程。

### 工具能力：Compact 指令（默认路径 — scaffold 不匹配时首选）

> scaffold 不匹配时，**默认使用 compact** 单文件指令替代多文件读取。不要分别读取 template + sdesign + pitfalls。

| 页面类型  | compact 文件                   |
| --------- | ------------------------------ |
| CRUD 列表 | `.ai/compact/manual-crud.md`   |
| 独立表单  | `.ai/compact/manual-form.md`   |
| 详情页    | `.ai/compact/manual-detail.md` |

compact 文件自包含模板+组件 Props+规则+验证清单，读 1 个文件即可生成代码。
`pnpm compact:gen` 从源文件自动重新生成（修改 template/sdesign/pitfalls 后需执行）。

### 工具能力：跨会话 Task Prompt（多页面分步生成）

> Task ≥ 3 且上下文有限时，Session 1 完成规划+API，后续 Session 用脚本生成 prompt。

**命令**：`pnpm task:prompt {feature}` → 输出自包含上下文（spec + 模板 + 组件文档 + 约束 + 已有源码），AI 通过一条命令获取全部信息。

### 阶段判断

| 用户信号                            | 进入阶段                                     |
| ----------------------------------- | -------------------------------------------- |
| "到此为止/先这样/不用继续了"        | 确认结束，列出已产出文件清单，告知可随时恢复 |
| 提供 PRD/需求 + 要求画页面          | ① 画 Demo                                    |
| 提供 Swagger/接口文档               | ② 接口合并（自动检测是否有 PRD 走不同分支）  |
| 已有 feature-spec + demo + 要求改造 | ③ 改造适配                                   |
| 要求对接真实接口/联调/替换mock      | ④ 接口对接                                   |
| PRD 有更新/需求变更                 | 需求变更回溯（见下方决策表）                 |
| 小修改/加字段/改bug/调整            | ⑤ 迭代修复                                   |
| 无法判断                            | 向用户确认当前阶段                           |

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
>
> 非线性跳转、弹性退出、Task 拆解通用能力 → 详见 `.ai/core/lifecycle-advanced.md`

---

## 二、硬约束（所有模式通用，不可违反）

### 作用域

> **新代码**（①② / scaffold）严格遵守硬约束。**修改已有代码**（③④⑤）以已有代码风格为准，新增片段沿用同文件风格。发现不符规范时告知用户，不自行重构。

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

| 规则       | 正确写法                                            | Why                            |
| ---------- | --------------------------------------------------- | ------------------------------ |
| HTTP 请求  | `import { createRequest } from '@/plugins/request'` | 统一拦截/鉴权/错误处理         |
| 类型安全   | `Record<string, unknown>`                           | any 绕过类型检查，隐患累积     |
| 类型导入   | `import type { User } from './types'`               | 树摇优化，运行时零残留         |
| 路径别名   | `import { X } from '@/components/X'`                | 重构安全，路径不因移动断裂     |
| 状态管理   | `import { create } from 'zustand'`                  | 轻量零 boilerplate，immer 友好 |
| API 命名   | `getListByGet()` / `createByPost()`                 | 一眼识别 HTTP 方法             |
| 未使用参数 | `(_, record) => ...`                                | ESLint no-unused-vars          |

> **保底类型**: `Record<string, unknown>`，优先从已有实体推导（`Partial<Entity>`）。API 命名 SSOT → `.ai/conventions/api-conventions.md`

### 全局类型（`src/types/index.ts`，禁止重复定义）

> 拦截器已自动解包 `ApiResponse`，`request.get<T>()` 直接返回 `T`。

- `PageData<T>` — 分页响应（`request.get<PageData<Entity>>('/api/xxx', { params })`）
- `PageQuery` — 分页查询基类（`interface XxxQuery extends PageQuery { ... }`）

模块 `types.ts` 只定义：`{Entity}` + `{Entity}Query extends PageQuery` + `{Entity}FormData`。

### 验证

`pnpm verify`（tsc+eslint+prettier） | `pnpm verify:fix`（自动修复） | `pnpm lint` | `pnpm type-check`
git hooks: commit → lint-staged | push → type-check

### 范围限定原则

> AI 输出范围必须严格匹配用户请求边界。未提及的不生成。**量化**: ≤200 词响应 / ≤5 新文件 / ≤5 修改文件

### 上下文节约原则

- 每次只读取当前阶段必需的文档（见阶段表「进入后必须读取」列），禁止预读后续阶段文档
- 读取 .ai/ 文档后提取关键规则，不要在后续响应中全文复述原文
- 生成代码时直接写代码，不要先把组件文档复述一遍
- 优先使用 compact 文件（1 个文件）而非分别读取 template + sdesign + pitfalls（3-5 个文件）
- compact 和 template 二选一，读了 compact 就不要再读 template（内容 90% 重复）

### 引用深度规则

- 任何 .ai/ 文件的引用深度不超过 **1 层**（A 引用 B，B 不再引用 C）
- 如果确实需要多层信息，由 `pnpm compact:gen` 预合并为 compact 文件
- mode 文件可以引用 compact 文件或 template 文件，但**不能同时引用两者**
- AI 读取文件时遇到引用链（文件 A 说"详见文件 B"，文件 B 又说"详见文件 C"），在第 2 层停止，不继续追踪

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

## 四、项目结构

> 新建模块时 读取 `.ai/core/architecture.md` 确认目录结构。

## 五、纠错沉淀（用户纠正时触发）

当用户指出写法错误/过时时，**必须** 读取 `.ai/conventions/correction-workflow.md` 并按其四层防御体系执行沉淀。禁止只口头应答而不落实到文件。

## 六、扩展新阶段

新页面模式（可编辑表格等）→ `.ai/modes/` 新增模式文件 + `.ai/templates/` 新增模板（可选）+ 第一节阶段表增行。
