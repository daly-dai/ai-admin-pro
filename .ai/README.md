# AI 配置目录

> 所有AI相关的配置、规则、上下文都集中在此目录

## 目录结构

```
.ai/
├── README.md              # 本文件
├── architecture.md        # 架构规范（AI必读）
├── coding-standards.md    # 代码规范（AI必读）
├── api-conventions.md     # API约定（AI必读）
├── incremental-development.md  # 增量开发规范
├── SUMMARY.md             # 项目概要
├── prompts/               # AI对话模板
│   ├── crud-page.md       # 生成CRUD页面
│   ├── api-module.md      # 生成API模块
│   ├── data-visualization.md # 生成数据可视化页面
│   ├── form-designer.md   # 生成表单设计器/动态表单
│   ├── detail-page.md     # 生成详情页
│   ├── custom-hook.md     # 生成自定义Hook
│   └── workflow-page.md   # 生成工作流/审批页面
└── context/               # 项目上下文（AI理解项目用）
    ├── existing-apis.md   # 已有API列表
    ├── existing-components.md # 已有组件列表
    └── existing-pages.md  # 已有页面列表
```

## 使用方式

### 1. 新项目初始化

将本目录复制到新项目根目录，AI自动读取配置。

### 2. 日常开发

与AI对话时，AI会自动读取 `.ai/` 目录下的规则文件。

### 3. 自动化更新上下文

使用提供的脚本自动扫描项目并更新 `context/` 目录：

```bash
pnpm update-context
```

该脚本会自动：

- 扫描 `src/api/` 目录，更新 `existing-apis.md`
- 扫描 `src/components/` 目录，更新 `existing-components.md`
- 扫描 `src/router/` 配置，更新 `existing-pages.md`

### 4. 增量开发

每次新增功能后，运行 `pnpm update-context` 更新项目上下文，帮助AI理解项目现状。

## 核心原则

1. **配置即代码** - AI配置是项目的一部分，随项目演进
2. **上下文驱动** - AI通过读取配置理解项目，而非硬编码
3. **增量沉淀** - 每次开发都在完善AI对项目的理解
4. **自动化优先** - 使用脚本自动更新上下文，减少手动维护
