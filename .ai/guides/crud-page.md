# CRUD 页面开发指南

## 决策点

- **标准列表** -> `SSearchTable`（一体化方案，首选）
- **需要更多控制** -> `STable` + `SForm.Search` + `useSearchTable`

## 文件结构

```
src/api/{module}/types.ts     — 类型定义（Entity, EntityQuery, EntityFormData）
src/api/{module}/index.ts     — API 实现（导出 {module}Api 对象）
src/pages/{module}/index.tsx  — 列表页
src/pages/{module}/create.tsx — 新增页
src/pages/{module}/edit.tsx   — 编辑页
```

## 必选组件

| 用途 | 组件                             | 来源              |
| ---- | -------------------------------- | ----------------- |
| 列表 | `SSearchTable` 或 `STable`       | `@dalydb/sdesign` |
| 搜索 | `SForm.Search`（配合 STable 时） | `@dalydb/sdesign` |
| 表单 | `SForm`（items 配置式）          | `@dalydb/sdesign` |
| 按钮 | `SButton`（actionType 预设）     | `@dalydb/sdesign` |
| 标题 | `STitle`                         | `@dalydb/sdesign` |

## 关键约定

- API 对象命名：`{module}Api`
- 5 个标准方法：`getList` / `getById` / `create` / `update` / `delete`
- SSearchTable 的 `requestFn` 直接传 `{module}Api.getList`
- `paginationFields` 配置分页字段映射
- 操作列使用 `SButton` + `actionType`（如 `edit`、`delete`）

## 完整 API 参考

使用 sdesign 组件时查阅：`.ai/core/sdesign-docs.md`
