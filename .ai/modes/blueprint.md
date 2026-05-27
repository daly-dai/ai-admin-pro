# 阶段⓪b：双PRD → 前端蓝图

> 产品PRD + 后端SDD PRD → 交叉对比 → 前端实现蓝图 (spec.md + progress.md)。
> 输出的是「前端SDD」——页面类型分类 + Task拆解 + 执行路径，任何页面类型通用。

## 前置检查

开始前确认已获取两份文档：**产品 PRD** + **后端 SDD PRD**。缺任一来源 → 向用户索要。

## 触发条件

- 用户同时持有产品PRD和后端SDD PRD
- 用户信号：「生成蓝图/blueprint/前端SDD/拆Task/双PRD/两份PRD」

## 前提假设

- 产品PRD定义了「做什么」（页面清单、交互模式、业务规则）
- 后端SDD PRD定义了「数据从哪来」（实体、字段、枚举、接口）
- 两者可能有冲突，交叉对比是核心步骤
- AI 负责提取+对比+分类，用户负责决策🔴冲突

---

## 交叉对比规则

**权威规则**（冲突时以谁为准）：

| 维度                          | 权威来源                                 | 原因             |
| ----------------------------- | ---------------------------------------- | ---------------- |
| 字段类型、枚举值              | 后端SDD                                  | 后端实现数据库   |
| API路径、HTTP方法             | 后端SDD                                  | 后端暴露接口     |
| 必填/可选                     | 后端SDD                                  | 后端强制约束     |
| 页面清单、功能范围            | 产品PRD                                  | 产品定义用户需求 |
| 交互模式（Modal/页面/Drawer） | 产品PRD                                  | 产品定义UX       |
| 业务规则（校验/流转）         | 产品PRD（前端交互）+ 后端SDD（数据约束） | 互相校验         |
| 显示文案、标签                | 产品PRD                                  | 产品定义用户语言 |

**差异分级**：

| 级别   | 符号 | 含义                      | 处理                 |
| ------ | ---- | ------------------------- | -------------------- |
| 冲突   | 🔴   | 两份PRD对同一事物定义不同 | **暂停，等用户决策** |
| 需确认 | ⚠️   | 一份PRD有、另一份缺失     | AI建议 → 用户可覆盖  |
| 一致   | 🟢   | 两份PRD一致               | 自动纳入             |

**对比维度**：实体字段匹配 → 接口覆盖 → 枚举对齐 → 页面-API映射

---

## 页面类型分类

对产品PRD中每个页面/功能，按 `page-classification.md` 的类型目录表匹配分类。分类结果标注置信度：`高` / `中` / `低`。

## 用户决策门

展示交叉对比摘要 + 页面分类结果：

```
📊 双PRD交叉对比完成

✅ 一致: {N} 项
⚠️ 需确认: {M} 项（AI 已给默认建议）
🔴 冲突: {K} 项（需您决策）

[逐项展示 🔴 冲突，含后端值 vs 产品值+AI建议]

📄 页面类型识别:

| 页面 | 类型 | 置信度 |
|------|------|--------|
| ...  | ...  | ...    |

确认页面类型？{K} 个冲突如何处理？
```

所有 🔴 项决策完毕 + 页面类型确认后，进入生成 spec.md。

## 生成 spec.md

按 `specs/template.md` 格式，写入 `.ai/specs/{feature}/spec.md`。

**生成每个 Task 时**：从 `.ai/conventions/task-gates.md` 按 Task 类型取默认值，`{module}` 替换为实际模块名，`{Entity}` 替换为实际实体名。输出锁和验收闸门填入 Task，不得留空。

每个 Task 必须包含：

```markdown
### Task N: [标题]

**类型**: {task-type}

**描述**: [1-3句]

**前置条件**: [依赖的Task号]

**输出锁**: [从 task-gates.md 按类型取默认值，替换{module}]

- src/api/{module}/types.ts (新建/修改)
- ...

**验收闸门**: [从 task-gates.md 按类型取默认值，保留checklist格式]

- [ ] ...
- [ ] 全局闸门 G1-G12 全部通过
- [ ] pnpm verify 0 error（仅本Task输出锁内文件，范围外报错忽略）

**AI 必读文档**:

- [ ] .ai/templates/{template}.md
- [ ] .ai/sdesign/components/{Component}.md

**关键决策**: [未解决的 🔴/⚠️ 或重要推断]
```

**Task 必读模板映射**（来自 page-classification.md）：

| 类型                                                              | 必读模板                                                          |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| api, page-list, page-form, page-detail, component, store          | api-module.md, crud-page.md, form-page.md, detail-page.md（按需） |
| page-dashboard, component-chart, component-widget, data-transform | dashboard-page.md                                                 |
| page-workflow                                                     | workflow-page.md                                                  |
| page-landing                                                      | landing-page.md                                                   |
| page-custom                                                       | —（用户指定）                                                     |

**Task 排序原则**：数据优先（api → page），依赖在前。

---

## 约束

- **不写代码**：本阶段只输出 spec.md + progress.md，不创建 `src/` 下任何文件
- **不确定不猜**：模糊的字段映射、页面边界标注 `[待确认]`，不自行判断
- **冲突必须决策**：所有 🔴项在用户决策前，蓝图不算完成
- **字段名保持原文**：不转换命名风格，在代码生成阶段转换
- **一个 feature 一个目录**：`.ai/specs/{feature}/`

## 输出锁

🔒 `.ai/specs/{feature}/spec.md` + `.ai/specs/{feature}/progress.md`
