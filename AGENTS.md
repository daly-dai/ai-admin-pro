# AI Frontend App

> React 18 + TypeScript 5 + @dalydb/sdesign + antd + Zustand + Rsbuild
>
> **这是 AI 进入本项目的唯一入口。所有开发必须遵循本文件定义的流程和约束。**

---

## 一、总览：SDD 开发流程

本项目采用 **SDD（Spec-Driven Development）** 模式，所有开发从需求拆解开始：

`步骤 0: 检查 specs/ 是否已有对应的需求规格
         ↓ 没有
步骤 1: 拆解需求 → specs/[feature]/spec.md
         ↓
  ┌─────────────────── 以下步骤按 Task 逐个循环 ───────────────────┐
  │ 步骤 2: 场景预读 → 根据当前 Task 类型读取对应文档（仅当前 Task） │
  │          ↓                                                      │
  │ 步骤 3: 参考已有模块 → Glob + Read 同类实现                     │
  │          ↓                                                      │
  │ 步骤 4: 生成代码 → 严格遵循规范                                 │
  │          ↓                                                      │
  │ 步骤 5: 组件约束速查 → 逐条对照                                 │
  │          ↓                                                      │
  │ 步骤 6: 验证循环 → pnpm verify → 自修复 → 自检清单              │
  │          ↓                                                      │
  │ 步骤 7: 更新进度 → specs/[feature]/progress.md                  │
  └─────────────────── 下一个 Task → 回到步骤 2 ───────────────────┘`

> ⚠️ **禁止跳步**。跳过步骤 1 直接写代码，或跳过步骤 2 直接生成代码，均属于流程违规。

---

## 二、硬约束（不可违反，ESLint 机械化强制执行）

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

**@dalydb/sdesign 是 antd 的业务增强层，不是替代品。** sdesign 仅封装了 CRUD 场景中高频使用的 4 类组件（表格、表单、按钮、描述列表），其余 antd 组件仍然是项目基础 UI 库。

#### antd 可直接使用的组件（不受限制）

| 分类                                   | 可直接使用的 antd 组件                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| 布局                                   | Row Col Space Divider Layout Flex                                                          |
| 导航                                   | Menu Breadcrumb Tabs Pagination Steps Dropdown                                             |
| 反馈                                   | Modal Drawer message                                                                       |
| otification Spin Tooltip Popover Alert |
| 数据展示                               | Tag Badge Avatar Image Tree Timeline Empty Card Statistic List Progress Segmented Calendar |
| 输入                                   | Input Select DatePicker Switch Radio Checkbox（在 SForm 外独立使用时）                     |
| 其他                                   | Result Skeleton ConfigProvider Upload（在 SForm 外独立使用时）                             |

> **核心原则**：sdesign 管 CRUD 四件套，antd 管其余一切。
>
> **AI 防幻觉提示**：不要臆想 sdesign 中不存在的组件（如 ~~SModal~~、~~SDrawer~~、~~STag~~、~~SMenu~~）。不确定时查阅 .ai/sdesign/components/ 目录。

### 导入规则

- 禁止 import axios -- 使用 import { request } from '@/plugins/request'
- 禁止 any 类型 -- 使用具体类型或泛型
- 类型导入使用 import type { ... }
- 路径使用 @/ 或 src/ 别名，禁止 ../../ 相对路径
- 状态管理使用 Zustand + immer，禁止 Redux

### 验证命令

`bash
pnpm verify        # tsc + eslint + prettier 全量检查
pnpm verify:fix    # eslint --fix + prettier --write 自动修复
pnpm lint          # 仅 eslint
pnpm type-check    # 仅 tsc
`

- git commit 自动运行 lint-staged（eslint + prettier）
- git push 自动运行 type-check

---

## 三、步骤详解

### 步骤 0：检查已有需求规格

`Glob: specs/*/spec.md`

- 如果已存在对应功能的 spec.md → 直接跳到步骤 2，按 Task 逐个开发
- 如果不存在 → 进入步骤 1，先拆解需求

### 步骤 1：拆解需求

> 📖 **必读**：.ai/specs/template.md

1. 理解需求意图，判断功能范围
2. 按模板格式创建 specs/[feature-name]/spec.md
3. 将需求拆解为独立、可验证的 Task
4. 创建 specs/[feature-name]/progress.md 跟踪进度

**Task 拆解原则**：

- 一个 Task = 一个明确交付物（一个页面 / 一个 API 模块 / 一个组件）
- 先数据后展示：API → 列表页 → 表单页 → 详情页
- 依赖关系必须声明

### 步骤 2：场景预读（按 Task 逐个执行，不可跳过）

> ⚠️ **预读粒度：每个 Task 单独执行本步骤，仅读取当前 Task 类型对应的文档。禁止一次性预读所有 Task 的文档。**
>
> ⚠️ **在生成任何代码之前，必须读取当前 Task 类型对应的文档。跳过此步骤直接生成代码属于流程违规，是组件约束违规的首要原因。**

根据当前 Task 的类型，确定并读取必读文档：

| Task 类型   | 场景            | 必读文档                                                                      |
| ----------- | --------------- | ----------------------------------------------------------------------------- |
| api         | 新增 API 模块   | .ai/guides/api-module.md + .ai/conventions/api-conventions.md                 |
| page-list   | CRUD 列表页     | .ai/guides/crud-page.md + .ai/sdesign/components/SSearchTable.md + SButton.md |
| page-form   | 新增/编辑表单页 | .ai/guides/form-page.md + .ai/sdesign/components/SForm.md                     |
| page-detail | 详情展示页      | .ai/guides/detail-page.md + .ai/sdesign/components/SDetail.md                 |
| component   | 业务组件        | .ai/core/coding-standards.md（组件规范部分）                                  |
| store       | 状态管理        | .ai/core/architecture.md（状态管理规范部分）                                  |
| refactor    | 重构已有代码    | Read 目标文件 + 关联 API                                                      |
| 不确定      | —               | .ai/core/architecture.md + .ai/core/coding-standards.md                       |

预读顺序：

1. .ai/guides/ 下对应场景指南
2. .ai/sdesign/components/ 下对应组件文档（获取完整 Props 和用法）
3. .ai/core/ 下规范文档（仅在首次生成代码或新增模块/目录时读取，不需要每个 Task 重复读取）

### 步骤 3：参考已有模块

新增模块时，通过 Glob 发现并参考已有同类实现：

`bash
Glob: src/api/*/index.ts       # 已有 API 模块
Glob: src/pages/*/index.tsx    # 已有页面
Glob: src/components/business/**/*.tsx  # 已有业务组件
Glob: src/stores/*.ts          # 已有 Store
`

选择一个最接近的已有模块，Read 其完整代码作为参考。

### 步骤 4：生成代码

严格遵循以下约定生成代码：

**API 模块**：

- 文件：src/api/{module}/types.ts + src/api/{module}/index.ts
- 导出对象命名：{module}Api
- 标准方法：getList / getById / create / update / delete

> ⚠️ **API 签名冲突处理**：当需求文档（spec.md）中的接口设计与 api-conventions.md 模板签名不一致时，**以需求文档为准**，但必须在 spec.md 的对应 Task 下标注偏离点（如：`<!-- deviation: getList 参数使用 POST body 而非 GET query -->`）。

**页面组件**：

- 列表页首选 SSearchTable
- 表单页使用 SForm（items 配置式）
- 详情页使用 SDetail（items 配置式）
- 按钮使用 SButton（actionType 预设）

> ⚠️ **页面交互模式**：生成列表页时，必须根据 crud-page.md 中「页面交互模式选择」决定新增/编辑/详情的承载方式（Modal / 独立页面 / Drawer），不可自行假设。

**状态管理**：

- 服务端状态用 ahooks useRequest
- 客户端状态用 Zustand + immer + persist

### 步骤 5：组件约束速查

在输出 JSX 之前，逐条对照：

- [ ] 目标文件是否在豁免目录（login/、error/、register/、layouts/、router/）？
- [ ] 不在豁免目录：是否使用了 SForm 而非 antd Form？
- [ ] 不在豁免目录：是否使用了 SButton 而非 antd Button？
- [ ] 不在豁免目录：是否使用了 STable/SSearchTable 而非 antd Table？
- [ ] 如果不在豁免目录：是否使用了 SDetail 而非 antd Descriptions？
- [ ] 导入路径是否使用 @/ 或 src/ 别名？
- [ ] 是否有 any 类型？
- [ ] SForm 字段联动是否用 `type: 'dependency'` + `depNames` 而非外部 useWatch 控制渲染？
- [ ] SDatePickerRange 是否用 `rangeKeys` 拆分字段而非手动 getFieldValue 拆分？
- [ ] Modal 是否使用条件渲染 `{open && <Modal/>}` 而非 destroyOnClose？

### 步骤 6：验证循环

> 📖 **参考**：.ai/conventions/verification.md

**Level 1 - 代码级验证（AI 自执行）**：
`bash
pnpm verify
`

- 有错误 → 按优先级修复（tsc > eslint > prettier）→ 再次 verify
- 最多 3 轮，仍有错误 → 报告给用户

**Level 2 - 功能级自检（AI 自检）**：
逐条检查组件约束清单、代码质量清单、文件完整性清单（详见 verification.md）

### 步骤 7：更新进度

完成 Task 后，更新 specs/[feature]/progress.md 中对应 Task 的状态：

- Level 1 + Level 2 均通过 → 🟢
- 任一 Level 未通过 → 🔴（附失败原因）

---

## 四、项目结构

`src/
├── api/[module]/         # API 层（types.ts + index.ts）
├── components/
│   ├── business/         # 业务组件（本项目复用）
│   └── common/           # 通用组件（跨项目复用）
├── constants/            # 常量（enum.ts + config.ts）
├── hooks/                # 自定义 Hooks
├── layouts/              # 布局组件（MainLayout.tsx）
├── pages/[page-name]/    # 页面（index.tsx + components/）
├── plugins/request/      # HTTP 封装（唯一允许使用 axios 的位置）
├── router/               # 路由配置 + 守卫
├── stores/               # Zustand 状态管理
├── styles/               # 全局样式
├── types/                # 全局类型定义
└── utils/                # 工具函数`

---

## 五、文档索引（场景驱动，强制预读）

> ⚠️ **不是 按需查阅，而是场景匹配即必读。**

| 场景             | 必读文件                                   | 何时触发                        |
| ---------------- | ------------------------------------------ | ------------------------------- |
| **拆解需求**     | .ai/specs/template.md                      | 开发新功能前 **（强制）**       |
| **验证流程**     | .ai/conventions/verification.md            | 代码生成后 **（强制）**         |
| **增量开发**     | .ai/conventions/incremental-development.md | 修改已有模块时                  |
| **API 设计**     | .ai/conventions/api-conventions.md         | 新增 API 模块时                 |
| **API 模块**     | .ai/guides/api-module.md                   | 新增 API 模块 **（强制）**      |
| **CRUD 列表页**  | .ai/guides/crud-page.md                    | 生成列表页 **（强制）**         |
| **表单页**       | .ai/guides/form-page.md                    | 生成表单页 **（强制）**         |
| **详情页**       | .ai/guides/detail-page.md                  | 生成详情页 **（强制）**         |
| **sdesign 组件** | .ai/sdesign/components/ 下对应组件         | 使用任何 S\* 组件时             |
| **架构规范**     | .ai/core/architecture.md                   | 新增模块/目录时                 |
| **代码规范**     | .ai/core/coding-standards.md               | 首次生成代码时                  |
| **技术栈约束**   | .ai/core/tech-stack.md                     | 引入新依赖时                    |
| **纠错沉淀**     | .ai/conventions/correction-workflow.md     | 用户纠正错误写法时 **（强制）** |

---

## 六、动态发现策略

不维护静态文件清单，通过工具搜索获取实时上下文：

`bash

# 发现已有模块

Glob: src/api/_/index.ts
Glob: src/pages/_/index.tsx
Glob: src/components/business/\*_/_.tsx
Glob: src/stores/\*.ts

# 发现具体实现

Grep: export interface [Entity] # 查找类型定义
Grep: export const [module]Api # 查找 API 导出
Grep: import._[Component] # 查找组件引用
Grep: path:._[route] in src/router/ # 查找路由配置
`

---

## 七、纠错沉淀（用户纠正时触发）

当用户指出某个写法错误、过时或需要替换时，**必须**执行以下流程：

1. `Read .ai/conventions/correction-workflow.md`
2. 按决策流程（Step 1-4）判断纠正应沉淀到哪些 Layer
3. 修改对应文件（eslint.config.mjs / AGENTS.md / verification.md / pitfalls/）
4. 如修改了 eslint.config.mjs → 运行 `pnpm lint` 验证规则生效
5. 向用户报告沉淀结果（写入了哪个 Layer、改了哪个文件）

> ⚠️ **禁止只口头应答而不落实到文件。** 每次纠正必须产生至少一个文件变更。
