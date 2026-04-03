# API 约定（唯一数据源）

> ⚠️ 本文件是 API 规范的**唯一权威来源（SSOT）**，其他文件引用本文件，不重复定义。
> 组件库文档参考: `.ai/sdesign/components/`

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

使用 `createRequest` 创建独立实例，支持对接不同后端服务：

| 配置          | 说明                                            | 默认值         |
| ------------- | ----------------------------------------------- | -------------- |
| `prefix`      | URL 前缀（baseURL）                             | `''`           |
| `codeKey`     | 状态码字段名，如 `code`、`returnCode`、`status` | `code`         |
| `successCode` | 成功状态码值，如 `200`、`0`、`true`             | `200`          |
| `dataKey`     | 数据字段名，用于解包，如 `data`、`result`       | `''`（不解包） |
| `msgKey`      | 消息字段名，如 `message`、`msg`                 | `message`      |
| `timeout`     | 超时时间（毫秒）                                | `30000`        |

## 接口定义格式

```yaml
module: [module_name] # 模块名（英文，如: product, order）
name: [模块中文名] # 模块名（中文，如: 商品管理）
basePath: /api/[module] # 基础路径（如: /api/products）
# 可选：多后端服务配置
config:
  prefix: /user-api       # URL 前缀
  codeKey: returnCode     # 状态码字段名
  successCode: 200        # 成功状态码值
  dataKey: result         # 数据字段名
  msgKey: msg             # 消息字段名

interfaces:
  - name: [method_name]By[HTTP] # 如: getListByGet, createByPost
    desc: [接口描述]
    method: [GET|POST|PUT|DELETE|PATCH]
    path: /api/[module]
    query: # 查询参数（可选）
      - name: [param_name]
        type: [string|number|boolean]
        required: [true|false]
        desc: [参数描述]
    params: # URL参数（可选）
      - name: [param_name]
        type: [string|number]
        required: [true|false]
    body: # 请求体（可选）
      - name: [field_name]
        type: [field_type]
        required: [true|false]
    response:
      type: [ReturnType] # 如: PageData<Entity>, Entity

types:
  [EntityName]: # 实体类型
    - name: [field_name]
      type: [field_type]
      desc: [字段描述]
```

## AI 生成规则

### 1. 类型定义生成 (api/[module]/types.ts)

```typescript
export type [Entity]Status = '[value1]' | '[value2]';

export interface [Entity] {
  id: string;
  [fieldName]: [fieldType];
  status: [Entity]Status;
  createTime: string;
}

export interface [Entity]Query {
  page?: number;
  pageSize?: number;
  [filterField]?: [filterType];
}

export interface [Entity]FormData {
  [fieldName]: [fieldType];
  status: [Entity]Status;
}
```

### 2. API 实现生成 (api/[module]/index.ts)

```typescript
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

export const updateByPut = (id: string, data: Partial<[Entity]FormData>) =>
  [module]Api.put<[Entity]>(`/[module]/${id}`, data);

export const deleteByDelete = (id: string) =>
  [module]Api.delete(`/[module]/${id}`);
```

### 3. 页面调用规范（useRequest）

> ⚠️ **阻断性要求**：所有页面中的 API 调用**必须**通过 `useRequest` 包装，禁止直接 `await api.xxx()` 手动管理 loading/data/error 状态。
> **唯一例外**：SSearchTable 的 `requestFn` 直接传 API 方法（组件内部已封装请求管理）。

#### 场景一：列表页

```tsx
import { useRequest } from 'ahooks';
import { getListByGet, deleteByDelete } from '@/api/[module]';

// 列表查询（SSearchTable 内部管理，不需要手动 useRequest）
// <SSearchTable requestFn={getListByGet} ... />

// 删除（手动触发）
const { run: handleDelete } = useRequest(deleteByDelete, {
  manual: true,
  onSuccess: () => {
    message.success('删除成功');
    actionRef.current?.reload();
  },
});
```

#### 场景二：新增表单页

```tsx
import { useRequest } from 'ahooks';
import { createByPost } from '@/api/[module]';

const { run: handleCreate, loading: submitLoading } = useRequest(createByPost, {
  manual: true,
  onSuccess: () => {
    message.success('创建成功');
    navigate(-1); // 或关闭弹窗
  },
});

// SForm onFinish 中调用
const onFinish = (values: [Entity]FormData) => {
  handleCreate(values);
};
```

#### 场景三：编辑表单页

```tsx
import { useRequest } from 'ahooks';
import { getByIdByGet, updateByPut } from '@/api/[module]';

// 加载详情数据（自动触发，ready 控制）
const { data: detail, loading: detailLoading } = useRequest(
  () => getByIdByGet(id!),
  { ready: !!id },
);

// 提交编辑（手动触发）
const { run: handleUpdate, loading: submitLoading } = useRequest(
  (values: Partial<[Entity]FormData>) => updateByPut(id!, values),
  {
    manual: true,
    onSuccess: () => {
      message.success('更新成功');
      navigate(-1);
    },
  },
);
```

#### 场景四：详情页

```tsx
import { useRequest } from 'ahooks';
import { getByIdByGet } from '@/api/[module]';

// 加载详情数据
const { data: detail, loading } = useRequest(() => getByIdByGet(id!), {
  ready: !!id,
});

// SDetail 中使用
// <SDetail dataSource={detail} items={items} loading={loading} />
```

#### 反模式（❌ 禁止）

```tsx
// ❌ 禁止：直接 await + 手动管理状态
const [loading, setLoading] = useState(false);
const [data, setData] = useState<[Entity]>();

useEffect(() => {
  setLoading(true);
  getByIdByGet(id).then(setData).finally(() => setLoading(false));
}, [id]);

// ❌ 禁止：在 onFinish 中直接 await
const onFinish = async (values: [Entity]FormData) => {
  await createByPost(values); // 没有 loading 控制、没有统一错误处理
  message.success('创建成功');
};
```

### useRequest 常用配置

| 配置            | 说明                                      |
| --------------- | ----------------------------------------- |
| `manual`        | 是否手动触发（写操作设为 true）           |
| `defaultParams` | 默认请求参数                              |
| `onSuccess`     | 成功回调                                  |
| `onError`       | 错误回调                                  |
| `refreshDeps`   | 依赖变化自动刷新                          |
| `ready`         | 是否就绪（false 时不发起请求，常用于 id） |

## 硬约束

- 使用 `import { createRequest } from '@/plugins/request'`，禁止直接 axios
- 使用 `import type` 导入类型
- 禁止 `any`，所有方法都需要泛型注解
- 添加 JSDoc 注释
- **方法名必须添加 HTTP 方法后缀**
- **页面中使用 useRequest**，避免手动定义 loading/data/error

## 字段类型映射

| 后端类型      | TypeScript类型 | SForm组件类型 | 备注     |
| ------------- | -------------- | ------------- | -------- |
| string        | string         | input         | 默认     |
| string (long) | string         | textarea      | 多行文本 |
| number        | number         | inputNumber   | 数字     |
| boolean       | boolean        | switch        | 开关     |
| date          | string         | datePicker    | 日期     |
| datetime      | string         | datePicker    | 日期时间 |
| enum          | string/number  | select        | 枚举     |
| array         | T[]            | checkbox      | 数组     |
| object        | Record         | -             | 对象     |

## API 签名冲突处理

当需求文档（spec.md）中定义的接口签名与本文件模板不一致时，遵循以下优先级：

1. **以 spec.md 需求文档为准** — spec.md 中的接口定义反映了后端实际设计
2. **在 spec.md 对应 Task 下标注偏离点** — 便于后续审查和维护
3. **常见偏离场景**：
   - getListByGet 使用 POST body 而非 GET query（复杂筛选条件）
   - 非标准方法名（如 `batchEnableByPost` 代替 `updateByPut`）
   - 分页参数命名不同（如 `current/size` 代替 `page/pageSize`）

## 特殊字段处理

### 1. 状态字段

```typescript
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
{
  title: '创建时间',
  dataIndex: 'createTime',
  valueType: 'dateTime',
  search: false,
}
```

### 3. 操作字段

```typescript
{
  title: '操作',
  valueType: 'option',
  render: (_, record) => [
    <Button key="edit">编辑</Button>,
    <Button key="delete" danger>删除</Button>,
  ],
}
```
