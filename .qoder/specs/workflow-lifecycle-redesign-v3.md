# AGENTS.md 工作流生命周期改造方案 v3

## Context

**问题**：当前 AGENTS.md 的 6 个工作模式作为独立的关键词触发原子操作平铺列举，但实际开发是信息渐进到达的生命周期。v1 方案准确识别了痛点但线性假设仍偏强；v2 方案解决了 v1 的短板但引入了过多重机制（lifecycle.md、约束分级、字段版本管理），复杂度接近工作流引擎。

**v3 定位**：以 v1 为骨架、从 v2 选择性吸收 3 项改进、补充 v1 遗漏的安全阀门，形成**最小必要改造方案**。

**设计原则**：

- 精准解决"模式割裂"和"信息渐进到达"两个核心痛点
- 不引入新的运行时状态文件（不要 lifecycle.md）
- 不削弱硬约束的绝对性（不要 P0/P1/P2 分级）
- 保持与现有架构的最大兼容性

---

## 一、新架构概览：5 阶段开发生命周期

### 1.1 阶段总览

```
PRD 到达 → ① 画 Demo → ② 接口合并（可多轮）→ ③ 改造适配 → ④ 接口对接 → ⑤ 迭代修复
                            ↻ 分批到位                                        ↕
                                                                        自测 / 测试 / 上线
```

| 阶段 | 名称     | 触发信号                           | 做什么                                                       | 模式文件         |
| ---- | -------- | ---------------------------------- | ------------------------------------------------------------ | ---------------- |
| ①    | 画 Demo  | PRD/需求 + "画页面/demo/骨架"      | 规范化PRD → Task拆解 → 生成demo页面+占位API                  | `demo.md`        |
| ②    | 接口合并 | Swagger/接口文档                   | **条件分支**：有PRD→完整合并+feature-spec；无PRD→仅生成API层 | `api-merge.md`   |
| ③    | 改造适配 | feature-spec就绪 + "改造/对齐规格" | 根据feature-spec改造已有demo页面                             | `demo-refine.md` |
| ④    | 接口对接 | 真实接口就绪 + "对接/联调"         | 占位URL→真实URL，删除TODO                                    | `api-connect.md` |
| ⑤    | 迭代修复 | "改一下/加字段/修复/调整"          | 最小范围修改                                                 | `incremental.md` |

### 1.2 与 v1/v2 的关键差异

| 决策点                | v1             | v2              | **v3**                                         |
| --------------------- | -------------- | --------------- | ---------------------------------------------- |
| 阶段间关系            | 线性链         | 图关系          | **线性为主 + 允许跳转**（见1.3）               |
| 跨会话状态            | 无             | lifecycle.md    | **复用现有 session-template.md + progress.md** |
| api-merge 分支        | 强制捆绑       | 条件分支        | **条件分支（吸收自v2）**                       |
| 约束分级              | 无             | P0/P1/P2        | **不分级，保持硬约束绝对性**                   |
| feature-spec 版本管理 | 无             | 字段级版本标记  | **变更摘要表（轻量）**                         |
| 弹性退出              | 无             | 完成摘要模板    | **简单声明机制（吸收自v2，轻量化）**           |
| 需求变更回溯          | 4分支          | 细粒度+删除裁剪 | **补充删除/裁剪分支（吸收自v2）**              |
| demo 范围控制         | 去掉单页面原则 | 同v1            | **支持Task拆解但保留单Task=单页面**            |
| Task 拆解启用         | 仅①③           | 所有阶段≥3文件  | **①③必要时启用，②④⑤不启用**                    |
| api-merge 降级        | 无             | 无              | **大文档分批处理策略（v3新增）**               |

### 1.3 阶段判断决策树

```
用户提交请求
  │
  ├─ 用户声明"到此为止/先这样"?
  │   └─ → 确认结束，列出已产出文件清单
  │
  ├─ 提供 PRD/需求 + 要求画页面?
  │   └─ → ① 画 Demo
  │
  ├─ 提供 Swagger/接口文档?
  │   └─ → ② 接口合并
  │
  ├─ 已有 feature-spec + demo + 要求根据规格改造?
  │   └─ → ③ 改造适配
  │
  ├─ 要求对接真实接口/联调/替换mock?
  │   └─ → ④ 接口对接
  │
  ├─ PRD 有更新/需求变更?
  │   └─ → 需求变更回溯（见2.3）
  │
  ├─ 小修改/加字段/改bug/调整?
  │   └─ → ⑤ 迭代修复
  │
  └─ 无法判断? → 向用户确认当前阶段
```

**允许的非线性跳转**（不要求严格 ①→②→③→④→⑤）：

| 场景                     | 跳转路径     | 条件                            |
| ------------------------ | ------------ | ------------------------------- |
| 接口一步到位，不需要demo | 直接②，跳过① | 用户只提供Swagger，未要求画页面 |
| 简单页面不需要改造       | ①→④ 或 ①→⑤   | 用户声明不需要③                 |
| 接口变更需重新合并       | ④→②          | 对接时发现接口有变              |

### 1.4 弹性退出机制（吸收自v2，轻量化）

用户可在任意阶段声明"当前模块到此为止"。AI 响应：

1. 确认结束
2. 列出已产出文件清单
3. 告知用户如需继续可随时恢复

**不需要**：完成摘要模板、lifecycle.md 状态标记。保持简单。

---

## 二、各阶段详细设计

### 2.1 阶段①：画 Demo（替代 page-first + full-sdd 前半段）

**基于**：page-first.md 重写

**关键变更**（相对 page-first）：

- 去掉"单页面原则" → 支持 Task 拆解（多页面时）
- 增加 PRD 规范化预处理（以 prd-template 9章为检查清单）
- **保留**：单 Task = 单页面的粒度控制

**步骤**：

1. 读模板 + 读 prd-template（规范化基准）
2. 规范化需求（以 prd-template 为基准结构化，缺失信息标 `[?]`）
3. **判断范围**：
   - 用户只要求一个页面 → 直接生成（同原 page-first 流程）
   - 用户需求涉及多页面 → Task 拆解，创建 `specs/[feature]/spec.md` + `progress.md`
4. 读错题集 + sdesign 组件文档（同原 page-first）
5. 生成占位 API（同原 page-first）
6. 生成页面代码（单页面一次 / 多页面逐 Task，**每个 Task 仍为单页面**）
7. 验证

**输出锁**：

- 单页面模式：同原 page-first（`types.ts` + `index.ts` + 一个页面文件）
- 多页面 Task 模式：`src/api/{module}/types.ts`、`src/api/{module}/index.ts`、`src/pages/{module}/*.tsx`、`specs/[feature]/spec.md`、`specs/[feature]/progress.md`

**范围控制阀门**（v3 新增安全措施）：

> 多页面 Task 拆解时，每个 Task 仍遵循"一个 Task = 一个页面"的粒度。
> 生成顺序：先占位 API（覆盖所有页面需要的接口），再逐页面生成。
> 每个页面 Task 完成后独立验证，不累积到最后一起验证。

### 2.2 阶段②：接口合并（替代 api-gen + spec-gen）

**基于**：api-gen.md + spec-gen.md + feature-spec-workflow.md 合并重写

**关键变更**：

- api-gen + spec-gen 合并为一个阶段，一次操作同时完成两件事
- **条件分支**（吸收自v2）：自动检测是否存在 PRD，走不同流程
- 支持多轮触发（接口分批到达）

**条件分支检测**：

```
收到 Swagger
  │
  ├─ 检查是否存在可用 PRD
  │   │  （①的规范化产出 / 用户本次提供 / specs/{f}/ 下已有 PRD 相关文件）
  │   │
  │   ├─ 存在 → 分支 A: 完整合并流程
  │   │   1. 读模板：api-module.md + feature-spec.md + feature-spec-workflow.md + prd-template.md
  │   │   2. 检查已有 API 文件（有则追加，无则创建）
  │   │   3. 解析 Swagger → 生成/更新 API 层代码（types.ts + index.ts）
  │   │   4. 按 feature-spec-workflow 执行交叉对比
  │   │   5. 输出/更新 feature-spec.md
  │   │   6. 向用户展示差异汇总
  │   │   7. 验证 API 层
  │   │
  │   └─ 不存在 → 分支 B: 仅生成 API 层
  │       1. 读模板：api-module.md + api-conventions.md
  │       2. 检查已有 API 文件（有则追加，无则创建）
  │       3. 解析 Swagger → 生成/更新 API 层代码
  │       4. 不生成 feature-spec（无 PRD 可合并）
  │       5. 验证 API 层
  │       6. 告知用户：如后续有 PRD，可再次触发②走分支A
```

**多轮机制**：

```
第 N 批 Swagger 到达
  │
  ├─ 读取已有 API 文件
  ├─ 解析新 Swagger，提取新增接口
  ├─ 追加到 types.ts / index.ts（不覆盖已有）
  │
  ├─ 有 feature-spec?
  │   ├─ 是 → 更新 feature-spec，补充新接口覆盖的部分
  │   └─ 否 → 跳过
  │
  └─ 每轮结束标注完成度（哪些接口已到位，哪些待补充）
```

**大文档降级策略**（v3 新增）：

> 当 Swagger 文档接口数量 > 30 个时，AI 应向用户确认：
> 「接口数量较多（X 个），建议分模块处理以确保质量。是否按功能分组分批生成？」
> 用户同意 → 按功能分组多轮执行。用户拒绝 → 一次性处理但跳过 feature-spec 合并（仅生成 API 层）。

**输出锁**：

- 分支A：`src/api/{module}/types.ts`、`src/api/{module}/index.ts`、`specs/[feature]/feature-spec.md`
- 分支B：`src/api/{module}/types.ts`、`src/api/{module}/index.ts`

### 2.3 需求变更回溯机制（v1 基础 + v2 删除/裁剪补充）

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
  ├─ 删除/裁剪功能或字段？（v2 吸收）
  │   └─ 回到 ③ 改造适配（删除页面元素）+ ⑤ 清理 API 层无用代码
  │
  └─ 文案调整/小改动？
      └─ 直接 ⑤ 迭代修复
```

**处理流程**：

1. 用户告知 PRD 有更新
2. AI 对比变更内容，生成**变更影响清单**（受影响的文件列表）
3. 向用户确认影响范围
4. 回到受影响的最早阶段，**仅对变更部分执行**
5. 从该阶段向后推进

**混合变更**（多种变更同时出现）：取最早阶段。如 ①+③ 同时 → 走①。

### 2.4 阶段③：改造适配（全新阶段）

**步骤**：

1. 读 feature-spec：`specs/[feature]/feature-spec.md`
2. 读已有 demo 代码：所有页面文件 + API 类型
3. 读错题集 + sdesign 组件文档
4. 生成变更清单：对比 feature-spec 与 demo 代码的差异
5. 向用户确认变更范围
6. 判断范围：改动少直接修改 / 多页面则 Task 拆解（单 Task = 单页面）
7. 执行改造：更新 types.ts + 页面代码
8. 验证

**输出锁**：仅修改已有的 `src/api/{module}/` 和 `src/pages/{module}/` 下的文件

### 2.5 阶段④⑤：微调保留

**api-connect.md**：增加阶段定位说明（"本阶段对应生命周期④接口对接"），其余不变。

**incremental.md**：增加阶段定位说明（"贯穿生命周期所有阶段的最小范围修改"），其余不变。

### 2.6 Task 拆解通用能力

原 full-sdd 的 Task 拆解机制（`specs/template.md` + `progress.md` + 逐Task执行 + `session-template.md`）下沉为通用能力：

| 阶段       | 何时启用 Task 拆解                           |
| ---------- | -------------------------------------------- |
| ① 画 Demo  | 需求涉及多个页面时（AI 判断或用户要求）      |
| ③ 改造适配 | feature-spec 涉及多个页面改动时              |
| ② ④ ⑤      | 不启用（②是API层单交付物，④⑤是最小修改原则） |

Task 粒度：一个 Task = 一个明确交付物（一个页面 / 一组 API）。

保留不变：`specs/template.md`、`progress-template.md`、`session-template.md`。

---

## 三、阶段间数据流

```
① 画 Demo
   输入: PRD/需求文档
   输出: src/pages/{m}/*.tsx（demo页面）
         src/api/{m}/types.ts（临时类型，TODO标注）
         src/api/{m}/index.ts（占位API，TODO URL）
         [可选] specs/{f}/spec.md + progress.md（多页面时）
         [内部] 规范化 PRD 理解结果
              ↓
② 接口合并（可多轮）
   输入: Swagger/接口文档（部分或全部）
   分支A额外输入: ①的规范化PRD / 用户提供的PRD
   输出: src/api/{m}/types.ts（真实类型，逐轮追加）
         src/api/{m}/index.ts（真实方法签名，逐轮追加）
         [分支A] specs/{f}/feature-spec.md（逐轮更新完善）
              ↓
③ 改造适配
   输入: feature-spec.md + 已有demo页面 + 已有API类型
   输出: 更新后的页面文件（对齐feature-spec）
         更新后的 types.ts（如feature-spec有字段调整）
              ↓
④ 接口对接
   输入: 真实接口地址 + 已有代码
   输出: 占位URL → 真实URL
         删除TODO注释
         按需更新页面联动
              ↓
⑤ 迭代修复（贯穿所有阶段）
   输入: 用户描述的具体修改
   输出: 最小范围修改
```

---

## 四、文件变更清单

### 4.1 AGENTS.md 变更

**重写 第一节**：

- 从 6 模式关键词触发表 → 5 阶段生命周期总览
- 新增：阶段判断决策树（含需求变更回溯 + 弹性退出）
- 新增：阶段②多轮机制 + 条件分支说明
- 新增：Task 拆解通用能力说明
- 新增：允许的非线性跳转表

**重写 第三节**：更新模式索引表（6 模式 → 5 阶段对应的模式文件）

**不动**：第二节（硬约束）、第四节（验证规则）、第五节（项目结构）、第六节（纠错沉淀）、第七节（扩展）

### 4.2 模式文件变更

| 操作     | 文件路径                   | 说明                                                                                                    |
| -------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| **新增** | `.ai/modes/demo.md`        | 阶段①，替代 page-first.md。基于 page-first 内容重写，增加 Task 拆解 + PRD 规范化，保留单Task=单页面粒度 |
| **新增** | `.ai/modes/api-merge.md`   | 阶段②，替代 api-gen.md + spec-gen.md。合并两者职责，增加条件分支（有PRD/无PRD）+ 多轮机制 + 大文档降级  |
| **新增** | `.ai/modes/demo-refine.md` | 阶段③，全新。定义改造适配的步骤、输出锁、约束                                                           |
| **微调** | `.ai/modes/api-connect.md` | 增加阶段定位说明，其余不变                                                                              |
| **微调** | `.ai/modes/incremental.md` | 增加阶段定位说明，其余不变                                                                              |
| **删除** | `.ai/modes/full-sdd.md`    | 废弃，Task 拆解机制融入①③                                                                               |
| **删除** | `.ai/modes/page-first.md`  | 被 demo.md 替代                                                                                         |
| **删除** | `.ai/modes/spec-gen.md`    | 被 api-merge.md 分支A 吸收                                                                              |
| **删除** | `.ai/modes/api-gen.md`     | 被 api-merge.md 分支B 吸收                                                                              |

### 4.3 规范文件变更

| 操作     | 文件路径                                   | 说明                                                                                |
| -------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| **微调** | `.ai/conventions/feature-spec-workflow.md` | 第七章：衔接目标从 full-sdd → ③改造适配阶段；7.4 节：切换模式从 full-sdd → 改造适配 |

### 4.4 保留不变

- `.ai/core/` 所有文件
- `.ai/sdesign/` 所有文件
- `.ai/templates/` 所有现有模板（api-module.md, crud-page.md, form-designer.md, detail-page.md, feature-spec.md）
- `.ai/specs/` 所有模板文件（template.md, progress-template.md, session-template.md, prd-template.md）
- `.ai/conventions/` 除 feature-spec-workflow.md 外的所有文件
- `.ai/pitfalls/` 所有文件

---

## 五、各新增/重写文件的详细内容规划

### 5.1 demo.md 内容结构

```
# 阶段①：画 Demo
> 阶段定位说明

## 范围判断（单页面 vs 多页面 Task 拆解）
- 判断规则表
- 多页面时的 Task 拆解流程（复用 specs/template.md）

## 步骤
1. 读模板（按页面类型选择）
2. 读 prd-template → 规范化 PRD
3. 判断范围 → 单页面直接生成 / 多页面 Task 拆解
4. 读错题集 + sdesign 组件文档
5. 生成占位 API
6. 生成页面代码（单页面一次 / 多页面逐Task，每Task一页面）
7. 验证

## 约束
- 每个 Task = 单页面（范围控制阀门）
- 占位 API URL 统一 '/api/TODO/{module}'
- 页面代码必须符合硬约束

## 输出锁
- 单页面 / 多页面 两种输出锁范围
```

**内容来源**：page-first.md（主体）+ full-sdd.md（Task拆解部分）+ prd-template 规范化逻辑

### 5.2 api-merge.md 内容结构

```
# 阶段②：接口合并
> 阶段定位说明 + 条件分支概述

## 条件分支检测
- 检测逻辑（自动，无需用户选择）
- 分支A: 完整合并流程（有PRD）
- 分支B: 仅生成API层（无PRD）

## 分支A 步骤（完整合并）
1. 读模板：api-module.md + feature-spec.md + feature-spec-workflow.md + prd-template.md
2. 检查已有 API 文件
3. 解析 Swagger → 生成/更新 API 层
4. 按 feature-spec-workflow 交叉对比
5. 输出/更新 feature-spec.md
6. 向用户展示差异汇总
7. 验证

## 分支B 步骤（仅API层）
1. 读模板：api-module.md + api-conventions.md
2. 检查已有 API 文件
3. 解析 Swagger → 生成/更新 API 层
4. 验证
5. 告知用户后续可补充 PRD 走分支A

## 多轮机制
- 追加逻辑（不覆盖已有）
- 完成度标注

## 大文档降级策略
- 接口 > 30 个时的处理方式

## 输出锁
- 分支A / 分支B 两种输出锁范围
```

**内容来源**：api-gen.md（API层生成逻辑）+ spec-gen.md（规格书输出逻辑）+ feature-spec-workflow.md（交叉对比引用）

### 5.3 demo-refine.md 内容结构

```
# 阶段③：改造适配
> 阶段定位说明

## 前置条件
- 必须已有 feature-spec.md
- 必须已有 demo 页面

## 步骤
1. 读 feature-spec
2. 读已有 demo 代码
3. 读错题集 + sdesign 组件文档
4. 生成变更清单（feature-spec vs demo 的差异）
5. 向用户确认变更范围
6. 判断范围 → 直接修改 / Task 拆解
7. 执行改造
8. 验证

## 约束
- 仅修改已有文件，不创建新文件
- 保留用户手动添加的自定义逻辑

## 输出锁
- 仅修改已有的 src/api/{m}/ 和 src/pages/{m}/ 下的文件
```

### 5.4 AGENTS.md 第一节重写内容

替换当前的"工作模式"表格和匹配规则，改为：

1. **开发生命周期总览图**
2. **5 阶段说明表**（阶段/名称/触发信号/做什么/模式文件）
3. **阶段判断决策树**（含弹性退出分支 + 需求变更回溯分支）
4. **允许的非线性跳转表**
5. **阶段②条件分支 + 多轮机制说明**
6. **需求变更回溯决策树**（含删除/裁剪分支）
7. **Task 拆解通用能力说明**

### 5.5 AGENTS.md 第三节更新

```
| 模式        | 详细流程文件               |
| ----------- | -------------------------- |
| ① 画 Demo   | `.ai/modes/demo.md`       |
| ② 接口合并  | `.ai/modes/api-merge.md`  |
| ③ 改造适配  | `.ai/modes/demo-refine.md`|
| ④ 接口对接  | `.ai/modes/api-connect.md`|
| ⑤ 迭代修复  | `.ai/modes/incremental.md`|
```

### 5.6 feature-spec-workflow.md 微调点

仅修改两处：

1. 第一节总览表：⑦ 确认衔接列的输出从 `→ full-sdd` → `→ ③ 改造适配`
2. 第七章 7.4 节：从"切换到 full-sdd 模式"→"切换到③改造适配阶段"

---

## 六、实施顺序

> 按依赖关系排序，后面的文件依赖前面的。

| 步骤 | 操作 | 文件                                       | 依赖                                  |
| ---- | ---- | ------------------------------------------ | ------------------------------------- |
| 1    | 新增 | `.ai/modes/demo.md`                        | 无（独立编写）                        |
| 2    | 新增 | `.ai/modes/api-merge.md`                   | 无（独立编写）                        |
| 3    | 新增 | `.ai/modes/demo-refine.md`                 | 无（独立编写）                        |
| 4    | 微调 | `.ai/modes/api-connect.md`                 | 无                                    |
| 5    | 微调 | `.ai/modes/incremental.md`                 | 无                                    |
| 6    | 微调 | `.ai/conventions/feature-spec-workflow.md` | 无                                    |
| 7    | 重写 | `AGENTS.md` 第一节 + 第三节                | 步骤1-6完成后（需引用新模式文件路径） |
| 8    | 删除 | `.ai/modes/full-sdd.md`                    | 步骤7完成后（AGENTS.md不再引用）      |
| 9    | 删除 | `.ai/modes/page-first.md`                  | 步骤7完成后                           |
| 10   | 删除 | `.ai/modes/spec-gen.md`                    | 步骤7完成后                           |
| 11   | 删除 | `.ai/modes/api-gen.md`                     | 步骤7完成后                           |

**步骤 1-6 可并行执行**（互不依赖）。步骤 7 依赖 1-6。步骤 8-11 依赖 7。

---

## 七、验证方式

本次改动全部是 `.md` 规范文件，无代码变更：

### 7.1 路径完整性检查

- AGENTS.md 引用的所有模式文件路径都存在
- 各模式文件引用的模板/规范文件路径正确

### 7.2 功能覆盖检查

- 旧模式的所有功能在新阶段中都有对应覆盖：

| 旧模式                | 覆盖方                              |
| --------------------- | ----------------------------------- |
| page-first 单页面生成 | demo.md 单页面模式                  |
| page-first 占位API    | demo.md 步骤5                       |
| full-sdd Task拆解     | demo.md / demo-refine.md 多页面模式 |
| full-sdd 逐Task执行   | demo.md / demo-refine.md Task循环   |
| full-sdd 会话交接     | session-template.md（保留不变）     |
| api-gen 生成API       | api-merge.md 分支B                  |
| spec-gen 合并规格书   | api-merge.md 分支A                  |
| api-connect 接口对接  | api-connect.md（保留）              |
| incremental 小修改    | incremental.md（保留）              |

### 7.3 回归检查

- [ ] AGENTS.md 第二节（硬约束）未被修改
- [ ] AGENTS.md 第四节（验证规则）未被修改
- [ ] AGENTS.md 第五节（项目结构）未被修改
- [ ] AGENTS.md 第六节（纠错沉淀）未被修改
- [ ] 所有现有模板文件引用路径正确
- [ ] 验证范围限制表已更新为新阶段对应关系

### 7.4 模拟验证

用「主题管理」模块模拟完整生命周期：

| 步骤 | 操作                           | 预期结果                                    |
| ---- | ------------------------------ | ------------------------------------------- |
| 1    | 提供 PRD，要求画页面           | 进入①，判断多页面→Task拆解，逐页面生成demo  |
| 2    | 提供部分 Swagger（无PRD引用）  | 进入②分支B，生成API层，不生成feature-spec   |
| 3    | 用户说"PRD在步骤1已经规范化了" | AI检测到①的产出→②切分支A，补充feature-spec  |
| 4    | 提供第2批 Swagger              | ②多轮，追加API+更新feature-spec             |
| 5    | 要求根据规格改造               | 进入③，对比feature-spec与demo，生成变更清单 |
| 6    | 模拟PRD变更（删除一个功能）    | 变更回溯→③+⑤（删除裁剪分支）                |
| 7    | 用户说"先这样"                 | 弹性退出，列出文件清单                      |
