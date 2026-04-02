# 模式 B：page-first（页面先行）

> 用户有产品文档 / 原型图 / 口头描述，但没有接口文档。先出页面，后补接口。

**步骤**：

1. **读模板**：根据页面类型读取对应模板
   - 列表页 → `.ai/templates/crud-page.md`
   - 表单页 → `.ai/templates/form-designer.md`
   - 详情页 → `.ai/templates/detail-page.md`
2. **读错题集**：Read `.ai/pitfalls/index.md`，对照错题避免已知错误模式
3. **读 sdesign 组件文档**：根据页面类型 Read 对应组件文档（未读文档的组件禁止使用）
   - 列表页 → `SSearchTable.md` + `SButton.md`
   - 表单页 → `SForm.md` + `SButton.md`
   - 详情页 → `SDetail.md`
   - 用到其他 sdesign 组件 → 读对应 `.ai/sdesign/components/{组件名}.md`
4. **生成占位 API**：
   - `src/api/{module}/types.ts` — 根据描述定义临时类型，未确认字段加 `// TODO: 待接口确认`
   - `src/api/{module}/index.ts` — 方法签名完整，URL 用 `'/api/TODO/{module}'` 占位
5. **生成页面代码**：基于占位类型生成可渲染的页面，严格使用 sdesign 组件
6. **验证**：`pnpm verify`，最多 3 轮修复

**约束**：

- 占位 API 的 URL 统一用 `'/api/TODO/{module}'` 前缀，方便后续全局替换
- 页面代码**必须符合硬约束**，不因为是临时代码就降低标准
- 不生成 spec.md / progress.md（信息不完整，写了也是占位）

> 🔒 **输出锁**：本模式仅允许创建 `src/api/{module}/types.ts`、`src/api/{module}/index.ts` 和对应页面文件（`src/pages/{module}/*.tsx`），禁止创建其他文件。
