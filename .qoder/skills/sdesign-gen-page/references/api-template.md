# API 模块代码模板

> 适用于所有页面类型（CRUD / 详情 / 表单）的接口层生成。

## 文件结构

```
src/api/{module}/types.ts  — 类型定义
src/api/{module}/index.ts  — API 实现
```

## 多后端服务配置

> 不同后端服务的响应结构可能不同，通过 `createRequest` 配置适配。

```typescript
import { createRequest } from 'src/plugins/request';

export const {module}Api = createRequest({
  prefix: '/api/{module}',    // URL 前缀
  codeKey: 'code',            // 状态码字段名
  successCode: 200,           // 成功状态码值
  dataKey: '',                // 数据字段名（空则不解包）
  msgKey: 'message',          // 消息字段名
});
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

> ⚠️ HTTP 方法名必须带后缀：`ByGet`/`ByPost`/`ByPut`/`ByDelete`。分页返回值用 `PageData<T>`。

```typescript
// src/api/{module}/index.ts
import { createRequest } from 'src/plugins/request';
// ✅ import type { Product, ProductQuery, ProductFormData } from './types';
import type { @FILL_Entity, @FILL_EntityQuery, @FILL_EntityFormData } from './types';
// ✅ import type { PageData } from 'src/types';
import type { PageData } from 'src/types';

/** @FILL: 配置 createRequest，根据后端服务调整 */
export const @FILL_moduleApi = createRequest({
  prefix: '@FILL: URL前缀',
  // 以下为默认值，如后端响应结构不同则修改
  // codeKey: 'code',
  // successCode: 200,
  // dataKey: '',
  // msgKey: 'message',
});

/** 分页列表查询 */
// ✅ 方法名 ByGet 后缀 + 返回 PageData<Entity>
export const getListByGet = (params?: @FILL_EntityQuery) =>
  @FILL_moduleApi.get<PageData<@FILL_Entity>>('@FILL: 列表路径', { params });

/** 根据 ID 查询详情 */
export const getByIdByGet = (id: string) =>
  @FILL_moduleApi.get<@FILL_Entity>(`@FILL: 详情路径/${id}`);

/** 新增 */
// ✅ 方法名 ByPost 后缀
export const createByPost = (data: @FILL_EntityFormData) =>
  @FILL_moduleApi.post<@FILL_Entity>('@FILL: 新增路径', data);

/** 编辑 */
// ✅ 方法名 ByPut 后缀
export const updateByPut = (id: string, data: Partial<@FILL_EntityFormData>) =>
  @FILL_moduleApi.put<@FILL_Entity>(`@FILL: 编辑路径/${id}`, data);

/** 删除 */
// ✅ 方法名 ByDelete 后缀
export const deleteByDelete = (id: string) =>
  @FILL_moduleApi.delete(`@FILL: 删除路径/${id}`);
```

### 按需裁剪

| 页面类型    | 必需方法                                        | 可选方法                                                        |
| ----------- | ----------------------------------------------- | --------------------------------------------------------------- |
| CRUD 列表页 | `getListByGet` + `deleteByDelete`               | `createByPost` + `updateByPut` + `getByIdByGet`（如有弹层编辑） |
| 详情页      | `getByIdByGet`                                  | —                                                               |
| 表单页      | `createByPost` + `updateByPut` + `getByIdByGet` | —                                                               |

> 不需要的方法直接删除，不要保留空实现。

---

## 特殊字段处理

| 字段类型 | 关键配置                                            |
| -------- | --------------------------------------------------- |
| 状态枚举 | `valueEnum: { key: { text, status } }`              |
| 时间日期 | `valueType: 'dateTime', search: false`              |
| 操作列   | `valueType: 'option', render: (_, record) => [...]` |
