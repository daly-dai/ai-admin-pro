# 框架减负改造 — 基线（Task 0.1 产物）

> 用途：为 Task 5.1 提供「改造前」对照读数。
> 原则：**每个数字标注来源与复现方式**。本次会话实测的标「实测」，引自测量报告的标「引用」。
> 本文件不修改任何被测量的文件。

---

## 0. 先说一条比数字更要紧的事实：**这已经是第三份计划**

| 时间            | 产物                                                     | 位置                                | 状态                                                                                         |
| --------------- | -------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| 2026-06-27      | `.ai/docs/ai-engineering-renovation-plan.md`（623 行）   | `.ai/docs/`（**tracked**）          | 验收项全 `[ ]`，引用的 `.ai/evals`、`.ai/nonstandard`、`AGENTS.md §五` 均不存在 → **未执行** |
| 2026-09-07      | AI 工程架构复盘 + 3 份子报告（4 文件 / **37,772 字符**） | `.dsh/ai-review/`（**gitignored**） | P0 四项、P1 四项全部未执行 → **未执行**                                                      |
| 2026-09（本次） | `specs/framework-slim-tasks.md` + 本文件                 | `specs/`（**tracked**）             | 待实施                                                                                       |

**2026-09-07 复盘与本次分析的结论高度重合**（详见 §5 对账），它甚至给自己下了同一个诊断：

> 「不是"想错了"，是"**装载体过时**"」（该复盘 §4.2）

**而它自己就是装载体过时的受害者**——它落在一个 gitignored 的运行时目录里，是**报告**而不是**Task 清单**：没有输出锁、没有 `⬜` 状态、没有逐项可勾选的验收。主分支最后一次提交是 2026-09-10，它写于 09-07，中间隔着三天，四项 P0 一项未动。

**所以本清单的首要风险不是"做错"，是变成第三份躺着的文档。** 三条对策已写进 `specs/framework-slim-tasks.md` 的执行规则：产物进 `specs/`（tracked）、每个 Task 有 `⬜` 状态、验收项全部可 `grep`。

---

## 1. 实测数字（本次会话，可复现）

### 1.1 入口文件

| 对象             | 字符       | 行  |
| ---------------- | ---------- | --- |
| `AGENTS.md`      | **6,030**  | 147 |
| `AGENTS-LITE.md` | **14,104** | 238 |

复现：

```powershell
(Get-Content -Raw -Encoding UTF8 -LiteralPath 'AGENTS.md').Length
(Get-Content -Encoding UTF8 -LiteralPath 'AGENTS.md').Count
```

### 1.2 技能树（三 runtime）

| runtime     | `skills/**/*.md` 合计 | 文件数 |
| ----------- | --------------------- | ------ |
| `.dsh`      | 77,944                | 8      |
| `.qoder`    | 160,399               | 17     |
| `.reasonix` | 99,945                | 11     |
| **合计**    | **338,288**           | **36** |

### 1.3 技能树逐文件

| runtime     | 文件                                                          | 字符                            |
| ----------- | ------------------------------------------------------------- | ------------------------------- |
| `.dsh`      | `skills/business-analysis/SKILL.md`                           | 1,680                           |
| `.dsh`      | `skills/sdesign-gen-page/SKILL.md`                            | 32,421                          |
| `.dsh`      | `skills/sdesign-gen-page/references/api-template.md`          | 4,136                           |
| `.dsh`      | `skills/sdesign-gen-page/references/crud-template.md`         | 10,995                          |
| `.dsh`      | `skills/sdesign-gen-page/references/dashboard-template.md`    | 10,730                          |
| `.dsh`      | `skills/sdesign-gen-page/references/detail-template.md`       | 5,237                           |
| `.dsh`      | `skills/sdesign-gen-page/references/form-template.md`         | 9,507                           |
| `.dsh`      | `skills/sdesign-gen-page/references/search-table-template.md` | 3,238                           |
| `.qoder`    | `skills/blueprint-gen/SKILL.md`                               | 7,762                           |
| `.qoder`    | `skills/dashboard-gen/SKILL.md`                               | 10,871                          |
| `.qoder`    | `skills/dashboard-gen/references/dashboard-page-template.md`  | 3,591                           |
| `.qoder`    | `skills/main-agent-execution/SKILL.md`                        | 18,352                          |
| `.qoder`    | `skills/sdesign-gen-page/**`（同 `.dsh`，7 文件）             | 76,264                          |
| `.qoder`    | `skills/task-executor/SKILL.md`                               | 872                             |
| `.qoder`    | `skills/using-git-worktrees/SKILL.md`                         | 6,306                           |
| `.qoder`    | `skills/using-superpowers/SKILL.md`                           | 5,791                           |
| `.qoder`    | `skills/write-prd/SKILL.md`                                   | 13,175                          |
| `.qoder`    | `skills/write-prd/assets/prd-template.md`                     | 9,457                           |
| `.qoder`    | `skills/writing-plans/SKILL.md`                               | 7,958                           |
| `.reasonix` | `skills/blueprint-gen/SKILL.md`                               | 7,762                           |
| `.reasonix` | `skills/dashboard-gen/SKILL.md`                               | **11,381**（≠ `.qoder` 10,871） |
| `.reasonix` | `skills/dashboard-gen/references/dashboard-page-template.md`  | 3,591                           |
| `.reasonix` | `skills/sdesign-gen-page/**`（同 `.dsh`，7 文件）             | 76,264                          |
| `.reasonix` | `skills/task-executor/SKILL.md`                               | **947**（≠ `.qoder` 872）       |

### 1.4 `references/` 三份是否一致（Task 0.2 的依据）

**六文件 SHA-256 三 runtime 全等：**

```
same=True api-template.md
same=True crud-template.md
same=True dashboard-template.md
same=True detail-template.md
same=True form-template.md
same=True search-table-template.md
```

→ **一份进 git 历史即三份保全。**

复现：

```powershell
Get-ChildItem '.dsh/skills/sdesign-gen-page/references' -File | ForEach-Object {
  $n=$_.Name
  $a=(Get-FileHash ".dsh/skills/sdesign-gen-page/references/$n" -Algorithm SHA256).Hash
  $b=(Get-FileHash ".qoder/skills/sdesign-gen-page/references/$n" -Algorithm SHA256).Hash
  $c=(Get-FileHash ".reasonix/skills/sdesign-gen-page/references/$n" -Algorithm SHA256).Hash
  "same=$($a -eq $b -and $b -eq $c) $n"
}
```

> 该结论**补上了 2026-09-07 复盘的未验证项**——它写明「`.qoder/.reasonix` skills 内容一致性**未比对**」。

### 1.5 框架资产

| 对象                             | 字符        | 文件数     |
| -------------------------------- | ----------- | ---------- |
| `.ai/**/*.md`                    | **227,934** | 75         |
| `.ai/sdesign/components/**/*.md` | 61,076      | 35         |
| `.ai/templates/**/*.md`          | 35,252      | 10         |
| `.ai/pitfalls/index.md`          | 11,280      | —          |
| `.ai/pitfalls/verify-errors.md`  | 5,439       | —          |
| `.ai/error-log/raw.jsonl`        | —           | **299 行** |

`.ai/templates/` 逐文件：

| 文件                     | 字符  |
| ------------------------ | ----- |
| `crud-page.md`           | 9,695 |
| `dashboard-page.md`      | 9,406 |
| `editable-table.md`      | 4,069 |
| `page-classification.md` | 2,629 |
| `form-page.md`           | 2,610 |
| `detail-page.md`         | 1,799 |
| `prd/prd-fallback.md`    | 1,673 |
| `api-module.md`          | 1,636 |
| `prd/prd-standard.md`    | 1,388 |
| `recipe.md`              | 347   |

四篇组件的准确字符（**覆盖测量报告 2 的偏高数字**）：

| 文档           | 字符       | 报告 2 曾报 |
| -------------- | ---------- | ----------- |
| `SProTable.md` | **4,050**  | 4,317 ❌    |
| `SForm.md`     | **5,981**  | 6,451 ❌    |
| `SDetail.md`   | **5,458**  | 5,772 ❌    |
| `SButton.md`   | **2,372**  | 2,509 ❌    |
| **合计**       | **17,861** | 19,049      |

### 1.6 `.dsh/` 里的额外资产（本次新发现）

| 文件                                                    | 字符       |
| ------------------------------------------------------- | ---------- |
| `ai-review/AI-ARCHITECTURE-RETROSPECTIVE-2026-09-07.md` | 12,211     |
| `ai-review/report-A.md`                                 | 9,153      |
| `ai-review/report-B.md`                                 | 9,107      |
| `ai-review/report-C.md`                                 | 7,301      |
| `lib-capability-map.md`                                 | 663        |
| **合计**                                                | **38,435** |

`.qoder/specs/distillation-pipeline.md` = 10,829 **字节**（非字符）。

---

## 2. 引用数字（来自本会话测量报告，未由本次独立复算）

| 对象                                      | 字符                   | 出处                            |
| ----------------------------------------- | ---------------------- | ------------------------------- |
| 强模型路径 A 档强制读取（标准 CRUD 首次） | 80,105                 | 测量报告（`.ai/` 9 项清单口径） |
| 技能路径 A 档                             | ~96,000                | 本会话估算                      |
| B 档（小改动）                            | ~30,000                | 本会话估算                      |
| `SKILL.md §2`                             | 19,358（占全文 59.7%） | 测量报告，行 85–365             |
| `SKILL.md` §2 内部冗余                    | 5,877（30.4%）         | 测量报告，bigram Jaccard ≥0.70  |
| `references/` 六文件合计                  | 43,843                 | **本次实测复核，一致**          |
| `raw.jsonl` 规则种数                      | 27                     | 测量报告                        |

---

## 3. 测量陷阱（复现时必须避开）

1. **`.qoder/` 是污染源。** 整个目录 **1,654,094 字符 / 149 文件**，其中 `repowiki/` 占绝大部分（代码 wiki，非技能）。**量技能必须只量 `skills/` 子树**，否则数字虚高约 10 倍。
2. **PowerShell 5.1 ConstrainedLanguage 下必须带 `-Encoding UTF8`。** 不带会把 UTF-8 按 ANSI 解码，字符数虚高（`SKILL.md` 会量成 35,122 / 445 行，实际 32,421 / 525 行）。
3. **字符 vs 字节口径不同。** 2026-09-07 复盘用 KB（字节），本文件用字符。中文 3 字节/字符，两组数字不可直接比。
4. **`.dsh` 的 `skills/` 子树是 8 个 md 文件，但 `.dsh/` 全树是 13 个**——差值在 `ai-review/`（4）与 `lib-capability-map.md`（1）。
5. **`.ai` 文件定义**：本文件计 `-Filter *.md`（75 文件）。含 `.ts` `.jsonl` 的「全文件」口径下约 79。

---

## 4. 单点校正（对 2026-09-07 复盘的时效性订正）

复盘有 3 处已被后续提交改变，**实施时以本文件为准**：

| 复盘的断言                                         | 订正                                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| P0-1「sdesign 拷贝触发脚本**未定位**」             | `.ai/tools/sync-sdesign-docs.ts` **存在**                                                                                      |
| P1-4「verify 集成 sdesign 文档 hash/版本校验」     | **已存在**：`verify-wrapper.ts` 已有 `sync-sdesign-docs.ts --check` 前置漂移校验                                               |
| 「`.qoder/.reasonix` skills 内容一致性**未比对**」 | **已比对**：`sdesign-gen-page` 三份 SHA-256 全等；`blueprint-gen` 全等；`dashboard-gen`、`task-executor` **不一致**（见 §1.3） |

---

## 5. 与 2026-09-07 复盘的对账

### 5.1 重合（两组独立分析得到同一结论 → 优先级应上调）

| 结论                                          | 复盘            | 本次                                  |
| --------------------------------------------- | --------------- | ------------------------------------- |
| 全量必读式清单把预加载账单推高                | A1（≈86,837）   | 实测 80,105                           |
| ≤20 行小改动也要全读 pitfalls                 | A1/b（≈3.1 万） | ~30,000                               |
| 双入口规则漂移、R 规则同名不同义、轮次 3 vs 5 | A2 / M8         | Q14 / R1                              |
| 技能只在 gitignore 里，fresh clone 不可复现   | M8              | Q4 / Task 0.2                         |
| 组件文档读取策略需重估                        | A4              | Q12 / Task 3.1                        |
| 死脚本 `pitfall:review`                       | M4              | 本次核实：`pitfalls-reviewer/` 不存在 |
| 623 行改造提案未实施未归档                    | M7              | 本次核实：仍全 `[ ]`                  |

### 5.2 复盘有、本次没有（**建议并入**）

| 项                                                              | 事实                                                                                                                          | 本次为何重要                                                                                          |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **`.ai/sdesign/` = node_modules 包文档逐字节拷贝 + gitignored** | 34 份与 `@dalydb/sdesign` 包内文档 MD5 全等                                                                                   | Task 3.1 要把组件文档降为「报错才查」——**但它自己含相反指令，降级后一查就被误导**                     |
| **「首选组件」矛盾**                                            | `STable.md`/`SSearchTable.md` 推 SSearchTable；`SProTable.md` 称首选 SProTable；源头在库自身 `index.d.ts:166` vs `:220`       | 技能侧实测用 `SProTable` 19 处、`SSearchTable` **0 处**（与 `src/` 一致）→ **技能是对的，文档是错的** |
| **5 个死链**                                                    | SDynamicContainer / SNoPage / STextEllipsis / useGetDictData / useScale 有实现无文档                                          | 组件文档可信度                                                                                        |
| `useProTable.md` 双份分叉                                       | `components/` 与 `hooks/` 各一份，MD5 不同，components 版尾部损坏                                                             | 同上                                                                                                  |
| **G4「禁 ../」21 处违反**                                       | `features/mail-template` 17 + `router/routes` 5                                                                               | 落地 lint 会立刻失败 → 需先清理，故**不进本次范围**                                                   |
| **eslint 拦截范围窄 + 死 ignore**                               | `editable-tables`（目录不存在）、`register`（空目录）；`src/features`/`src/layouts` 不在范围 → `MainLayout` 裸 Button 过 lint | 与 Task 1.3 同区域，宜一并处理                                                                        |
| **规范区混入非规范资产**                                        | `.ai/docs` ~107.6KB 产品资料 + `raw.jsonl` 66.9KB + 孤儿 `environment-sandbox.md`                                             | 与 Task 2.1 同区域                                                                                    |
| `AGENTS.md:14` 仍写「18 条错题集」                              | 实际 P001–P020 = 20 条                                                                                                        | 一行事实错误，Task 3.1 顺手修                                                                         |
| `task-splitting.md:53` 引不存在的「AGENTS.md §五」              | `AGENTS.md` 实止于 §四                                                                                                        | 死链                                                                                                  |

### 5.3 本次有、复盘没有

| 项                                                                 | 事实                                                                                   |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **技能模板的 7 类错误**                                            | 复盘明确把「props 级逐字段比对」列为**未验证项**                                       |
| **`api-template.md` API 命名三段全错**                             | 无实体前缀 + `ByPut`/`ByDelete` + `PageData`；`api-conventions.md:22` 明令禁止其中两个 |
| **`.ai/templates/` ↔ `references/` 约 95% 重复且已分叉 7 处**      | 复盘未比对两族模板                                                                     |
| **`SKILL.md` 7 处读取指令自相矛盾 + `:364` 非法栅栏吞 5,686 字符** | 复盘未深入技能内容                                                                     |
| **`references/` 三 runtime SHA-256 全等**                          | 复盘的未验证项，已补                                                                   |
| **`§2` 内部 30.4% 冗余、大屏占 41.5%**                             | 复盘只到「pitfalls 压至 1/3」粒度                                                      |
| **`specs/` 挂在未合并分支上、落地后从 main 清理**                  | 复盘称 specs 层「正常」但未描述其生命周期                                              |
| **技能模板只覆盖 36.4% 的组件 API 事实**                           | 复盘未量化                                                                             |

### 5.4 判定

两组分析**互补**：复盘强在**广度**（组件文档来源、eslint 盲区、规范区噪音、外部生态对照），本次强在**技能内容与模板正确性**。

**重合项优先做**——两组独立得出同一结论，说明它不依赖任一方的口径。

---

## 6. Task 5.1 的对照口径

改造后需要重算的，按本文件 §1 的同一命令重跑：

| 指标                              | 改造前  | 改造后                |
| --------------------------------- | ------- | --------------------- |
| `AGENTS.md` 字符                  | 6,030   | 待测                  |
| 技能树三 runtime 合计             | 338,288 | 待测（预期 ~206,759） |
| `.ai/templates/` 合计             | 35,252  | 待测                  |
| `.ai/pitfalls/index.md`           | 11,280  | 待测（目标 ≤2,000）   |
| `.ai/conventions/modify-paths.md` | 903     | 待测（目标 ≤2,000）   |
| `.ai/**/*.md` 合计                | 227,934 | 待测                  |
| `raw.jsonl` 行数                  | 299     | 待测（增量对比）      |
| verify 轮次                       | 待记    | 待记                  |

> ⚠️ **混淆提示**：阶段 1–2 是**正确性**、阶段 3 是**上下文**。两者都会让 verify 错误减少。若需分开归因，阶段 1–2 跑一轮、阶段 3 再跑一轮。
