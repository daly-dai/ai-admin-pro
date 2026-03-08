# API约定

> AI根据后端接口定义生成前端代码的约定
> 组件库文档参考: `.ai/core/sdesign-docs.md`

## 接口定义格式

```yaml
module: [module_name]       # 模块名（英文，如: product, order）
name: [模块中文名]          # 模块名（中文，如: 商品管理）
basePath: /api/[module]     # 基础路径（如: /api/products）

interfaces:
  - name: [method_name]     # 如: getList, getById, create
    desc: [接口描述]
    method: [GET|POST|PUT|DELETE]
    path: /api/[module]
    query:                  # 查询参数（可选）
      - name: [param_name]
        type: [string|number|boolean]
        required: [true|false]
        desc: [参数描述]
    params:                 # URL参数（可选）
      - name: [param_name]
        type: [string|number]
        required: [true|false]
    body:                   # 请求体（可选）
      - name: [field_name]
        type: [field_type]
        required: [true|false]
    response:
      type: [ReturnType]    # 如: PageData<Entity>, Entity

types:
  [EntityName]:             # 实体类型
    - name: [field_name]
      type: [field_type]
      desc: [字段描述]
```

## AI生成规则

### 1. 类型定义生成 (api/[module]/types.ts)

```typescript
// 枚举类型
export type [Entity]Status = '[value1]' | '[value2]';

// 实体接口
export interface [Entity] {
  id: string;
  [fieldName]: [fieldType];
  status: [Entity]Status;
  createTime: string;
}

// 查询参数
export interface [Entity]Query {
  page?: number;
  pageSize?: number;
  [filterField]?: [filterType];
}

// 表单数据
export interface [Entity]FormData {
  [fieldName]: [fieldType];
  status: [Entity]Status;
}
```

### 2. API实现生成 (api/[module]/index.ts)

```typescript
export const [module]Api = {
  getList: (params?: [Entity]Query) =>
    request.get<PageData<[Entity]>>('/api/[module]', { params }),
  getById: (id: string) => request.get<[Entity]>(`/api/[module]/${id}`),
  create: (data: [Entity]FormData) => request.post<[Entity]>('/api/[module]', data),
  update: (id: string, data: Partial<[Entity]FormData>) =>
    request.put<[Entity]>(`/api/[module]/${id}`, data),
  delete: (id: string) => request.delete(`/api/[module]/${id}`),
};
```

### 3. 页面组件生成

使用 @dalydb/sdesign 组件库：

```tsx
// 列表页
<SSearchTable
  headTitle={{ children: '[模块名称]' }}
  requestFn={[module]Api.getList}
  formProps={{ items: searchItems, columns: 3 }}
  tableProps={{ columns, rowKey: 'id' }}
/>

// 表单页
<SForm items={formItems} columns={2} onFinish={handleSubmit} />

// 详情页
<SDetail title="[详情标题]" dataSource={data} items={detailItems} column={2} />
```

> 完整组件 Props 定义请参考: `node_modules/@dalydb/sdesign/ai/llms.txt`

## 字段类型映射

| 后端类型      | TypeScript类型 | SForm组件类型        | 备注     |
| ------------- | -------------- | -------------------- | -------- |
| string        | string         | input                | 默认     |
| string (long) | string         | textarea             | 多行文本 |
| number        | number         | inputNumber          | 数字     |
| boolean       | boolean        | switch               | 开关     |
| date          | string         | datePicker           | 日期     |
| datetime      | string         | datePicker           | 日期时间 |
| enum          | string/number  | select               | 枚举     |
| array         | T[]            | checkbox             | 数组     |
| object        | Record         | -                    | 对象     |

## 特殊字段处理

### 1. 状态字段

```typescript
// 自动生成valueEnum
{
  title: '状态',
  dataIndex: 'status',
  valueEnum: {
    active: { text: '启用', status: 'Success' },
    inactive: { text: '禁用', status: 'Default' },
  },
}
```

### 2. 时间字段

```typescript
// 自动使用dateTime类型
{
  title: '创建时间',
  dataIndex: 'createTime',
  valueType: 'dateTime',
  search: false,
}
```

### 3. 操作字段

```typescript
// 自动生成操作列
{
  title: '操作',
  valueType: 'option',
  render: (_, record) => [
    <Button key="edit">编辑</Button>,
    <Button key="delete" danger>删除</Button>,
  ],
}
```
