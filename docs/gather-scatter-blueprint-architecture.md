# Gather-Scatter：蓝图驱动的 AI 辅助开发架构

> 蓝图是产品语言（PRD）和代码语言（TypeScript）之间的**中间表示（IR）**。它把散落在产品、后端、架构三处的信息收拢到一个文件，再以输出锁为边界打散成可独立验收的 Task。
>
> 最后更新：2026-05-13

---

## 一、核心模式

```
                    收拢（Gather）                              打散（Scatter）

产品PRD ─┐                              ┌→ Task 1 → src/api/{module}/types.ts
后端SDD ─┼→ 蓝图（一处集中）────────→  ├→ Task 2 → src/pages/{module}/index.tsx
架构信息 ─┘                              ├→ Task 3 → src/pages/{module}/create.tsx
                                         ├→ Task 4 → src/router/index.tsx
                                         └→ Task 5 → src/pages/{module}/detail.tsx

         「把散落的认知收拢到一个文件」              「按输出锁精准分散到各个位置」
```

传统开发：在脑中同时持有 7 个文件的状态，在不同位置来回跳。

Gather-Scatter：把"理解"和"执行"拆成两个阶段，每个阶段 AI 只需要一种上下文。

- **Gather 阶段**：AI 看到全部 PRD + 全部架构信息 → 全局视角
- **Scatter 阶段**：AI 看到蓝图 + 当前 Task 的输出锁 → 局部视角，不被其他 Task 信息干扰

---

## 二、双层架构

|                  | 简单功能          | 复杂功能                     |
| ---------------- | ----------------- | ---------------------------- |
| **怎么生成**     | 模板填空          | 蓝图驱动（Gather-Scatter）   |
| **怎么保证质量** | 全局标准          | 全局标准 + AI 生成验收标准   |
| **怎么控制边界** | 输出锁            | 输出锁                       |
| **AI 推理负担**  | 零（照模板写）    | 高（交叉对比 PRD → 拆 Task） |
| **适用场景**     | 标准 CRUD、单页面 | 多页面模块、大屏、工作流     |

### 2.1 模板层（为什么简单 CRUD 也需要模板）

不是为了难度，是为了**代码一致性**。没有模板时，AI 需要读源码找类似实现——增加上下文消耗且结果不稳定。模板让 AI 直接填空，零推理成本，输出风格统一。

### 2.2 蓝图层（Gather-Scatter 流程）

```
产品PRD + 后端SDD + 架构信息
    → AI 交叉对比（🔴冲突 / ⚠️需确认 / 🟢一致）
    → 页面类型分类（page-classification 关键词匹配）
    → 用户决策门（确认冲突 + 页面类型）
    → 生成蓝图 spec.md（接口定义、路由定义、组件拆分、布局拓扑图（大屏场景））
    → 拆分 Task（含输出锁、全局验收标准、AI 生成验收标准）
    → 顺序/并行执行
    → 人工逐 Task 验收
```

蓝图内容：

- **接口定义**：Entity 类型、Query 类型、FormData 类型、API 方法签名
- **路由定义**：页面路由路径、嵌套关系
- **组件拆分**：页面 → 子组件 → 私有组件的层级拆解
- **布局拓扑图**：大屏/仪表盘场景的组件嵌套关系（管理端通常不需要）

### 2.3 验收标准两层结构

| 层级          | 内容                                               | 生成方式                          |
| ------------- | -------------------------------------------------- | --------------------------------- |
| 全局标准      | eslint、组件命名、API 命名约定、导入规则、类型安全 | 人工定义，所有 Task 通用          |
| Task 验收标准 | 功能正确性、边界条件、交互状态                     | AI 从 Task 描述生成，人工二次确认 |

---

## 三、理论依据

### 3.1 Gather-Scatter 的历史前身

| 领域       | Gather                                       | Scatter                          |
| ---------- | -------------------------------------------- | -------------------------------- |
| 编译器     | IR（中间表示）— 多种源语言收拢到一种中间格式 | 代码生成 — IR 分散到多目标平台   |
| 项目管理   | WBS（工作分解结构）— 需求收拢为结构化任务树  | 执行 — 任务分配给不同执行者      |
| 分布式系统 | Consensus（共识）— 多节点状态收拢到一致决策  | Execution — 决策分散到各节点执行 |
| 军事       | 情报汇总 → 作战计划                          | 任务分发 → 多线执行              |

蓝图的本质：在 PRD 和代码之间创建一层"设计语言"——**解耦理解阶段和执行阶段**。

### 3.2 Mise en Place for Agentic Coding（2026年5月）

**论文**：[Andrew Zigler, _Mise en Place for Agentic Coding_, arXiv:2605.05400](https://arxiv.org/abs/2605.05400)，发表于 VibeX 2026 Workshop。

三阶段准备方法论，与 Gather-Scatter 同构：

| 论文模型                                              | 本架构                                  |
| ----------------------------------------------------- | --------------------------------------- |
| Contextual Grounding（将隐性知识外化为结构化文档）    | Gather — PRD + 架构信息收拢为蓝图       |
| Collaborative Specification（人-AI 对话产出详细设计） | Gather — 交叉对比 + 用户决策门          |
| Task Decomposition（规格转为依赖感知的 Task）         | Scatter — Task 拆分 + 输出锁 + 验收闸门 |

核心结论：**~2 小时的 Gather 投入 → 多个 AI agent 并行 Scatter 执行。**

### 3.3 Spec Kit Agents（2026年4月）

**论文**：[_Spec Kit Agents: Context-Grounded Agentic Workflows_, arXiv:2604.05278v1](https://arxiv.org/html/2604.05278v1)

128 次实验，32 个功能，5 个仓库：

- 核心发现：**在中间制品层（spec/plan/tasks）拦截错误，比在代码层拦截成本低一个数量级。**
- 中间制品的错误会复合放大——蓝图里一个组件拆分错误，所有后续 Task 都继承。
- 解决方案：phase-level context-grounding hooks（pre-hook 读取验证，post-hook 检查中间制品）。

**→ 蓝图的正确性 = 所有 Task 的质量上限。** Gather 阶段必须有自动化 post-hook。

### 3.4 Stanford ACE 框架（2025）

**论文**：[_Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models_](https://developer.aliyun.com/article/1684851)

量化数据：

- 富上下文、持续演进的策略手册：Agent 任务准确率 **+17.1%**
- Token 成本反而**降低 86.9%**（减少试错轮次）
- 小规模开源模型 + 好上下文，追平顶尖闭源模型

**→ 上下文质量 > 模型能力。** Gather 阶段的输入质量撬动整个链条。

### 3.5 Context Engineering 行业共识（2025-2026）

**来源**：[MIT Technology Review](https://www.technologyreview.com/2025/11/05/1127477), [VentureBeat](https://venturebeat.com/ai/why-most-enterprise-ai-coding-pilots-underperform-hint-its-not-the-model/)

> "Context + Agent = Leverage. Skip the first half, and the rest collapses."

Gather 阶段 = Context Engineering（把散落的上下文工程化组织为高密度文档）。Scatter 阶段 = Agent（每个 Task 独立会话，上下文隔离，输出受锁）。

### 3.6 AI 生成验收标准的实验数据

**来源**：[ThoughtWorks, _AI-generated test cases from user stories_, 2025](https://www.thoughtworks.com/insights/blog/generative-ai/AI-generated-test-cases-from-user-stories-an-experimental-research-study)

| 指标                    | 数值       |
| ----------------------- | ---------- |
| 验收标准覆盖率          | 98.67%     |
| 正确性                  | 87.06%     |
| **模糊率（Ambiguity）** | **27.22%** |
| Prompt 优化后质量提升   | **67.78%** |

关键结论：AI 生成的验收标准覆盖率很高，但每 4 条中有 1 条不够具体——这是人工二次确认的负担来源。通过优化验收标准生成的 prompt（指定格式、边界条件约束、禁止模糊词），可提升 67%+。

---

## 四、优化方案

### 4.1 短期：加固 Gather 阶段的输出质量

#### A. 蓝图自动化 post-hook（4 项检查）

蓝图生成后、Task 拆分前，自动执行：

```
1. API 存在性检查
   蓝图引用的每个 API 路径必须在后端 SDD 中有对应定义
   实现: 从后端SDD提取接口列表 → grep 对比蓝图中的API引用

2. 输出锁路径检查
   每个 Task 的输出锁路径必须在 src/ 真实目录结构内
   实现: 项目目录树 → 对比 Task 输出锁

3. Task 依赖无环检查
   依赖关系不能形成 A→B→C→A
   实现: 拓扑排序 → 检测环路

4. 组件引用检查
   蓝图引用的组件必须存在于组件库或项目已有组件中
   实现: 组件清单 → 对比蓝图中的组件引用
```

#### B. 优化验收标准生成 prompt

在蓝图生成 Task 时，加入验收标准约束：

```
每个 Task 的验收标准必须满足：
• ≥1 条边界条件（空值、极值、特殊字符）
• ≥1 条交互状态（loading、empty、error）
• Given/When/Then 格式
• 禁止模糊词：「正常」「合理」「适当」「等等」
```

#### C. 蓝图自身验收闸门

在用户决策门之后、生成 spec.md 之前：

```
蓝图自检（AI 执行）：
□ 所有 API 路径在后端 SDD 中有对应定义
□ 所有路由路径不与现有路由冲突
□ 组件拆分粒度：每 Task ≤1 页面或 ≤1 独立组件
□ Task 依赖图无环
□ 所有 Task 输出锁路径在项目结构内
□ 布局拓扑图（如有）与实际页面层级一致
```

### 4.2 中期：中间复杂度快速通道

```
功能复杂度判断：

if 页面数 ≤ 3 且 非标需求 ≤ 2:
    → 模板骨架 + 差异标注
      AI 用模板生成代码
      → AI 标注需要额外处理的复杂部分
      → 仅对这些部分做小范围蓝图补充
else:
    → 完整 Gather-Scatter 流程
```

### 4.3 长期：可推广的最小框架

将 Gather-Scatter 提取为跨项目的可复用框架：

```
Gather 层（跨项目可复用）:
  ├── blueprint.md              流程骨架
  ├── page-classification.md    页面分类（按项目定制）
  └── spec-template.md          输出格式

Scatter 层（项目按需生长）:
  ├── 代码模板                   执行期积累
  ├── 组件文档                   按组件库同步
  ├── 错题集                     出错才加（≥3次重复 → 沉淀）
  └── eslint/tsc                 零成本复用

验收层（两层）:
  ├── 全局标准                   eslint + 组件命名 + API 约定 + 导入规则
  └── AI 生成验收标准            人工二次确认
```

---

## 五、历史项目低成本 SDD 路径

### 5.1 三步启动

**第一步：从代码反向生成"伪 PRD"**

```
AI 读取项目：
  - src/pages/ 下所有页面
  - src/api/ 下所有模块
  - src/router/ 路由配置
  - package.json 依赖
  ↓
AI 输出：
  - 页面清单（类型、核心组件、数据来源）
  - API 模块清单（实体、方法、参数）
  - 组件依赖关系
  - 已知问题/技术债标记
```

**第二步：选一个功能模块跑蓝图试点**

```
伪 PRD（产品视角） + 后端接口分析（数据视角）
  + 当前代码作为"现有架构信息"
    ↓
  简版 Gather-Scatter 流程
    ↓
  spec.md（新功能的实现蓝图）
```

只需要三个文件即可启动：

- `blueprint.md`（流程骨架，去掉项目专属路径）
- `page-classification.md`（按项目定制的页面类型分类）
- `tsc --noEmit` + `eslint`（验证层，零额外成本）

**第三步：按 Task 执行，基建自然生长**

```
Task 1 执行 → AI 用 antd Table 而非项目封装 → 沉淀一条规则
Task 2 执行 → API 方法名不统一 → 沉淀一条规则
Task 3 执行 → 通过，无新问题
...
第 10 个 Task → 基建自然生长到够用水平
```

原则：**先开枪，后画靶。** 不提前建基建，在执行中按需沉淀。

### 5.2 对比

|            | AI-admin-pro（已建成）                 | 历史项目低成本路径                   |
| ---------- | -------------------------------------- | ------------------------------------ |
| Gather 层  | blueprint.md + page-classification     | 直接复用（替换 page-classification） |
| Scatter 层 | 8 个模板 + 27 个组件文档               | 渐进生长，出错才加                   |
| 验证层     | pnpm verify（tsc + eslint + prettier） | 零成本复用                           |
| 约束层     | 错题集 P001-P006 + 硬约束              | 按需沉淀                             |
| 组件文档   | sdesign 27 个组件 .md                  | 按项目实际                           |
| 启动时间   | 7 个阶段、4 套方案、74 次提交          | **一个会话**                         |

---

## 六、关键设计原则

1. **Gather 阶段质量 = 全链条上限。** 蓝图里的一个错误，所有 Task 继承放大。必须配自动化 post-hook。
2. **模板不是冗余，是下限保障。** 模板消除 AI 的代码风格波动，降低上下文消耗。
3. **验收标准生成需要专项 prompt 优化。** 默认 prompt 产生 27% 模糊率，优化后可提升 67%+。
4. **基建分层级，不一步到位。** 前 20% 基建（蓝图模板 + 验证命令）解决 80% 问题。
5. **简单/复杂之间需要快速通道。** 不是所有功能都值得走完整 Gather-Scatter。

---

## 七、参考资料

| 来源                                            | 链接                                                                                                                                              | 关键贡献                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Mise en Place for Agentic Coding (Zigler, 2026) | [arXiv:2605.05400](https://arxiv.org/abs/2605.05400)                                                                                              | 三阶段准备方法论，与 Gather-Scatter 同构 |
| Spec Kit Agents (2026)                          | [arXiv:2604.05278v1](https://arxiv.org/html/2604.05278v1)                                                                                         | 中间制品错误拦截，phase-level hooks      |
| Stanford ACE Framework (2025)                   | [Aliyun](https://developer.aliyun.com/article/1684851)                                                                                            | 富上下文 +17.1% 准确率，成本 -86.9%      |
| AI-Generated Test Cases (ThoughtWorks, 2025)    | [ThoughtWorks](https://www.thoughtworks.com/insights/blog/generative-ai/AI-generated-test-cases-from-user-stories-an-experimental-research-study) | 验收标准 27% 模糊率，prompt 优化 +67%    |
| Context Engineering Consensus (2025)            | [MIT Tech Review](https://www.technologyreview.com/2025/11/05/1127477)                                                                            | Context + Agent = Leverage               |
| Agent Rule Bloat (2025)                         | [Octospark](https://octospark.ai/blog/agent-rule-bloat-how-to-avoid)                                                                              | 规则价值公式，多即是少                   |
| Qoder 5人7天案例 (2026)                         | [Qoder](https://qoder.com/zh/blog/qoder-case-5-7team)                                                                                             | Software Intentioning 范式               |
