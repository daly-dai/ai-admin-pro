# API 模块代码模板

> 适用于所有页面类型（CRUD / 详情 / 表单）的接口层生成。
> 规范 SSOT：`{project}/.ai/conventions/api-conventions.md`

## 文件结构

```
src/api/{module}/types.ts  — 类型定义
src/api/{module}/index.ts  — API 实现
```

## 多后端服务配置

> 不同后端服务的响应结构可能不同，通过 `createRequest` 配置适配。

```typescript
import { createRequest } from 'src/plugins/request';

const {module}Api = createRequest({
  prefix: '/api/{module}',
  dataKey: 'data',            // 响应自动拆包
});
// codeKey='code' / successCode=200 / msgKey='message' 为默认值，无需显式配置
```

| 配置          | 说明             | 默认值    |
| ------------- | ---------------- | --------- |
| `prefix`      | URL前缀          | `''`      |
| `codeKey`     | 状态码字段名     | `code`    |
| `successCode` | 成功状态码值     | `200`     |
| `dataKey`     | 数据字段名       | `''`      |
| `msgKey`      | 消息字段名       | `message` |
| `timeout`     | 超时时间（毫秒） | `30000`   |

---

## 填空模板：types.ts

> ⚠️ 类型导入必须用 `import type`，禁止 `import { X }` 导入纯类型。

```typescript
// src/api/{module}/types.ts
// ✅ import type { PageQuery } from 'src/types';
// ❌ import { PageQuery }（纯类型必须用 import type）
import type { PageQuery } from 'src/types';

/** @FILL: 实体类型 — 字段从需求/Swagger 中提取 */
export interface @FILL_Entity {
  id: string;
  // @FILL: 业务字段，示例:
  // name: string;
  // status: number;
  // description?: string;
  createTime: string;
  updateTime: string;
}

/** @FILL: 查询参数 — 仅包含搜索条件字段 */
// ✅ extends PageQuery（内置 pageNum/pageSize）
export interface @FILL_EntityQuery extends PageQuery {
  // @FILL: 搜索字段（全部可选），示例:
  // keyword?: string;
  // status?: number;
}

/** @FILL: 表单数据 — 仅包含可写字段（不含 id/createTime 等只读字段） */
export interface @FILL_EntityFormData {
  // @FILL: 可写字段，示例:
  // name: string;        // 必填字段不加 ?
  // description?: string; // 可选字段加 ?
  // status: number;
}
```

---

## 填空模板：api/index.ts

> ⚠️ **命名**：`{Entity}{动作}By{HTTP}`，**必须带实体前缀**——`get{Entity}ListByPost`，不是 `getListByPost`。
> ⚠️ **本项目后端统一 POST**：列表 / 搜索 / 新增 / 更新 / 删除全部走 POST；`ByGet` 只用于只读单条 / 辅助查询。
> **禁止 `ByPut` / `ByDelete` / `ByPatch`**——后端不提供对应 HTTP 方法，用了会与真实代码脱节。
> 分页返回值用全局类型 `PageResult<T>`（**不是 `PageData`**）。权威规则 → `.ai/conventions/api-conventions.md`

```typescript
// src/api/{module}/index.ts
import { createRequest } from 'src/plugins/request';
// ✅ import type { Product, ProductFormData } from './types';
import type { @FILL_Entity, @FILL_EntityFormData } from './types';
// ✅ import type { PageQuery, PageResult } from 'src/types';
import type { PageQuery, PageResult } from 'src/types';

// 与 src/api/{user,role,permission,dict}/index.ts 一致：createRequest() 无参，每次调用写全路径
const @FILL_moduleApi = createRequest();

/** 分页列表查询（POST） */
export const get{Entity}ListByPost = (query: PageQuery = {}) =>
  @FILL_moduleApi.post<PageResult<@FILL_Entity>>('/api/@FILL_module/list', query);

// @FILL: 需要模糊搜索时取消注释（types.ts 的 {Entity}Query extends PageQuery）
// export const search{Entity}ByPost = (query: @FILL_EntityQuery) =>
//   @FILL_moduleApi.post<PageResult<@FILL_Entity>>('/api/@FILL_module/search', query);

/** 按 ID 查单条（GET —— 全项目仅此一处走 GET） */
export const get{Entity}ByIdByGet = (id: number) =>
  @FILL_moduleApi.get<@FILL_Entity>(`/api/@FILL_module/${id}`);

/** 新增（POST） */
export const create{Entity}ByPost = (data: @FILL_EntityFormData) =>
  @FILL_moduleApi.post<null>('/api/@FILL_module', data);

/** 更新（POST；id 放 body，不是路径参数） */
export const update{Entity}ByPost = (
  data: @FILL_EntityFormData & { id: number },
) => @FILL_moduleApi.post<null>('/api/@FILL_module/update', data);

/** 删除（POST；id 放 body，不是路径参数） */
export const delete{Entity}ByPost = (id: number) =>
  @FILL_moduleApi.post<null>('/api/@FILL_module/delete', { id });
```

### 按需裁剪

| 页面类型    | 必需方法                                                                 | 可选方法                                                                                 |
| ----------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| CRUD 列表页 | `get{Entity}ListByPost` + `delete{Entity}ByPost`                         | `create{Entity}ByPost` + `update{Entity}ByPost` + `get{Entity}ByIdByGet`（如有弹层编辑） |
| 详情页      | `get{Entity}ByIdByGet`                                                   | —                                                                                        |
| 表单页      | `create{Entity}ByPost` + `update{Entity}ByPost` + `get{Entity}ByIdByGet` | —                                                                                        |
| 查询列表页  | `get{Entity}ListByPost`                                                  | —                                                                                        |

> 不需要的方法直接删除，不要保留空实现。

---

## 字段类型映射

| 后端类型      | TS 类型       | SForm 控件  |
| ------------- | ------------- | ----------- |
| string        | string        | input       |
| string(long)  | string        | textarea    |
| number        | number        | inputNumber |
| boolean       | boolean       | switch      |
| date/datetime | string        | datePicker  |
| enum          | string/number | select      |
| array         | T[]           | checkbox    |
