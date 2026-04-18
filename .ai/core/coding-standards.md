# 代码规范

> AI 生成代码时的质量标准。组件约束、全局类型、导入规则 → 见 AGENTS.md 硬约束。

## TypeScript 规范

### 类型定义

```typescript
// 正确：泛型注解（返回类型由泛型自动推导，无需显式声明）
export const getListByGet = (params?: ProductQuery) =>
  productApi.get<PageData<Product>>('/api/product', { params });

// 错误：无泛型、无 HTTP 后缀、直接 axios
export const getList = async (params) => {
  return request.get('/api/product');
};
```

### 命名规范

| 对象     | 命名规则           | 示例              |
| -------- | ------------------ | ----------------- |
| 实体类型 | `{Entity}`         | `Product`         |
| 查询参数 | `{Entity}Query`    | `ProductQuery`    |
| 表单数据 | `{Entity}FormData` | `ProductFormData` |
| 接口方法 | `{name}By{HTTP}`   | `getListByGet`    |

#### 命名冲突处理

当实体类型名与 `src/types/` 下全局类型冲突时：

1. 使用模块前缀（如 `MgmtUser`、`SystemRole`）
2. 禁止重名覆盖
3. 生成前先 `Grep: export interface [EntityName]` 确认

### 未使用参数处理

```typescript
// 正确：未使用参数加 _ 前缀
render: (_, record) => <SButton onClick={() => edit(record.id)}>编辑</SButton>
render: (_text, _record, index) => index + 1

// 错误：不加前缀触发 no-unused-vars
render: (text, record) => <SButton onClick={() => edit(record.id)}>编辑</SButton>
```

### 类型导出

```typescript
// types.ts — 定义并导出
export interface Product {
  id: string;
  name: string;
}

// index.ts — import type 重导出
export type { Product, ProductStatus } from './types';
```

## React 组件规范

### 组件结构（按顺序）

```typescript
// 1. 导入（React → 第三方 → src/ 绝对路径 → ./ 相对路径 → 样式）
import React, { useRef } from 'react';
import { message } from 'antd';
import { useRequest } from 'ahooks';
import type { SColumnsType, SFormItems, SearchTableRef } from '@dalydb/sdesign';
import { SButton, SSearchTable } from '@dalydb/sdesign';
import { deleteByDelete, getListByGet } from 'src/api/[module]';
import type { [Entity] } from 'src/api/[module]/types';
import './index.css';

// 2. 组件声明
const [Module]Page: React.FC = () => {
  // 3. Ref / State
  const tableRef = useRef<SearchTableRef>(null);
  // 4. Hooks（API 调用必须用 useRequest）
  const { run: handleDelete } = useRequest(deleteByDelete, {
    manual: true, onSuccess: () => { message.success('删除成功'); tableRef.current?.refresh(); },
  });
  // 5. 配置（formItems / columns）
  // 6. 渲染
  return <SSearchTable ref={tableRef} requestFn={getListByGet} />;
};

// 7. 导出
export default [Module]Page;
```

### 组件命名

| 类型  | 命名模式              | 示例                                        |
| ----- | --------------------- | ------------------------------------------- |
| 页面  | `PascalCase` + `Page` | `ProductPage`                               |
| 容器  | `{Entity}{Layer}`     | `{Entity}FormModal`, `{Entity}DetailDrawer` |
| Hooks | `use` + `PascalCase`  | `useProductList`                            |

### 容器组件

容器组件封装 Modal/Drawer + 内容组件，内部管理 open/close 状态，通过 ref 暴露 `open()` 方法。

> 弹层封装原则 → `.ai/templates/crud-page.md`「弹层封装原则」

### 样式规范

BEM 命名，避免全局污染：`.product-card`（正确）vs `.card`（错误）

## API 层规范

```typescript
import { createRequest } from 'src/plugins/request';
import type { PageData } from 'src/types';
import type { Product, ProductFormData, ProductQuery } from './types';

const productApi = createRequest();

export const getListByGet = (
  params?: ProductQuery,
): Promise<PageData<Product>> =>
  productApi.get<PageData<Product>>('/api/TODO/product', { params });
export const getByIdByGet = (id: string): Promise<Product> =>
  productApi.get<Product>(`/api/TODO/product/${id}`);
export const createByPost = (data: ProductFormData): Promise<Product> =>
  productApi.post<Product>('/api/TODO/product', data);
export const updateByPut = (
  id: string,
  data: Partial<ProductFormData>,
): Promise<Product> => productApi.put<Product>(`/api/TODO/product/${id}`, data);
export const deleteByDelete = (id: string): Promise<void> =>
  productApi.delete<void>(`/api/TODO/product/${id}`);
```

> 完整 API 规范 SSOT → `.ai/conventions/api-conventions.md`

## 错误处理

API 错误由 `src/plugins/request/` 统一处理，组件中只处理业务错误。使用 `useRequest` 的 `onSuccess`/`onError` 回调。

## 禁止事项

> 硬约束规则 SSOT → `AGENTS.md` 第二节。API 调用规范 → `.ai/conventions/api-conventions.md`。
