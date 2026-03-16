# .ai/ 配置目录索引

> 本目录包含 AI 辅助开发的规范和指南文档。项目入口为根目录的 `AGENTS.md`。

## AI 阅读顺序（重要）

```
1. AGENTS.md            ← 入口，硬约束 + 豁免范围 + 工作流
2. 根据场景查阅 guides/ ← 强制预读，不可跳过（见 AGENTS.md 步骤 2）
3. 按需查阅 core/       ← 组件 API、架构、代码规范
4. 按需查阅 conventions/ ← API 约定、增量开发
```

> ⚠️ 跳过步骤 2 直接生成代码是组件约束违规的首要原因。

## 目录结构

```
.ai/
├── core/                  # 核心规范（深入参考）
│   ├── architecture.md    # 架构规范、项目结构
│   ├── coding-standards.md # 代码规范
│   ├── tech-stack.md      # 技术栈定义和约束
│   └── tech-stack.md      # 技术栈定义和约束
├── sdesign/               # @dalydb/sdesign 组件库文档（自动同步，已 gitignore）
│   ├── llms.txt           # 组件库概览
│   └── components/        # 各组件详细文档（SForm.md, STable.md 等）
├── conventions/           # 开发约定
│   ├── api-conventions.md # API 设计约定（YAML 接口定义格式）
│   └── incremental-development.md # 增量开发规范（含场景前置阅读清单）
├── guides/                # 开发指南（场景匹配即必读，每个 guide 顶部有前置条件）
│   ├── crud-page.md       # CRUD 页面开发指南
│   ├── api-module.md      # API 模块开发指南
│   ├── form-page.md       # 表单页面开发指南
│   └── detail-page.md     # 详情页面开发指南
└── tools/                 # 工具脚本
    └── sync-sdesign-docs.ts # 组件库文档同步
```

## 硬约束验证

所有代码规范通过 ESLint + TypeScript + Prettier 机械化强制执行：

```bash
pnpm verify        # 全量验证（tsc + eslint + prettier）
pnpm verify:fix    # 自动修复
```
