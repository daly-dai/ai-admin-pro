# AI Frontend App

> React 18 + TypeScript 5 + @dalydb/sdesign + Zustand + Rsbuild

## 硬约束（不可违反，ESLint 机械化强制执行）

### 组件使用

| 禁止直接使用        | 必须替换为                | 来源              |
| ------------------- | ------------------------- | ----------------- |
| antd `Table`        | `STable` / `SSearchTable` | `@dalydb/sdesign` |
| antd `Form`         | `SForm` / `SForm.Search`  | `@dalydb/sdesign` |
| antd `Button`       | `SButton`                 | `@dalydb/sdesign` |
| antd `Descriptions` | `SDetail`                 | `@dalydb/sdesign` |

> **豁免范围（仅限以下目录/文件）**：`src/pages/login/`、`src/pages/error/`、`src/layouts/`、`src/router/`。
> 这些属于基础设施代码，可直接使用 antd 组件。
>
> **不在豁免范围内的**：`src/pages/register/`、`src/components/business/`、`src/pages/` 下所有其他业务页面。
> 即使功能上与 login 相关（如注册、修改密码），只要文件不在上述豁免目录中，就**必须**使用 sdesign 组件。

#### sdesign 与 antd 的关系

**@dalydb/sdesign 是 antd 的业务增强层，不是替代品。** sdesign 仅封装了 CRUD 场景中高频使用的 4 类组件（表格、表单、按钮、描述列表），其余 antd 组件仍然是项目的基础 UI 库，可以且应该直接使用。

#### antd 可直接使用的组件（不受限制）

即使在非豁免的业务页面中，以下 antd 组件**不在 sdesign 封装范围内**，应直接从 `antd` 导入使用：

| 分类     | 可直接使用的 antd 组件                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| 布局     | `Row` `Col` `Space` `Divider` `Layout` `Flex`                                                                        |
| 导航     | `Menu` `Breadcrumb` `Tabs` `Pagination` `Steps` `Dropdown`                                                           |
| 反馈     | `Modal` `Drawer` `message` `notification` `Spin` `Tooltip` `Popover` `Alert`                                         |
| 数据展示 | `Tag` `Badge` `Avatar` `Image` `Tree` `Timeline` `Empty` `Card` `Statistic` `List` `Progress` `Segmented` `Calendar` |
| 输入     | `Input` `Select` `DatePicker` `Switch` `Radio` `Checkbox`（在 SForm 外独立使用时）                                   |
| 其他     | `Result` `Skeleton` `ConfigProvider` `Upload`（在 SForm 外独立使用时）                                               |

> **核心原则**：sdesign 管 CRUD 四件套（STable/SForm/SButton/SDetail），antd 管其余一切。两者相辅相成，不是互斥关系。
>
> **AI 防幻觉提示**：不要臆造 sdesign 中不存在的组件（如 ~~SModal~~、~~SDrawer~~、~~STag~~、~~SMenu~~ 均不存在）。如果不确定 sdesign 是否提供某组件，查阅 `.ai/sdesign/components/` 目录。

### 导入规则

- 禁止 `import axios` -- 使用 `import { request } from '@/plugins/request'`
- 禁止 `any` 类型 -- 使用具体类型或泛型
- 类型导入使用 `import type { ... }`
- 路径使用 `@/` 或 `src/` 别名，禁止 `../../` 相对路径
- 状态管理使用 Zustand + immer，禁止 Redux

### 验证命令

```bash
pnpm verify        # tsc + eslint + prettier 全量检查
pnpm verify:fix    # eslint --fix + prettier --write 自动修复
pnpm lint          # 仅 eslint
pnpm type-check    # 仅 tsc
```

- `git commit` 自动运行 lint-staged（eslint + prettier）
- `git push` 自动运行 type-check

## 项目结构

```
src/
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
└── utils/                # 工具函数
```

## 开发工作流

```
理解需求 → 场景判定 → 强制预读 → 生成代码 → pnpm verify → 修复 → 重新 verify → 提交
```

### 步骤 1：理解需求意图

判断属于哪种场景（CRUD / 表单 / 详情 / 自定义），并确认目标文件是否在豁免范围内。

### 步骤 2：强制预读（不可跳过）

⚠️ **在生成任何代码之前，必须根据场景读取对应文档。跳过此步骤直接生成代码属于流程违规。**

| 场景                | 必须预读的文件                                                       |
| ------------------- | -------------------------------------------------------------------- |
| 新增 API 模块       | `.ai/guides/api-module.md`                                           |
| CRUD 列表页         | `.ai/guides/crud-page.md` → `.ai/sdesign/components/SSearchTable.md` |
| 表单页（新增/编辑） | `.ai/guides/form-page.md` → `.ai/sdesign/components/SForm.md`        |
| 详情页              | `.ai/guides/detail-page.md` → `.ai/sdesign/components/SDetail.md`    |
| 修改已有页面        | 先 Read 目标文件 + 关联 API，再判断是否需查阅 guide                  |
| 不确定时            | Read `.ai/core/architecture.md` + `.ai/core/coding-standards.md`     |

### 步骤 3：参考已有模式

新增模块时，先 `Glob src/api/*/index.ts` 和 `Glob src/pages/*/index.tsx`，读取一个已有的同类模块作为参考。

### 步骤 4：组件约束速查

在编写 JSX 之前，逐条对照以下检查清单：

- [ ] 目标文件是否在豁免目录（`login/`、`error/`、`layouts/`、`router/`）？
- [ ] 如果不在豁免目录：是否使用了 SForm 而非 antd Form？
- [ ] 如果不在豁免目录：是否使用了 SButton 而非 antd Button？
- [ ] 如果不在豁免目录：是否使用了 STable/SSearchTable 而非 antd Table？
- [ ] 导入路径是否使用 `@/` 或 `src/` 别名（禁止 `../../`）？

### 步骤 5：生成代码

### 步骤 6：自我修正协议

生成代码后 **必须** 执行验证循环：

1. 运行 `pnpm verify`
2. 解析错误输出，按优先级修复：**tsc 错误 > eslint 错误 > prettier 格式**
3. 重新 `pnpm verify`
4. 最多循环 3 次
5. 如果 3 轮后仍有错误，报告给用户

## 关键约定

### API 模块

- 文件：`src/api/{module}/types.ts` + `src/api/{module}/index.ts`
- 导出对象命名：`{module}Api`（如 `productApi`）
- 标准方法：`getList` / `getById` / `create` / `update` / `delete`
- 使用 `request.get/post/put/delete`，禁止直接 axios

### 页面组件

- 列表页首选 `SSearchTable`，需要更多控制时用 `STable` + `SForm.Search` + `useSearchTable`
- 表单页使用 `SForm`（items 配置式）
- 详情页使用 `SDetail`（items 配置式）
- 按钮使用 `SButton`（actionType 预设）

### 状态管理

- 服务端状态用 ahooks `useRequest`
- 客户端状态用 Zustand + immer + persist

## 深入参考（场景驱动，强制预读）

> ⚠️ **不是"按需查阅"，而是"场景匹配即必读"**。AI 在步骤 2 中必须根据场景读取对应文档，否则极易遗漏组件约束。

| 场景             | 必读文件                                     | 何时触发                     |
| ---------------- | -------------------------------------------- | ---------------------------- |
| sdesign 组件 API | `.ai/sdesign/components/` 下对应组件文档     | 使用任何 S\* 组件时          |
| 架构规范详情     | `.ai/core/architecture.md`                   | 新增模块/目录时              |
| 代码规范详情     | `.ai/core/coding-standards.md`               | 首次生成代码时建议通读       |
| 技术栈约束       | `.ai/core/tech-stack.md`                     | 引入新依赖时                 |
| API 设计约定     | `.ai/conventions/api-conventions.md`         | 新增 API 模块时              |
| 增量开发规范     | `.ai/conventions/incremental-development.md` | 修改已有模块时               |
| CRUD 页面指南    | `.ai/guides/crud-page.md`                    | 生成列表页时 **（强制）**    |
| 表单页面指南     | `.ai/guides/form-page.md`                    | 生成表单页时 **（强制）**    |
| 详情页面指南     | `.ai/guides/detail-page.md`                  | 生成详情页时 **（强制）**    |
| API 模块指南     | `.ai/guides/api-module.md`                   | 新增 API 模块时 **（强制）** |
