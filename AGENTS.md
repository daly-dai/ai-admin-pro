# AI Frontend App

> React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + Zustand + Rsbuild
>
> **这是 AI 进入本项目的唯一入口。所有开发必须遵循本文件定义的流程和约束。**

---

## 一、工作模式（AI 接到请求后第一步判断）

> ⚠️ **模式判断阶段不读取任何文件**，仅根据用户消息中的关键词匹配。判断完成后再按对应模式的步骤执行。

| 模式            | 触发词（消息中出现即匹配）                          | 做什么                     | 预读文件数 |
| --------------- | --------------------------------------------------- | -------------------------- | ---------- |
| **api-gen**     | swagger、接口文档、生成接口、生成类型定义、生成 API | 仅生成 types.ts + index.ts | 1          |
| **page-first**  | 原型图、先画页面、接口还没有、mock、页面骨架        | 生成页面 + 占位 API        | 1-2        |
| **api-connect** | 对接接口、接口好了、替换 mock、联调                 | 更新已有类型和页面         | 2-3        |
| **incremental** | 加个字段、改一下、修复、调整、新增按钮              | 最小范围修改               | 1-2        |
| **full-sdd**    | 完整实现、从零搭建、做一整个模块                    | spec 拆解 → 逐 Task 开发   | 按需       |

**匹配规则**：

- 优先匹配最具体的模式（如「根据 swagger 生成接口」→ api-gen，不是 full-sdd）
- 无法判断时，向用户确认而非默认走 full-sdd
- 用户可以在消息中直接指定模式（如「用 api-gen 模式」）

---

## 二、硬约束（所有模式通用，不可违反）

### 组件使用

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

## 三、各模式详细流程

### 模式 A：api-gen（接口生成）

> 用户提供了 swagger / 接口文档 / YAML，只需要生成前端接口定义。

**步骤**：

1. **读模板**：Read `.ai/templates/api-module.md`
2. **解析接口文档**：从用户提供的文档中提取实体字段、方法、URL、参数
3. **生成代码**：
   - `src/api/{module}/types.ts` — 实体类型、查询参数、表单数据
   - `src/api/{module}/index.ts` — API 对象（{module}Api），真实 URL 和方法
4. **验证**：`pnpm verify`，最多 3 轮修复

**约束**：

- 只生成 API 层，不生成页面（除非用户明确要求）
- 字段类型从接口文档映射，不猜测
- API 对象命名：`{module}Api`，5 个标准方法：getList / getById / create / update / delete

---

### 模式 B：page-first（页面先行）

> 用户有产品文档 / 原型图 / 口头描述，但没有接口文档。先出页面，后补接口。

**步骤**：

1. **读模板**：根据页面类型读取对应模板
   - 列表页 → `.ai/templates/crud-page.md`
   - 表单页 → `.ai/templates/form-designer.md`
   - 详情页 → `.ai/templates/detail-page.md`
2. **生成占位 API**：
   - `src/api/{module}/types.ts` — 根据描述定义临时类型，未确认字段加 `// TODO: 待接口确认`
   - `src/api/{module}/index.ts` — 方法签名完整，URL 用 `'/api/TODO/{module}'` 占位
3. **生成页面代码**：基于占位类型生成可渲染的页面，严格使用 sdesign 组件
4. **验证**：`pnpm verify`，最多 3 轮修复

**约束**：

- 占位 API 的 URL 统一用 `'/api/TODO/{module}'` 前缀，方便后续全局替换
- 页面代码**必须符合硬约束**，不因为是临时代码就降低标准
- 不生成 spec.md / progress.md（信息不完整，写了也是占位）

---

### 模式 C：api-connect（接口对接）

> 页面已存在（模式 B 或手动创建的），接口文档现在到位了，需要对接。

**步骤**：

1. **读已有代码**：Read `src/api/{module}/types.ts` + `src/api/{module}/index.ts`
2. **读接口文档**：解析用户提供的 swagger / 接口文档
3. **对比差异**：生成变更清单（新增字段 / 删除字段 / 类型变更 / URL 替换），告知用户
4. **更新 API 层**：
   - types.ts — 用真实类型替换临时类型，删除 `// TODO` 注释
   - index.ts — 替换占位 URL 为真实路径
5. **按需更新页面**：Read 已有页面代码，检查是否需要同步修改（新增搜索字段、列定义变更等）
6. **验证**：`pnpm verify`，最多 3 轮修复

**约束**：

- **先对比再改**，不是重新生成
- 保留页面中用户手动添加的自定义逻辑
- 新增字段是否加到页面中，需向用户确认

---

### 模式 D：incremental（增量修改）

> 需求变更、bug 修复、加字段、改交互等小范围修改。

**步骤**：

1. **读目标文件**：根据用户描述定位并读取要修改的文件
2. **如涉及类型变更**：同时读取 `src/api/{module}/types.ts`
3. **最小范围修改**：只改用户提到的内容，不重构不相关的代码
4. **验证**：`pnpm verify`，最多 3 轮修复

**约束**：

- **最小修改原则**，不动用户没提到的代码
- 不需要读模板（已有代码就是最好的参考）
- 不需要 spec.md / progress.md

---

### 模式 E：full-sdd（完整 SDD）

> 从零搭建一个完整功能模块，信息完备。

**步骤**：

1. **拆解需求**：
   - Read `.ai/specs/template.md`
   - 按范围限定原则判断功能范围，创建 `specs/[feature]/spec.md` + `progress.md`
   - 拆解为独立 Task（一个 Task = 一个明确交付物）
   - 先数据后展示：API → 列表页 → 表单页 → 详情页

2. **逐 Task 执行**（循环）：
   - **预读**：根据 Task 类型读取对应模板（见下表）+ 页面类读取 API 数据源
   - **生成代码**：按模板和数据源生成，遵循硬约束
   - **验证**：`pnpm verify` + 脑内自检硬约束
   - **更新进度**：specs/[feature]/progress.md 标记 🟢 或 🔴

| Task 类型   | 代码模板                       | 数据源                                                    |
| ----------- | ------------------------------ | --------------------------------------------------------- |
| api         | .ai/templates/api-module.md    | —                                                         |
| page-list   | .ai/templates/crud-page.md     | `src/api/{module}/types.ts` + `src/api/{module}/index.ts` |
| page-form   | .ai/templates/form-designer.md | `src/api/{module}/types.ts` + `src/api/{module}/index.ts` |
| page-detail | .ai/templates/detail-page.md   | `src/api/{module}/types.ts` + `src/api/{module}/index.ts` |
| component   | .ai/core/coding-standards.md   | —                                                         |
| store       | .ai/core/architecture.md       | —                                                         |
| refactor    | —                              | Read 目标文件 + 关联 API                                  |

> **页面类 Task 的数据源是硬依赖**：必须先读取已定义的 API 类型和方法签名。**禁止猜测接口签名**。

**补充预读（按需，非必读）**：

- 首次接触 sdesign 组件 → 查阅 `.ai/sdesign/components/` 下对应组件文档
- 首次新增模块/目录 → Read `.ai/core/architecture.md`
- 页面交互模式决策 → 查阅 `.ai/templates/crud-page.md`「页面交互模式选择」章节
- 修改已有模块 → Read `.ai/conventions/incremental-development.md`

**会话交接**（仅跨会话中断时）：
按 `.ai/specs/session-template.md` 生成 session 文档。同一会话内连续执行多个 Task 不需要每个都生成。

---

## 四、所有模式通用的验证规则

**Level 1（自动化）**：`pnpm verify`，有错误按优先级修复（tsc > eslint > prettier），最多 3 轮，仍有错误则报告用户。

**Level 2（自检，不需要额外读取文件）**：对照第二节硬约束在脑内逐条检查：

- 业务页面是否使用了 SSearchTable / SForm / SButton / SDetail 而非 antd 原生组件
- 是否存在 `import axios`、`any` 类型、`../../` 相对路径
- API 对象命名是否正确（`{module}Api`）
- SForm 字段联动是否用 `type: 'dependency'`，Modal 是否用条件渲染 `{open && <Modal/>}`

---

## 五、项目结构

> 详见 `.ai/core/architecture.md`「项目结构（强制）」章节。

---

## 六、纠错沉淀（用户纠正时触发）

当用户指出写法错误/过时时，**必须** Read `.ai/conventions/correction-workflow.md` 并按其四层防御体系执行沉淀。禁止只口头应答而不落实到文件。

---

## 七、扩展新模式

当出现现有模式未覆盖的页面模式（如可编辑表格、拖拽排序等）时：

1. 在 `.ai/templates/` 下新增对应模板文件
2. 在第一节的模式表格中增加一行（触发词 + 模板路径）
3. 在第三节中增加对应模式的步骤描述

无需修改其他模式的流程。
