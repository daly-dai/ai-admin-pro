# 阶段①：画 Demo

> 用户有 PRD/需求，尚无接口文档。生成 demo 页面 + 占位 API。

## 范围判断

| 用户请求         | 执行方式                                                       |
| ---------------- | -------------------------------------------------------------- |
| 明确只要一个页面 | **单页面**：直接生成，不创建 spec.md/progress.md               |
| 文档涵盖多页面   | **多页面 Task 拆解**：创建 spec.md + progress.md，逐 Task 生成 |

> 多页面时向用户确认：「文档涵盖多个页面，我将按 Task 逐页面生成。如只需先出某个页面，请告知。」

## 步骤

1. **读模板文件**（根据页面类型选一个）：
   - 列表页 / CRUD → `.ai/templates/crud-page.md`
   - 表单页 → `.ai/templates/form-page.md`
   - 详情页 → `.ai/templates/detail-page.md`
   - 多页面还需读 `specs/template.md` + `specs/progress-template.md`
2. ⛔ **读组件文档**：涉及 SSearchTable / SForm / SButton / SDetail → 读 `.ai/sdesign/components/{组件名}.md`
3. ⛔ **读错题集**：读 `.ai/pitfalls/index.md`
4. **规范化 PRD**：Read `.ai/specs/prd-template.md`「AI 提取清单」，按 9 章提取，缺失标 `[?]`
5. **生成占位 API**：
   - `src/api/{module}/types.ts` — 未确认字段加 `// TODO: 待接口确认`
   - `src/api/{module}/index.ts` — 方法名必须带 HTTP 后缀，URL 用 `'/api/TODO/{module}'` 占位
   - 单页面只定义当前页面所需接口；多页面一次性定义全部
6. **生成页面代码**：按模板文件中的结构和规则生成，逐 Task 生成（每 Task = 单页面）
7. **验证**：`pnpm verify`，最多 3 轮
8. **更新进度**（多页面必选）：每个 Task 验证通过后立即更新 progress.md，禁止批量更新

## 约束

- 占位 API URL 统一 `'/api/TODO/{module}'`
- 单页面模式不生成 spec.md/progress.md
- 每个 Task = 一个页面，禁止单 Task 生成多个页面文件

## 分步执行模式（跨会话）

> Task ≥ 3 且模型上下文有限时使用。Session 1 在当前对话完成规划 + API，后续 Task 用脚本生成 prompt。

### 工作流

1. **Session 1**（当前对话）：PRD → spec.md + progress.md + API 模块（Task 1）
2. **Session 2..N**（新对话）：用户发送「执行 `pnpm task:prompt {feature}` 并根据输出生成代码」，AI 自行运行脚本并生成
3. **最终验证**（新对话）：全量 `pnpm verify` + 对照 spec.md 自检

> 脚本将 spec.md + 模板 + sdesign 文档 + 约束文件 + 已有源码组装成自包含上下文，AI 通过一条命令获取全部信息，无需逐个读取文件。

## 输出锁

- **单页面**：🔒 `src/api/{module}/types.ts` + `index.ts` + 一个页面文件
- **多页面**：🔒 `src/api/{module}/` + `src/pages/{module}/*.tsx`（逐 Task）+ `specs/[feature]/`
