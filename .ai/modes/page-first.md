# 模式 B：page-first（页面先行）

> 用户有产品文档 / 原型图 / 口头描述，尚未有接口文档。**一次只生成一个页面 + 占位 API**，不做完整模块。

## 范围约束（重要）

> ⚠️ **page-first 每次只生成一个页面类型**（列表页 OR 表单页 OR 详情页），不在一次执行中生成完整 CRUD 模块。

| 用户请求范围                           | 正确模式       | 原因                                           |
| -------------------------------------- | -------------- | ---------------------------------------------- |
| 「先画个列表页」「出个表单页骨架」     | **page-first** | 单页面 + 占位 API，范围可控                    |
| 「根据产品文档做一整个模块」           | **full-sdd**   | 涉及多页面，需要 task 拆解 + 逐步验证          |
| 「根据文档先把列表页和表单页都画出来」 | **full-sdd**   | 多页面请求，即使没有接口也应走 full-sdd 的流程 |

**判断规则**：如果用户提供的产品文档涵盖了完整 CRUD 功能（列表 + 新增/编辑 + 详情），且用户未明确只要求其中某个页面，应向用户确认：

> 「您的文档涵盖了多个页面（列表/表单/详情），建议使用 full-sdd 模式逐步生成以确保质量。如果只需要先出某个页面的骨架，请告诉我优先生成哪个页面。」

**步骤**：

1. **读模板**：根据页面类型读取**对应的一个**模板
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
   - **只定义当前页面所需的接口方法**，不预生成其他页面的接口
6. **生成单个页面代码**：基于占位类型生成**用户指定的那一个页面**，严格使用 sdesign 组件
7. **验证**：`pnpm verify`，最多 3 轮修复

**约束**：

- **单页面原则**：一次执行只生成一个页面文件，禁止一口气生成列表+表单+详情
- 占位 API 的 URL 统一用 `'/api/TODO/{module}'` 前缀，方便后续全局替换
- 页面代码**必须符合硬约束**，不因为是临时代码就降低标准
- 不生成 spec.md / progress.md（信息不完整，写了也是占位）

> 🔒 **输出锁**：本模式仅允许创建 `src/api/{module}/types.ts`、`src/api/{module}/index.ts` 和**一个**页面文件（`src/pages/{module}/{pageName}.tsx`），禁止在一次执行中创建多个页面文件。
