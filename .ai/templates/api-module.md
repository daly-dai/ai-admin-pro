# API 模块代码模板

> 规范 SSOT：`.ai/conventions/conventions.md` §二

## 文件结构

```
src/api/{module}/types.ts  — 类型定义
src/api/{module}/index.ts  — API 实现
```

## 多后端服务配置

```typescript
import { createRequest } from 'src/plugins/request';

const {module}Api = createRequest({
  prefix: '/api/{module}',
  dataKey: 'data',            // 响应自动拆包
});
// 多后端服务配置 → `.ai/conventions/conventions.md` §二
```

> 配置项说明 → `.ai/conventions/conventions.md` §二「多后端服务配置」

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

const {module}Api = createRequest({ prefix: '/api/{module}' });

export const get{Entity}ListByGet = (params?: {Entity}Query) =>
  {module}Api.get<PageData<{Entity}>>('', { params });

export const get{Entity}ByIdByGet = (id: string) =>
  {module}Api.get<{Entity}>(`/${id}`);

export const create{Entity}ByPost = (data: {Entity}FormData) =>
  {module}Api.post<{Entity}>('', data);

export const update{Entity}ByPut = (id: string, data: Partial<{Entity}FormData>) =>
  {module}Api.put<{Entity}>(`/${id}`, data);

export const delete{Entity}ByDelete = (id: string) =>
  {module}Api.delete(`/${id}`);
```

## useRequest 用法

> 场景速查 SSOT → `.ai/conventions/conventions.md` §二「useRequest 规范」
