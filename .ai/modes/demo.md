# 阶段①：画 Demo

> 用户有 PRD/需求，尚无接口文档。生成 demo 页面 + 占位 API。

## 范围判断

| 用户请求         | 执行方式                                                       |
| ---------------- | -------------------------------------------------------------- |
| 明确只要一个页面 | **单页面**：直接生成，不创建 spec.md/progress.md               |
| 文档涵盖多页面   | **多页面 Task 拆解**：创建 spec.md + progress.md，逐 Task 生成 |

> 多页面时向用户确认：「文档涵盖多个页面，我将按 Task 逐页面生成。如只需先出某个页面，请告知。」

## 步骤

1. **读模板**：列表页→`templates/crud-page.md` | 表单页→`templates/form-page.md` | 详情页→`templates/detail-page.md`；多页面还需读 `specs/template.md` + `specs/progress-template.md`
2. **规范化 PRD**：Read `.ai/specs/prd-template.md`「AI 提取清单」，按 9 章提取，缺失标 `[?]`
3. **读错题集 + sdesign 文档**：Read `.ai/pitfalls/index.md` 匹配页面类型 → Read 对应 sdesign 组件文档（未读文档的组件禁止使用）
4. **生成占位 API**：
   - `src/api/{module}/types.ts` — 未确认字段加 `// TODO: 待接口确认`
   - `src/api/{module}/index.ts` — 方法名必须带 HTTP 后缀，URL 用 `'/api/TODO/{module}'` 占位
   - 单页面只定义当前页面所需接口；多页面一次性定义全部
5. **生成页面代码**：严格使用 sdesign 组件，逐 Task 生成（每 Task = 单页面）
6. **验证**：`pnpm verify`，最多 3 轮
7. **更新进度**（多页面必选）：每个 Task 验证通过后立即更新 progress.md，禁止批量更新

## 约束

- 占位 API URL 统一 `'/api/TODO/{module}'`
- 单页面模式不生成 spec.md/progress.md
- 每个 Task = 一个页面，禁止单 Task 生成多个页面文件

## 输出锁

- **单页面**：🔒 `src/api/{module}/types.ts` + `index.ts` + 一个页面文件
- **多页面**：🔒 `src/api/{module}/` + `src/pages/{module}/*.tsx`（逐 Task）+ `specs/[feature]/`

## 会话交接

多页面跨会话中断时按 `specs/session-template.md` 生成交接文档。
