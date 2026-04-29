---
name: sdesign-gen-page
description: 'Generates admin pages (CRUD list, detail, form) using @dalydb/sdesign component library. Includes full API layer (types.ts + api/index.ts) and page layer generation with built-in component rules, pitfall checks, and verification. Use when the user asks to generate pages, create CRUD pages, create list/detail/form pages, create new modules, or mentions sdesign page generation.'
---

# sdesign-gen-page — 页面生成 Skill

> 适用：CRUD列表页 / 详情页 / 独立表单页
> 技术栈：React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + ahooks + zustand + Rsbuild

## 使用方式

本文件是一个跨平台 AI Skill，任何 AI 编辑器都可使用。

1. AI 读取本文件后，先通过 **§1 路由表** 匹配页面类型
2. 按 **§2 固定步骤表** 中对应的步骤逐步执行，**不可跳步**
3. 每步标注了需要读取的文件，**按指示读取**（注意区分两类路径，见下方路径约定）
4. 生成代码时遵守 **§3-§4** 的硬约束和 API 约定
5. 完成后按 **§5-§6** 自检和验证

### 🛑 会话状态检查（避免重复挂载，每次执行第一步前必须判断）

> ⛔ **本 Skill 在同一个会话中只应被完整执行一次。** 如果当前会话中已经读取过本 SKILL.md，**不要重新挂载 Skill、不要重新读取 Skill 文件**，直接跳到对应的步骤继续执行。

| 已读取过的内容           | 本次行为                                                                        |
| ------------------------ | ------------------------------------------------------------------------------- |
| 本 SKILL.md              | **跳过**，不再读取。直接按上次确立的页面类型和步骤继续                          |
| 代码模板（references/）  | **跳过**，不再读取。模板知识已在上下文中                                        |
| 组件文档（.ai/sdesign/） | **跳过**，不再读取。仅在 `pnpm verify` 报错且 verify-errors.md 未匹配时才按需读 |

> 判断方法：回顾当前会话历史，若已出现过 SKILL.md 的内容或模板内容，即视为已读取。

### ⚠️ 路径约定（必读）

本 Skill 引用两类文件，**解析基准不同**：

| 路径前缀                            | 解析基准                                     | 说明                        |
| ----------------------------------- | -------------------------------------------- | --------------------------- |
| `references/`                       | **Skill 安装目录**（即本 SKILL.md 所在目录） | Skill 自带的代码模板文件    |
| `{project}/.ai/sdesign/components/` | **项目根目录**（即当前工作目录 / cwd）       | 项目内的 sdesign 组件库文档 |

> **关键规则**：当文档中出现 `.ai/sdesign/components/xxx.md` 时，**必须从项目根目录解析**（如 `{cwd}/.ai/sdesign/components/xxx.md`），而不是从 Skill 安装目录解析。Skill 可能被全局安装到用户目录（如 `~/.qoder/skills/`），组件文档不在那里。

### 🔒 输出锁（贯穿全流程，不可违反）

> **输出锁 = 仅允许创建/修改的文件范围，由 §1 路由表「输出锁」列定义。**

- ⛔ **禁止修改输出锁范围外的任何文件**，即使 `pnpm verify` 报错也不修
- `pnpm verify` 报错时：只修输出锁范围内文件的错误，范围外报错 → **跳过，不修，不提**
- 验证最多 3 轮，仍有范围外错误 → 忽略，报告生成完成

---

## §1 路由表

根据用户意图匹配页面类型，确定读取哪些文件：

| 用户意图关键词                                             | 页面类型    | 读取的模板文件（基于 Skill 目录 `references/`） | 组件文档（按需读，报错且 verify-errors 未匹配时才读）               | 输出锁                                                                                                |
| ---------------------------------------------------------- | ----------- | ----------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 查询 / 列表 / 搜索表格（无"新增/编辑/删除"等增删改关键词） | 查询列表页  | `search-table-template.md` + `api-template.md`  | `SSearchTable.md`（报错按需）                                       | `src/api/{module}/` + `src/pages/{module}/`                                                           |
| 列表 / CRUD / 管理 / 增删改查                              | CRUD 列表页 | `crud-template.md` + `api-template.md`          | `SSearchTable.md`（报错按需）；涉及弹窗时 `SForm.md` + `SDetail.md` | `src/api/{module}/` + `src/pages/{module}/` + `specs/{feature}/`                                      |
| 详情 / 查看 / detail                                       | 详情页      | `detail-template.md` + `api-template.md`        | `SDetail.md` + `SButton.md`（报错按需）                             | `src/api/{module}/` + `src/pages/{module}/detail.tsx`                                                 |
| 表单 / 新增 / 编辑 / form                                  | 表单页      | `form-template.md` + `api-template.md`          | `SForm.md` + `SButton.md`（报错按需）                               | `src/api/{module}/` + `src/pages/{module}/form.tsx`（默认统一）；确认拆分后 `create.tsx` + `edit.tsx` |

> 判断规则：用户描述中无"新增/编辑/删除/增删改"等关键词 → 默认走查询列表页，不生成弹窗和操作列。模糊时向用户确认。

---

## §2 固定步骤表

### 前置步骤：复用检查（所有页面类型通用，生成文件前必须执行）

1. `ls src/pages/{module}/` 列出目标目录已有页面文件
2. `ls src/api/{module}/` 列出目标目录已有 API 文件
3. 如果已有以下文件，**不新建，改为修改已有文件**：
   - 已有 `form.tsx` / `create.tsx` / `edit.tsx` → 不再新建功能重叠的表单页
   - 已有 `index.tsx` → 不再新建列表页
   - 已有 `detail.tsx` → 不再新建详情页
   - 已有 `types.ts` → **只补充缺失的类型定义，不重写整个文件**
   - 已有 `index.ts`（API 文件）→ **只补充缺失的 API 方法，不重写整个文件**
4. ⛔ **禁止覆盖已有的 API 文件**：如果 `src/api/{module}/index.ts` 已存在且包含同名导出，**不要重新生成**。重复定义会导致 ESLint 报错并浪费修复轮次。
5. 仅在目标文件确实不存在时才新建
6. 新建文件前向用户确认文件列表

---

### 查询列表页（7 步）

> ⚠️ **纯只读列表，无增删改操作**。适用于数据展示/报表/日志等只读场景。模板已内嵌组件 API 约束，`pnpm verify` 报错时 → 先查 .ai/pitfalls/verify-errors.md → 未匹配才按需读组件文档。

| #   | 动作                                                                                                                                       | 读取                                                                                 | 产出                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------ |
| 1   | **收集需求信息** — 确认模块名、实体名、字段列表、无增删改                                                                                  | —                                                                                    | 需求清单                       |
| 2   | **读取代码模板** — 模板已内嵌组件 API 约束                                                                                                 | **[Skill目录]** `references/search-table-template.md` + `references/api-template.md` | 模板知识                       |
| 3   | **生成 types.ts** — Entity + EntityQuery（无需 EntityFormData，无增删改故无需表单数据类型）                                                | `references/api-template.md`「填空模板：types.ts」                                   | `src/api/{module}/types.ts`    |
| 4   | **生成 api/index.ts** — createRequest + getListByGet（只读，无需增删改方法）                                                               | `references/api-template.md`「填空模板：api/index.ts」+ §4 命名规则                  | `src/api/{module}/index.ts`    |
| 5   | **生成 index.tsx** — SSearchTable 纯列表，无操作列/弹窗/删除逻辑                                                                           | `references/search-table-template.md`「填空模板：index.tsx」                         | `src/pages/{module}/index.tsx` |
| 6   | **自检** — 逐条检查 §5 错题集 + §6 验证清单                                                                                                | 本文件 §5 + §6                                                                       | 修复问题                       |
| 7   | **运行验证** — `pnpm verify`，报错先查 .ai/pitfalls/verify-errors.md 匹配签名，未匹配才按需读组件文档。**只修输出锁范围内文件**，最多 3 轮 | —                                                                                    | 验证通过                       |

---

### CRUD 列表页（9 步）

> ⚠️ **组件文档按需读**：填空模板注释已内嵌组件 API 约束（类型注解、prop 名、反例），无需额外预读组件文档。`pnpm verify` 报错时 → 先查 .ai/pitfalls/verify-errors.md 匹配签名 → 未匹配才按需读 `.ai/sdesign/components/{组件名}.md`。

| #   | 动作                                                                                                                                       | 读取                                                                         | 产出                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------- |
| 1   | **收集需求信息** — 确认模块名、实体名、字段列表、交互模式（Modal/独立页/Drawer）                                                           | —                                                                            | 需求清单                         |
| 2   | **读取代码模板** — 模板已内嵌组件 API 约束（类型注解/prop 名/反例），掌握填空模板                                                          | **[Skill目录]** `references/crud-template.md` + `references/api-template.md` | 模板知识                         |
| 3   | **生成 types.ts** — 按 api-template.md 填空模板生成 Entity + EntityQuery + EntityFormData                                                  | `references/api-template.md`「填空模板：types.ts」                           | `src/api/{module}/types.ts`      |
| 4   | **生成 api/index.ts** — 按 api-template.md 填空模板生成 createRequest + CRUD 方法                                                          | `references/api-template.md`「填空模板：api/index.ts」+ §4 命名规则          | `src/api/{module}/index.ts`      |
| 5   | **生成 index.tsx** — SSearchTable 列表页，按 crud-template.md 填空模板                                                                     | `references/crud-template.md`「填空模板：index.tsx」                         | `src/pages/{module}/index.tsx`   |
| 6   | **生成弹层组件** — FormModal（createModal）和/或 DetailDrawer（createDrawer）                                                              | 模板「弹层封装原则」                                                         | `src/pages/{module}/components/` |
| 7   | **自检** — 逐条检查 §5 错题集 + §6 验证清单                                                                                                | 本文件 §5 + §6                                                               | 修复问题                         |
| 8   | **运行验证** — `pnpm verify`，报错先查 .ai/pitfalls/verify-errors.md 匹配签名，未匹配才按需读组件文档。**只修输出锁范围内文件**，最多 3 轮 | —                                                                            | 验证通过                         |
| 9   | **报告** — 输出生成的文件清单                                                                                                              | —                                                                            | 文件清单                         |

### 详情页（7 步）

> ⚠️ **组件文档按需读**：填空模板注释已内嵌组件 API 约束，无需额外预读组件文档。`pnpm verify` 报错时 → 先查 .ai/pitfalls/verify-errors.md → 未匹配才按需读 `.ai/sdesign/components/{组件名}.md`。

| #   | 动作                                                                                                             | 读取                                                                           | 产出                                             |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| 1   | **收集需求信息** — 确认模块名、实体名、字段列表、模式（独立页/Drawer）                                           | —                                                                              | 需求清单                                         |
| 2   | **读取代码模板** — 模板已内嵌组件 API 约束                                                                       | **[Skill目录]** `references/detail-template.md` + `references/api-template.md` | 模板知识                                         |
| 3   | **生成/更新 types.ts** — 按 api-template.md 填空模板补充 Entity 类型                                             | `references/api-template.md`「填空模板：types.ts」                             | `src/api/{module}/types.ts`                      |
| 4   | **生成/更新 api/index.ts** — 按 api-template.md 补充 getByIdByGet 方法                                           | `references/api-template.md`「按需裁剪」表                                     | `src/api/{module}/index.ts`                      |
| 5   | **生成详情页** — detail.tsx（独立页）或 DetailDrawer（createDrawer）                                             | `references/detail-template.md` 填空模板                                       | `src/pages/{module}/detail.tsx` 或 `components/` |
| 6   | **自检** — 逐条检查 §5 + §6                                                                                      | 本文件 §5 + §6                                                                 | 修复问题                                         |
| 7   | **运行验证** — `pnpm verify`，报错先查 .ai/pitfalls/verify-errors.md 匹配签名，未匹配才按需读组件文档。最多 3 轮 | —                                                                              | 验证通过                                         |

### 表单页（9 步）

> ⚠️ **组件文档按需读**：填空模板注释已内嵌组件 API 约束（Spin 包裹/groupItems 注解/类型反例），无需额外预读组件文档。`pnpm verify` 报错时 → 先查 .ai/pitfalls/verify-errors.md 匹配签名 → 未匹配才按需读 `.ai/sdesign/components/{组件名}.md`。

| #   | 动作                                                                                                                                                              | 读取                                                                         | 产出                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | **收集需求信息** — 确认模块名、实体名、字段列表、模式（Modal/独立页）、是否分组、是否有联动                                                                       | —                                                                            | 需求清单                                       |
| 2   | **读取代码模板** — 模板已内嵌组件 API 约束                                                                                                                        | **[Skill目录]** `references/form-template.md` + `references/api-template.md` | 模板知识                                       |
| 3   | **生成/更新 types.ts** — 按 api-template.md 填空模板生成 Entity + EntityFormData                                                                                  | `references/api-template.md`「填空模板：types.ts」                           | `src/api/{module}/types.ts`                    |
| 4   | **生成/更新 api/index.ts** — 按 api-template.md 生成 createByPost + updateByPut + getByIdByGet                                                                    | `references/api-template.md`「按需裁剪」表                                   | `src/api/{module}/index.ts`                    |
| 5   | **判断新增/编辑差异** — 字段重合 > 70% 且仅标题和 API 不同 → 生成单个 `form.tsx`（通过 `?id` 统一处理）；差异大（字段、布局、区块明显不同）→ **向用户确认后**拆分 | —                                                                            | 决策结论                                       |
| 6a  | **生成 form.tsx**（差异小时）— 独立页模式 → 统一表单页；Modal 模式 → `FormModal`                                                                                  | `references/form-template.md` 填空模板                                       | `src/pages/{module}/form.tsx` 或 `components/` |
| 6b  | **生成 create.tsx + edit.tsx**（差异大且确认后）— 独立页模式下分别生成；Modal 模式跳过                                                                            | `references/form-split-template.md` 填空模板                                 | `src/pages/{module}/create.tsx` + `edit.tsx`   |
| 7   | **处理联动**（如有）— 使用 `SForm.useWatch` + 条件展开 items                                                                                                      | 模板「字段联动」示例                                                         | 联动逻辑                                       |
| 8   | **自检** — 逐条检查 §5 + §6（特别注意 P004 联动规则 + P013 文件复用规则）                                                                                         | 本文件 §5 + §6                                                               | 修复问题                                       |
| 9   | **运行验证** — `pnpm verify`，报错先查 .ai/pitfalls/verify-errors.md 匹配签名，未匹配才按需读组件文档。最多 3 轮                                                  | —                                                                            | 验证通过                                       |

---

## §3 硬约束速查

> 新代码严格遵守。修改已有代码以已有风格为准，新增片段沿用同文件风格。

### 组件替换（必须）

| 禁止直接使用      | 必须替换为            | Why                         |
| ----------------- | --------------------- | --------------------------- |
| antd Table        | STable / SSearchTable | 内置分页/搜索/loading 联动  |
| antd Form         | SForm / SForm.Search  | 配置式，减 50% 样板代码     |
| antd Button       | SButton               | actionType 预设统一操作交互 |
| antd Descriptions | SDetail               | 配置式分组，dataSource 驱动 |

> 可直接用：Modal / Modal.confirm / Tag / message / Card / Spin / InputNumber

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

> 保底类型：`Record<string, unknown>`，优先从已有实体推导（`Partial<Entity>`）。

### 全局类型（`src/types/index.ts`，禁止重复定义）

- `PageData<T>` — 分页响应（`{ dataList: T[], totalSize, pageNum, pageSize }`）
- `PageQuery` — 分页查询基类（`{ pageNum?, pageSize? }`）
- 模块 `types.ts` 只定义：`{Entity}` + `{Entity}Query extends PageQuery` + `{Entity}FormData`

---

## §4 API 约定摘要

### 命名规则

| 对象     | 规则               | 示例              |
| -------- | ------------------ | ----------------- |
| API 对象 | `[module]Api`      | `productApi`      |
| 实体类型 | `[Entity]`         | `Product`         |
| 查询参数 | `[Entity]Query`    | `ProductQuery`    |
| 表单数据 | `[Entity]FormData` | `ProductFormData` |
| 接口方法 | `[name]By[HTTP]`   | `getListByGet`    |

### HTTP 后缀

| HTTP   | 后缀       | 示例                  |
| ------ | ---------- | --------------------- |
| GET    | `ByGet`    | `getListByGet`        |
| POST   | `ByPost`   | `createByPost`        |
| PUT    | `ByPut`    | `updateByPut`         |
| DELETE | `ByDelete` | `deleteByDelete`      |
| PATCH  | `ByPatch`  | `updateStatusByPatch` |

### useRequest 规范

> 必须用 useRequest 包装 API 调用，禁止手动 useState 管理 loading/data。

| 场景     | 模式                                                    |
| -------- | ------------------------------------------------------- |
| 列表查询 | SSearchTable `requestFn` 直传                           |
| 写操作   | `useRequest(apiFn, { manual: true, onSuccess })`        |
| 详情加载 | `useRequest(() => getByIdByGet(id!), { ready: !!id })`  |
| 表单提交 | `useRequest(apiFn, { manual: true })` + onFinish 调 run |

### 字段类型映射

| 后端类型      | TS 类型       | SForm 控件  |
| ------------- | ------------- | ----------- |
| string        | string        | input       |
| string(long)  | string        | textarea    |
| number        | number        | inputNumber |
| boolean       | boolean       | switch      |
| date/datetime | string        | datePicker  |
| enum          | string/number | select      |
| array         | T[]           | checkbox    |

---

## §5 错题集

> 生成代码时必须对照检查。每条标注了适用的页面类型。

| 编号 | 适用范围    | 核心规则                                                                                                                                                                                                                                                      | 快速修复                                                                         |
| ---- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| P001 | CRUD + 表单 | **禁止在列表页管理弹层 open 状态，禁止手动 forwardRef**。使用 `createModal` 或 `createDrawer`（`@dalydb/sdesign`）工厂函数，Content 关闭即卸载                                                                                                                | 用 `createModal`/`createDrawer` 包装                                             |
| P002 | 表单        | **SForm `type: 'table'` 和 STable 不支持行内编辑**。可编辑表格使用 `EditableProTable`（`@ant-design/pro-components`）                                                                                                                                         | 替换为 EditableProTable \| **模板**：`{project}/.ai/templates/editable-table.md` |
| P003 | 全部        | **回调函数未使用的参数加 `_` 前缀**。如 `render: (_, record) => ...`。禁止用 `void`、`eslint-disable` 绕过                                                                                                                                                    | 加 `_` 前缀                                                                      |
| P004 | 表单        | **禁止 `type: 'dependency'`**。字段联动统一使用 `SForm.useWatch(fieldName, form)` + `...(value === 'x' ? [item] : [])` 条件展开                                                                                                                               | `SForm.useWatch` + 条件展开 items                                                |
| P005 | CRUD        | **禁止 SConfirm 组件**。确认弹窗统一使用 antd `Modal.confirm({ title, content, onOk })`                                                                                                                                                                       | `Modal.confirm()`                                                                |
| P006 | CRUD        | **必须使用显式类型注解声明 columns 和 searchItems**。`const columns: SColumnsType<Entity> = [...]`、`const searchItems: SFormItems[] = [...]`。避免 `as const`                                                                                                | `const columns: SColumnsType<Entity> = [...]`                                    |
| P007 | CRUD        | **`paginationFields` 的属性名是 `current`（不是 `pageNum`）**。`PaginationFields` 只有 4 个 key：`current`/`pageSize`/`total`/`list`                                                                                                                          | 将 `pageNum:` 改为 `current:`                                                    |
| P008 | CRUD + 表单 | **禁止硬编码 options/枚举映射**。字典数据从 `useDictStore.dictMapData` 获取，sdesign 组件通过 SConfigProvider 自动消费。SSearchTable 枚举列通过 `dictKey` 指定，SForm 下拉通过 `fieldProps: { dictKey }` 指定                                                 | 从 dictMapData 取，组件 name 匹配 dict code                                      |
| P009 | 全部        | **禁止从旧代码中盲目还原常量/变量/模式**。旧代码中的常量（分页、loading 状态、回调等）可能已被新组件内置处理。`pnpm verify` 若报 `Cannot find name` 且该名称来自旧代码 → 先判断是否仍需要，不需要则删引用，不确定则问用户                                     | 判断是否仍需 → 删除旧引用 或 问用户                                              |
| P010 | 表单        | **SForm 没有 `type: 'group'`**。分组表单使用 `<SForm.Group groupItems={[{ title, items, columns }]}>` 组件，不在 SForm 的 items 数组里写 `type: 'group'`。`groupItems` 每项类型为 `GroupItemsType`，必须显式注解 `const groupItems: GroupItemsType[] = [...]` | 用 `SForm.Group` 组件                                                            |
| P011 | 表单        | **SForm / SForm.Group 不支持 `loading` 属性**。需要 loading 效果时用 `<Spin spinning={loading}>` 包裹整个 `SForm.Group`。同理 SForm 也不支持 `loading`                                                                                                        | `<Spin>` 包裹                                                                    |
| P012 | 表单        | **生成新页面前先检查目标目录已有文件**。若已有功能相似文件（如已有 `form.tsx` 时不要再建 `create.tsx`），优先复用/修改已有文件                                                                                                                                | 先 `ls` 再决定新建还是复用                                                       |
| P013 | 表单        | **默认优先共用单个表单页**。新增和编辑差异小时通过 `?id` 参数或 `mode: 'create' \| 'edit'` 区分，`isEdit = !!id`。**差异大时（字段、布局、区块明显不同）向用户确认后再拆分**，禁止不经确认直接拆成两个文件                                                    | 默认 `form.tsx`；确认后可拆分                                                    |
| P014 | 详情        | **SDetail.Group 顶层 prop 是 `items` 不是 `groupItems`**。`<SDetail.Group items={[{ groupTitle, items }]}>`。`groupItems` 是分组内嵌套子组字段。**SDetail 不支持 `loading` 属性**，用 `<Spin>` 包裹                                                           | `items` 而非 `groupItems`；`<Spin>` 包裹                                         |
| P015 | 迁移/改造   | **未知的外部实现用 `// TODO` 占位，禁止猜测**。当 PRD 未提供外部模块（组件/工具函数/API）的实现细节时，禁止凭空猜测。用 `// TODO: 补充 {描述}` 占位，保证代码通过 verify。猜测的错误实现会引入更多类型错误，浪费修复轮次。                                    | `// TODO: 补充 xxx` 占位                                                         |

---

## §6 验证清单

### Level 1：自动化验证

```bash
pnpm verify  # tsc + eslint + prettier
```

有错误 → 按优先级修复（tsc > eslint > prettier）→ 再次 verify → **最多 3 轮**。
⛔ **仅处理当前输出锁范围内文件的错误。范围外文件报错 → 跳过，不修，不提。**

### Level 2：AI 自检

- [ ] 业务页面使用 sdesign 组件（SSearchTable/SForm/SButton/SDetail），未使用不存在的 sdesign 组件
- [ ] 无 any 类型，未直接 import axios，类型导入用 `import type`
- [ ] API 方法名带 HTTP 后缀（getListByGet/createByPost 等）
- [ ] SForm 字段联动用 `SForm.useWatch` + 动态 items 条件展开（禁止 `type: 'dependency'`）
- [ ] 确认弹窗用 antd `Modal.confirm`（禁止 SConfirm）
- [ ] Modal/Drawer 使用 `createModal`/`createDrawer` 工厂函数，禁止手动管理 open 状态
- [ ] 所有 API 调用通过 useRequest 包装（SSearchTable.requestFn 除外）
- [ ] 写操作 useRequest 配置了 onSuccess（提示 + 刷新/跳转）
- [ ] types.ts 类型完整（Entity + EntityQuery + EntityFormData）

---

## §7 示例：输入 → 产出

> 用户请求（查询列表）

```
帮我生成一个操作日志的查询页面，字段：操作人、操作类型、IP地址、操作时间。只有查询和展示，不需要增删改。
```

> 路由匹配：无"新增/编辑/删除"关键词 → 查询列表页 → §2 七步流程

> 产出文件

| 文件                      | 说明                                                  |
| ------------------------- | ----------------------------------------------------- |
| `src/api/log/types.ts`    | Log + LogQuery（无需 LogFormData）                    |
| `src/api/log/index.ts`    | createRequest + getListByGet（只读，无增删改方法）    |
| `src/pages/log/index.tsx` | SSearchTable 纯列表，含搜索栏，无操作列/弹窗/删除逻辑 |

---

> 用户请求（CRUD）

```
帮我生成一个商品管理的 CRUD 页面，字段：商品名称、价格、分类、状态、创建时间。弹窗模式新增编辑。
```

> 路由匹配：关键词「CRUD」→ CRUD 列表页 → §2 九步流程

> 产出文件

| 文件                                         | 说明                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/api/product/types.ts`                   | Product + ProductQuery + ProductFormData                                                  |
| `src/api/product/index.ts`                   | createRequest + getListByGet / getByIdByGet / createByPost / updateByPut / deleteByDelete |
| `src/pages/product/index.tsx`                | SSearchTable 列表页，含搜索栏 + 操作列                                                    |
| `src/pages/product/components/FormModal.tsx` | createModal 包装，SForm 配置式表单，useRequest 提交                                       |
