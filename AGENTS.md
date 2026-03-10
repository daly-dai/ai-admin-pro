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

> 基础设施代码（login、error、layouts、router）不受此限制，可直接使用 antd 组件。

### 导入规则

- 禁止 `import axios` -- 使用 `import { request } from '@/plugins/request'`
- 禁止 `any` 类型 -- 使用具体类型或泛型
- 类型导入使用 `import type { ... }`
- 路径使用 `@/` 别名，禁止 `../../` 相对路径
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
理解需求 → 按需查阅 guides/ → 生成代码 → pnpm verify → 修复 → 重新 verify → 提交
```

1. 理解需求意图，判断属于哪种场景（CRUD / 表单 / 详情 / 自定义）
2. 按需查阅 `.ai/guides/` 下对应指南
3. 生成代码
4. 运行 `pnpm verify`
5. 解析 tsc / eslint / prettier 错误并修复
6. 重新 `pnpm verify`（最多 3 轮循环）
7. 提交代码

## 自我修正协议

生成代码后 **必须** 执行以下验证循环：

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

## 深入参考（按需查阅，不要预读）

| 场景             | 文件                                         |
| ---------------- | -------------------------------------------- |
| sdesign 组件 API | `.ai/core/sdesign-docs.md`                   |
| 架构规范详情     | `.ai/core/architecture.md`                   |
| 代码规范详情     | `.ai/core/coding-standards.md`               |
| 技术栈约束       | `.ai/core/tech-stack.md`                     |
| API 设计约定     | `.ai/conventions/api-conventions.md`         |
| 增量开发规范     | `.ai/conventions/incremental-development.md` |
| CRUD 页面指南    | `.ai/guides/crud-page.md`                    |
| 表单页面指南     | `.ai/guides/form-page.md`                    |
| 详情页面指南     | `.ai/guides/detail-page.md`                  |
| API 模块指南     | `.ai/guides/api-module.md`                   |
