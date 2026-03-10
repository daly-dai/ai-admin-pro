# API 模块开发指南

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

## 5 个标准方法

```typescript
export const {module}Api = {
  getList: (params?: {Entity}Query) =>
    request.get<PageData<{Entity}>>('/api/{module}', { params }),
  getById: (id: string) =>
    request.get<{Entity}>(`/api/{module}/${id}`),
  create: (data: {Entity}FormData) =>
    request.post<{Entity}>('/api/{module}', data),
  update: (id: string, data: Partial<{Entity}>) =>
    request.put<{Entity}>(`/api/{module}/${id}`, data),
  delete: (id: string) =>
    request.delete(`/api/{module}/${id}`),
};
```

## 硬约束

- 使用 `import { request } from '@/plugins/request'`，禁止直接 axios
- 使用 `import type` 导入类型
- 禁止 `any`，所有方法都需要泛型注解
- 添加 JSDoc 注释

## 接口定义格式

使用 YAML 定义接口，详见：`.ai/conventions/api-conventions.md`
