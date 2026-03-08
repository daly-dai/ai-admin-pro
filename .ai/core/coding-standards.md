# 代码规范

> AI生成代码时必须遵循的规范

## TypeScript规范

### 1. 类型定义

```typescript
// ✅ 正确：显式定义返回类型
const get[Entity] = async (id: string): Promise<[Entity]> => {
  return request.get(`/api/[module]/${id}`);
};

// ❌ 错误：隐式类型
const get[Entity] = async (id: string) => {
  return request.get(`/api/[module]/${id}`);
};
```

### 2. 接口命名规范

```typescript
// 实体类型命名模式
interface [Entity] {}              // 实体
interface [Entity]Query {}         // 查询参数
interface [Entity]FormData {}      // 表单数据
interface [Entity]ListItem {}      // 列表项

// 示例
interface Product {}
interface ProductQuery {}
interface ProductFormData {}
```

### 3. 类型导出

```typescript
// api/[module]/types.ts
export interface [Entity] {}
export type [Entity]Status = '[status1]' | '[status2]';

// api/[module]/index.ts
export type { [Entity], [Entity]Status } from './types';
```

## React组件规范

### 1. 组件结构

```typescript
import React, { useState, useCallback } from 'react';
import { Card, Button } from 'antd';
import { useRequest } from 'ahooks';
import { [module]Api } from '@api/[module]';
import type { [Entity] } from '@api/[module]/types';
import './index.css';

// 1. Props接口
interface [ComponentName]Props {
  [entity]: [Entity];
  on[Action]?: ([entity]: [Entity]) => void;
}

// 2. 组件实现
const [ComponentName]: React.FC<[ComponentName]Props> = ({ [entity], on[Action] }) => {
  // 3. State定义
  const [expanded, setExpanded] = useState(false);

  // 4. Hooks使用
  const { loading, run: handle[Action] } = useRequest([module]Api.[method], {
    manual: true,
  });

  // 5. 事件处理
  const handle[Action] = useCallback(() => {
    on[Action]?.([entity]);
  }, [on[Action], [entity]]);

  // 6. 渲染
  return (
    <Card className="[component-name]">
      {/* ... */}
    </Card>
  );
};

export default [ComponentName];
```

### 2. 组件命名规范

| 类型 | 命名模式 | 示例 |
|------|----------|------|
| 页面组件 | `PascalCase` + `Page` | `ProductPage`, `OrderPage` |
| 业务组件 | `PascalCase` | `ProductCard`, `OrderList` |
| 通用组件 | `PascalCase` | `DataTable`, `SearchForm` |
| Hooks | `use` + `PascalCase` | `useProductList`, `useOrderForm` |

### 3. 样式规范

```css
/* 组件样式文件：与组件同名 */
/* [ComponentName]/index.css */

/* 1. 使用BEM命名 */
.[component-name] {
}
.[component-name]__[element] {
}
.[component-name]--[modifier] {
}

/* 2. 避免全局样式污染 */
/* ❌ 不要这样 */
.card { }

/* ✅ 这样 */
.product-card { }
```

## API层规范

### 1. 模块组织

```typescript
// 按业务模块组织
api/
├── [moduleA]/      # 模块A（如: product, order）
│   ├── index.ts    # API实现
│   └── types.ts    # 类型定义
├── [moduleB]/      # 模块B
│   ├── index.ts
│   └── types.ts
└── index.ts        # 统一导出
```

### 2. API对象模式

```typescript
// ✅ 使用对象模式组织API
export const [module]Api = {
  getList: (params?: [Entity]Query) => {...},
  getById: (id: string) => {...},
  create: (data: [Entity]FormData) => {...},
  update: (id: string, data: Partial<[Entity]>) => {...},
  delete: (id: string) => {...},
};

// 使用
import { [module]Api } from '@api/[module]';
const { data } = useRequest([module]Api.getList);
```

### 3. 类型定义位置

```typescript
// 类型定义在 api/[module]/types.ts
// 不要在API文件中定义类型

// api/[module]/types.ts
export interface [Entity] {
  id: string;
  [fieldName]: [fieldType];
  status: [Entity]Status;
  createTime: string;
}

export type [Entity]Status = '[status1]' | '[status2]';

export interface [Entity]Query {
  page?: number;
  pageSize?: number;
  [filterField]?: [filterType];
}

export interface [Entity]FormData {
  [fieldName]: [fieldType];
  status: [Entity]Status;
}
```

## 状态管理规范

### 1. Store组织

```typescript
// stores/[domain].ts - 领域状态（如: product, order）
// stores/app.ts - 应用级状态
// stores/index.ts - 统一导出

// stores/index.ts
export { use[Domain]Store } from './[domain]';
export { useAppStore } from './app';
```

### 2. Store结构

```typescript
interface [Domain]State {
  // 1. State定义
  [data]: [DataType];
  loading: boolean;

  // 2. Computed（通过selector实现）
  // 不存储在store中，使用时计算

  // 3. Actions
  set[Data]: (data: [DataType]) => void;
  fetch[Data]: () => Promise<void>;
  reset: () => void;
}
```

## 导入导出规范

### 1. 导入顺序

```typescript
// 1. React相关
import React, { useEffect, useState } from 'react';
// 2. 第三方库
import { Button, Card } from 'antd';
import { useRequest } from 'ahooks';
// 3. 绝对路径（src/）
import { [module]Api } from 'src/api/[module]';
import type { [Entity] } from 'src/api/[module]/types';
import { use[Domain]Store } from 'src/stores';
// 4. 相对路径（./）
import [ComponentName] from './components/[ComponentName]';

import './index.css';
```

### 2. 导出模式

```typescript
// 默认导出（组件）
export default [ComponentName];

// 命名导出（API、Hooks、工具函数）
export const [module]Api = {...};
export const use[Entity]List = () => {...};

// 统一导出
export * from './[module]';
export * from './app';
```

## 错误处理规范

### 1. API错误

```typescript
// 统一在 request.ts 中处理
// 组件中只处理业务错误

const { run: submit } = useRequest([module]Api.create, {
  manual: true,
  onSuccess: () => {
    message.success('创建成功');
  },
  onError: (error) => {
    // 只处理需要特殊处理的错误
    if (error.code === '[ERROR_CODE]') {
      message.error('[错误提示]');
    }
  },
});
```

### 2. 表单验证

```typescript
<Form
  onFinish={async (values) => {
    try {
      await submit(values);
    } catch (error) {
      // 错误已在request层处理
    }
  }}
>
  <Form.Item
    name="[fieldName]"
    rules={[
      { required: true, message: '请输入[fieldLabel]' },
      { type: '[validationType]', message: '[验证失败提示]' },
    ]}
  >
    <Input />
  </Form.Item>
</Form>
```

## 注释规范

### 1. JSDoc注释

```typescript
/**
 * 获取[实体]列表
 * @param params 查询参数
 * @returns [实体]列表数据
 * @example
 * const { list, total } = await [module]Api.getList({ page: 1 });
 */
const getList = (params?: [Entity]Query): Promise<PageData<[Entity]>> => {...};
```

### 2. 代码注释

```typescript
// ✅ 解释"为什么"，而非"做什么"
// [业务原因说明]
const [result] = [operation]([data]);

// ❌ 不要注释显而易见的代码
// [显而易见的操作说明]
[operation]();
```

## 性能优化规范

### 1. 避免不必要的重渲染

```typescript
// ✅ 使用useMemo缓存计算结果
const filteredList = useMemo(() => {
  return list.filter((item) => item.[statusField] === '[activeValue]');
}, [list]);

// ✅ 使用useCallback缓存回调函数
const handle[Action] = useCallback(() => {
  on[Action](id);
}, [on[Action], id]);
```

### 2. 列表渲染优化

```typescript
// ✅ 使用key属性
{list.map(item => (
  <[ComponentName] key={item.id} [entity]={item} />
))}

// ✅ 大数据量使用虚拟列表
import { VirtualList } from '@components/common';
<VirtualList data={list} itemHeight={60} />
```
