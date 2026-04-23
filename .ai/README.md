# .ai/ 配置目录索引

> 本目录包含 AI 辅助开发的规范和指南文档。项目入口为根目录的 `AGENTS.md`。

## AI 阅读顺序

```
1. AGENTS.md → 唯一入口，判断阶段（① 画 Demo / ② 接口合并 / ③ 改造适配 / ④ 接口对接 / ⑤ 迭代修复）
1.5 .ai/project-brief.md → 认知底座（首次会话读取，记忆覆盖后可跳过）
2. modes/{mode}.md → 按匹配的模式读取对应流程文件，获取详细步骤和输出锁
3. 按模式步骤按需读取 templates/ / conventions/ 等文件
```

> 不要跳过模式判断直接生成代码，也不要一次性读取所有文件。按模式步骤渐进式加载。

## 目录结构

```
.ai/
├── project-brief.md             # 项目认知速览（~68 行，浓缩 tech-stack/architecture/coding-standards/api-conventions）
├── core/                        # 核心规范（速览已覆盖 80%，详细模板按需读取）
│   ├── architecture.md          # 架构规范、项目结构
│   ├── coding-standards.md      # 代码规范（TypeScript/React/API 质量标准）
│   ├── lifecycle-advanced.md    # 生命周期补充（非线性跳转、弹性退出、Task 拆解）
│   └── tech-stack.md            # 技术栈定义和约束
├── modes/                       # 工作模式流程（每个阶段一个文件）
│   ├── demo.md                  # ① 画 Demo 模式
│   ├── api-merge.md             # ② 接口合并模式
│   ├── demo-refine.md           # ③ 改造适配模式
│   ├── api-connect.md           # ④ 接口对接模式
│   └── incremental.md           # ⑤ 迭代修复模式
├── conventions/                 # 开发约定
│   ├── api-conventions.md       # API 规范（SSOT，唯一权威来源）
│   ├── verification.md          # 验证流程规范（三级验证体系）
│   └── correction-workflow.md   # 纠错沉淀工作流（四层防御）
├── templates/                   # 代码模板 + 开发指南（合并）
│   ├── api-module.md            # API 模块模板
│   ├── crud-page.md             # CRUD 页面模板（含交互模式选择 + 弹层封装原则）
│   ├── form-page.md             # 表单页面模板
│   ├── detail-page.md           # 详情页面模板
│   ├── editable-table.md       # 可编辑表格模板（EditableProTable 受控模式 + SForm 嵌入）
│   └── feature-spec.md          # 功能规格书输出模板
├── specs/                       # 需求规格
│   ├── template.md              # 需求拆解模板
│   ├── progress-template.md     # 进度追踪模板

│   ├── prd-template.md          # PRD 模板（含 AI 提取清单）
│   └── [feature]/               # 每个功能的需求目录
├── pitfalls/                    # 错题集（已知错误模式）
│   ├── index.md                 # 错题索引
│   └── *.md                     # 各错误模式详情
├── error-log/                   # 错误飞轮日志（O2）
│   ├── raw.jsonl                # verify 自动追加的原始错误日志（gitignore）
│   └── pending/                 # pitfall:scan 生成的草稿（待人工审批）
├── sdesign/                     # @dalydb/sdesign 组件库文档（自动同步，已 gitignore）
│   ├── README.md                # 组件索引
│   └── components/              # 各组件详细文档（SForm.md, SSearchTable.md 等）
└── tools/                       # 工具脚本
    ├── gen-task-prompt.ts       # 跨会话 Task Prompt 生成（pnpm task:prompt <feature>）
    ├── sync-sdesign-docs.ts     # 组件库文档同步（pnpm sync-ai-docs，postinstall 自动执行）
    ├── verify-wrapper.ts        # verify 增强包装器（pnpm verify，自动追加错误到 raw.jsonl）
    ├── pitfall-scan.ts          # 错误模式聚合器（pnpm pitfall:scan，生成 pitfall 草稿）
    ├── distill-check.ts          # 蒸馏漂移检测（pnpm distill:check，AGENTS→LITE 知识漂移）
    └── verify-scope.ts          # 输出锁范围检查（pnpm verify:scope，跨模块软告警）
```

## 开发流程

```
① 阶段判断（AGENTS.md 阶段总览表）
   ↓ 根据用户消息关键词匹配模式
② 读取模式文件（modes/{mode}.md）
   ↓ 获取步骤、约束、输出锁
③ 按步骤执行（读模板 → 读 sdesign 文档 → 读错题集 → 生成代码）
   ↓ 遵循硬约束，使用 sdesign 组件前必须读文档
④ 验证（pnpm verify + 自检 + 错题集对照）
   ↓ 最多 3 轮修复
⑤ 完成
```

## 硬约束验证

```bash
pnpm verify        # 全量验证（tsc + eslint + prettier），错误自动追加到 error-log/raw.jsonl
pnpm verify:fix    # 自动修复
pnpm verify:scope  # 跨模块修改范围检查（软告警）
pnpm distill:check # 检测 AGENTS→LITE 知识漂移，输出报告
pnpm pitfall:scan  # 聚合高频错误，生成 pitfall 草稿到 error-log/pending/
```
