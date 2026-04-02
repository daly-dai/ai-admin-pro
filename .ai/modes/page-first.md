# 模式 B：page-first（页面先行）

> 用户有产品文档 / 原型图 / 口头描述，**尚未有接口文档，也未通过 api-gen 生成接口代码**。先出页面骨架，后补接口。

## 与 full-sdd 的区分（重要）

| 条件                                     | 选择模式                     |
| ---------------------------------------- | ---------------------------- |
| 只有 PRD/原型图，没有任何接口信息        | **page-first**               |
| 已有 PRD + 已通过 api-gen 生成了接口代码 | **full-sdd**                 |
| 已有 PRD + Swagger 接口文档              | **spec-gen** 或 **full-sdd** |

> ⚠️ **如果 `src/api/{module}/` 下已存在 `types.ts` 和 `index.ts`，说明接口代码已生成，应使用 full-sdd 模式而非 page-first。page-first 的核心价值是在接口未知时生成占位 API + 页面骨架，如果接口已有，占位 API 步骤就是多余的。**

**步骤**：

1. **读模板**：根据页面类型读取对应模板
   - 列表页 → `.ai/templates/crud-page.md`
   - 表单页 → `.ai/templates/form-designer.md`
   - 详情页 → `.ai/templates/detail-page.md`
2. **读错题集**：Read `.ai/pitfalls/index.md`，按「适用场景」匹配当前页面类型，将匹配的核心规则作为硬性约束执行。不确定时再按需 Read 对应详情文件
3. **读 API 命名规范**：Read `.ai/conventions/api-conventions.md`，占位 API 的方法名也必须遵循 `{name}By{HTTP}` 命名规则
4. **读 sdesign 组件文档**：根据页面类型 Read 对应组件文档（未读文档的组件禁止使用）
   - 列表页 → `SSearchTable.md` + `SButton.md`
   - 表单页 → `SForm.md` + `SButton.md`
   - 详情页 → `SDetail.md`
   - 用到其他 sdesign 组件 → 读对应 `.ai/sdesign/components/{组件名}.md`
5. **生成占位 API**：
   - `src/api/{module}/types.ts` — 根据描述定义临时类型，未确认字段加 `// TODO: 待接口确认`
   - `src/api/{module}/index.ts` — **方法名必须使用 `{name}By{HTTP}` 后缀**（如 `getListByGet`、`createByPost`），URL 用 `'/api/TODO/{module}'` 占位
6. **生成页面代码**：基于占位类型生成可渲染的页面，严格使用 sdesign 组件
   - **对照错题集逐条检查**：确保不出现 P001（弹层状态泄漏到列表页）、P002（误用 SForm type='table' 做可编辑表格）、P003（render 回调未使用的参数缺少 `_` 前缀）等已知错误
7. **验证**：`pnpm verify`，最多 3 轮修复

**约束**：

- 占位 API 的 URL 统一用 `'/api/TODO/{module}'` 前缀，方便后续全局替换
- **占位 API 的方法名仍需遵循命名规范**（`getListByGet`、`createByPost` 等），不因占位而降低命名标准
- 页面代码**必须符合硬约束**，不因为是临时代码就降低标准
- 不生成 spec.md / progress.md（信息不完整，写了也是占位）

> 🔒 **输出锁**：本模式仅允许创建 `src/api/{module}/types.ts`、`src/api/{module}/index.ts` 和对应页面文件（`src/pages/{module}/*.tsx`），禁止创建其他文件。
