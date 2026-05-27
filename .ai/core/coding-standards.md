# 代码规范

> AI 生成代码时的质量标准。组件约束、全局类型、导入规则 → 见 AGENTS.md 硬约束。

## 命名规范

| 对象     | 命名规则              | 示例                                      |
| -------- | --------------------- | ----------------------------------------- |
| 实体类型 | `{Entity}`            | `Product`                                 |
| 查询参数 | `{Entity}Query`       | `ProductQuery`                            |
| 表单数据 | `{Entity}FormData`    | `ProductFormData`                         |
| 接口方法 | `{name}By{HTTP}`      | `getListByGet`                            |
| 页面组件 | `PascalCase` + `Page` | `ProductPage`                             |
| 容器组件 | `{Entity}{Layer}`     | `ProductFormModal`, `ProductDetailDrawer` |
| Hooks    | `use` + `PascalCase`  | `useProductList`                          |

### 命名冲突处理

当实体类型名与 `src/types/` 下全局类型冲突时：使用模块前缀（如 `MgmtUser`、`SystemRole`），生成前先 `Grep: export interface [EntityName]` 确认。

## 未使用参数处理

```typescript
// 正确：未使用参数加 _ 前缀
render: (_, record) => <SButton onClick={() => edit(record.id)}>编辑</SButton>
render: (_text, _record, index) => index + 1

// 错误：不加前缀触发 no-unused-vars
render: (text, record) => <SButton onClick={() => edit(record.id)}>编辑</SButton>
```

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

## 样式规范

BEM 命名，避免全局污染：`.product-card`（正确）vs `.card`（错误）

## 错误处理

API 错误由 `src/plugins/request/` 统一处理，组件中只处理业务错误。使用 `useRequest` 的 `onSuccess`/`onError` 回调。

## 禁止事项

> 硬约束规则 SSOT → `AGENTS.md` 第二节。API 调用规范 → `.ai/conventions/api-conventions.md`。
