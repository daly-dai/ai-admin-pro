# 阶段②：接口合并

> 用户提供 Swagger/接口文档，生成前端 API 层代码，有 PRD 时同步合并为功能规格书。

## 前置检查

开始前确认已获取 Swagger/接口文档。分支 A 额外确认已有 PRD。缺 → 向用户索要。

## 条件分支（自动检测）

```
收到 Swagger → 检查是否有可用 PRD
  ├─ 有 PRD → 分支 A: 完整合并（API + feature-spec）
  └─ 无 PRD → 分支 B: 仅生成 API 层
```

> 不确定时向用户确认：「是否有 PRD 需要一起合并？没有则仅生成 API 层代码。」

## 分支 A：完整合并（有 PRD）

1. 读模板：`api-module.md` + `api-conventions.md` + `feature-spec.md`
2. 检查已有 API：已存在→合并更新；不存在→创建
3. 解析 Swagger → 生成 types.ts + index.ts
4. **交叉对比**：字段匹配（精确→大小写→下划线/驼峰→语义）。差异分级：🔴 冲突→用户决策 | ⚠️ 需确认→AI 建议 | 🟢 自动→AI 处理。权威性：类型/路径/必填→Swagger | 功能/交互/规则→PRD
5. 输出 `feature-spec.md`，展示差异汇总，等待用户决策 🔴 项
6. 验证：`pnpm verify`

**约束**：🔴 项全部决策才算完成；⚠️ 项未决策按 AI 建议处理标 `[AI 默认]`

## 分支 B：仅生成 API 层（无 PRD）

1. 读模板：`api-module.md` + `api-conventions.md`
2. 检查已有 API → 解析 Swagger → 生成 types.ts + index.ts
3. 验证：`pnpm verify`
4. 告知用户：「API 层已生成。后续提供 PRD 可走完整合并流程。」

## 多轮机制（接口分批到达）

每批到达时：读已有 API → 追加新方法和类型 → 有 feature-spec 则更新。首轮 B 后续补充 PRD 则自动切换到 A。

## 输出锁

- **分支 A**：🔒 `src/api/{module}/types.ts` + `index.ts` + `specs/[feature]/feature-spec.md`
- **分支 B**：🔒 `src/api/{module}/types.ts` + `index.ts`
