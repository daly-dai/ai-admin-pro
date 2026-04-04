# AGENTS.md 工作流生命周期改造计划

## Context

**问题**：当前 AGENTS.md 将 6 个工作模式作为独立的、关键词触发的原子操作平铺列举。但实际开发是一个**确定的、信息渐进到达的生命周期**：

```
需求文档 → 画Demo → 接口分批到位+合并PRD → 改造Demo → 接口对接 → 迭代修复/自测 → 测试 → 上线
```

具体问题：

1. **模式割裂**：page-first → api-gen → spec-gen → api-connect 之间没有流转关系
2. **full-sdd 与现实不符**：假设「信息一次到位，从零搭建」，但现实是信息渐进到达
3. **缺失关键阶段**：「合并规格后改造 Demo 页面」无任何模式覆盖
4. **api-gen 和 spec-gen 是同一事件的两面**：Swagger 到了，既要生成代码又要跟 PRD 合并，不应拆成两步
5. **接口分批到达**：Swagger 不是一次给完的，合并阶段需要支持多轮触发
6. **需求变更未覆盖**：产品中途补充/修改需求是常态，当前没有机制处理 PRD 更新对已有代码的影响

**决策**：

- 废弃 full-sdd，Task 拆解机制融入生命周期各阶段
- Demo 阶段支持多页面 Task 拆解
- api-gen + spec-gen 合并为一个「接口合并」阶段（可多轮触发）
- AI 自动判断当前所处阶段

---

## 新架构：5 阶段开发生命周期

### 生命周期总览

```
PRD 到达 → ① 画 Demo → ② 接口合并（可多轮）→ ③ 改造适配 → ④ 接口对接 → ⑤ 迭代修复
                            ↻ 分批到位                                        ↕
                                                                        自测 / 测试 / 上线

           ↑_______________↑________________↑_______________↑
                     PRD 变更 → 回到受影响的最早阶段
```

**生命周期不是单向的**。产品中途可能补充/修改需求，此时 AI 需要评估影响范围并回溯到受影响的最早阶段重新执行。

| 阶段 | 名称     | 触发信号                                | 做什么                                              | 模式文件             |
| ---- | -------- | --------------------------------------- | --------------------------------------------------- | -------------------- |
| ①    | 画 Demo  | PRD/需求 + "画页面/出骨架/demo"         | 规范化PRD → Task拆解 → 生成demo页面+占位API         | `demo.md`            |
| ②    | 接口合并 | 用户提供 Swagger/接口文档（部分或全部） | 生成/更新API层 + 与规范化PRD合并 → 输出feature-spec | `api-merge.md`       |
| ③    | 改造适配 | ②完成（或足够完成）后                   | 根据 feature-spec 改造已有 demo 页面                | `demo-refine.md` NEW |
| ④    | 接口对接 | 真实接口就绪                            | 占位API → 真实接口，按需更新页面                    | `api-connect.md`     |
| ⑤    | 迭代修复 | 任何阶段的小修改/bug/需求变更           | 最小范围修改                                        | `incremental.md`     |

### 阶段②的多轮机制

接口可能分批到达（如先给列表+详情接口，后给表单接口），因此阶段②设计为**可多轮触发**：

```
第 1 批 Swagger（如列表/详情接口）
  → 生成部分 API 层（types.ts 中已有接口的实体 + index.ts 中已有的方法）
  → 与规范化 PRD 合并 → 生成 feature-spec（部分，未到位的接口标 ⚠️）
  → 可选：先对已有接口覆盖的页面做③改造适配

第 2 批 Swagger（如表单接口）
  → 更新 API 层（追加新方法和类型）
  → 更新 feature-spec（补充缺失部分，更新差异状态）
  → 继续③改造适配

全部接口到位
  → feature-spec 完整，所有 ⚠️ 清除
  → 进入④接口对接
```

**关键**：每轮②都同时做两件事：生成/更新代码（原 api-gen）+ 合并/更新规格书（原 spec-gen）。不分成两步。

### 阶段判断逻辑（AI 自动检测）

```
用户提交请求
  │
  ├─ 提供 PRD/需求 + 要求画页面？
  │   └─ → ① 画 Demo
  │
  ├─ 提供 Swagger/接口文档？
  │   └─ → ② 接口合并（无论模块是否已有 demo，都走合并流程）
  │
  ├─ 已有 feature-spec + demo + 要求根据规格改造？
  │   └─ → ③ 改造适配
  │
  ├─ 要求对接真实接口/联调/替换mock？
  │   └─ → ④ 接口对接
  │
  ├─ PRD 有更新/需求变更？
  │   └─ → 需求变更回溯（见下方）
  │
  ├─ 小修改/加字段/改bug/调整？
  │   └─ → ⑤ 迭代修复
  │
  └─ 无法判断？ → 向用户确认当前阶段
```

### 需求变更回溯

产品中途补充或修改需求是常态。PRD 更新时，AI 评估变更影响范围，回溯到受影响的**最早阶段**重新执行：

```
PRD 变更到达
  │
  ├─ 新增页面/模块级功能？
  │   └─ 回到 ① 画 Demo（画新页面，已有页面不动）
  │
  ├─ 修改数据模型/字段定义/业务规则？
  │   ├─ 已有 feature-spec？ → 回到 ② 接口合并（更新 feature-spec）→ ③ 改造适配
  │   └─ 无 feature-spec？   → 回到 ① 画 Demo（更新已有 demo）
  │
  ├─ 修改页面交互/表单字段/表格列？
  │   └─ 回到 ③ 改造适配（更新页面，API 不动）
  │
  └─ 文案调整/小改动？
      └─ 直接 ⑤ 迭代修复
```

**处理流程**：

1. 用户告知 PRD 有更新（提供更新后的文档或描述变更内容）
2. AI 对比变更内容，生成**变更影响清单**（哪些文件/页面受影响）
3. 向用户确认影响范围
4. 回到受影响的最早阶段，**仅对变更部分执行**（不重做未受影响的部分）
5. 从该阶段向后依次推进，直到回到当前进度

### Task 拆解机制（通用能力，不绑定阶段）

原 full-sdd 的 Task 拆解机制（specs/template.md + progress.md + 逐Task执行）下沉为通用能力：

| 阶段       | 何时启用 Task 拆解                           |
| ---------- | -------------------------------------------- |
| ① 画 Demo  | 需求涉及多个页面时（AI 判断或用户要求）      |
| ③ 改造适配 | feature-spec 涉及多个页面改动时              |
| ② ④ ⑤      | 不启用（②是API层单交付物，④⑤是最小修改原则） |

---

## 文件变更清单

### 1. 重写：`AGENTS.md`

**改动范围**：第一节 + 第三节

第一节改为：

- 开发生命周期总览图
- 5 个阶段说明表
- AI 阶段判断决策树（含需求变更回溯分支）
- 阶段②多轮机制说明
- 需求变更回溯机制说明
- Task 拆解通用能力说明

第三节更新模式索引表。

**不动**：第二节（硬约束）、第四节（验证规则）、第五节（项目结构）、第六节（纠错沉淀）、第七节（扩展）。

### 2. 新增：`.ai/modes/demo.md`（替代 page-first.md）

基于 page-first.md 重写：

- 去掉「单页面原则」
- 增加 Task 拆解（多页面时）
- 增加 PRD 规范化预处理（以 prd-template 9章为检查清单）
- 保留：sdesign 文档必读、占位API、错题集等约束

步骤：

1. 读模板 + 读 prd-template
2. 规范化需求（以 prd-template 为基准结构化）
3. 判断范围：单页面直接生成 / 多页面 Task 拆解
4. 读错题集 + sdesign 组件文档
5. 生成占位 API
6. 生成页面代码（单页面一次 / 多页面逐 Task）
7. 验证

### 3. 新增：`.ai/modes/api-merge.md`（替代 api-gen.md + spec-gen.md）

**合并 api-gen 和 spec-gen 的职责**，一个阶段同时完成两件事。

步骤：

1. 读模板：`.ai/templates/api-module.md` + `.ai/templates/feature-spec.md` + `.ai/conventions/feature-spec-workflow.md` + `.ai/specs/prd-template.md`
2. 读已有代码（如有）：检查 `src/api/{module}/` 是否已存在
3. 解析 Swagger：识别格式 → 提取实体/接口/参数
4. **生成/更新 API 层**：
   - types.ts — 用 Swagger 定义的真实类型（已有则合并更新）
   - index.ts — API 方法（已有则追加新方法）
5. **合并规格书**：
   - 检查是否已有规范化 PRD（阶段①产出）
   - 有 → 按 feature-spec-workflow 交叉对比，输出/更新 feature-spec.md
   - 无 → 以 prd-template 为基准从 Swagger 推断，缺失部分标 `[待补充]`
6. 向用户展示差异汇总（如有 PRD 可合并时）
7. 验证 API 层：`pnpm verify`

**多轮支持**：

- 首轮：创建 API 文件 + 创建 feature-spec
- 后续轮：更新 API 文件（追加新接口）+ 更新 feature-spec（补充缺失项）
- 每轮结束标注 feature-spec 的完成度（哪些接口已到位，哪些待补充）

**输出锁**：`src/api/{module}/types.ts`、`src/api/{module}/index.ts`、`specs/[feature]/feature-spec.md`

### 4. 新增：`.ai/modes/demo-refine.md`（全新：改造适配阶段）

步骤：

1. 读 feature-spec：`specs/[feature]/feature-spec.md`
2. 读已有 demo 代码：所有页面文件 + API 类型
3. 读错题集 + sdesign 组件文档
4. 生成变更清单：对比 feature-spec 与 demo 代码的差异
5. 向用户确认变更范围
6. 判断范围：改动少直接修改 / 多页面则 Task 拆解
7. 执行改造：更新 types.ts + 页面代码
8. 验证

**输出锁**：仅修改已有的 `src/api/{module}/` 和 `src/pages/{module}/` 下的文件

### 5. 保留并微调：`.ai/modes/api-connect.md`

- 增加阶段定位说明
- 其余不变

### 6. 保留并微调：`.ai/modes/incremental.md`

- 增加阶段定位说明：「贯穿生命周期所有阶段」
- 其余不变

### 7. 微调：`.ai/conventions/feature-spec-workflow.md`

- 第一章总览表：阶段③ 从「PRD 解析」→ 「PRD 规范化」（已改过）
- 第七章衔接：从「衔接 full-sdd」→「衔接③改造适配阶段」
- 7.4 节：从「切换到 full-sdd」→「切换到改造适配阶段」

### 8. 删除旧文件

| 删除                      | 原因                   |
| ------------------------- | ---------------------- |
| `.ai/modes/full-sdd.md`   | 废弃，机制融入其他阶段 |
| `.ai/modes/page-first.md` | 被 `demo.md` 替代      |
| `.ai/modes/spec-gen.md`   | 被 `api-merge.md` 吸收 |
| `.ai/modes/api-gen.md`    | 被 `api-merge.md` 吸收 |

保留不变：`specs/template.md`、`progress-template.md`、`session-template.md`（被新阶段复用）

---

## 阶段间的数据流

```
① 画 Demo
   输入: PRD/需求文档
   输出: src/pages/{module}/*.tsx（demo页面）
         src/api/{module}/types.ts（临时类型，TODO标注）
         src/api/{module}/index.ts（占位API，TODO URL）
         [可选] specs/[feature]/spec.md + progress.md（多页面时）
         [内部] 规范化 PRD 理解结果
              ↓
② 接口合并（可多轮）
   输入: Swagger/接口文档（部分或全部）+ ①的规范化PRD
   输出: src/api/{module}/types.ts（真实类型，逐轮追加）
         src/api/{module}/index.ts（真实方法签名，逐轮追加）
         specs/[feature]/feature-spec.md（逐轮更新完善）
              ↓
③ 改造适配
   输入: feature-spec.md + 已有demo页面 + 已有API类型
   输出: 更新后的页面文件（对齐 feature-spec）
         更新后的 types.ts（如 feature-spec 有字段调整）
              ↓
④ 接口对接
   输入: 真实接口地址 + 已有代码
   输出: 占位URL → 真实URL
         删除TODO注释
         按需更新页面联动
              ↓
⑤ 迭代修复（贯穿④之后所有阶段）
   输入: 用户描述的具体修改
   输出: 最小范围修改
```

---

## 文件操作汇总

| 操作 | 文件路径                                   | 说明                            |
| ---- | ------------------------------------------ | ------------------------------- |
| 重写 | `AGENTS.md`                                | 第一、三节改为5阶段生命周期架构 |
| 新增 | `.ai/modes/demo.md`                        | 替代 page-first，增加Task拆解   |
| 新增 | `.ai/modes/api-merge.md`                   | 合并 api-gen + spec-gen         |
| 新增 | `.ai/modes/demo-refine.md`                 | 全新阶段③：改造适配             |
| 微调 | `.ai/modes/api-connect.md`                 | 加阶段定位说明                  |
| 微调 | `.ai/modes/incremental.md`                 | 加阶段定位说明                  |
| 微调 | `.ai/conventions/feature-spec-workflow.md` | 第七章衔接改为③改造适配         |
| 删除 | `.ai/modes/full-sdd.md`                    | 废弃                            |
| 删除 | `.ai/modes/page-first.md`                  | 被 demo.md 替代                 |
| 删除 | `.ai/modes/spec-gen.md`                    | 被 api-merge.md 吸收            |
| 删除 | `.ai/modes/api-gen.md`                     | 被 api-merge.md 吸收            |

---

## 验证方式

本次改动全部是 `.md` 规范文件，无代码变更：

1. **路径完整性**：AGENTS.md 引用的所有模式文件路径都存在
2. **交叉引用**：各模式文件引用的模板/规范文件路径正确
3. **流转完整性**：① → ⑤ 的数据流无断裂
4. **回归检查**：AGENTS.md 第二节（硬约束）、第四节（验证规则）未被修改
5. **模拟验证**：用「主题管理」模块走完生命周期，确认每阶段的触发/输入/输出/衔接无遗漏
