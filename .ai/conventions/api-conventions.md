# API 约定（SSOT）

## 命名约定

| 对象     | 规则               | 示例              |
| -------- | ------------------ | ----------------- |
| API对象  | `[module]Api`      | `productApi`      |
| 实体类型 | `[Entity]`         | `Product`         |
| 查询参数 | `[Entity]Query`    | `ProductQuery`    |
| 表单数据 | `[Entity]FormData` | `ProductFormData` |
| 接口方法 | `[name]By[HTTP]`   | `getListByGet`    |

## 方法命名规则

| HTTP   | 后缀       | 示例                  |
| ------ | ---------- | --------------------- |
| GET    | `ByGet`    | `getListByGet`        |
| POST   | `ByPost`   | `createByPost`        |
| PUT    | `ByPut`    | `updateByPut`         |
| DELETE | `ByDelete` | `deleteByDelete`      |
| PATCH  | `ByPatch`  | `updateStatusByPatch` |

## 多后端服务配置

| 配置          | 说明             | 默认值    |
| ------------- | ---------------- | --------- |
| `prefix`      | URL前缀          | `''`      |
| `codeKey`     | 状态码字段名     | `code`    |
| `successCode` | 成功状态码值     | `200`     |
| `dataKey`     | 数据字段名       | `''`      |
| `msgKey`      | 消息字段名       | `message` |
| `timeout`     | 超时时间（毫秒） | `30000`   |

## 接口定义格式

```yaml
module: [module_name]
name: [模块中文名]
basePath: /api/[module]
config: { prefix, codeKey, successCode, dataKey, msgKey }
interfaces:
  - name: [method_name]By[HTTP]
    desc: [接口描述]
    method: [GET|POST|PUT|DELETE|PATCH]
    path: /api/[module]
    query: [{ name, type, required }]
    params: [{ name, type, required }]
    body: [{ name, type, required }]
    response: { type: [ReturnType] }
types:
  [EntityName]: [{ name, type, desc }]
```

## AI 生成规则

> 生成模板 → `.ai/templates/api-module.md`

## useRequest 规范

> 必须用 `useRequest` 包装 API 调用，禁止手动 useState 管理 loading/data。

| 场景     | 模式                                                    | 模板参考       |
| -------- | ------------------------------------------------------- | -------------- |
| 列表查询 | SSearchTable `requestFn` 直传                           | crud-page.md   |
| 写操作   | `useRequest(apiFn, { manual: true, onSuccess })`        | crud-page.md   |
| 详情加载 | `useRequest(() => getByIdByGet(id!), { ready: !!id })`  | detail-page.md |
| 表单提交 | `useRequest(apiFn, { manual: true })` + onFinish 调 run | crud-page.md   |

### useRequest 常用配置

| 配置        | 说明                        |
| ----------- | --------------------------- |
| `manual`    | 手动触发（写操作设为 true） |
| `onSuccess` | 成功回调                    |
| `ready`     | 就绪控制（常用于 id）       |

## 硬约束

> 通用硬约束（no any / no axios / import type / src/ 路径）→ `AGENTS.md` 第二节。以下为 API 层特有约束：

- **方法名必须添加 HTTP 方法后缀**（`getListByGet` 等）
- 所有方法需要泛型注解（返回类型由泛型推导）
- 添加 JSDoc 注释
- 页面中使用 useRequest 包装 API 调用（详见上方 useRequest 规范）

## 字段类型映射

| 后端类型      | TS类型        | SForm组件   |
| ------------- | ------------- | ----------- |
| string        | string        | input       |
| string(long)  | string        | textarea    |
| number        | number        | inputNumber |
| boolean       | boolean       | switch      |
| date/datetime | string        | datePicker  |
| enum          | string/number | select      |
| array         | T[]           | checkbox    |

## API 签名冲突处理

- 以 spec.md 为准，在 Task 下标注偏离点

## 特殊字段处理

| 字段类型 | 关键配置                                            |
| -------- | --------------------------------------------------- |
| 状态     | `valueEnum: { key: { text, status } }`              |
| 时间     | `valueType: 'dateTime', search: false`              |
| 操作     | `valueType: 'option', render: (_, record) => [...]` |
