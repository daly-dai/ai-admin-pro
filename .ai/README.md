# .ai/ 配置目录索引

> 本目录包含 AI 辅助开发的规范和指南文档。项目入口为根目录的 AGENTS.md。

## AI 阅读顺序（重要）

`

1. AGENTS.md → 入口，硬约束 + 豁免范围 + 工作流
2. 根据场景查阅 guides/ → 强制预读，不可跳过（见 AGENTS.md 步骤 2）
3. 根据场景查阅 specs/ → 需求拆解，开发前必读（见 AGENTS.md 步骤 1）
4. 按需查阅 core/ → 组件 API、架构、代码规范
5. 按需查阅 conventions/ → API 约定、增量开发、验证流程
   `

> ⚠️ 跳过步骤 2 或 3 直接生成代码是组件约束违规的首要原因。

## 目录结构

`.ai/
├── core/                  # 核心规范（深入参考）
│   ├── architecture.md    # 架构规范、项目结构
│   ├── coding-standards.md # 代码规范
│   └── tech-stack.md      # 技术栈定义和约束
├── specs/                 # 需求规格（开发前必读）
│   ├── template.md        # 需求拆解模板
│   ├── progress-template.md # 进度追踪模板
│   └── [feature]/         # 每个功能的需求目录
│       ├── spec.md        # 需求拆解（Task 列表）
│       └── progress.md    # 开发进度追踪
├── sdesign/               # @dalydb/sdesign 组件库文档（自动同步，已 gitignore）
│   ├── llms.txt           # 组件库概览
│   └── components/        # 各组件详细文档（SForm.md, STable.md 等）
├── conventions/           # 开发约定
│   ├── api-conventions.md # API 设计约定（YAML 接口定义格式）
│   ├── incremental-development.md # 增量开发规范（含场景前置阅读清单）
│   └── verification.md    # 验证流程规范（三级验证体系）
├── guides/                # 开发指南（场景匹配即必读，每个 guide 顶部有前置条件）
│   ├── crud-page.md       # CRUD 页面开发指南
│   ├── api-module.md      # API 模块开发指南
│   ├── form-page.md       # 表单页面开发指南
│   └── detail-page.md     # 详情页面开发指南
└── tools/                 # 工具脚本
    └── sync-sdesign-docs.ts # 组件库文档同步`

## SDD 开发流程

`① 需求拆解（specs/）
   ↓ 拆解为可执行的 Task
② 规范约束（guides/ + core/）
   ↓ AI 按规范生成代码
③ 验证兜底（conventions/verification.md）
   ↓ 三级验证：代码 → 功能 → 业务
④ 完成`

## 硬约束验证

所有代码规范通过 ESLint + TypeScript + Prettier 机械化强制执行：

`ash
pnpm verify        # 全量验证（tsc + eslint + prettier）
pnpm verify:fix    # 自动修复
`
