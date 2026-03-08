# 架构规范

> AI必须理解并遵循的架构规范

## 技术栈（固定）

```yaml
构建工具: RSBuild ^1.7.0
框架: React ^18.3.0 + TypeScript ^5.5.0
UI库: Ant Design ^5.29.3+ @dalydb/sdesign^1.2.2
状态管理: Zustand ^5.0.11 + immer ^10.1.0
路由: React Router ^6.26.0
HTTP: Axios ^1.7.0
Hooks: ahooks ^3.8.0
图表: Chart.js ^4.4.0 + react-chartjs-2 ^5.2.0 (轻量级)
图标: lucide-react ^0.400.0 + @ant-design/icons ^5.4.0
工具库: dayjs ^1.11.0, lodash-es ^4.17.0
```

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
│   │   ├── dashboard.tsx   # 仪表盘相关路由
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

```typescript
// api/[module]/types.ts - 类型定义（必须）
export interface [Entity] {
  id: string;
  [fieldName]: [fieldType];
}

export interface [Entity]Query {
  page?: number;
  pageSize?: number;
  [filterField]?: [filterType];
}

// api/[module]/index.ts - API实现
import type { PageData } from '@types';
import { request } from '@utils/request';
import type { [Entity], [Entity]Query } from './types';

export const [module]Api = {
  /** 获取[实体]列表 */
  getList: (params?: [Entity]Query) =>
    request.get<PageData<[Entity]>>('/api/[module]', { params }),

  /** 获取[实体]详情 */
  getById: (id: string) => request.get<[Entity]>(`/api/[module]/${id}`),

  /** 创建[实体] */
  create: (data: Omit<[Entity], 'id'>) => request.post<[Entity]>('/api/[module]', data),

  /** 更新[实体] */
  update: (id: string, data: Partial<[Entity]>) =>
    request.put<[Entity]>(`/api/[module]/${id}`, data),

  /** 删除[实体] */
  delete: (id: string) => request.delete(`/api/[module]/${id}`),
};
```

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

```typescript
// pages/[module]/index.tsx
import React from 'react';
import { [module]Api } from '@api/[module]';
import { SColumnsType, SFormItems, SSearchTable } from '@dalydb/sdesign';
import type { [Entity], [Entity]Query } from '@api/[module]/types';

const [Module]Page: React.FC = () => {

  // 搜索表单配置
  const formItems: SFormItems[] = [
    {
      label: '[字段标签]',
      name: '[fieldName]',
      type: '[input|select|...]',
    },
    // ...
  ];

  // 表格列配置
  const columns: SColumnsType = [
    {
      title: '[列标题]',
      dataIndex: '[fieldName]',
      width: 120,
    },
    // ...
  ];

  return (
    <SSearchTable
      headTitle={{
        children: '[页面标题]',
        desc: '[页面描述]',
      }}
      tableTitle={{
        children: '[表格标题]',
      }}
      requestFn={[module]Api.getList}
      options={{
        paginationFields: {
          current: 'current',
          pageSize: 'pageSize',
          total: 'total',
          list: 'list',
        },
      }}
      formProps={{
        items: formItems,
        columns: 3,
        showExpand: true,
        defaultExpand: false,
      }}
      tableProps={{
        columns,
        rowKey: 'id',
        scroll: { x: 1200 },
      }}
    />
  );
};

export default [Module]Page;
```

## 禁止事项

1. ❌ 不要使用 `any` 类型
2. ❌ 不要直接使用 `axios`，使用封装后的 `request`
3. ❌ 不要在组件内直接调用API，使用 `ahooks` 的 `useRequest`
4. ❌ 不要使用相对路径 `../../`，使用 `src/`
5. ❌ 不要直接修改Zustand状态，使用immer或set方法
