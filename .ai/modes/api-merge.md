# 阶段②：接口合并

> 用户提供 Swagger/接口文档，生成前端 API 层代码，有 PRD 时同步合并为功能规格书。

## 条件分支（自动检测）

```
收到 Swagger → 检查是否有可用 PRD
  ├─ 有 PRD → 分支 A: 完整合并（API + feature-spec）
  └─ 无 PRD → 分支 B: 仅生成 API 层
```

> 不确定时向用户确认：「是否有 PRD 需要一起合并？没有则仅生成 API 层代码。」

## 分支 A：完整合并流程（有 PRD）

1. **读模板**：`templates/api-module.md` + `conventions/api-conventions.md` + `templates/feature-spec.md` + `specs/prd-template.md`
2. **检查已有 API**：`src/api/{module}/` 已存在→合并更新；不存在→创建
3. **解析 Swagger**：识别格式 → 提取实体/接口/参数 → 对齐 api-conventions
4. **生成/更新 API 层**：types.ts（真实类型）+ index.ts（方法名带 HTTP 后缀）
5. **交叉对比**：
   - 字段匹配：精确 → 大小写忽略 → 下划线/驼峰互转 → 语义匹配（<80%需标注）
   - 差异分级：🔴 冲突→必须用户决策 | ⚠️ 需确认→AI 建议 | 🟢 自动→AI 处理
   - 权威性：类型/路径/必填→Swagger | 功能/交互/规则→PRD
6. **输出 feature-spec**：`specs/[feature]/feature-spec.md`，展示差异汇总，等待用户决策 🔴 项
7. **验证**：按 `conventions/verification.md` 执行 Level 1 + Level 2，报错先查 `pitfalls/verify-errors.md`

**约束**：🔴 项全部决策才算完成；⚠️ 项未决策按 AI 建议处理标 `[AI 默认]`

## 分支 B：仅生成 API 层（无 PRD）

1. **读模板**：`templates/api-module.md` + `conventions/api-conventions.md`
2. **检查已有 API** → **解析 Swagger** → **生成/更新 API 层**（同分支 A 步骤 2-4）
3. **验证**：按 `conventions/verification.md` 执行 Level 1 + Level 2，报错先查 `pitfalls/verify-errors.md`
4. **告知用户**：「API 层已生成。后续提供 PRD 可走完整合并流程。」

## 多轮机制（接口分批到达）

每批到达时：读已有 API → 追加新方法和类型 → 有 feature-spec 则更新 → 标注完成度。
首轮 B 后续补充 PRD 则自动切换到 A。

## 大文档降级

接口 > 30 个时建议分批处理；用户拒绝则仅走分支 B 控制复杂度。

## 输出锁

- **分支 A**：🔒 `src/api/{module}/types.ts` + `index.ts` + `specs/[feature]/feature-spec.md`
- **分支 B**：🔒 `src/api/{module}/types.ts` + `index.ts`
