# 古树档案管理模块 · Task 拆分

> 依据 `.ai/conventions/task-splitting.md`，CRUD Lane，分支 `feature/tree-archive`。
> 需求来源：`docs/lianyungang-tree-checkin/prd.md`（管理后台 MVP = 古树档案 CRUD）。

## 整体进度

| 阶段 | Task 数 | 完成 | 待实施 |
| ---- | ------- | ---- | ------ |
| 全部 | 3       | 3    | 0      |

## Task 列表

### Task 1.1 — api/tree 模块（类型 + 接口）

| 项       | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| **类型** | api                                                          |
| **输出锁** | `src/api/tree/types.ts`、`src/api/tree/index.ts`             |
| **模板** | `.ai/templates/api-module.md`（对齐 `src/api/user` 实际写法） |
| **做什么** | 定义 Tree/TreeQuery/TreeFormData 类型与五方法 API（list/byId/create/update/delete） |

**验收标准**：

- [ ] 五方法命名符合 `{Entity}{动作}By{HTTP}`：getTreeListByPost / getTreeByIdByGet / createTreeByPost / updateTreeByPost / deleteTreeByPost
- [ ] `pnpm verify` 通过

**状态**：✅ 已完成

### Task 2.1 — pages/tree/archive 列表页 + 表单弹层

| 项       | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| **类型** | page-list + page-form                                        |
| **输出锁** | `src/pages/tree/archive/index.tsx`、`src/pages/tree/archive/components/TreeFormModal.tsx` |
| **模板** | `.ai/templates/crud-page.md`（对齐 `src/pages/system/user`） |
| **做什么** | 古树档案列表页（SProTable + 搜索 + 新增/编辑/删除）+ TreeFormModal（createModal 工厂，8 字段两列） |

**验收标准**：

- [ ] SProTable + SButton.Group/Space + createModal 封装，无父组件管 open
- [ ] columns 注解 `SColumnsType<Tree>`，searchItems 不注解（P006）
- [ ] 删除用 `Modal.confirm`（P004），未用参数加 `_` 前缀（P003）
- [ ] `pnpm verify` 通过

**状态**：✅ 已完成

### Task 3.1 — 路由 + 菜单注册

| 项       | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| **类型** | 修改类（走修改路径，≤10 行纯增量）                            |
| **输出锁** | `src/router/routes/index.tsx`、`src/layouts/MainLayout.tsx`  |
| **模板** | 无（纯增量注册）                                             |
| **做什么** | 新增路由 `tree/archive`（lazyPage）+ 侧边栏「古树管理 → 古树档案」菜单项 |

**验收标准**：

- [ ] 路由可达 `/tree/archive`，菜单选中态正确
- [ ] `pnpm verify` 通过

**状态**：✅ 已完成

## 执行规则

- 逐 Task 推进；输出锁互斥，不越界修改
- 每个 Task 完成即跑 `pnpm verify`（最多 3 轮，防死循环 R1/R2）
- 新建文件 verify 通过后执行自重构（回读 → 语义命名 → 函数拆分 → else 消除 → 注释补全 → 重 verify）

## 配方扫描记录

| 模块 | 命中配方 | 沉淀提议 |
| ---- | -------- | -------- |
| 古树档案 | 未命中（配方表为空） | 无 |

## Task 复盘三问

（每个 Task 完成后追加）

### Task 1.1（api/tree）

- Q1: verify 报过什么错？`tsc --noEmit` 报 1 个存量错误 `src/components/DisguiseTextarea/index.tsx: Cannot find module '../DebounceTextArea'`——非本 Task 文件（输出锁外，main 分支 HEAD `a1a1fee` 即存在）。本 Task 文件 0 error。
- Q2: 报错的根因是什么？存量问题：DisguiseTextarea 引用的 DebounceTextArea 模块不存在，与本 Task 无关。
- Q3: 需要沉淀到错题集吗？无。

### Task 2.1（pages/tree/archive）

- Q1: verify 报过什么错？本 Task 文件 0 error（整体 tsc 仍只有上述存量错误）；eslint/prettier 全通过。
- Q2: 报错的根因是什么？无。自重构回读时发现并修复 1 个 SForm 用法错误：`placeholder` 写在 items 顶层 → 移入 `fieldProps`（SForm.md 确认 fieldProps 承载控件属性）。
- Q3: 需要沉淀到错题集吗？有（建议）：错误签名「SForm items 顶层写 placeholder」→ 修复「控件属性一律放 fieldProps，如 `fieldProps: { placeholder }`」。⚠️ 未直接修改 .ai/pitfalls（改 .ai 需用户确认），此处仅记录。

### Task 3.1（路由 + 菜单）

- Q1: verify 报过什么错？0 error（仅存量 DisguiseTextarea 错误）。
- Q2: 报错的根因是什么？无。
- Q3: 需要沉淀到错题集吗？无。
