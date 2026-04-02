# Prompt: 生成 API 模块

> **规范 SSOT**：`.ai/conventions/api-conventions.md`
> 命名约定、方法命名规则、类型定义模板、字段映射、硬约束均以 SSOT 为准。

## 使用方式

提供接口定义，AI 生成完整 API 模块代码。

## 接口定义模板

> 完整 YAML 格式定义 → 见 `.ai/conventions/api-conventions.md`「接口定义格式」

## 生成规范

- `src/api/[module]/types.ts` — 类型定义（含 JSDoc）
- `src/api/[module]/index.ts` — API 实现（独立方法模式）
- 代码规范 → 见 `.ai/conventions/api-conventions.md`「硬约束」

## 快速示例

### types.ts

```typescript
// api/[module]/types.ts
export interface [Entity] {
  id: string;
  [fieldName]: [fieldType];
  createTime: string;
}

export interface [Entity]Query {
  page?: number;
  pageSize?: number;
}

export interface [Entity]FormData {
  [fieldName]: [fieldType];
}
```

### index.ts

```typescript
// api/[module]/index.ts
import { createRequest } from '@/plugins/request';

export const [module]Api = createRequest({
  prefix: '/[module]',
  codeKey: 'code',
  successCode: 200,
  dataKey: '',
  msgKey: 'message',
});

export const getListByGet = (params?: [Entity]Query) =>
  [module]Api.get<PageData<[Entity]>>('/[module]', { params });

export const getByIdByGet = (id: string) =>
  [module]Api.get<[Entity]>(`/[module]/${id}`);

export const createByPost = (data: [Entity]FormData) =>
  [module]Api.post<[Entity]>('/[module]', data);

export const updateByPut = (id: string, data: Partial<[Entity]>) =>
  [module]Api.put<[Entity]>(`/[module]/${id}`, data);

export const deleteByDelete = (id: string) =>
  [module]Api.delete(`/[module]/${id}`);
```

### 页面中使用

> 使用 useRequest，详见 `.ai/guides/api-module.md`「页面中使用」

```typescript
import { useRequest } from 'ahooks';
import { getListByGet, createByPost, deleteByDelete } from '@/api/[module]';

const { data, loading, refresh } = useRequest(getListByGet, {
  defaultParams: [{ page: 1, pageSize: 10 }],
});

const { run: handleCreate } = useRequest(createByPost, {
  manual: true,
  onSuccess: () => {
    message.success('创建成功');
    refresh();
  },
});

const { run: handleDelete } = useRequest(deleteByDelete, {
  manual: true,
  onSuccess: () => {
    message.success('删除成功');
    refresh();
  },
});
```
