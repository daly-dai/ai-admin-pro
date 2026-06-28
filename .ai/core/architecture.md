# 架构规范

> AI必须理解并遵循的架构规范

## 技术栈

> 技术栈详情 → `.ai/core/tech-stack.md`

## 项目结构（强制）

```
src/
├── api/                   # API层
│   ├── index.ts          # 统一导出
│   └── [module]/         # 按模块组织
│       ├── index.ts      # 模块API
│       └── types.ts      # 模块类型
├── assets/               # 静态资源
│   ├── images/           # 图片资源
│   ├── fonts/            # 字体文件
│   └── icons/            # 图标资源
├── components/            # 组件层
│   ├── business/         # 业务组件
│   ├── common/           # 通用组件
│   └── layout/           # 布局组件
├── constants/            # 常量定义
│   ├── index.ts          # 统一导出
│   ├── enum.ts           # 枚举常量
│   └── config.ts         # 配置常量
├── hooks/                 # 自定义Hooks
│   └── index.ts          # 统一导出
├── layouts/               # 布局组件（复数命名）
│   ├── index.ts          # 统一导出
│   └── MainLayout.tsx    # 主布局
├── pages/                 # 页面层
│   └── [page-name]/      # 页面目录
│       ├── index.tsx     # 页面组件
│       └── components/   # 页面私有组件
├── plugins/              # 插件层
│   ├── index.ts          # 统一导出
│   ├── request/          # 请求插件（HTTP封装）
│   └── tracker/          # 埋点插件
├── router/                # 路由配置
│   ├── guards/            # 路由守卫目录
│   │   ├── RequireAuth.tsx  # 认证守卫
│   │   └── index.ts        # 守卫导出
│   ├── routes/            # 路由配置目录
│   │   ├── auth.tsx        # 认证相关路由
│   │   ├── error.tsx       # 错误页面路由
│   │   └── index.tsx       # 路由配置整合
│   ├── utils/             # 工具目录
│   │   └── index.tsx       # 懒加载工具
│   └── index.tsx          # 主路由配置
├── stores/                # 状态管理
│   ├── index.ts          # 统一导出
│   └── [store-name].ts   # 具体store
├── styles/                # 全局样式
│   └── global.css
├── types/                 # 全局类型
│   └── index.ts
└── utils/                 # 工具函数
    └── index.ts          # 通用工具
```

## 核心约定

### 1. 组件规范

函数式组件 + TypeScript，Props 接口独立定义。

> 详细组件结构 → `.ai/core/coding-standards.md`

### 2. API 层规范

API 模块采用 `types.ts`（类型定义）+ `index.ts`（API 对象）双文件结构，导出 `{module}Api` 对象，包含 5 个标准方法。

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
