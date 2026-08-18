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

const {module}Api = createRequest({
  prefix: '/api/{module}',
  dataKey: 'data',            // 响应自动拆包
});
// 多后端服务配置见 `src/plugins/request`（RequestConfig 接口）
```

> 配置项说明 → `src/plugins/request/index.ts` 的 `RequestConfig` 接口

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
import type { PageResult } from 'src/types';

const {module}Api = createRequest({ prefix: '/api/{module}' });

export const get{Entity}ListByPost = (params?: {Entity}Query) =>
  {module}Api.post<PageResult<{Entity}>>('/list', params);

export const get{Entity}ByIdByGet = (id: string) =>
  {module}Api.get<{Entity}>(`/${id}`);

export const create{Entity}ByPost = (data: {Entity}FormData) =>
  {module}Api.post<{Entity}>('', data);

export const update{Entity}ByPost = (id: string, data: Partial<{Entity}FormData>) =>
  {module}Api.post<{Entity}>(`/${id}/update`, data);

export const delete{Entity}ByPost = (id: string) =>
  {module}Api.post<null>(`/${id}/delete`, { id });
```

## useRequest 用法

> 场景速查 SSOT → `.ai/conventions/api-conventions.md` §useRequest 规范
