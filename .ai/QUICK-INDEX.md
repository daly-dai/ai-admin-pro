# 快速索引（QUICK-INDEX）

> 扁平化文件导航，支持关键词快速定位。

---

## 按场景查找

| 场景            | 文件路径                             |
| --------------- | ------------------------------------ |
| 首次进入项目    | `AGENTS.md`                          |
| 不确定当前阶段  | `AGENTS.md` → 一、阶段判断           |
| 需要查代码规范  | `.ai/core/coding-standards.md`       |
| 需要查 API 规范 | `.ai/conventions/api-conventions.md` |
| 需要查验证规则  | `.ai/conventions/verification.md`    |
| 需要查安全规则  | `.ai/core/security-rules.md`         |

---

## 按阶段查找

| 阶段       | 触发信号                            | 流程文件                   |
| ---------- | ----------------------------------- | -------------------------- |
| ① 画 Demo  | PRD/需求 + "画页面/出骨架/demo"     | `.ai/modes/demo.md`        |
| ② 接口合并 | 提供 Swagger/接口文档               | `.ai/modes/api-merge.md`   |
| ③ 改造适配 | feature-spec就绪 + "改造/对齐规格"  | `.ai/modes/demo-refine.md` |
| ④ 接口对接 | 真实接口就绪 + "对接/联调/替换mock" | `.ai/modes/api-connect.md` |
| ⑤ 迭代修复 | "改一下/加字段/修复/调整"           | `.ai/modes/incremental.md` |

---

## 按任务类型查找

| 任务类型       | 文件路径                         |
| -------------- | -------------------------------- |
| 开发 CRUD 页面 | `.ai/guides/crud-page.md`        |
| 开发 API 模块  | `.ai/guides/api-module.md`       |
| Task 拆解      | `.ai/specs/template.md`          |
| PRD 规范化     | `.ai/specs/prd-template.md`      |
| 进度追踪       | `.ai/specs/progress-template.md` |
| 会话交接       | `.ai/specs/session-template.md`  |

---

## 按问题类型查找

| 问题类型                  | 文件路径                                     |
| ------------------------- | -------------------------------------------- |
| Modal/Drawer 封装问题     | `.ai/pitfalls/modal-drawer-encapsulation.md` |
| 可编辑表格问题            | `.ai/pitfalls/editable-table.md`             |
| render 函数未使用参数问题 | `.ai/pitfalls/unused-params-in-render.md`    |

---

## 核心规范文件清单

| 文件                                 | 用途                     | 行数 |
| ------------------------------------ | ------------------------ | ---- |
| `AGENTS.md`                          | 主入口，阶段判断，硬约束 | 160  |
| `.ai/core/coding-standards.md`       | 代码规范，组件使用规则   | 384  |
| `.ai/core/architecture.md`           | 项目结构，架构规范       | 213  |
| `.ai/core/security-rules.md`         | 安全规则，操作分类       | -    |
| `.ai/conventions/api-conventions.md` | API 命名规范，类型映射   | 324  |
| `.ai/conventions/verification.md`    | 验证流程，三级验证       | 234  |

---

## 模板文件清单

| 文件                            | 用途              |
| ------------------------------- | ----------------- |
| `.ai/templates/crud-page.md`    | CRUD 页面代码模板 |
| `.ai/templates/api-module.md`   | API 模块代码模板  |
| `.ai/templates/feature-spec.md` | 功能规格书模板    |

---

## 关键词索引

| 关键词       | 对应文件                                                   |
| ------------ | ---------------------------------------------------------- |
| sdesign 组件 | `.ai/core/coding-standards.md` + `.ai/sdesign/components/` |
| SSearchTable | `.ai/sdesign/components/SSearchTable.md`                   |
| SForm        | `.ai/sdesign/components/SForm.md`                          |
| SButton      | `.ai/sdesign/components/SButton.md`                        |
| useRequest   | `.ai/core/coding-standards.md`                             |
| Zustand      | `.ai/core/coding-standards.md`                             |
| 类型定义     | `.ai/conventions/api-conventions.md`                       |
| 验证命令     | `AGENTS.md` + `.ai/conventions/verification.md`            |
| 输出锁       | 各阶段模式文件末尾                                         |
