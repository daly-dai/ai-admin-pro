# specs/ - 需求规格目录

> 每个功能需求在此目录下拆解为可执行的 Task，作为 AI 开发的输入

## 目录结构

`specs/
├── template.md              # 需求拆解模板（必读）
├── progress-template.md     # 进度追踪模板
├── session-template.md      # 会话交接模板
└── [feature]/               # 每个功能一个目录（如 theme-mgmt、caliber-mgmt）
    ├── spec.md              # 需求规格文档（拆解后的 Task 列表）
    ├── progress.md          # 完成进度追踪
    └── sessions/            # 会话交接记录
        └── session-{task-id}.md  # 每个 Task 的会话交接文档
    `

## 工作流程

`[恢复会话] → 需求 → 填写 spec.md（拆解 Task）→ 逐个 Task 开发 → 勾选 progress.md → 生成 session → 完成`

- **恢复会话**：检查 sessions/ 下最新 session 文件，加载上下文
- **生成 session**：Task 完成后按 session-template.md 生成交接文档

## 命名规范

- 目录名：kebab-case（如 data-theme、caliber-mgmt）
- 文件名：固定 spec.md + progress.md
- sessions 目录：固定命名 sessions/
- session 文件：session-{task-id}.md（如 session-T01.md、session-T02.md）
