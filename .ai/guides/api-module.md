# API 模块开发指南

> ⚠️ **前置条件**：在使用本指南生成代码之前，你必须已经完成以下步骤：
>
> 1. 阅读 `AGENTS.md` — 确认导入规则（禁止直接 axios，使用 `@/plugins/request`）
> 2. `Glob src/api/*/index.ts` — 确认模块名不冲突
> 3. Read 一个已有 API 模块 — 参考真实代码模式和命名约定

## 文件结构

```
src/api/{module}/types.ts  — 类型定义
src/api/{module}/index.ts  — API 实现
```

## 命名约定

| 对象     | 命名规则           | 示例              |
| -------- | ------------------ | ----------------- |
| API 对象 | `{module}Api`      | `productApi`      |
| 实体类型 | `{Entity}`         | `Product`         |
| 查询参数 | `{Entity}Query`    | `ProductQuery`    |
| 表单数据 | `{Entity}FormData` | `ProductFormData` |
| 接口方法 | `{name}By{HTTP}`   | `getListByGet`    |

## 方法命名规则

接口方法名必须添加 HTTP 方法后缀，明确标识请求类型：

| HTTP 方法 | 后缀       | 示例                  |
| --------- | ---------- | --------------------- |
| GET       | `ByGet`    | `getListByGet`        |
| POST      | `ByPost`   | `createByPost`        |
| PUT       | `ByPut`    | `updateByPut`         |
| DELETE    | `ByDelete` | `deleteByDelete`      |
| PATCH     | `ByPatch`  | `updateStatusByPatch` |

## 多后端服务配置

项目支持对接多个后端服务，每个服务可能返回不同的数据结构。使用 `createRequest` 创建独立实例：

```typescript
import { createRequest } from '@/plugins/request';

// 默认实例（向后兼容）
// import { request } from '@/plugins/request';

// 创建独立实例
export const {module}Api = createRequest({
  prefix: '/api/{module}',    // URL 前缀（baseURL）
  codeKey: 'code',            // 状态码字段名（根据后端调整）
  successCode: 200,           // 成功状态码值（根据后端调整）
  dataKey: '',                // 数据字段名（空则不解包）
  msgKey: 'message',          // 消息字段名（根据后端调整）
});
```

### 配置项说明

| 配置          | 说明                                            | 默认值         |
| ------------- | ----------------------------------------------- | -------------- |
| `prefix`      | URL 前缀（baseURL）                             | `''`           |
| `codeKey`     | 状态码字段名，如 `code`、`returnCode`、`status` | `code`         |
| `successCode` | 成功状态码值，如 `200`、`0`、`true`             | `200`          |
| `dataKey`     | 数据字段名，用于解包，如 `data`、`result`       | `''`（不解包） |
| `msgKey`      | 消息字段名，如 `message`、`msg`                 | `message`      |
| `timeout`     | 超时时间（毫秒）                                | `30000`        |

### 使用示例

```typescript
// 方法名必须添加请求类型后缀：ByGet、ByPost、ByPut、ByDelete、ByPatch
export const getListByGet = (params?: ProductQuery) =>
  productApi.get<PageData<Product>>('/product', { params });

export const getByIdByGet = (id: string) =>
  productApi.get<Product>(`/product/${id}`);

export const createByPost = (data: ProductFormData) =>
  productApi.post<Product>('/product', data);

export const updateByPut = (id: string, data: Partial<Product>) =>
  productApi.put<Product>(`/product/${id}`, data);

export const deleteByDelete = (id: string) =>
  productApi.delete(`/product/${id}`);

// 导出完整 API 对象
export { productApi };
```

## 硬约束

- 使用 `import { createRequest } from '@/plugins/request'`，禁止直接 axios
- 使用 `import type` 导入类型
- 禁止 `any`，所有方法都需要泛型注解
- 添加 JSDoc 注释
- **方法名必须添加 HTTP 方法后缀**：`ByGet`、`ByPost`、`ByPut`、`ByDelete`、`ByPatch`

## 接口定义格式

使用 YAML 定义接口，详见：`.ai/conventions/api-conventions.md`
