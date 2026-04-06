# specs/ - 需求规格目录

> 每个功能需求在此目录下拆解为可执行的 Task，作为 AI 开发的输入

## 目录结构

`specs/
├── template.md              # 需求拆解模板（必读）
├── progress-template.md     # 进度追踪模板
└── [feature]/               # 每个功能一个目录（如 theme-mgmt、caliber-mgmt）
    ├── spec.md              # 需求规格文档（拆解后的 Task 列表）
    └── progress.md          # 完成进度追踪
    `

## 工作流程

`需求 → 填写 spec.md（拆解 Task）→ 逐个 Task 开发 → 勾选 progress.md → 完成`

## 命名规范

- 目录名：kebab-case（如 data-theme、caliber-mgmt）
- 文件名：固定 spec.md + progress.md
