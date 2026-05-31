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

---

## Swagger / 接口文档 → 合并规则

> 当 Swagger/接口文档到达时，与已有 PRD 或已有代码合并。

### 差异分级

| 级别   | 符号 | 含义                                 | 处理                 |
| ------ | ---- | ------------------------------------ | -------------------- |
| 冲突   | 🔴   | Swagger 和已有定义对同一事物定义不同 | **暂停，等用户决策** |
| 需确认 | ⚠️   | Swagger 有、已有定义缺失，或反之     | AI 建议 → 用户可覆盖 |
| 一致   | 🟢   | 两者一致                             | 自动纳入             |

### 权威规则（冲突时以谁为准）

| 维度                          | 权威来源                             | 原因             |
| ----------------------------- | ------------------------------------ | ---------------- |
| 字段类型、枚举值              | Swagger/后端SDD                      | 后端实现数据库   |
| API路径、HTTP方法             | Swagger/后端SDD                      | 后端暴露接口     |
| 必填/可选                     | Swagger/后端SDD                      | 后端强制约束     |
| 页面清单、功能范围            | 产品PRD                              | 产品定义用户需求 |
| 交互模式（Modal/页面/Drawer） | 产品PRD                              | 产品定义UX       |
| 业务规则（校验/流转）         | 产品PRD（交互）+ 后端SDD（数据约束） | 互相校验         |

### 多轮机制

接口分批到达时：读已有 API → 追加新方法和类型。接口未到时用占位 URL `/api/TODO/{module}`。
