# 阶段②：接口合并

> **阶段定位**：开发生命周期的第二站。用户提供了 Swagger / 接口文档，需要生成前端 API 层代码，并在有 PRD 时同步合并为功能规格书。

---

## 条件分支检测（自动，无需用户选择）

```
收到 Swagger / 接口文档
  │
  ├─ 检查是否存在可用 PRD
  │   │  检查来源（按优先级）：
  │   │  1. 用户本次消息中同时提供了 PRD / 产品文档
  │   │  2. 阶段①的规范化 PRD 产出（用户提及或 AI 可确认）
  │   │  3. specs/{feature}/ 下已有 PRD 相关文件
  │   │
  │   ├─ 存在 → 分支 A: 完整合并流程
  │   │
  │   └─ 不存在 → 分支 B: 仅生成 API 层
```

> **不确定时**：向用户确认「是否有产品文档/PRD 需要一起合并？如果没有，我将仅生成 API 层代码。」

---

## 分支 A：完整合并流程（有 PRD）

> 同时完成两件事：生成/更新 API 层代码 + 合并为 feature-spec。

**步骤**：

1. **读模板**：
   - `.ai/templates/api-module.md`（API 代码模板）
   - `.ai/conventions/api-conventions.md`（API 命名规范）
   - `.ai/templates/feature-spec.md`（规格书输出模板）
   - `.ai/conventions/feature-spec-workflow.md`（合并工作流详细规范）
   - `.ai/specs/prd-template.md`（PRD 规范化基准）
2. **检查已有 API 文件**：检查 `src/api/{module}/` 是否已存在（阶段①可能已生成占位 API）
   - 已存在 → 后续步骤在已有文件基础上合并更新（追加新接口，真实类型替换临时类型）
   - 不存在 → 创建新文件
3. **解析 Swagger**：
   - 识别输入格式（JSON / YAML / URL / 截图 / 手动表格）
   - 提取实体定义、接口清单、参数结构
   - 转换为内部格式（对齐 api-conventions）
4. **生成/更新 API 层代码**：
   - `src/api/{module}/types.ts` — 用 Swagger 定义的真实类型（已有则合并更新）
   - `src/api/{module}/index.ts` — API 方法（已有则追加新方法），**方法名必须带 HTTP 后缀**
5. **按 feature-spec-workflow 执行交叉对比**：
   - 规范化 PRD（以 prd-template 9 章为基准）
   - 按 workflow 定义的 5 步对比流程执行
   - 自动处理 🟢 级差异，收集 ⚠️ 和 🔴 级差异
6. **输出/更新 feature-spec**：
   - 生成 `specs/[feature]/feature-spec.md`
   - 向用户展示差异汇总（一致/需确认/冲突的数量 + 阻塞项清单）
   - 等待用户对 🔴 冲突项和 ⚠️ 需确认项做出决策
7. **验证 API 层**：`pnpm verify`，最多 3 轮修复

**约束**：

- **Swagger 是接口真实性的权威来源**（类型、路径、方法以 Swagger 为准）
- **PRD 是功能范围的权威来源**（做不做某个功能以 PRD 为准）
- 🔴 冲突项必须全部获得用户决策才能被视为完成
- ⚠️ 需确认项如用户不决策，按 AI 建议处理并标注 `[AI 默认]`

---

## 分支 B：仅生成 API 层（无 PRD）

> 等同于原 api-gen 模式，只生成 API 代码，不生成 feature-spec。

**步骤**：

1. **读模板**：Read `.ai/templates/api-module.md` + `.ai/conventions/api-conventions.md`
2. **检查已有 API 文件**：同分支 A 步骤 2
3. **解析 Swagger**：同分支 A 步骤 3
4. **生成/更新 API 层代码**：同分支 A 步骤 4
5. **验证**：`pnpm verify`，最多 3 轮修复
6. **告知用户后续路径**：「API 层已生成。如后续有产品文档/PRD，可再次提供 Swagger + PRD，我将走完整合并流程生成 feature-spec。」

**约束**：

- 只生成 API 层，不生成 feature-spec（无 PRD 可合并）
- 不生成页面（除非用户明确要求）
- 字段类型从接口文档映射，不猜测
- API 对象命名：`{module}Api`
- **方法命名**：必须使用 `{name}By{HTTP}` 格式

---

## 多轮机制（接口分批到达）

接口可能分批到达（如先给列表+详情接口，后给表单接口），因此阶段②设计为**可多轮触发**：

```
第 N 批 Swagger 到达
  │
  ├─ 读取已有 API 文件（src/api/{module}/types.ts + index.ts）
  ├─ 解析新 Swagger，提取新增接口
  ├─ 追加到 types.ts / index.ts（不覆盖已有，仅追加新方法和类型）
  │
  ├─ 有 feature-spec?
  │   ├─ 是 → 更新 feature-spec，补充新接口覆盖的部分，更新完成度
  │   └─ 否 → 跳过（分支B场景，不生成）
  │
  └─ 每轮结束标注完成度（哪些接口已到位，哪些待补充）
```

**关键**：每轮都检查分支条件。如果首轮走了分支B（无PRD），后续轮用户补充了 PRD，则自动切换到分支A。

---

## 大文档降级策略

> 当 Swagger 文档规模过大时，一次性处理可能影响输出质量。

当 Swagger 文档接口数量 > 30 个时，AI 应向用户确认：

> 「接口数量较多（X 个），建议按功能分组分批生成以确保质量。是否分批处理？」

- 用户同意 → 按功能分组多轮执行（每轮处理一组相关接口）
- 用户拒绝 → 一次性处理，但仅走分支B（生成 API 层），跳过 feature-spec 合并以控制复杂度

---

## 输出锁

**分支 A**：

> 🔒 仅允许创建/修改 `src/api/{module}/types.ts`、`src/api/{module}/index.ts`、`specs/[feature]/feature-spec.md`。步骤 6 用户确认差异后，如需衔接③改造适配，再由③的输出锁控制后续文件。

**分支 B**：

> 🔒 仅允许创建/修改 `src/api/{module}/types.ts` 和 `src/api/{module}/index.ts`，禁止创建其他文件。
