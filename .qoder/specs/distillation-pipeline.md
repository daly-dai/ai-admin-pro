# 蒸馏管线 — AGENTS.md -> LITE 规则覆盖度追踪

## 背景

本项目有双轨 AI 架构：

- **AGENTS.md**（强模型研发实验室）：5 阶段生命周期、66+ 条规则、引用链式文档体系
- **AGENTS-LITE.md**（弱模型生产线）：查表式规则 + @FILL 填空模板 + Skill 路由

新规则通过探索和纠错沉淀进入 AGENTS.md（及其 `.ai/` 引用链），但**没有追踪机制**提醒是否需要蒸馏到 LITE。目前蒸馏过程完全靠人肉、无追踪。

**目标**：加一层轻量追踪（Markdown 表格 + 极简漂移检测脚本），让蒸馏缺口可见，同时不产生随架构演化膨胀的维护成本。

**核心约束**：「架构在不断演化，脚本维护会越来越臃肿」——因此脚本必须**对演化免疫**（所有配置从追踪表动态读取，不硬编码任何规则或文件路径）。

---

## 方案

### 第一步：创建 `.ai/distill-tracker.md`（追踪表文件）

用 Markdown 表格追踪 **19 个规则组**（不是 66 条逐条追踪），按源文件分组。每行 = 一个源文件（AGENTS.md 按章节拆为 6 组）。

**文件路径**：`.ai/distill-tracker.md`

**内容**：

```markdown
# 蒸馏追踪表

> AGENTS.md → AGENTS-LITE.md 知识覆盖度追踪。
> 漂移检测：`pnpm distill:check`

## 使用方式

1. 修改 `.ai/` 下的文件后，运行 `pnpm distill:check`
2. 查看报告中标为「漂移」的组
3. 判断：需要蒸馏 → 更新 LITE + 更新确认日期 | 不需要 → 只更新确认日期
4. 报告中出现「未追踪」文件时，决定是否加入追踪表

## 追踪表

| 组号 | 源文件                                   | 主题                        | 优先级 | LITE 状态 | LITE 位置         | 确认日期   |
| ---- | ---------------------------------------- | --------------------------- | ------ | --------- | ----------------- | ---------- |
| G01  | `AGENTS.md#S1`                           | 生命周期与阶段路由          | -      | - 不蒸馏  | —                 | 2026-04-23 |
| G02  | `AGENTS.md#S2-组件`                      | 组件替换+阻断性读取         | P0     | 已覆盖    | §2 组件替换       | 2026-04-23 |
| G03  | `AGENTS.md#S2-导入`                      | 导入规则+全局类型           | P0     | 已覆盖    | §2 禁止模式       | 2026-04-23 |
| G04  | `AGENTS.md#S2-流程`                      | 上下文/引用深度/自主权/风险 | -      | - 不蒸馏  | —                 | 2026-04-23 |
| G05  | `AGENTS.md#S3`                           | 验证规则+自检清单           | P1     | 部分覆盖  | §3 常见报错       | 2026-04-23 |
| G06  | `AGENTS.md#S5`                           | 纠错沉淀触发                | -      | - 不蒸馏  | —                 | 2026-04-23 |
| G07  | `.ai/modes/demo.md`                      | ① 画 Demo 流程              | -      | - 不蒸馏  | Skill 覆盖        | 2026-04-23 |
| G08  | `.ai/modes/api-merge.md`                 | ② 接口合并流程              | -      | - 不蒸馏  | Skill 覆盖        | 2026-04-23 |
| G09  | `.ai/modes/demo-refine.md`               | ③ 改造适配流程              | -      | - 不蒸馏  | Skill 覆盖        | 2026-04-23 |
| G10  | `.ai/modes/api-connect.md`               | ④ 接口对接流程              | -      | - 不蒸馏  | Skill 覆盖        | 2026-04-23 |
| G11  | `.ai/modes/incremental.md`               | ⑤ 迭代修复                  | P1     | 部分覆盖  | §1 修改路径 T1-T8 | 2026-04-23 |
| G12  | `.ai/conventions/api-conventions.md`     | API 命名/useRequest         | P0     | 部分覆盖  | §2 禁止模式(部分) | 2026-04-23 |
| G13  | `.ai/conventions/verification.md`        | 三级验证体系                | P1     | 部分覆盖  | §3 常见报错       | 2026-04-23 |
| G14  | `.ai/conventions/correction-workflow.md` | 纠错五层防御                | -      | - 不蒸馏  | —                 | 2026-04-23 |
| G15  | `.ai/core/coding-standards.md`           | TS/React 编码规范           | P0     | 部分覆盖  | §2 禁止模式       | 2026-04-23 |
| G16  | `.ai/core/architecture.md`               | 项目结构约束                | P1     | - 不蒸馏  | Skill 内嵌        | 2026-04-23 |
| G17  | `.ai/core/lifecycle-advanced.md`         | 非线性跳转/弹性退出         | -      | - 不蒸馏  | —                 | 2026-04-23 |
| G18  | `.ai/core/tech-stack.md`                 | 技术栈+禁用列表             | P1     | 部分覆盖  | 文件头标注        | 2026-04-23 |
| G19  | `.ai/pitfalls/*.md`                      | 错题集 P001-P006+           | P0     | 已覆盖    | §1 第4步读取      | 2026-04-23 |

**优先级**：`P0` = 必须蒸馏（弱模型依赖） | `P1` = 部分蒸馏 | `-` = 不蒸馏（强模型专属或 Skill 已覆盖）

**LITE 状态**：`已覆盖` = 完整覆盖 | `部分覆盖` = 有精简版本 | `- 不蒸馏` = 有意不蒸馏

## 变更日志

| 日期       | 组号 | 变更内容       | 处理方式                 |
| ---------- | ---- | -------------- | ------------------------ |
| 2026-04-23 | —    | 初始追踪表创建 | 基于完整覆盖度审计的基线 |
```

**脚本解析规则**：

- `源文件`列：提取反引号内文本，`#` 前为文件路径（如 `AGENTS.md#S2-组件` → `AGENTS.md`）。含 `*` 通配符时 glob 该目录
- `确认日期`列：`YYYY-MM-DD` 日期字符串，与 git log 日期做比较
- 其余列脚本不解析，纯人工维护

### 第二步：创建 `.ai/tools/distill-check.ts`（漂移检测脚本）

**文件路径**：`.ai/tools/distill-check.ts`（目标 ~100-120 行）

**设计原则**：

- 完全照搬 `verify-scope.ts` 的代码结构（imports → constants → helpers → main）
- **所有配置从 `distill-tracker.md` 动态读取**——不硬编码任何文件路径或组号
- 只做：解析表格 → git log 取日期 → 日期比较 → glob 未追踪文件 → 输出报告
- 软告警（exit 0），永远不修改任何文件

**算法流程**：

```
1. 读取 .ai/distill-tracker.md
2. 正则匹配表格行（/^\| (G\d{2}) \|/）
3. 每行提取：
   - source：反引号中的文本 → 去掉 # 后缀 → 解析为文件路径
   - verified：确认日期列的日期字符串
4. 去重源文件（多个 G 行可能指向同一个 AGENTS.md）
5. 对每个唯一源文件：
   - 含 *.md 通配符 → glob 目录，取所有 .md 文件中最大的 git 修改日期
   - 否则 → git log -1 --format=%aI -- {file}
6. 比较：git 日期 > 确认日期 → 标记为「漂移」
7. Glob 扫描 .ai/{modes,conventions,core,pitfalls}/*.md + AGENTS.md
   - 过滤掉已在源文件列中的文件
   - 剩余的 = 「未追踪」
8. 输出报告：
   - 漂移组按优先级排序（P0 优先）
   - 未追踪文件
   - 汇总行
```

**关键实现细节**：

```typescript
// 表格行解析（参考 pitfall-scan.ts 的正则模式）
const TABLE_ROW = /^\|\s*(G\d{2})\s*\|\s*`([^`]+)`\s*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|\s*(\d{4}-\d{2}-\d{2})\s*\|/;

// 源文件路径解析
function resolveSource(raw: string): { file: string; isGlob: boolean } {
  const hashIdx = raw.indexOf('#');
  const filePart = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
  return { file: filePart, isGlob: filePart.includes('*') };
}

// 获取 git 修改日期（复用 verify-scope.ts 模式）
function getGitDate(file: string): string | null {
  try {
    return execSync(`git log -1 --format=%aI -- "${file}"`, { ... }).trim() || null;
  } catch { return null; }
}

// 通配符源（如 .ai/pitfalls/*.md）：取目录下所有匹配文件的最大 git 日期
function getMaxGitDate(pattern: string): string | null { ... }
```

**输出报告示例**：

```
蒸馏漂移检测报告

漂移（源文件在上次确认后有变更）：
  G02  AGENTS.md#S2-组件          修改: 2026-04-25  确认: 2026-04-23  [P0]
  G19  .ai/pitfalls/*.md          修改: 2026-04-24  确认: 2026-04-23  [P0]
  G11  .ai/modes/incremental.md   修改: 2026-04-24  确认: 2026-04-23  [P1]

未追踪（.ai/ 下的新文件不在追踪表中）：
  .ai/pitfalls/new-error-pattern.md
  .ai/templates/editable-table.md

汇总：16/19 组正常 | 3 组漂移（2 个 P0 + 1 个 P1）| 2 个未追踪文件
操作：审查漂移组，按需更新 LITE，然后更新追踪表中的确认日期
```

**为什么脚本对架构演化免疫**：

- 新增 `.ai/` 文件 → 被「未追踪」检测自动捕获 → 手动决定是否加入追踪表
- AGENTS.md 新增章节 → AGENTS.md 的 git 日期变了 → 所有指向 AGENTS.md 的组标为「漂移」 → 人工检查时发现新章节 → 加一行新 G 行
- 追踪表新增列 → 脚本只解析 `源文件` 和 `确认日期` 两列 → 其余列随意加不影响
- **脚本本身永远不需要因架构演化而修改**

### 第三步：注册 npm 命令

**文件**：`package.json`（修改 scripts 部分）

新增一行：

```json
"distill:check": "tsx .ai/tools/distill-check.ts",
```

放在 `verify:scope` 之后，保持工具脚本的字母序分组。

### 第四步：更新 `.ai/README.md` 工具列表

**文件**：`.ai/README.md`

在工具目录树中新增：

```
.ai/tools/
    ...
    ├── distill-check.ts        # 蒸馏漂移检测（pnpm distill:check）
```

在命令列表中新增：

```bash
pnpm distill:check  # 检测 AGENTS→LITE 知识漂移，输出报告
```

---

## 文件清单

| 操作 | 文件                         | 行数                   |
| ---- | ---------------------------- | ---------------------- |
| 新建 | `.ai/distill-tracker.md`     | ~55 行                 |
| 新建 | `.ai/tools/distill-check.ts` | ~100-120 行            |
| 修改 | `package.json`               | +1 行（scripts）       |
| 修改 | `.ai/README.md`              | +2 行（工具列表+命令） |

---

## 验证方式

1. **脚本能正常运行**：

   ```bash
   pnpm distill:check
   ```

   预期：输出 19 个组的报告，全部基线日期 2026-04-23，0 个漂移

2. **漂移检测有效**：修改一个被追踪的源文件（如 `.ai/pitfalls/index.md`），commit 后再跑 `pnpm distill:check` → 应报告 G19 漂移

3. **未追踪检测有效**：脚本应能检测到 `.ai/templates/*.md` 等存在但不在追踪表中的文件，报告为「未追踪」（templates 设计上不追踪，但能验证 glob 正常工作）

4. **演化安全性**：在追踪表中手动加一行 `G20`，填一个不存在的源文件路径 → 脚本应解析它并尝试 `git log`（返回 null → 标记为 UNKNOWN）。证明脚本能适配新行而无需改代码

5. **`pnpm verify` 仍然通过**（不影响现有工具链）
