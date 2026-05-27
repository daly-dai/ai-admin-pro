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

## 硬约束

> 通用硬约束（no any / no axios / import type / src/ 路径）→ `AGENTS.md` 第二节。

- **方法名必须添加 HTTP 方法后缀**（`getListByGet` 等）
- 所有方法需要泛型注解（返回类型由泛型推导）
- 添加 JSDoc 注释
- 页面中使用 useRequest 包装 API 调用
