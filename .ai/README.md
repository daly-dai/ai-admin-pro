# .ai/ 配置目录索引

> 本目录包含 AI 辅助开发的规范和指南文档。项目入口为根目录的 `AGENTS.md`。

## AI 阅读顺序

```
1. AGENTS.md → 唯一入口，判断工作模式（api-gen / page-first / api-connect / incremental / spec-gen / full-sdd）
2. modes/{mode}.md → 按匹配的模式读取对应流程文件，获取详细步骤和输出锁
3. 按模式步骤按需读取 templates/ / guides/ / conventions/ 等文件
```

> ⚠️ 不要跳过模式判断直接生成代码，也不要一次性读取所有文件。按模式步骤渐进式加载。

## 目录结构

```
.ai/
├── core/                        # 核心规范
│   ├── architecture.md          # 架构规范、项目结构
│   ├── coding-standards.md      # 代码规范
│   └── tech-stack.md            # 技术栈定义和约束
├── modes/                       # 工作模式流程（每个模式一个文件）
│   ├── api-gen.md               # 接口生成模式
│   ├── page-first.md            # 页面先行模式
│   ├── api-connect.md           # 接口对接模式
│   ├── incremental.md           # 增量修改模式
│   ├── spec-gen.md              # 功能规格书生成模式
│   └── full-sdd.md              # 完整 SDD 模式
├── conventions/                 # 开发约定
│   ├── api-conventions.md       # API 规范（SSOT，唯一权威来源）
│   ├── feature-spec-workflow.md # Swagger+PRD 合并工作流
│   ├── incremental-development.md # 增量开发规范
│   ├── verification.md          # 验证流程规范（三级验证体系）
│   └── correction-workflow.md   # 纠错沉淀工作流（四层防御）
├── guides/                      # 开发指南（按模式步骤按需读取）
│   ├── crud-page.md             # CRUD 页面开发指南
│   ├── api-module.md            # API 模块开发指南
│   ├── form-page.md             # 表单页面开发指南
│   └── detail-page.md           # 详情页面开发指南
├── templates/                   # 代码模板
│   ├── api-module.md            # API 模块代码模板
│   ├── crud-page.md             # CRUD 页面代码模板
│   ├── detail-page.md           # 详情页面代码模板
│   ├── form-designer.md         # 表单页面代码模板
│   └── feature-spec.md          # 功能规格书输出模板
├── specs/                       # 需求规格（开发前必读）
│   ├── template.md              # 需求拆解模板
│   ├── progress-template.md     # 进度追踪模板
│   ├── session-template.md      # 会话交接模板
│   ├── prd-template.md          # PRD 模板
│   └── [feature]/               # 每个功能的需求目录
├── pitfalls/                    # 错题集（已知错误模式）
│   ├── index.md                 # 错题索引
│   └── *.md                     # 各错误模式详情
├── sdesign/                     # @dalydb/sdesign 组件库文档（自动同步，已 gitignore）
│   ├── README.md                # 组件索引
│   └── components/              # 各组件详细文档（SForm.md, SSearchTable.md 等）
└── tools/                       # 工具脚本
    └── sync-sdesign-docs.ts     # 组件库文档同步
```

## 开发流程

```
① 模式判断（AGENTS.md 模式表）
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

所有代码规范通过 ESLint + TypeScript + Prettier 机械化强制执行：

```bash
pnpm verify        # 全量验证（tsc + eslint + prettier）
pnpm verify:fix    # 自动修复
```
