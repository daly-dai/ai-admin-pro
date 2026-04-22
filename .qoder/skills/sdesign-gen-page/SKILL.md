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

| 用户意图关键词                           | 页面类型    | 读取的模板文件（基于 Skill 目录 `references/`） | 读取的组件文档（基于**项目根目录** `.ai/sdesign/components/`） | 输出锁                                                             |
| ---------------------------------------- | ----------- | ----------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| 列表 / CRUD / 管理 / 搜索表格 / 增删改查 | CRUD 列表页 | `crud-template.md` + `api-template.md`          | `SSearchTable.md` + `SForm.md` + `SButton.md` + `SDetail.md`   | `src/api/{module}/` + `src/pages/{module}/` + `specs/{feature}/`   |
| 详情 / 查看 / detail                     | 详情页      | `detail-template.md` + `api-template.md`        | `SDetail.md` + `SButton.md`                                    | `src/api/{module}/` + `src/pages/{module}/detail.tsx`              |
| 表单 / 新增 / 编辑 / form                | 表单页      | `form-template.md` + `api-template.md`          | `SForm.md` + `SButton.md`                                      | `src/api/{module}/` + `src/pages/{module}/create.tsx` + `edit.tsx` |

> 模糊时默认 CRUD 列表页，在步骤 1 中向用户确认。

---

## §2 固定步骤表

### CRUD 列表页（10 步）

| #   | 动作                                                                                                                           | 读取                                                                                                 | 产出                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | **收集需求信息** — 确认模块名、实体名、字段列表、交互模式（Modal/独立页/Drawer）                                               | —                                                                                                    | 需求清单                         |
| 2   | **读取组件 API** — 掌握 Props 和用法                                                                                           | **[项目根目录]** `.ai/sdesign/components/SSearchTable.md` + `SForm.md` + `SButton.md` + `SDetail.md` | 组件知识                         |
| 3   | **读取代码模板** — 掌握代码骨架和填空模板                                                                                      | **[Skill目录]** `references/crud-template.md` + `references/api-template.md`                         | 模板知识                         |
| 4   | **生成 types.ts** — 按 api-template.md 填空模板生成 Entity + EntityQuery + EntityFormData                                      | `references/api-template.md`「填空模板：types.ts」                                                   | `src/api/{module}/types.ts`      |
| 5   | **生成 api/index.ts** — 按 api-template.md 填空模板生成 createRequest + CRUD 方法                                              | `references/api-template.md`「填空模板：api/index.ts」+ §4 命名规则                                  | `src/api/{module}/index.ts`      |
| 6   | **生成 index.tsx** — SSearchTable 列表页                                                                                       | 模板 + 组件 API                                                                                      | `src/pages/{module}/index.tsx`   |
| 7   | **生成弹层组件** — FormModal（createModal）和/或 DetailDrawer（createDrawer）                                                  | 模板「弹层封装原则」                                                                                 | `src/pages/{module}/components/` |
| 8   | **自检** — 逐条检查 §5 错题集 + §6 验证清单                                                                                    | 本文件 §5 + §6                                                                                       | 修复问题                         |
| 9   | **运行验证** — `pnpm verify`，有错误按 tsc > eslint > prettier 优先级修复，**只修输出锁范围内文件**，范围外报错跳过，最多 3 轮 | —                                                                                                    | 验证通过                         |
| 10  | **报告** — 输出生成的文件清单                                                                                                  | —                                                                                                    | 文件清单                         |

### 详情页（8 步）

| #   | 动作                                                                              | 读取                                                                           | 产出                                             |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| 1   | **收集需求信息** — 确认模块名、实体名、字段列表、模式（独立页/Drawer）            | —                                                                              | 需求清单                                         |
| 2   | **读取组件 API**                                                                  | **[项目根目录]** `.ai/sdesign/components/SDetail.md` + `SButton.md`            | 组件知识                                         |
| 3   | **读取代码模板**                                                                  | **[Skill目录]** `references/detail-template.md` + `references/api-template.md` | 模板知识                                         |
| 4   | **生成/更新 types.ts** — 按 api-template.md 填空模板补充 Entity 类型              | `references/api-template.md`「填空模板：types.ts」                             | `src/api/{module}/types.ts`                      |
| 5   | **生成/更新 api/index.ts** — 按 api-template.md 补充 getByIdByGet 方法            | `references/api-template.md`「按需裁剪」表                                     | `src/api/{module}/index.ts`                      |
| 6   | **生成详情页** — detail.tsx（独立页）或 DetailDrawer（createDrawer）              | 模板 + 组件 API                                                                | `src/pages/{module}/detail.tsx` 或 `components/` |
| 7   | **自检** — 逐条检查 §5 + §6                                                       | 本文件 §5 + §6                                                                 | 修复问题                                         |
| 8   | **运行验证** — `pnpm verify`，**只修输出锁范围内文件**，范围外报错跳过，最多 3 轮 | —                                                                              | 验证通过                                         |

### 表单页（10 步）

| #   | 动作                                                                                           | 读取                                                                         | 产出                                             |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | **收集需求信息** — 确认模块名、实体名、字段列表、模式（Modal/独立页）、是否分组、是否有联动    | —                                                                            | 需求清单                                         |
| 2   | **读取组件 API**                                                                               | **[项目根目录]** `.ai/sdesign/components/SForm.md` + `SButton.md`            | 组件知识                                         |
| 3   | **读取代码模板**                                                                               | **[Skill目录]** `references/form-template.md` + `references/api-template.md` | 模板知识                                         |
| 4   | **生成/更新 types.ts** — 按 api-template.md 填空模板生成 Entity + EntityFormData               | `references/api-template.md`「填空模板：types.ts」                           | `src/api/{module}/types.ts`                      |
| 5   | **生成/更新 api/index.ts** — 按 api-template.md 生成 createByPost + updateByPut + getByIdByGet | `references/api-template.md`「按需裁剪」表                                   | `src/api/{module}/index.ts`                      |
| 6   | **生成 create.tsx**（独立页模式）或 FormModal（Modal 模式）                                    | 模板 + 组件 API                                                              | `src/pages/{module}/create.tsx` 或 `components/` |
| 7   | **生成 edit.tsx**（独立页模式，Modal 模式跳过此步）                                            | 模板 + 组件 API                                                              | `src/pages/{module}/edit.tsx`                    |
| 8   | **处理联动**（如有）— 使用 `SForm.useWatch` + 条件展开 items                                   | 模板「字段联动」示例                                                         | 联动逻辑                                         |
| 9   | **自检** — 逐条检查 §5 + §6（特别注意 P004 联动规则）                                          | 本文件 §5 + §6                                                               | 修复问题                                         |
| 10  | **运行验证** — `pnpm verify`，**只修输出锁范围内文件**，范围外报错跳过，最多 3 轮              | —                                                                            | 验证通过                                         |

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

| 编号 | 适用范围    | 核心规则                                                                                                                                                                                        | 快速修复                                                                        |
| ---- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| P001 | CRUD + 表单 | **禁止在列表页管理弹层 open 状态，禁止手动 forwardRef**。使用 `createModal`（`src/components/ModalContainer`）或 `createDrawer`（`src/components/DrawerContainer`）工厂函数，Content 关闭即卸载 | 用 `createModal`/`createDrawer` 包装                                            |
| P002 | 表单        | **SForm `type: 'table'` 和 STable 不支持行内编辑**。可编辑表格使用 `EditableProTable`（`@ant-design/pro-components`）                                                                           | 替换为 EditableProTable \| **范例**：`{project}/.ai/examples/editable-table.md` |
| P003 | 全部        | **回调函数未使用的参数加 `_` 前缀**。如 `render: (_, record) => ...`。禁止用 `void`、`eslint-disable` 绕过                                                                                      | 加 `_` 前缀                                                                     |
| P004 | 表单        | **禁止 `type: 'dependency'`**。字段联动统一使用 `SForm.useWatch(fieldName, form)` + `...(value === 'x' ? [item] : [])` 条件展开                                                                 | `SForm.useWatch` + 条件展开 items                                               |
| P005 | CRUD        | **禁止 SConfirm 组件**。确认弹窗统一使用 antd `Modal.confirm({ title, content, onOk })`                                                                                                         | `Modal.confirm()`                                                               |

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

> 用户请求

```
帮我生成一个商品管理的 CRUD 页面，字段：商品名称、价格、分类、状态、创建时间。弹窗模式新增编辑。
```

> 路由匹配：关键词「CRUD」→ CRUD 列表页 → §2 十步流程

> 产出文件

| 文件                                         | 说明                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/api/product/types.ts`                   | Product + ProductQuery + ProductFormData                                                  |
| `src/api/product/index.ts`                   | createRequest + getListByGet / getByIdByGet / createByPost / updateByPut / deleteByDelete |
| `src/pages/product/index.tsx`                | SSearchTable 列表页，含搜索栏 + 操作列                                                    |
| `src/pages/product/components/FormModal.tsx` | createModal 包装，SForm 配置式表单，useRequest 提交                                       |
