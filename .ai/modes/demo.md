# 阶段①：画 Demo

> 用户有 PRD/需求，尚无接口文档。生成 demo 页面 + 占位 API。

## 前置检查

开始前确认已获取 PRD/需求文档。缺 → 向用户索要。

## 范围判断

| 用户请求         | 执行方式                                                       |
| ---------------- | -------------------------------------------------------------- |
| 明确只要一个页面 | **单页面**：直接生成，不创建 spec.md/progress.md               |
| 文档涵盖多页面   | **多页面 Task 拆解**：创建 spec.md + progress.md，逐 Task 生成 |

> 多页面时向用户确认：「文档涵盖多个页面，我将按 Task 逐页面生成。如只需先出某个页面，请告知。」

## 核心步骤

1. **读模板**（根据页面类型选一个）：crud-page / form-page / detail-page
2. ⛔ **读组件文档**：涉及 SSearchTable / SForm / SButton / SDetail → 读对应组件文档
3. ⛔ **读错题集**：读 `.ai/pitfalls/index.md`
4. **生成占位 API**：`types.ts` + `index.ts`，URL 用 `'/api/TODO/{module}'` 占位，方法名带 HTTP 后缀
5. **生成页面代码**：按模板生成
6. **验证**：`pnpm verify`，最多 3 轮

## 约束

- 占位 API URL 统一 `'/api/TODO/{module}'`
- 单页面模式不生成 spec.md/progress.md
- 每个 Task = 一个页面，禁止单 Task 生成多个页面文件

## 输出锁

- **单页面**：🔒 `src/api/{module}/types.ts` + `index.ts` + 一个页面文件
- **多页面**：🔒 `src/api/{module}/` + `src/pages/{module}/*.tsx`（逐 Task）+ `specs/[feature]/`
