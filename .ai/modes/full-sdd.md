# 模式 E：full-sdd（完整 SDD）

> 从零搭建一个完整功能模块，信息完备。

**步骤**：

1. **拆解需求**：
   - Read `.ai/specs/template.md`
   - 按范围限定原则判断功能范围，创建 `specs/[feature]/spec.md` + `progress.md`
   - 拆解为独立 Task（一个 Task = 一个明确交付物）
   - 先数据后展示：API → 列表页 → 表单页 → 详情页

2. **逐 Task 执行**（循环）：
   - **预读**：根据 Task 类型读取对应模板（见下表）+ 页面类读取 API 数据源
   - **读 sdesign 组件文档**（页面类 Task 必选）：Read 页面中使用的所有 sdesign 组件文档（`.ai/sdesign/components/{组件名}.md`），未读文档的组件禁止使用
   - **读错题集**：Read `.ai/pitfalls/index.md`，对照错题避免已知错误模式
   - **生成代码**：按模板和数据源生成，遵循硬约束
   - **验证**：`pnpm verify` + 脑内自检硬约束
   - **更新进度**：specs/[feature]/progress.md 标记 🟢 或 🔴

| Task 类型   | 代码模板                       | 数据源                                                    |
| ----------- | ------------------------------ | --------------------------------------------------------- |
| api         | .ai/templates/api-module.md    | —                                                         |
| page-list   | .ai/templates/crud-page.md     | `src/api/{module}/types.ts` + `src/api/{module}/index.ts` |
| page-form   | .ai/templates/form-designer.md | `src/api/{module}/types.ts` + `src/api/{module}/index.ts` |
| page-detail | .ai/templates/detail-page.md   | `src/api/{module}/types.ts` + `src/api/{module}/index.ts` |
| component   | .ai/core/coding-standards.md   | —                                                         |
| store       | .ai/core/architecture.md       | —                                                         |
| refactor    | —                              | Read 目标文件 + 关联 API                                  |

> **页面类 Task 的数据源是硬依赖**：必须先读取已定义的 API 类型和方法签名。**禁止猜测接口签名**。

**补充预读（按需，非必读）**：

- 首次新增模块/目录 → Read `.ai/core/architecture.md`
- 页面交互模式决策 → 查阅 `.ai/templates/crud-page.md`「页面交互模式选择」章节
- 修改已有模块 → Read `.ai/conventions/incremental-development.md`

**会话交接**（仅跨会话中断时）：
按 `.ai/specs/session-template.md` 生成 session 文档。同一会话内连续执行多个 Task 不需要每个都生成。
