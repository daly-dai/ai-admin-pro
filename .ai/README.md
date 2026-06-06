# .ai/ 配置目录索引

> 项目入口为根目录 `AGENTS.md`（执行管道）。本目录是资产库——模板、规约、错题集、组件文档。

## AI 阅读顺序

```
1. AGENTS.md → 唯一入口，执行策略 → 场景匹配 → Lane 分发
2. .ai/project-brief.md → 认知底座（首次会话读取，后续记忆覆盖可跳过）
3. 按 Lane 需读取 templates/ / conventions/ 等资产文件（不跳转流程文件）
```

> AGENTS.md 是管道，.ai/ 是资产。管道告诉 AI "做什么 + 用什么"，资产告诉 AI "长什么样 + 不能犯什么错"。

## 目录结构

```
.ai/
├── project-brief.md              # 项目认知速览（浓缩 tech-stack/architecture/coding-standards/principles）
├── core/                         # 核心规范
│   ├── ai-engineering-principles.md  # 指导思想（宪法 + 执政纲领 + 落地笔记）
│   ├── architecture.md           # 架构规范、项目结构
│   ├── coding-standards.md       # 代码规范（TypeScript/React/API）
│   └── tech-stack.md             # 技术栈定义和约束
├── conventions/                  # 开发规约
│   ├── api-conventions.md        # API 规范（SSOT，含 🔴🟡🟢 差异分级）
│   ├── dashboard-conventions.md  # 大屏规约（组件独立性/数据分离/D1-D6）
│   ├── dict-conventions.md       # 字典使用规范
│   ├── task-gates.md             # Task 闸门 + 输出锁
│   └── verification.md           # 验证三级体系
├── templates/                    # 代码模板（填空式）
│   ├── prd/                      # PRD 模板
│   │   ├── prd-standard.md       # 标准场景 PRD（CRUD/表单/详情）
│   │   └── prd-fallback.md       # 兜底 PRD（非标场景）
│   ├── api-module.md             # API 模块模板
│   ├── crud-page.md              # CRUD 列表页模板
│   ├── form-page.md              # 表单页模板
│   ├── detail-page.md            # 详情页模板
│   ├── dashboard-page.md         # 大屏页面骨架模板
│   ├── editable-table.md         # 可编辑表格模板
│   └── page-classification.md    # 页面类型分类目录
├── pitfalls/                     # 错题集
│   ├── index.md                  # 全局索引（P001-P006+）
│   ├── verify-errors.md          # 错误速查表
│   └── *.md                      # 各错题详情
├── sdesign/                      # 组件库文档（自动同步）
│   └── components/
└── tools/                        # 工具脚本
    ├── gen-task-prompt.ts        # 跨会话 Task 提示词生成
    ├── pitfall-scan.ts           # 高频错误聚合
    ├── sync-sdesign-docs.ts      # 组件文档同步
    ├── verify-scope.ts           # 输出锁范围检查
    └── verify-wrapper.ts         # verify 增强包装器
```

## 开发流程

```
用户需求 → AGENTS.md §一 执行策略（前置判断）
  → §二 场景匹配 → Lane 分发（CRUD / 大屏 / 多Tab / 非标）
  → §四 生成流程（读模板 → 读组件文档 → 读错题集 → 填空 → verify）
  → §五 修改路径（迭代）
```

## 验证

```bash
pnpm verify        # tsc + eslint + prettier
pnpm verify:fix    # 自动修复
pnpm verify:scope  # 跨模块修改范围检查
pnpm pitfall:scan  # 高频错误聚合 → 生成 pitfall 草稿
```
