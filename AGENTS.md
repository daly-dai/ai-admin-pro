# AI Frontend App

> React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + Zustand + Rsbuild
>
> **这是 AI 进入本项目的唯一入口。所有开发必须遵循本文件定义的流程和约束。**

---

## 一、开发生命周期（AI 接到请求后第一步判断）

> ⚠️ **阶段判断阶段不读取任何文件**，仅根据用户消息中的关键词和上下文判断。判断完成后再按对应阶段的步骤执行。

### 生命周期总览

```
PRD 到达 → ① 画 Demo → ② 接口合并（可多轮）→ ③ 改造适配 → ④ 接口对接 → ⑤ 迭代修复
                            ↻ 分批到位                                        ↕
                                                                        自测 / 测试 / 上线

           ↑_______________↑________________↑_______________↑
                     PRD 变更 → 回到受影响的最早阶段
```

| 阶段 | 名称     | 触发信号                                | 做什么                                                       |
| ---- | -------- | --------------------------------------- | ------------------------------------------------------------ |
| ①    | 画 Demo  | PRD/需求 + "画页面/出骨架/demo"         | 规范化PRD → Task拆解 → 生成demo页面+占位API                  |
| ②    | 接口合并 | 用户提供 Swagger/接口文档（部分或全部） | **条件分支**：有PRD→完整合并+feature-spec；无PRD→仅生成API层 |
| ③    | 改造适配 | feature-spec就绪 + "改造/对齐规格"      | 根据feature-spec改造已有demo页面                             |
| ④    | 接口对接 | 真实接口就绪 + "对接/联调/替换mock"     | 占位URL→真实URL，删除TODO注释                                |
| ⑤    | 迭代修复 | "改一下/加字段/修复/调整"               | 最小范围修改                                                 |

### 阶段判断决策树

```
用户提交请求
  │
  ├─ 用户声明"到此为止/先这样/不用继续了"?
  │   └─ → 确认结束，列出已产出文件清单，告知可随时恢复
  │
  ├─ 提供 PRD/需求 + 要求画页面?
  │   └─ → ① 画 Demo
  │
  ├─ 提供 Swagger/接口文档?
  │   └─ → ② 接口合并（自动检测是否有 PRD 走不同分支）
  │
  ├─ 已有 feature-spec + demo + 要求根据规格改造?
  │   └─ → ③ 改造适配
  │
  ├─ 要求对接真实接口/联调/替换mock?
  │   └─ → ④ 接口对接
  │
  ├─ PRD 有更新/需求变更?
  │   └─ → 需求变更回溯（见下方）
  │
  ├─ 小修改/加字段/改bug/调整?
  │   └─ → ⑤ 迭代修复
  │
  └─ 无法判断? → 向用户确认当前阶段
```

**匹配规则**：

- 优先匹配最具体的阶段（如「根据 swagger 生成接口」→ ②接口合并，不默认走①）
- 无法判断时，向用户确认而非自行假设
- 用户可以在消息中直接指定阶段（如「走接口合并阶段」）
- 当用户同时提供 Swagger 和 PRD/产品文档，进入②接口合并分支A（完整合并流程）

### 允许的非线性跳转

> 生命周期以线性为主，但不要求严格按 ①→②→③→④→⑤ 顺序。

| 场景                      | 跳转路径     | 条件                             |
| ------------------------- | ------------ | -------------------------------- |
| 接口一步到位，不需要 demo | 直接②，跳过① | 用户只提供 Swagger，未要求画页面 |
| 简单页面不需要改造        | ①→④ 或 ①→⑤   | 用户声明不需要③                  |
| 接口变更需重新合并        | ④→②          | 对接时发现接口有变               |

### 弹性退出机制

用户可在任意阶段声明"当前模块到此为止"。AI 响应：

1. 确认结束
2. 列出已产出文件清单
3. 告知用户如需继续可随时恢复

### 阶段②条件分支 + 多轮机制

**条件分支**：收到 Swagger 后，自动检测是否存在可用 PRD：

- 有 PRD → **分支A**：同时生成 API 层 + 合并为 feature-spec（原 api-gen + spec-gen 的合并）
- 无 PRD → **分支B**：仅生成 API 层代码（等同于原 api-gen）

**多轮机制**：接口分批到达时，每批触发一轮②，追加新接口到已有文件（不覆盖已有）。

**大文档降级**：Swagger 接口 > 30 个时，建议分批处理以确保质量。

### 需求变更回溯

```
PRD 变更到达
  │
  ├─ 新增页面/模块级功能？
  │   └─ 回到 ① 画 Demo（画新页面，已有页面不动）
  │
  ├─ 修改数据模型/字段定义/业务规则？
  │   ├─ 已有 feature-spec？ → 回到 ② 接口合并（更新 feature-spec）→ ③ 改造适配
  │   └─ 无 feature-spec？   → 回到 ① 画 Demo（更新已有 demo）
  │
  ├─ 修改页面交互/表单字段/表格列？
  │   └─ 回到 ③ 改造适配（更新页面，API 不动）
  │
  ├─ 删除/裁剪功能或字段？
  │   └─ 回到 ③ 改造适配（删除页面元素）+ ⑤ 清理 API 层无用代码
  │
  └─ 文案调整/小改动？
      └─ 直接 ⑤ 迭代修复
```

**处理流程**：

1. 用户告知 PRD 有更新（提供更新后的文档或描述变更内容）
2. AI 对比变更内容，生成**变更影响清单**（哪些文件/页面受影响）
3. 向用户确认影响范围
4. 回到受影响的最早阶段，**仅对变更部分执行**（不重做未受影响的部分）
5. 从该阶段向后依次推进，直到回到当前进度

**混合变更**（多种变更同时出现）：取最早阶段。如 ①+③ 同时 → 走①。

### Task 拆解通用能力

多页面场景下的 Task 拆解机制（`specs/template.md` + `progress.md` + 逐 Task 执行 + `session-template.md`）下沉为通用能力：

| 阶段       | 何时启用 Task 拆解                           |
| ---------- | -------------------------------------------- |
| ① 画 Demo  | 需求涉及多个页面时（AI 判断或用户要求）      |
| ③ 改造适配 | feature-spec 涉及多个页面改动时              |
| ② ④ ⑤      | 不启用（②是API层单交付物，④⑤是最小修改原则） |

Task 粒度：一个 Task = 一个明确交付物（一个页面 / 一组 API）。

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
- 禁止 `any` 类型 -- 使用具体类型或泛型。**保底类型**：当确实无法确定结构时，使用 `Record<string, unknown>` 而非 `Record<string, any>`，并优先从已有实体类型推导（如 `Partial<Entity>`、`Pick<Entity, 'id' | 'name'>`）
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

### 风险操作确认

根据操作可逆性和影响范围分类，AI 必须遵循以下确认规则：

| 分类           | 示例                                                                                                                  | AI 行为                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **自由操作**   | 读取文件、搜索代码、pnpm verify、创建新模块文件（types.ts / index.ts / 页面文件）                                     | 无需确认，直接执行                    |
| **需确认操作** | 删除已有文件、修改 package.json 依赖、修改 eslint / rsbuild / tsconfig 等全局配置、修改 `.ai/` 下的规范文件           | 透明告知操作内容 + 等待用户确认后执行 |
| **禁止操作**   | 修改不在当前输出锁范围内的文件、自行安装新依赖包、修改 src/plugins/ 或 src/router/ 等基础设施代码（除非用户明确要求） | 必须拒绝，向用户说明原因              |

> ⚠️ **原则**：暂停确认的代价很低，而超出范围的修改代价可能非常高。
>
> - 遇到类型报错或 lint 错误时，只修复当前输出锁范围内的文件，不扩展修改范围
> - 发现现有代码可能有问题时，告知用户而不是自行修改
> - 不确定是否在输出锁范围内时，先确认再操作

---

## 三、各阶段详细流程（渐进式加载）

> **阶段判断后，Read 对应的阶段模式文件获取详细步骤、约束和输出锁。不要一次性读取所有模式文件。**

| 阶段       | 详细流程文件               |
| ---------- | -------------------------- |
| ① 画 Demo  | `.ai/modes/demo.md`        |
| ② 接口合并 | `.ai/modes/api-merge.md`   |
| ③ 改造适配 | `.ai/modes/demo-refine.md` |
| ④ 接口对接 | `.ai/modes/api-connect.md` |
| ⑤ 迭代修复 | `.ai/modes/incremental.md` |

---

## 四、所有模式通用的验证规则

> ⚠️ **验证阶段仅用于检查和修复已生成文件中的错误，禁止在验证阶段创建新文件或添加新功能。** 验证失败时，只修复报告的错误，不超出当前阶段的输出锁范围。

### 验证范围限制（重要）

`pnpm verify` 可能输出整个项目的错误，但 **AI 只处理当前输出锁范围内的文件**：

| 当前阶段   | 只处理这些路径的错误                                     |
| ---------- | -------------------------------------------------------- |
| ① 画 Demo  | `src/api/{module}/` + `src/pages/{module}/` 下的文件     |
| ② 接口合并 | `src/api/{module}/types.ts`、`src/api/{module}/index.ts` |
| ③ 改造适配 | `src/api/{module}/` + `src/pages/{module}/` 下的已有文件 |
| ④ 接口对接 | 用户指定的页面文件 + 对应的 API 文件                     |
| ⑤ 迭代修复 | 用户指定的文件                                           |

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

> ⚠️ 此步骤对所有涉及页面/组件代码生成的阶段（① 画 Demo、③ 改造适配、④ 接口对接、⑤ 迭代修复）均为**必选项**，不可跳过。

---

## 五、项目结构

> 详见 `.ai/core/architecture.md`「项目结构（强制）」章节。

---

## 六、纠错沉淀（用户纠正时触发）

当用户指出写法错误/过时时，**必须** Read `.ai/conventions/correction-workflow.md` 并按其四层防御体系执行沉淀。禁止只口头应答而不落实到文件。

---

## 七、扩展新阶段

当出现现有阶段未覆盖的页面模式（如可编辑表格、拖拽排序等）时：

1. 在 `.ai/modes/` 下新增对应模式文件（步骤 + 约束 + 输出锁）
2. 如需代码模板，在 `.ai/templates/` 下新增对应模板文件
3. 在第一节的阶段说明表中增加一行（触发信号 + 做什么）
4. 在第三节的索引表中增加一行（阶段名 + 文件路径）

无需修改其他模式的流程。
