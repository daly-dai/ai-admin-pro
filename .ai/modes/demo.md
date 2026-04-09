# 阶段①：画 Demo

> 用户有 PRD/需求，尚无接口文档。生成 demo 页面 + 占位 API。

## 范围判断

| 用户请求         | 执行方式                                                       |
| ---------------- | -------------------------------------------------------------- |
| 明确只要一个页面 | **单页面**：直接生成，不创建 spec.md/progress.md               |
| 文档涵盖多页面   | **多页面 Task 拆解**：创建 spec.md + progress.md，逐 Task 生成 |

> 多页面时向用户确认：「文档涵盖多个页面，我将按 Task 逐页面生成。如只需先出某个页面，请告知。」

## 路径选择（进入步骤前先判断）

```
PRD 到达 → 需求匹配标准 CRUD 场景？
              ├─ 是 → 🚀 Scaffold 路径（路径 A）
              └─ 否 → 📝 手动生成路径（路径 B）
```

### 路径 A：Scaffold 路径

> 读取 `.ai/tools/scaffold/usage.md`，按其中的场景匹配表和步骤执行。

### 路径 B：手动生成路径

> 当需求超出 scaffold 场景能力（如可编辑表格、拖拽排序、复杂自定义布局等），走下方原有步骤。

## 步骤（路径 B）

1. **读模板**：列表页→`templates/crud-page.md` | 表单页→`templates/form-page.md` | 详情页→`templates/detail-page.md`；多页面还需读 `specs/template.md` + `specs/progress-template.md`
2. **规范化 PRD**：Read `.ai/specs/prd-template.md`「AI 提取清单」，按 9 章提取，缺失标 `[?]`
3. **读错题集 + sdesign 文档**：读取 `.ai/pitfalls/index.md` 匹配页面类型 → 读取 对应 sdesign 组件文档（未读文档的组件禁止使用）
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
