# 代码规范

> AI生成代码时必须遵循的规范

## sdesign 组件约束

> 🚫 **阻断性要求**：代码中每使用一个 sdesign 组件，**必须先 Read 该组件的文档**（`.ai/sdesign/components/{ComponentName}.md`）。
> **未读文档 = 禁止使用该组件。没有例外。**
>
> 常见需读文档：
>
> - `SSearchTable` → Read `.ai/sdesign/components/SSearchTable.md`
> - `SForm` → Read `.ai/sdesign/components/SForm.md`
> - `SButton` → Read `.ai/sdesign/components/SButton.md`
> - `SDetail` → Read `.ai/sdesign/components/SDetail.md`
> - `STable` → Read `.ai/sdesign/components/STable.md`
> - 其他 sdesign 组件同理，文档路径：`.ai/sdesign/components/{组件名}.md`
>
> ⚠️ **禁止凭记忆、猜测或参考其他 AI 生成的代码来使用 sdesign 组件的属性。文档是唯一可信来源。**

**豁免范围（仅限以下目录中的文件）**：src/pages/login/、src/pages/error/、src/pages/register/、src/layouts/、src/router/

这些属于基础设施代码，可直接使用 antd 组件。**不在上述目录中的业务页面，必须使用 sdesign 组件。**

### sdesign 与 antd 的关系

sdesign 管 CRUD 四件套（Table/Form/Button/Descriptions），antd 管其余一切。不要臆想 sdesign 不存在的组件（如 ~~SModal~~、~~SDrawer~~、~~STag~~），不确定时查阅 `.ai/sdesign/components/` 目录。

## 全局类型复用（禁止重复定义）

> 以下类型已在 `src/types/index.ts` 中全局定义，**禁止在模块 types.ts 中重新定义**。
> 响应拦截器已自动解包 `ApiResponse`，`request.get<T>()` 直接返回业务数据 `T`。

| 全局类型         | 用途                                     | 正确用法                                                    |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `PageData<T>`    | 分页响应结构                             | `request.get<PageData<Entity>>('/api/xxx', { params })`     |
| `PageQuery`      | 分页查询基类                             | `interface XxxQuery extends PageQuery { keyword?: string }` |
| `ApiResponse<T>` | 响应包装（拦截器已解包，API 层无需关心） | 不直接使用                                                  |
| `ApiError`       | 错误结构                                 | 不直接使用                                                  |

**模块 types.ts 只定义**：实体接口（`Entity`）、查询参数（`EntityQuery extends PageQuery`）、表单数据（`EntityFormData`）。

## TypeScript 规范

### 1. 类型定义

- 所有函数/方法必须显式定义返回类型，禁止隐式推断
- API 方法必须使用泛型注解（如 `Promise<Entity>`）

```typescript
// ✅ 正确：显式返回类型 + 泛型注解
export const getListByGet = (
  params?: ProductQuery,
): Promise<PageData<Product>> =>
  productApi.get<PageData<Product>>('/api/product', { params });

// ❌ 错误：无返回类型、无泛型
export const getList = async (params) => {
  return request.get('/api/product');
};
```

### 2. 命名规范

| 对象     | 命名规则           | 示例              |
| -------- | ------------------ | ----------------- |
| 实体类型 | `{Entity}`         | `Product`         |
| 查询参数 | `{Entity}Query`    | `ProductQuery`    |
| 表单数据 | `{Entity}FormData` | `ProductFormData` |
| 接口方法 | `{name}By{HTTP}`   | `getListByGet`    |

#### 命名冲突处理

当 API 模块的实体类型名与全局已有类型冲突时（如 `User` 与 `src/types/` 下的全局 `User` 类型），按以下规则处理：

1. **优先使用模块前缀** — 在 `api/[module]/types.ts` 中为实体类型添加模块前缀（如 `MgmtUser`、`SystemRole`）
2. **禁止重名覆盖** — 不可在 API 模块中定义与 `src/types/` 下同名的类型
3. **检查方法** — 生成类型前先 `Grep: export interface [EntityName]` 或 `Grep: export type [EntityName]` 确认全局无同名类型

### 3. 未使用参数处理

> 回调函数中未使用的参数必须加 `_` 前缀，ESLint 默认忽略以 `_` 开头的参数。

```typescript
// ✅ 正确：未使用的参数加 _ 前缀
render: (_, record) => <SButton onClick={() => edit(record.id)}>编辑</SButton>
render: (_text, _record, index) => index + 1
items.map((_item, index) => index)

// ❌ 错误：未使用的参数不加 _ 前缀，触发 no-unused-vars
render: (text, record) => <SButton onClick={() => edit(record.id)}>编辑</SButton>

// ❌ 错误：使用 void 或 eslint-disable 绕过
render: (text, record) => { void text; return ...; }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
render: (text, record) => ...
```

### 4. 类型导出

```typescript
// api/[module]/types.ts — 定义并导出类型
export interface Product {
  id: string;
  name: string;
}
export type ProductStatus = 'online' | 'offline';

// api/[module]/index.ts — 使用 import type 重导出
export type { Product, ProductStatus } from './types';
```

## React 组件规范

### 1. 组件结构

组件内部按以下顺序组织代码：

```typescript
// === 1. 导入 ===
import React, { useRef } from 'react';
import { message, Modal } from 'antd';
import { useRequest } from 'ahooks';
import type { SColumnsType, SFormItems, SearchTableRef } from '@dalydb/sdesign';
import { SButton, SSearchTable } from '@dalydb/sdesign';
import { deleteByDelete, getListByGet } from '@/api/[module]';
import type { [Entity] } from '@/api/[module]/types';

// === 2. 组件声明 ===
const [Module]Page: React.FC = () => {
  // === 3. Ref / State ===
  const tableRef = useRef<SearchTableRef>(null);

  // === 4. Hooks（API 调用必须用 useRequest 包装）===
  const { run: handleDelete } = useRequest(deleteByDelete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      tableRef.current?.refresh();
    },
  });

  // === 5. 配置（formItems / columns）===
  const formItems: SFormItems[] = [/* ... */];
  const columns: SColumnsType<[Entity]> = [/* ... */];

  // === 6. 渲染 ===
  return <SSearchTable ref={tableRef} requestFn={getListByGet} /* ... */ />;
};

// === 7. 导出 ===
export default [Module]Page;
```

### 2. 组件命名规范

| 类型     | 命名模式              | 示例                                        |
| -------- | --------------------- | ------------------------------------------- |
| 页面组件 | `PascalCase` + `Page` | `ProductPage`, `OrderPage`                  |
| 业务组件 | `PascalCase`          | `ProductCard`, `OrderList`                  |
| 通用组件 | `PascalCase`          | `DataTable`, `SearchForm`                   |
| 容器组件 | `{Entity}{Layer}`     | `{Entity}FormModal`, `{Entity}DetailDrawer` |
| Hooks    | `use` + `PascalCase`  | `useProductList`, `useOrderForm`            |

#### 容器组件说明

容器组件用于封装 Modal/Drawer + 内容组件，将弹层的 open/close 状态内部管理，通过 ref 暴露 `open()` 方法供外部调用。

| 场景        | 命名模式               | 职责                                |
| ----------- | ---------------------- | ----------------------------------- |
| Modal 表单  | `{Entity}FormModal`    | 封装 Modal + SForm，管理弹层状态    |
| Drawer 详情 | `{Entity}DetailDrawer` | 封装 Drawer + SDetail，管理抽屉状态 |

> ⚠️ 需要弹层组件时必须 Read `.ai/guides/crud-page.md`「弹层封装原则」章节。

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
.card {
}

/* ✅ 这样 */
.product-card {
}
```

## API 层规范

```typescript
// api/[module]/index.ts — 标准 API 模块结构
import { createRequest } from '@/plugins/request';
import type { PageData } from '@/types';
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

> ⚠️ 接口合并/改造阶段必须 Read `.ai/conventions/api-conventions.md`（API 规范唯一权威来源）。

## 导入导出规范

### 1. 导入顺序

```typescript
// 1. React相关
import React, { useEffect, useState } from 'react';
// 2. 第三方库
import { Button, Card } from 'antd';
import { useRequest } from 'ahooks';
// 3. 绝对路径（@/）
import { getListByGet } from '@/api/[module]';
import type { [Entity] } from '@/api/[module]/types';
import { use[Domain]Store } from '@/stores';
// 4. 相对路径（./）
import [ComponentName] from './components/[ComponentName]';

import './index.css';
```

### 2. 导出模式

```typescript
// 默认导出（组件）
export default [ComponentName];

// 命名导出（API、Hooks、工具函数）
export const use[Entity]List = () => {...};

// 统一导出
export * from './[module]';
```

## 错误处理规范

> API 错误由 `src/plugins/request/` 统一处理，组件中只处理业务错误。
> 使用 `useRequest` 的 `onSuccess` / `onError` 回调处理成功/失败。

## 注释规范

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
import { VirtualList } from '@/components/common';
<VirtualList data={list} itemHeight={60} />
```

## 禁止事项

1. ❌ 不要使用 `any` 类型
2. ❌ 不要直接使用 `axios`，使用封装后的 `createRequest`
3. ❌ 不要在组件内直接调用API，使用 `useRequest` 包装
4. ❌ 不要使用相对路径 `../../`，使用 `@/`
5. ❌ 不要直接修改Zustand状态，使用immer或set方法
