# 错误沉淀与飞轮机制 (Error Flywheel)

> 把 AI 的错误当作系统信号而非孤立 bug 来处理。

## 核心命题

**AI 代码生成的错误是可预测、可积累、可防御的。关键不在于消灭错误，而在于构建一个让错误"越犯越少"的自增强系统。**

## 问题：手动沉淀的天花板

大多数团队处理 AI 生成错误的方式是：

```
AI 出错 → 人工发现 → 人工记录 → 人工提醒 AI 下次别这样
```

这个流程有三个致命缺陷：

1. **触发依赖人工**——忙的时候不沉淀，不沉淀就反复踩坑
2. **覆盖率低**——人只能记住印象深刻的错误，系统性的低频错误会被遗漏
3. **增长停滞**——错题集永远停留在个位数，无法对抗 AI 错误模式的多样性

Packmind 的 Context Engineering 实践数据显示：**增量式自动化规则调整比手动重写减少 86% 的偏差。** 差距不是一点点，是数量级的。

## 飞轮模型

真正有效的错误管理不是线性流程，而是自增强的飞轮：

```
AI 生成代码 → verify 失败 → 自动提取错误模式 → 分类归档 → 人工审批 → 注入规则
     ↑                                                                    ↓
     ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

每一圈飞轮转动，错题集增长一点，下一次 AI 生成就多避开一个坑。**飞轮转得越多，错误率越低。**

## 三层架构

### 第一层：自动捕获（零成本）

**核心思想：让 `pnpm verify` 的每一次失败都留下痕迹。**

在验证脚本的 wrapper 中追加结构化日志：

```jsonl
{"timestamp":"2026-04-21","file":"src/pages/user/list.tsx","rule":"@typescript-eslint/no-explicit-any","message":"Unexpected any","source":"ai-gen"}
{"timestamp":"2026-04-21","file":"src/pages/order/components/FormModal.tsx","rule":"no-restricted-imports","message":"'Form' import from 'antd' is restricted","source":"ai-gen"}
```

**关键设计决策：**

- **格式是 JSONL**（JSON Lines）——每行一条记录，追加写入，不需要解析整个文件
- **只记录 AI 生成相关的错误**——通过 git diff 判断文件是否被 AI 修改过
- **对 AI 完全透明**——AI 照常跑 `pnpm verify`，不知道后台在记日志
- **零额外成本**——wrapper 是一个 shell 管道，不影响原有验证流程

### 第二层：模式聚合（低成本，周频）

**核心思想：高频错误 = 系统性问题 = 需要沉淀为规则。**

一个简单脚本 `pnpm pitfall:scan`，统计 `raw.jsonl` 中的高频错误模式：

```
Top 5 error patterns (last 7 days):
1. no-explicit-any in SForm items callback          (12 occurrences)
2. missing import type for Entity types              (8 occurrences)
3. createModal not used for modal state management   (5 occurrences)
4. unused parameter without _ prefix in render       (4 occurrences)
5. SConfirm used instead of Modal.confirm            (3 occurrences)
```

**当同一模式出现 >= 3 次时，自动生成 pitfall 草稿：**

```markdown
| P007 | SForm 回调 | SForm items 回调参数禁止隐式 any，使用 `(_: unknown, record: Entity) => ...` | 显式类型注解 |
```

草稿放到 `.ai/error-log/pending/`，等待人工审批。

### 第三层：人工审批（保留控制权）

**核心思想：自动化做收集和分类，人做最终判断。**

每周花 5 分钟看 `pending/` 目录：

- 确认的 → 移入 `pitfalls/index.md`
- 误报的 → 删除或标记为"已知但不需要处理"
- 需要细化的 → 编辑后移入

**为什么不全自动？** 因为不是所有高频错误都值得沉淀为规则。有些错误是特定需求导致的一次性集中爆发，有些是模型版本变化导致的临时波动。人的判断力在这里不可替代。

## 与 Skill 的融合

飞轮不侵入 Skill 或 AI 工作流。它运行在基础设施层（verify wrapper），对 AI 决策层完全透明。

以 `sdesign-gen-page` Skill 为例，当前的验证流程是：

```
步骤 8: 自检（对照 §5 错题集）
步骤 9: pnpm verify → 修错 → 最多 3 轮
步骤 10: 报告
```

飞轮嵌入后：

```
步骤 8: 自检（对照 §5 错题集）← 错题集通过飞轮持续增长
步骤 9: pnpm verify → [wrapper 自动记录错误] → 修错 → 最多 3 轮
步骤 10: 报告
```

**Skill 不需要改一行代码。** 步骤 8 已经在读 `pitfalls/index.md`，飞轮的产出自动流入这个文件。

**知识回流闭环：**

```
任何 AI 入口 → 生成代码 → pnpm verify
                               ↓ 失败
                        raw.jsonl 自动追加（第一层）
                               ↓ 周频
                        pnpm pitfall:scan 聚合（第二层）
                               ↓ 人工审批（第三层）
                        pitfalls/index.md 新增条目
                               ↓
                    Skill §5 错题集自动命中新规则
                               ↓
                          同类错误不再重复
```

**pitfalls/index.md 是 SSOT（Single Source of Truth）。** 无论强模型还是弱模型，无论 AGENTS.md 还是 AGENTS-LITE，只要跑了 pnpm verify，错误就会被捕获。

## 飞轮的数学效应

假设 AI 有 20 种常见错误模式，每种模式的出现概率是 5%：

| 阶段             | 错题集条目数 | 单次生成出错概率 | 平均修复轮次 |
| ---------------- | ------------ | ---------------- | ------------ |
| 初始（手动沉淀） | 6 条         | ~70%             | 2-3 轮       |
| 飞轮运转 3 个月  | 15 条        | ~25%             | 1 轮         |
| 飞轮运转 6 个月  | 20+ 条       | <10%             | 接近 0       |

**错题集的增长是对数曲线——早期增长最快（因为高频错误先被捕获），后期趋于平稳（因为低频错误本身就少见）。** 这意味着飞轮的 ROI 集中在前 3 个月。

## 文件结构

```
.ai/
  error-log/
    raw.jsonl          # 自动追加的原始错误日志
    pending/           # 自动生成的 pitfall 草稿（待人工审批）
  pitfalls/
    index.md           # 已确认的错题集（SSOT）
    *.md               # 各 pitfall 的详情文件（按需）
```

## 实施路径

| 步骤 | 做什么                                  | 成本         |
| ---- | --------------------------------------- | ------------ |
| 1    | 写 verify wrapper，追加错误到 raw.jsonl | 半天         |
| 2    | 正常使用，积累 2-4 周数据               | 零           |
| 3    | 写 pitfall:scan 脚本（~50 行 Node）     | 半天         |
| 4    | 每周 5 分钟审批 pending/                | 持续极低成本 |

**不需要一步到位。先搭第一层（自动捕获），让数据积累起来。有了数据之后，第二层和第三层自然而然就会有动力去做。**

## 一句话总结

**错误不是负担，是燃料。飞轮把每一次错误转化为下一次生成的防护规则。**

---

_参考资料：_

- _Packmind — [Context Engineering for Teams](https://packmind.com/context-engineering-ai-coding/how-to-implement-context-engineering/) — "增量式规则调整比手动重写减少 86% 偏差"_
- _Netflix Chaos Monkey 设计哲学 — 从故障中学习，让系统越来越健壮_
