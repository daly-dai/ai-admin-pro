# 纠错沉淀流程

> 当用户纠正一个错误写法时，AI 必须按此流程将纠正沉淀到对应防御层。
> **禁止只口头应答而不落实到文件。**

---

## 触发条件

用户明确指出以下任一情况时触发本流程：

- "这个写法不对 / 过时了 / 应该用 xxx"
- "不要用 xxx，改成 yyy"
- "这个组件/API 已废弃"

---

## 四层防御体系

```
Layer 1: ESLint 机械拦截     → 0 token 成本，100% 可靠
Layer 2: AGENTS.md 核心速查   → 已常驻上下文，高频错误前置预防
Layer 3: 文件模式自动触发     → 按需加载，~200 token/次
Layer 4: 错题集按需检索       → 按需加载，~200 token/次
```

一个纠正**至少沉淀到一个层**：按 L1→L2→L3→L4 优先级匹配到第一个合适的层，但 **Layer 1 可与 Layer 2 或 Layer 3 联动**。

> **分层协作原则**：Layer 1（ESLint）在步骤 6 verify 时拦截已生成的错误代码，Layer 2/3 在步骤 5/步骤 2 预防错误生成。L1 与 L2/L3 解决不同时间点的问题，可联动。
>
> - L1 + 高频错误 → 同时写 L2（步骤 5 全局预防）
> - L1 + 模式绑定错误 → 同时写 L3（步骤 2 场景预防）
> - L1 + 低频无模式 → 仅 L1（ESLint message 引导修复即可）

---

## 决策流程

```
用户纠正了一个错误写法
         ↓
Step 1: 能否用 ESLint 机械检测？
  ├─ 能 → 写入 Layer 1（eslint.config.mjs）
  │        ↓
  │   此错误是否高频（>30% 同类场景会触发）？
  │   ├─ 是 → 同时写入 Layer 2（verification.md 自检清单）→ ✅ 结束
  │   └─ 否 → 此错误是否绑定特定文件模式？
  │           ├─ 是 → 同时写入 Layer 3（.ai/pitfalls/）→ ✅ 结束
  │           └─ 否 → ✅ 结束（ESLint message 足够引导修复）
  └─ 不能 → Step 2
         ↓
Step 2: 此错误是否高频（>30% 的同类场景会触发）？
  ├─ 是 → 写入 Layer 2（AGENTS.md 步骤 5 / verification.md 自检清单）→ ✅ 结束
  └─ 否 → Step 3
         ↓
Step 3: 此错误是否绑定特定文件模式？
  ├─ 是 → 写入 Layer 3（.ai/pitfalls/{pattern}.md + AGENTS.md 步骤 2 触发表）→ ✅ 结束
  └─ 否 → 写入 Layer 4（.ai/pitfalls/index.md + 独立错题文件）→ ✅ 结束
```

> **分层协作规则**：Layer 1（ESLint）可与 Layer 2 或 Layer 3 联动，因为它们解决不同时间点的问题（L1=步骤 6 兜底，L2=步骤 5 预防，L3=步骤 2 预防）。Layer 2/3/4 之间仍互斥。

---

## 各层写入规范

### Layer 1: ESLint 规则（eslint.config.mjs）

根据错误类型选择对应规则：

| 错误类型          | ESLint 规则              | selector / 配置               |
| ----------------- | ------------------------ | ----------------------------- |
| 禁止某个 import   | no-restricted-imports    | paths[].name                  |
| 禁止某个具名导入  | no-restricted-imports    | paths[].importNames           |
| 禁止某个对象方法  | no-restricted-properties | object + property             |
| 禁止某个 JSX 属性 | no-restricted-syntax     | JSXAttribute[name.name="xxx"] |
| 禁止某种代码模式  | no-restricted-syntax     | AST selector                  |

**写入要求**：

- message 中必须包含正确写法的简短说明
- 写入后运行 `pnpm lint` 确认规则生效且不误报

**示例**：

```js
// 禁止 JSX 属性
'no-restricted-syntax': [
  'error',
  {
    selector: 'JSXAttribute[name.name="destroyOnClose"]',
    message: '禁止使用 destroyOnClose，使用条件渲染 {open && <Modal/>} 替代。',
  },
],
```

### Layer 2: 核心速查（AGENTS.md / verification.md）

写入位置二选一：

- **组件/JSX 相关** → AGENTS.md 步骤 5「组件约束速查」追加条目
- **代码模式相关** → .ai/conventions/verification.md Level 2「AI 自检清单」追加条目

**写入要求**：

- 格式为 `- [ ] 问句形式（是否...而非...？）`
- 一行不超过 60 字

**示例**：

```markdown
- [ ] Modal 是否使用条件渲染 `{open && <Modal/>}` 而非 destroyOnClose？
```

### Layer 3: 文件模式触发（.ai/pitfalls/{pattern}.md）

**写入步骤**：

1. 创建或更新 `.ai/pitfalls/{pattern}.md`（按组件/场景命名，如 `modal-form.md`、`search-table.md`）
2. 在 AGENTS.md 步骤 2 场景预读表格下方追加触发规则

**pitfalls 文件格式**（150-200 token 以内）：

```markdown
# {场景名称}

❌ 错误写法
`tsx
// 简短的错误代码片段
`

✅ 正确写法
`tsx
// 简短的正确代码片段
`

> 原因：一句话解释
```

**AGENTS.md 触发表格式**：

```markdown
| 文件/代码模式           | 自动触发读取               |
| ----------------------- | -------------------------- |
| 含 Modal + SForm 的文件 | .ai/pitfalls/modal-form.md |
```

### Layer 4: 错题集（.ai/pitfalls/index.md + 独立文件）

**写入步骤**：

1. 在 `.ai/pitfalls/index.md` 索引中追加一行
2. 创建 `.ai/pitfalls/{error-id}.md` 详细内容

**索引格式**：

```markdown
| 编号       | 场景关键词       | 一句话描述 |
| ---------- | ---------------- | ---------- |
| FE-ERR-xxx | 关键词1、关键词2 | 简短描述   |
```

**错题文件格式**（同 Layer 3 的 pitfalls 文件格式）

---

## 容量限制与淘汰机制

> 目的：防止错题集无限膨胀导致上下文 token 成本失控。

### 各层容量上限

| 层级    | 计量对象                                 | 上限 |
| ------- | ---------------------------------------- | :--: |
| Layer 1 | eslint.config.mjs 中纠错相关的自定义规则 | 无限 |
| Layer 2 | AGENTS.md 步骤 5 + verification.md 条目  |  15  |
| Layer 3 | .ai/pitfalls/ 中的场景文件数             |  20  |
| Layer 4 | .ai/pitfalls/index.md 索引条目数         |  30  |

> Layer 1 不限容量，因为 ESLint 规则是 0 token 成本的机械拦截，不占用上下文。

### 触发淘汰的时机

当**写入新条目后**某层超出上限时，必须在同次操作中执行淘汰，使条目数回到上限以内。

### 淘汰策略（按优先级）

```
1. 晋升：该条目已被更高层覆盖 → 删除当前层条目
   （例：某个 L4 错题后来有了对应的 L3 pitfall 文件 → 从 L4 删除）
   注意：L1 联动的 L2/L3 条目不适用此规则，它们不因 L1 存在而删除

2. 合并：两个条目描述同一场景的不同细节 → 合并为一条

3. 淘汰：该条目长期未触发（沉淀记录中最近 20 条无相同场景） → 移除
   - Layer 3/4：将文件移至 .ai/pitfalls/archived/ 并从索引删除
   - Layer 2：直接删除条目
```

> 淘汰操作必须在沉淀记录中追加一行，标注 `淘汰` 和原因。

---

## 执行后验证

| 修改目标           | 验证方式                         |
| ------------------ | -------------------------------- |
| eslint.config.mjs  | `pnpm lint` 确认规则生效且无误报 |
| AGENTS.md          | 无需验证，下次 AI 会话自动生效   |
| verification.md    | 无需验证，下次验证循环自动生效   |
| .ai/pitfalls/\*.md | 确认 index.md 索引已同步更新     |

---

## 回复模板

沉淀完成后，必须向用户报告结果（仅列出命中层）：

```
收到纠正，按纠错沉淀流程处理：

命中层：Layer {N}
写入文件：{具体文件路径}
改动内容：{一句话描述}

已运行 pnpm lint 确认规则生效。（仅 Layer 1 需要）
```

---

## 沉淀记录

> 每次沉淀后在此追加记录，便于回溯和去重。

| 日期       | 纠正内容                                      | 命中层 |
| ---------- | --------------------------------------------- | :----: |
| 2026-03-23 | destroyOnClose → 条件渲染 {open && \<Modal/>} |   L1   |
| 2026-03-23 | Modal.confirm → SConfirm 组件                 |   L1   |
