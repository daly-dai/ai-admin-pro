# API 模块代码模板

> 规范 SSOT：`.ai/conventions/api-conventions.md`

## 文件结构

```
src/api/{module}/types.ts  — 类型定义
src/api/{module}/index.ts  — API 实现
```

## 多后端服务配置

```typescript
import { createRequest } from 'src/plugins/request';

export const {module}Api = createRequest({
  prefix: '/api/{module}',    // URL 前缀
  codeKey: 'code',            // 状态码字段名
  successCode: 200,           // 成功状态码值
  dataKey: '',                // 数据字段名（空则不解包）
  msgKey: 'message',          // 消息字段名
});
```

> 配置项说明 → `.ai/conventions/api-conventions.md`「多后端服务配置」

## 快速示例

### types.ts

```typescript
export interface {Entity} {
  id: string;
  // ...fields
  createTime: string;
}

export interface {Entity}Query extends PageQuery {
  keyword?: string;
}

export interface {Entity}FormData {
  // ...writable fields
}
```

### index.ts

```typescript
import { createRequest } from 'src/plugins/request';
import type { {Entity}, {Entity}Query, {Entity}FormData } from './types';
import type { PageData } from 'src/types';

export const {module}Api = createRequest({ prefix: '/{module}', ... });

export const getListByGet = (params?: {Entity}Query) =>
  {module}Api.get<PageData<{Entity}>>('/{module}', { params });

export const getByIdByGet = (id: string) =>
  {module}Api.get<{Entity}>(`/{module}/${id}`);

export const createByPost = (data: {Entity}FormData) =>
  {module}Api.post<{Entity}>('/{module}', data);

export const updateByPut = (id: string, data: Partial<{Entity}FormData>) =>
  {module}Api.put<{Entity}>(`/{module}/${id}`, data);

export const deleteByDelete = (id: string) =>
  {module}Api.delete(`/{module}/${id}`);
```

## useRequest 用法

> 场景速查 SSOT → `.ai/conventions/api-conventions.md`「useRequest 规范」
