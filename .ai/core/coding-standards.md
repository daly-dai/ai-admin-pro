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

### 语义化命名

> ⛔ 变量名必须自解释——读名字就知道它是什么，不需要看上下文猜。以下**直接禁止**：

#### 禁止缩写

除以下**白名单**外，所有缩写一律展开为完整单词：

> `id` `url` `api` `ctx` `req` `res` `err` `props` `ref` `dom` `ui` `db` `io` `max` `min` `len`

```typescript
// ❌ 禁止
const usr = user;
const btn = <Button />;
const cfg = { ... };
const dt = new Date();
const vl = data.value;
const nm = user.name;

// ✅ 正确
const user = currentUser;
const button = <Button />;
const config = { ... };
const date = new Date();
const value = data.value;
const name = user.name;
```

#### 禁止拼音

```typescript
// ❌ 禁止
const shuju = response.data;
const yonghu = currentUser;
const zhuangtai = 'active';

// ✅ 正确
const data = response.data;
const user = currentUser;
const status = 'active';
```

#### 禁止编号命名

```typescript
// ❌ 禁止
const item1 = list[0];
const data2 = secondResult;
const typeA = primaryType;

// ✅ 正确
const firstItem = list[0];
const secondResult = alternateData;
const primaryType = preferredType;
```

#### 禁止无意义占位

```typescript
// ❌ 禁止
const foo = calculate();
const bar = fetchUsers();
const baz = transform(data);
const temp = currentValue;
const tmp = intermediateState;

// ✅ 正确
const total = calculate();
const users = fetchUsers();
const transformed = transform(data);
const currentValue = input;
const intermediateState = pending;
```

#### 禁止回调参数缩写

```typescript
// ❌ 禁止
users.map((u) => u.name);
items.filter((i) => i.active);
onChange((e) => e.target.value);
useEffect((s) => s.fetch());

// ✅ 正确
users.map((user) => user.name);
items.filter((item) => item.active);
onChange((event) => event.target.value);
useEffect((store) => store.fetch());
```

#### 禁止布尔值无前缀

```typescript
// ❌ 禁止
const active = true;
const visible = false;
const loading = isLoading;

// ✅ 正确
const isActive = true;
const isVisible = false;
const isLoading = loading;
```

> ⚠️ 例外：`_`（未使用参数）、`i`/`j`/`k`（循环下标）。数组回调参数用完整单数名：`users.map((user) => ...)`。

### 命名冲突处理

当实体类型名与 `src/types/` 下全局类型冲突时：使用模块前缀（如 `MgmtUser`、`SystemRole`），生成前先 `Grep: export interface [EntityName]` 确认。

## 可读性约束

> ⛔ 以下 5 条是全局硬约束，所有 Lane、所有模板通用。生成代码时必须遵守。

| #   | 规则                  | 反例                                     | 正例                                                              |
| --- | --------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| R1  | 禁止 else 嵌套        | `if(a){...}else{if(b){...}else{...}}`    | 用 early return：`if(!a) return; if(!b) return; ...`              |
| R2  | 禁止 JSX 内 transform | `{data.filter(x=>x.ok).map(x=><Card/>)}` | 提到 JSX 外赋给语义化变量：`const visibleData = data.filter(...)` |
| R3  | 单文件单组件          | 一个文件 `export` 两个以上组件           | 一个文件 `export default` 一个组件 + 最多一个辅助组件             |
| R4  | 逻辑函数 ≤ 40 行      | 80 行含条件/循环/变换的 useEffect        | 提取 `fetchData()`、`renderChart()` 等子函数                      |
| R5  | 复杂逻辑必须注释      | 正则后面无说明                           | `// WHY: 匹配 ISO 8601 且允许毫秒省略`                            |

> ⚠️ R4 例外：纯声明式配置不计入 40 行。ECharts `option`、Table `columns`、Form `items` 是数据声明，不含控制流，行数由数据量决定。

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
