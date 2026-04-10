# 架构规范

> AI必须理解并遵循的架构规范

## 技术栈（固定）

> ⚠️ 技术栈详情必须 读取 `.ai/core/tech-stack.md`

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

### 1. 组件规范（强制）

```typescript
// 1. 函数式组件 + TypeScript
import React from 'react';
import { /* antd components */ } from 'antd';

// 2. Props接口定义
interface ComponentNameProps {
  /** 属性说明 */
  propName: string;
}

// 3. 组件实现
const ComponentName: React.FC<ComponentNameProps> = ({ propName }) => {
  return <div>{propName}</div>;
};

export default ComponentName;
```

### 2. API层规范（强制）

API 模块采用 `types.ts`（类型定义）+ `index.ts`（API 对象）双文件结构，导出 `{module}Api` 对象，包含 5 个标准方法（getList/getById/create/update/delete）。

> 完整类型模板和 API 对象模板 → ⚠️ 接口合并/改造阶段必须 读取 `.ai/conventions/api-conventions.md`。

### 3. 状态管理规范（强制）

```typescript
// stores/[domain].ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface [Domain]State {
  // State
  [data]: [DataType] | null;
  [flag]: boolean | null;

  // Actions
  set[Data]: (data: [DataType] | null) => void;
  set[Flag]: (flag: [FlagType] | null) => void;
  reset: () => void;
}

export const use[Domain]Store = create<[Domain]State>()(
  persist(
    immer((set) => ({
      [data]: null,
      [flag]: null,
      set[Data]: (data) =>
        set((state) => {
          state.[data] = data;
        }),
      set[Flag]: (flag) =>
        set((state) => {
          state.[flag] = flag;
        }),
      reset: () =>
        set((state) => {
          state.[data] = null;
          state.[flag] = null;
        }),
    })),
    { name: '[domain]-store' },
  ),
);
```

### 4. 页面组件规范（强制）

管理后台列表页使用 `SSearchTable` 一体化组件，表单页使用 `SForm`，详情页使用 `SDetail`。

> 列表页骨架代码 → `.ai/core/coding-standards.md` 或 `.ai/templates/crud-page.md`
> ⚠️ 生成页面前必须 读取 对应模板；使用 sdesign 组件前必须 读取 对应组件文档

## 禁止事项

> 禁止规则 SSOT → `AGENTS.md` 硬约束 / `.ai/conventions/api-conventions.md`。本文件不重复定义。
