# 模式 F：spec-gen（功能规格书生成）

> 用户同时拥有 Swagger 接口文档和产品文档（PRD），需要合并为结构化的功能规格书，
> 交叉验证后标注差异，用户确认后自动衔接 full-sdd 模式。

**步骤**：

1. **读模板**：Read `.ai/templates/feature-spec.md` + `.ai/conventions/feature-spec-workflow.md`
2. **解析 Swagger**：
   - 识别输入格式（JSON / YAML / URL / 截图）
   - 提取实体定义、接口清单、参数结构
   - 转换为内部 YAML 格式（对齐 api-conventions）
3. **解析 PRD**：
   - 识别输入格式（prd-template / 自由格式 / 截图）
   - 提取功能概述、数据模型、页面设计、业务规则
   - 评估信息完整性
4. **交叉对比**：
   - 按 feature-spec-workflow.md 定义的 5 步对比流程执行
   - 自动处理 🟢 级差异（标注决策理由）
   - 收集 ⚠️ 和 🔴 级差异
5. **生成功能规格书**：
   - 输出 `specs/[feature]/feature-spec.md`
   - 差异明细表中「用户决策」列留空
   - 向用户展示差异汇总统计 + 阻塞项清单
6. **等待用户确认**：
   - 用户逐条决策 🔴 冲突项和 ⚠️ 需确认项
   - AI 根据决策更新 feature-spec.md
7. **衔接 full-sdd**：
   - 将 Task 拆解建议展开为完整 `spec.md` + `progress.md`
   - 自动进入 full-sdd 模式，从 Task 1 开始执行

**约束**：

- 本模式**不生成任何代码**，只生成文档
- 🔴 冲突项必须全部获得用户决策才能进入步骤 7
- ⚠️ 需确认项如用户不决策，按 AI 建议处理并标注 `[AI 默认]`
- **Swagger 是接口真实性的权威来源**（类型、路径、方法以 Swagger 为准）
- **PRD 是功能范围的权威来源**（做不做某个功能以 PRD 为准）

> 🔒 **输出锁**：本模式仅允许在 `specs/[feature]/` 目录下创建 `feature-spec.md`，步骤 7 衔接时才创建 `spec.md` + `progress.md`。禁止创建 `src/` 下任何文件。
