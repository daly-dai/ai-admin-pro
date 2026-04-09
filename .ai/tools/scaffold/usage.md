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

## 注意事项

- **配置生命周期**：`temp/scaffold/` 已 gitignore，配置用完即弃，不纳入版本管理
- **不匹配 scaffold 时**：需求超出场景能力（如可编辑表格、拖拽排序、复杂自定义布局等），由 AI 直接手写代码
