# .ai/ 配置目录索引

> 本目录包含 AI 辅助开发的规范和指南文档。项目入口为根目录的 `AGENTS.md`。

## 目录结构

```
.ai/
├── core/                  # 核心规范（深入参考）
│   ├── architecture.md    # 架构规范、项目结构
│   ├── coding-standards.md # 代码规范
│   ├── tech-stack.md      # 技术栈定义和约束
│   └── sdesign-docs.md    # @dalydb/sdesign 组件库 API 文档
├── conventions/           # 开发约定
│   ├── api-conventions.md # API 设计约定（YAML 接口定义格式）
│   └── incremental-development.md # 增量开发规范
├── guides/                # 开发指南（决策导向，按需查阅）
│   ├── crud-page.md       # CRUD 页面开发指南
│   ├── api-module.md      # API 模块开发指南
│   ├── form-page.md       # 表单页面开发指南
│   └── detail-page.md     # 详情页面开发指南
└── tools/                 # 工具脚本
    └── sync-sdesign-docs.js # 组件库文档同步
```

## 硬约束验证

所有代码规范通过 ESLint + TypeScript + Prettier 机械化强制执行：

```bash
pnpm verify        # 全量验证（tsc + eslint + prettier）
pnpm verify:fix    # 自动修复
```
