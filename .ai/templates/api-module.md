# Prompt: 生成API模块

> 规范参考: `conventions/api-conventions.md`
> **更新：支持多后端服务配置 + ahooks useRequest**，详见 `.ai/guides/api-module.md`

## 使用方式

提供接口定义，AI生成完整API模块代码。

## 接口定义模板

```yaml
module: [module_name] # 模块名（英文）
name: [模块中文名] # 模块名（中文）
basePath: /api/[module] # 基础路径
# 可选：多后端服务配置（不写则使用默认实例）
config:
  prefix: /user-api # URL 前缀
  codeKey: returnCode # 状态码字段名
  successCode: 200 # 成功状态码值
  dataKey: result # 数据字段名
  msgKey: msg # 消息字段名

interfaces:
  - name: getListByGet
    desc: 获取[实体]列表
    method: GET
    path: /api/[module]
    query:
      - name: [param_name]
        type: [string|number|boolean]
        required: [true|false]
    response:
      type: PageData<[Entity]>

  - name: getByIdByGet
    desc: 获取[实体]详情
    method: GET
    path: /api/[module]/{id}
    params:
      - name: id
        type: string
        required: true
    response:
      type: [Entity]

  - name: createByPost
    desc: 创建[实体]
    method: POST
    path: /api/[module]
    body:
      - name: [field_name]
        type: [field_type]
    response:
      type: [Entity]

  - name: updateByPut
    desc: 更新[实体]
    method: PUT
    path: /api/[module]/{id}
    params:
      - name: id
        type: string
        required: true
    body:
      - name: [field_name]
        type: [field_type]
    response:
      type: [Entity]

  - name: deleteByDelete
    desc: 删除[实体]
    method: DELETE
    path: /api/[module]/{id}
    params:
      - name: id
        type: string
        required: true
    response:
      type: void

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
- `src/api/[module]/index.ts` - API实现（独立方法模式）

### 代码规范

- 所有接口添加JSDoc注释
- 类型定义完整，不使用any
- 使用 `createRequest` 创建请求实例
- 导出独立方法 + `[module]Api` 对象
- 方法名必须添加请求类型后缀：`ByGet`、`ByPost`、`ByPut`、`ByDelete`、`ByPatch`
- 根据后端服务配置 codeKey、successCode、dataKey、msgKey

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

// 多后端服务配置（创建独立实例）
export const [module]Api = createRequest({
  prefix: '/[module]',
  codeKey: 'code',               // 根据实际后端调整
  successCode: 200,              // 根据实际后端调整
  dataKey: '',                   // 如需解包，填写字段名
  msgKey: 'message',             // 根据实际后端调整
});

// 方法名必须添加请求类型后缀：ByGet、ByPost、ByPut、ByDelete、ByPatch
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

### 页面中使用（推荐 useRequest）

```typescript
import { useRequest } from 'ahooks';
import { getListByGet, createByPost, deleteByDelete } from '@/api/[module]';

// 列表查询（自动处理 loading、error、data）
const { data, loading, refresh } = useRequest(getListByGet, {
  defaultParams: [{ page: 1, pageSize: 10 }],
});

// 创建
const { run: handleCreate } = useRequest(createByPost, {
  manual: true,
  onSuccess: () => {
    message.success('创建成功');
    refresh(); // 刷新列表
  },
});

// 删除
const { run: handleDelete } = useRequest(deleteByDelete, {
  manual: true,
  onSuccess: () => {
    message.success('删除成功');
    refresh();
  },
});
```
