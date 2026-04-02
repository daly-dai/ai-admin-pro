# AI Frontend App

> React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + Zustand + Rsbuild
>
> **这是 AI 进入本项目的唯一入口。所有开发必须遵循本文件定义的流程和约束。**

---

## 一、工作模式（AI 接到请求后第一步判断）

> ⚠️ **模式判断阶段不读取任何文件**，仅根据用户消息中的关键词匹配。判断完成后再按对应模式的步骤执行。

| 模式            | 触发词（消息中出现即匹配）                                            | 做什么                     | 预读文件数 |
| --------------- | --------------------------------------------------------------------- | -------------------------- | ---------- |
| **api-gen**     | swagger、接口文档、生成接口、生成类型定义、生成 API                   | 仅生成 types.ts + index.ts | 1          |
| **page-first**  | 原型图、先画页面、接口还没有、mock、页面骨架                          | 生成页面 + 占位 API        | 1-2        |
| **api-connect** | 对接接口、接口好了、替换 mock、联调                                   | 更新已有类型和页面         | 2-3        |
| **incremental** | 加个字段、改一下、修复、调整、新增按钮                                | 最小范围修改               | 1-2        |
| **spec-gen**    | 合并规格书、功能规格书、swagger+PRD、对齐接口和需求、生成feature-spec | Swagger+PRD → 功能规格书   | 2-3        |
| **full-sdd**    | 完整实现、从零搭建、做一整个模块                                      | spec 拆解 → 逐 Task 开发   | 按需       |

**匹配规则**：

- 优先匹配最具体的模式（如「根据 swagger 生成接口」→ api-gen，不是 full-sdd）
- 无法判断时，向用户确认而非默认走 full-sdd
- 用户可以在消息中直接指定模式（如「用 api-gen 模式」）
- 当用户同时提供 Swagger 和 PRD/产品文档，且未指定模式时，优先匹配 spec-gen
- **page-first vs full-sdd 区分**：如果 `src/api/{module}/` 下已有接口代码（已跑过 api-gen），应走 full-sdd 而非 page-first。page-first 仅用于完全没有接口信息的场景

---

## 二、硬约束（所有模式通用，不可违反）

### 组件使用

> 🚫 **阻断性要求**：代码中每使用一个 sdesign 组件，**必须先 Read 该组件的文档**（`.ai/sdesign/components/{ComponentName}.md`）。
> **未读文档 = 禁止使用该组件。没有例外。**
>
> 常见需读文档：
>
> - `SSearchTable` → Read `.ai/sdesign/components/SSearchTable.md`
> - `SForm` → Read `.ai/sdesign/components/SForm.md`
> - `SButton` → Read `.ai/sdesign/components/SButton.md`
> - `SDetail` → Read `.ai/sdesign/components/SDetail.md`
> - `STable` → Read `.ai/sdesign/components/STable.md`
> - 其他 sdesign 组件同理，文档路径：`.ai/sdesign/components/{组件名}.md`
>
> ⚠️ **禁止凭记忆、猜测或参考其他 AI 生成的代码来使用 sdesign 组件的属性。文档是唯一可信来源。**

| 禁止直接使用      | 必须替换为            | 来源            |
| ----------------- | --------------------- | --------------- |
| antd Table        | STable / SSearchTable | @dalydb/sdesign |
| antd Form         | SForm / SForm.Search  | @dalydb/sdesign |
| antd Button       | SButton               | @dalydb/sdesign |
| antd Descriptions | SDetail               | @dalydb/sdesign |

> **豁免范围（仅限以下目录中的文件）**：src/pages/login/、src/pages/error/、src/pages/register/、src/layouts/、src/router/
>
> 这些属于基础设施代码，可直接使用 antd 组件。**不在上述目录中的业务页面，必须使用 sdesign 组件。**

#### sdesign 与 antd 的关系

sdesign 管 CRUD 四件套（Table/Form/Button/Descriptions），antd 管其余一切。不要臆想 sdesign 不存在的组件（如 ~~SModal~~、~~SDrawer~~、~~STag~~），不确定时查阅 `.ai/sdesign/components/` 目录。

### 导入规则

- 禁止 import axios -- 使用 import { request } from '@/plugins/request'
- 禁止 any 类型 -- 使用具体类型或泛型
- 类型导入使用 import type { ... }
- 路径使用 @/ 或 src/ 别名，禁止 ../../ 相对路径
- 状态管理使用 Zustand + immer，禁止 Redux
- API 方法名必须添加 HTTP 后缀（`{name}By{HTTP}`，如 `getListByGet`） -- 详见 `api-conventions.md`
- 未使用参数加 `_` 前缀（如 `(_, record) => ...`） -- 禁止 void / eslint-disable 绕过

### 全局类型复用（禁止重复定义）

> 以下类型已在 `src/types/index.ts` 中全局定义，**禁止在模块 types.ts 中重新定义**。
> 响应拦截器已自动解包 `ApiResponse`，`request.get<T>()` 直接返回业务数据 `T`。

| 全局类型         | 用途                                     | 正确用法                                                    |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `PageData<T>`    | 分页响应结构                             | `request.get<PageData<Entity>>('/api/xxx', { params })`     |
| `PageQuery`      | 分页查询基类                             | `interface XxxQuery extends PageQuery { keyword?: string }` |
| `ApiResponse<T>` | 响应包装（拦截器已解包，API 层无需关心） | 不直接使用                                                  |
| `ApiError`       | 错误结构                                 | 不直接使用                                                  |

**模块 types.ts 只定义**：实体接口（`Entity`）、查询参数（`EntityQuery extends PageQuery`）、表单数据（`EntityFormData`）。

### 验证命令

```bash
pnpm verify        # tsc + eslint + prettier 全量检查
pnpm verify:fix    # eslint --fix + prettier --write 自动修复
pnpm lint          # 仅 eslint
pnpm type-check    # 仅 tsc
```

- git commit 自动运行 lint-staged（eslint + prettier）
- git push 自动运行 type-check

### 范围限定原则（所有模式通用）

> AI 的输出范围必须严格匹配用户的请求边界，禁止自行扩展。
> **判断依据**：用户请求中明确提到的交付物。未提及的不生成，不猜测，不自行扩展。

---

## 三、各模式详细流程（渐进式加载）

> **模式判断后，Read 对应的模式文件获取详细步骤、约束和输出锁。不要一次性读取所有模式文件。**

| 模式        | 详细流程文件               |
| ----------- | -------------------------- |
| api-gen     | `.ai/modes/api-gen.md`     |
| page-first  | `.ai/modes/page-first.md`  |
| api-connect | `.ai/modes/api-connect.md` |
| incremental | `.ai/modes/incremental.md` |
| spec-gen    | `.ai/modes/spec-gen.md`    |
| full-sdd    | `.ai/modes/full-sdd.md`    |

---

## 四、所有模式通用的验证规则

> ⚠️ **验证阶段仅用于检查和修复已生成文件中的错误，禁止在验证阶段创建新文件或添加新功能。** 验证失败时，只修复报告的错误，不超出当前模式的输出锁范围。

### 验证范围限制（重要）

`pnpm verify` 可能输出整个项目的错误，但 **AI 只处理当前输出锁范围内的文件**：

| 当前模式    | 只处理这些路径的错误                                     |
| ----------- | -------------------------------------------------------- |
| api-gen     | `src/api/{module}/types.ts`、`src/api/{module}/index.ts` |
| page-first  | `src/pages/{module}/` 下的文件                           |
| api-connect | 用户指定的页面文件 + 对应的 API 文件                     |
| incremental | 用户指定的文件                                           |
| spec-gen    | 输出的 spec 文件（通常在 `.ai/specs/`）                  |
| full-sdd    | 当前 Task 涉及的文件（参考 spec 中的 Task 拆解）         |

**其他模块的错误**：在验证报告中列出（如「⚠️ 发现 3 个其他模块错误，不在本次修复范围内」），但 **不读取、不分析、不修复**。用户如需修复，应另开任务。

**Level 1（自动化）**：`pnpm verify`，有错误按优先级修复（tsc > eslint > prettier），最多 3 轮，仍有错误则报告用户。ESLint 修复策略参考 `.ai/core/coding-standards.md`，禁止使用 `void`、`eslint-disable` 等方式绕过。

**Level 2（自检，不需要额外读取文件）**：对照第二节硬约束在脑内逐条检查：

- 业务页面是否使用了 SSearchTable / SForm / SButton / SDetail 而非 antd 原生组件
- 是否存在 `import axios`、`any` 类型、`../../` 相对路径
- API 对象命名是否正确（`{module}Api`）
- **API 方法名是否添加了 HTTP 后缀**（`getListByGet`、`createByPost` 等，禁止无后缀的 `getList`、`create`）
- **回调函数中未使用的参数是否加了 `_` 前缀**（如 `render: (_, record) => ...`）
- SForm 字段联动是否用 `type: 'dependency'`，Modal 是否用条件渲染 `{open && <Modal/>}`

**Level 3（错题集对照）**：生成页面代码前，Read `.ai/pitfalls/index.md`，按「适用场景」匹配当前页面类型，将匹配的核心规则作为硬性约束对照当前代码逐条排查。如有匹配的错误模式，立即修正。不确定时再按需 Read 对应详情文件。

> ⚠️ 此步骤对所有涉及页面/组件代码生成的模式（page-first、api-connect、incremental、full-sdd）均为**必选项**，不可跳过。

---

## 五、项目结构

> 详见 `.ai/core/architecture.md`「项目结构（强制）」章节。

---

## 六、纠错沉淀（用户纠正时触发）

当用户指出写法错误/过时时，**必须** Read `.ai/conventions/correction-workflow.md` 并按其四层防御体系执行沉淀。禁止只口头应答而不落实到文件。

---

## 七、扩展新模式

当出现现有模式未覆盖的页面模式（如可编辑表格、拖拽排序等）时：

1. 在 `.ai/modes/` 下新增对应模式文件（步骤 + 约束 + 输出锁）
2. 如需代码模板，在 `.ai/templates/` 下新增对应模板文件
3. 在第一节的模式表格中增加一行（触发词 + 做什么）
4. 在第三节的索引表中增加一行（模式名 + 文件路径）

无需修改其他模式的流程。
