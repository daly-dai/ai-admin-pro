# 纠错沉淀流程

> 当用户纠正错误写法时，AI 必须按此流程沉淀到对应防御层。禁止只口头应答而不落实到文件。

## 触发条件

用户说「这个写法不对/过时了/应该用 xxx」、「不要用 xxx，改成 yyy」时触发。

## 五层防御体系

```
Layer 0: verify 错误速查      → pnpm verify 报错时优先查表，~150 token
Layer 1: ESLint 机械拦截     → 0 token，100% 可靠
Layer 2: 硬约束 + 自检清单    → 已常驻上下文，高频错误预防
Layer 3: 文件模式自动触发     → 按需加载，~200 token/次
Layer 4: 错题集按需检索       → 按需加载，~200 token/次
```

按 L0→L1→L2→L3→L4 优先级匹配。L0 专用于 `pnpm verify` 报错场景（速查表: `.ai/pitfalls/verify-errors.md`）。L1 可与 L2/L3 联动（解决不同时间点）。

## 决策流程

```
用户纠正 → 是 verify 报错？
  ├─ 是 → L0 速查表匹配？→ 匹配则直接执行修复
  └─ 否 → 能否 ESLint 检测？
           ├─ 能 → L1 + 高频？→L2 / 模式绑定？→L3 / 否→仅L1
           └─ 不能 → 高频？→L2 / 模式绑定？→L3 / 否→L4
```

## 各层写入规范

### Layer 0: verify 错误速查

`pnpm verify` 报错时，先查 `.ai/pitfalls/verify-errors.md` 匹配错误签名。匹配到 → 按表中修复方法执行，不自行分析。未匹配 → 进入 L1-L4 常规流程。

新增常见错误时写入 `verify-errors.md` 表格即可。

### Layer 1: ESLint 规则

| 错误类型          | ESLint 规则           | 配置                  |
| ----------------- | --------------------- | --------------------- |
| 禁止某个 import   | no-restricted-imports | paths[].name          |
| 禁止某个 JSX 属性 | no-restricted-syntax  | JSXAttribute selector |
| 禁止某种代码模式  | no-restricted-syntax  | AST selector          |

message 必须包含正确写法，写入后 `pnpm lint` 确认生效且无误报。

### Layer 2: 核心速查

写入位置：

- 组件/JSX → `.ai/core/coding-standards.md`
- 代码模式 → `.ai/conventions/verification.md` Level 2 自检清单

格式：`- [ ] 问句形式（是否...而非...？）`，一行不超过 60 字。

### Layer 3: 文件模式触发

1. 创建/更新 `.ai/pitfalls/{pattern}.md`（150-200 token 以内）
2. 对应模式文件中追加触发规则

pitfalls 文件格式：

```markdown
# {场景名称}

❌ 错误写法 → ✅ 正确写法 → 原因一句话
```

### Layer 4: 错题集

1. `.ai/pitfalls/index.md` 追加索引行
2. 创建 `.ai/pitfalls/{error-id}.md`（格式同 Layer 3）

## 容量限制

| 层级        | 上限  | 淘汰策略        |
| ----------- | :---: | --------------- |
| L0 速查表   | 30 条 | 合并同类 → 淘汰 |
| L1 ESLint   | 无限  | 不限（0 token） |
| L2 自检清单 | 15 条 | 晋升→合并→淘汰  |
| L3 场景文件 | 20 个 | 晋升→合并→淘汰  |
| L4 索引条目 | 30 条 | 晋升→合并→淘汰  |

超出上限时同次操作执行淘汰：已被更高层覆盖→删除 | 同场景→合并 | 长期未触发→归档。

## 验证

| 修改目标           | 验证方式                   |
| ------------------ | -------------------------- |
| eslint.config.mjs  | `pnpm lint` 确认生效无误报 |
| .ai/pitfalls/\*.md | 确认 index.md 索引已同步   |
| 其他 .ai/ 文件     | 下次 AI 会话自动生效       |

## 回复模板

```
收到纠正，按纠错沉淀流程处理：
命中层：Layer {N} | 写入文件：{路径} | 改动：{一句话}
```

## 沉淀记录

| 日期       | 纠正内容                                                      | 命中层 |
| ---------- | ------------------------------------------------------------- | :----: |
| 2026-03-23 | destroyOnClose → 条件渲染 {open && \<Modal/>}                 |   L1   |
| 2026-04-02 | 可编辑表格用 EditableProTable 而非 SForm type='table'         |   L3   |
| 2026-04-07 | SConfirm 组件 → 推荐使用 Modal.confirm 替代                   |   L4   |
| 2026-04-07 | type:'dependency' → useWatch + 动态 items（弃用 SDependency） |   L4   |
