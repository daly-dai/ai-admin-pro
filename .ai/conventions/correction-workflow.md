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

一个纠正**可以同时沉淀到多个层**：Layer 1 拦截错误写法，Layer 2/3 引导正确写法。

---

## 决策流程

```
用户纠正了一个错误写法
         ↓
Step 1: 能否用 ESLint 机械检测？
  ├─ 能 → 写入 Layer 1（eslint.config.mjs）
  │       继续判断 Step 2（Layer 1 拦截错误，Layer 2+ 引导正确）
  └─ 不能 → 跳到 Step 2
         ↓
Step 2: 此错误是否高频（>30% 的同类场景会触发）？
  ├─ 是 → 写入 Layer 2（AGENTS.md 步骤 5 / verification.md 自检清单）
  └─ 否 → 跳到 Step 3
         ↓
Step 3: 此错误是否绑定特定文件模式？
  ├─ 是 → 写入 Layer 3（.ai/pitfalls/{pattern}.md + AGENTS.md 步骤 2 触发表）
  └─ 否 → 写入 Layer 4（.ai/pitfalls/index.md + 独立错题文件）
```

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

## 执行后验证

| 修改目标           | 验证方式                         |
| ------------------ | -------------------------------- |
| eslint.config.mjs  | `pnpm lint` 确认规则生效且无误报 |
| AGENTS.md          | 无需验证，下次 AI 会话自动生效   |
| verification.md    | 无需验证，下次验证循环自动生效   |
| .ai/pitfalls/\*.md | 确认 index.md 索引已同步更新     |

---

## 回复模板

沉淀完成后，必须向用户报告结果：

```
收到纠正，按纠错沉淀流程处理：

Layer 1 ✅/— eslint.config.mjs
  - [具体改动]

Layer 2 ✅/— AGENTS.md / verification.md
  - [具体改动]

Layer 3 ✅/— .ai/pitfalls/{file}.md
  - [具体改动]

Layer 4 ✅/— .ai/pitfalls/index.md
  - [具体改动]

已运行 pnpm lint 确认规则生效。
```

---

## 沉淀记录

> 每次沉淀后在此追加记录，便于回溯和去重。

| 日期       | 纠正内容                                      | L1  | L2  | L3  | L4  |
| ---------- | --------------------------------------------- | :-: | :-: | :-: | :-: |
| 2026-03-23 | destroyOnClose → 条件渲染 {open && \<Modal/>} | ✅  | ✅  |  —  |  —  |
| 2026-03-23 | Modal.confirm → SConfirm 组件                 | ✅  |  —  |  —  |  —  |
