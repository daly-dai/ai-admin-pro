# Prompt: 生成API模块

> 规范参考: `conventions/api-conventions.md`

## 使用方式

提供接口定义，AI生成完整API模块代码。

## 接口定义模板

```yaml
module: [module_name]           # 模块名（英文）
name: [模块中文名]              # 模块名（中文）
basePath: /api/[module]         # 基础路径

interfaces:
  - name: getList
    desc: 获取[实体]列表
    method: GET
    path: /api/[module]
    query:
      - name: [param_name]
        type: [string|number|boolean]
        required: [true|false]
    response:
      type: PageData<[Entity]>

  - name: getById
    desc: 获取[实体]详情
    method: GET
    path: /api/[module]/{id}
    params:
      - name: id
        type: string
        required: true
    response:
      type: [Entity]

types:
  [Entity]:
    - name: id
      type: string
    - name: [field_name]
      type: [field_type]
```

## 生成规范

### 文件结构
- `src/api/[module]/types.ts` - 类型定义（含JSDoc）
- `src/api/[module]/index.ts` - API实现（对象模式）

### 代码规范
- 所有接口添加JSDoc注释
- 类型定义完整，不使用any
- 统一使用 `request.get/post/put/delete`
- API对象命名为 `[module]Api`

## 快速示例

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

```typescript
// api/[module]/index.ts
export const [module]Api = {
  getList: (params?: [Entity]Query) =>
    request.get<PageData<[Entity]>>('/api/[module]', { params }),
  getById: (id: string) => request.get<[Entity]>(`/api/[module]/${id}`),
  create: (data: [Entity]FormData) => request.post<[Entity]>('/api/[module]', data),
  update: (id: string, data: Partial<[Entity]>) =>
    request.put<[Entity]>(`/api/[module]/${id}`, data),
  delete: (id: string) => request.delete(`/api/[module]/${id}`),
};
```
