# 架构规范

> AI必须理解并遵循的架构规范

## 技术栈

> 技术栈详情 → `.ai/core/tech-stack.md`

## 项目结构（强制）

```
src/
├── api/                   # API 层
│   └── [module]/         # 按模块组织（user/role/permission/dict）
│       ├── index.ts      # 模块 API（{module}Api = createRequest()）
│       └── types.ts      # 模块类型（Entity + EntityQuery + EntityFormData）
├── components/            # 组件层
│   ├── common/           # 通用业务组件（MacaronTag 等）
│   ├── [Name]/           # 独立封装组件（EChartsBase / DashboardGrid / ...）
│   └── index.ts          # 统一导出
├── layouts/               # 布局层
│   ├── components/       # 布局私有组件
│   ├── index.ts          # 统一导出
│   └── MainLayout.tsx    # 主布局
├── pages/                 # 页面层
│   ├── login/            # 登录页
│   ├── home/             # 首页
│   ├── error/            # 错误页（404）
│   └── system/           # 系统管理模块
│       └── [module]/     # user / role / permission / dict
│           ├── index.tsx # 页面组件
│           └── components/ # 页面私有组件（Modal 等）
├── plugins/              # 插件层
│   ├── index.ts          # 统一导出
│   └── request/          # HTTP 封装（createRequest）
├── router/                # 路由
│   ├── guards/           # 路由守卫（RequireAuth）
│   ├── routes/           # 路由配置（auth/error/index）
│   ├── utils/            # 懒加载工具（lazyPage）
│   └── index.tsx         # 主路由
├── stores/                # 状态管理（Zustand + persist）
│   ├── index.ts          # 统一导出
│   └── [store-name].ts   # app / user / dict
├── styles/                # 全局样式
│   └── global.css
├── types/                 # 全局类型（PageQuery / PageResult）
│   └── index.ts
├── utils/                 # 工具函数
│   └── index.ts          # 通用工具
└── main.tsx               # 应用入口
```

## 核心约定

### 1. 组件规范

函数式组件 + TypeScript，Props 接口独立定义。

> 详细组件结构 → `.ai/core/coding-standards.md`

### 2. API 层规范

API 模块采用 `types.ts`（类型定义）+ `index.ts`（API 方法）双文件结构，导出以 `{Entity}{action}By{HTTP}` 命名的标准方法（写操作一律 `ByPost`）。

> 完整类型模板和 API 对象模板 → `.ai/conventions/api-conventions.md`

### 3. 状态管理规范

使用 Zustand + persist，Store 接口定义 state + actions + reset。

> 完整模板 → `.ai/core/coding-standards.md`

### 4. 页面组件规范

列表页用 `SProTable`，表单页用 `SForm`，详情页用 `SDetail`。

> 代码模板 → `.ai/templates/crud-page.md`、`form-page.md`、`detail-page.md`
> 使用 sdesign 组件前必须读取对应组件文档

## 禁止事项

> 禁止规则 SSOT → `AGENTS.md` 硬约束 / `.ai/conventions/api-conventions.md`。本文件不重复定义。
