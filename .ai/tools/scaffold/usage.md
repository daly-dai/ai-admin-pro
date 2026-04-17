# Scaffold 场景化生成指南

> 跨阶段工具能力。只要需求匹配下表任一场景，即可使用 scaffold 生成骨架代码，再由 AI 补充业务逻辑。

## 场景匹配表

| 需求描述                  | scene            | 生成内容                   | JSON 最小字段数 |
| ------------------------- | ---------------- | -------------------------- | --------------- |
| 新增弹框表单 / 独立表单页 | `form`           | FormModal 或 Create+Edit   | ~10 行          |
| 新增详情抽屉 / 详情页     | `detail`         | DetailDrawer 或 DetailPage | ~10 行          |
| 新增列表页                | `list`           | index.tsx (SSearchTable)   | ~20 行          |
| 只需类型定义              | `types`          | types.ts                   | ~8 行           |
| 只需 API 层               | `api`            | api/index.ts               | ~5 行           |
| 完整 CRUD（新模块冷启动） | `crud`（或省略） | 全部 5-6 个文件            | 完整配置        |

## 使用步骤

1. **匹配场景**：根据需求判断匹配的 scene（优先选最小场景，如只需表单就用 `form` 而非 `crud`）
2. **生成配置**：生成 `temp/scaffold/{module}.json`，必须包含 `"scene"` 字段（参考 `.ai/tools/scaffold/types.ts` 中对应的 `XxxSceneConfig` 接口）
3. **运行 scaffold**：`pnpm scaffold {module}`
4. **验证**：`pnpm verify`，修复生成代码中的类型错误（如有）
5. **定制业务逻辑**：在生成的骨架上补充 scaffold 无法覆盖的部分
6. **再次验证**：`pnpm verify`

## 配置示例

> 示例文件位于 `.ai/tools/scaffold/examples/`，覆盖从简单到复杂的典型场景。

| 示例文件           | 场景   | 演示特性                                                                                                                 |
| ------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `crud-simple.json` | `crud` | 基础 CRUD：modal 表单 + drawer 详情 + 枚举 + 搜索                                                                        |
| `crud-full.json`   | `crud` | 完整 CRUD：apiNames 自定义 + enums(含 entries) + extraApis + watchRules + 多分组详情 + page 表单 + 条件操作按钮 + 行选择 |
| `migration.json`   | `crud` | 迁移场景：apiNames 自定义 + enums(仅 name，无 entries)                                                                   |
| `scene-form.json`  | `form` | 单场景：仅生成 FormModal，配合 apiNames 部分覆盖                                                                         |
| `scene-list.json`  | `list` | 单场景：仅生成列表页，含 form/detail mode 导航提示                                                                       |

生成配置时参考对应示例的结构，类型定义见 `types.ts` 中各 `XxxSceneConfig` 接口。

## 注意事项

- **配置生命周期**：`temp/scaffold/` 已 gitignore，配置用完即弃，不纳入版本管理
- **不匹配 scaffold 时**：需求超出场景能力（如可编辑表格、拖拽排序、复杂自定义布局等），由 AI 直接手写代码

## 自定义 API 方法名（apiNames）

项目迁移时已有 API 函数名与 scaffold 默认名不匹配，可通过 `apiNames` 字段覆盖，写什么就生成什么。

### 默认值

| key       | 默认函数名       | 用途             |
| --------- | ---------------- | ---------------- |
| `getList` | `getListByGet`   | 分页列表查询     |
| `getById` | `getByIdByGet`   | 根据 ID 获取详情 |
| `create`  | `createByPost`   | 新增             |
| `update`  | `updateByPut`    | 编辑             |
| `delete`  | `deleteByDelete` | 删除             |

### 用法

在 JSON 配置中添加可选的 `apiNames` 对象，支持部分覆盖（未指定的 key 保持默认）：

```json
{
  "scene": "crud",
  "module": "order",
  "entity": "Order",
  "basePath": "/api/order",
  "apiNames": {
    "getList": "queryOrderPage",
    "getById": "getOrderDetail",
    "create": "addOrder",
    "update": "modifyOrder",
    "delete": "removeOrder"
  }
}
```

### 适用场景

- 除 `types` 外的所有场景均支持（`crud` / `api` / `list` / `form` / `detail`）
- 不写 `apiNames` = 完全向后兼容，行为不变

## 枚举数据（enums）

`enums` 数组中的 `entries` 是**可选的**。适用于下拉框数据从字典接口动态获取、PRD 只给出枚举名的场景。

### 行为对照

| entries 状态           | 生成结果                                                         | 适用场景                |
| ---------------------- | ---------------------------------------------------------------- | ----------------------- |
| 有 entries（非空数组） | 完整 MAP 常量 + keyof 类型                                       | 枚举值已知且固定        |
| 无 entries 或空数组    | `export const XXX_MAP: Record<string, string> = {};` + TODO 注释 | 迁移项目 / 字典接口获取 |

### 用法

只写 `name`，省略 `entries`：

```json
{
  "enums": [{ "name": "OrderStatus" }, { "name": "OrderType" }]
}
```

生成的 types.ts：

```ts
/** OrderStatus 映射（TODO: 补充枚举数据或接入字典接口） */
export const ORDER_STATUS_MAP: Record<string, string> = {};

export type OrderStatus = string;
```

生成的页面代码中 MAP 引用保持不变（select options / Tag render / dictMap），UI 降级显示原始值，开发者补充 MAP 数据后即恢复正常。
