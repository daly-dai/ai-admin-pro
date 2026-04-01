# Vue → React 场景预读式迁移指南

> **这是 AI 进入本项目执行迁移分析的唯一入口。所有分析必须遵循本文件定义的流程和约束。**
>
> 产出目标：结构化业务描述文档（不是 React 代码）

---

## 一、总流程

```
步骤 0: 项目档案 → 步骤 1: 场景分类 → 步骤 2: 共享上下文
  → [循环] 步骤 3: 逐文件场景分析 → 步骤 4: Task 拆解
```

> 完整流程按 0→1→2→3→4 顺序执行。支持按需执行单个或多个步骤，但**前置条件必须满足**。

---

## 二、按需执行

用户可以指定只执行部分步骤，AI 按以下规则处理：

### 前置条件检查

每个步骤有独立的前置条件（详见各 step 文件顶部）。执行前先检查：

| 步骤 | 前置条件                                    | 缺失时处理                                   |
| ---- | ------------------------------------------- | -------------------------------------------- |
| 0    | 无                                          | 直接执行                                     |
| 1    | `output/project-profile.md` 存在            | 提示用户先执行步骤 0，或用户手动提供项目信息 |
| 2    | `output/{module}/overview.md` 存在且已确认  | 提示用户先执行步骤 1                         |
| 3    | `output/{module}/context.md` 存在           | 提示用户先执行步骤 2                         |
| 4    | 所有页面描述文档已生成（overview.md 全 ✅） | 提示用户先完成步骤 3                         |

### 指令示例

```
# 只执行步骤 0（填写项目档案）
"读取 .migration/GUIDE.md，只执行步骤 0，填写项目档案。"

# 只执行步骤 1（扫描分类）
"读取 .migration/GUIDE.md，只执行步骤 1，扫描 src/views/order/ 模块的场景分类。"

# 执行步骤 0 到 2（准备阶段，不分析具体页面）
"读取 .migration/GUIDE.md，执行步骤 0-2，目标模块：src/views/order/"

# 只对单个文件执行步骤 3
"读取 .migration/GUIDE.md，只分析 OrderList.vue 这一个文件。"

# 只执行步骤 4（已有所有描述文档，只做 Task 拆解）
"读取 .migration/GUIDE.md，只执行步骤 4，汇总 order 模块的 Task 拆解。"

# 从中断处继续
"读取 .migration/GUIDE.md，继续迁移分析。目标模块：order。"

# 重新分析某个文件
"读取 .migration/GUIDE.md，重新分析 OrderForm.vue。"
```

### 单文件分析模式

用户指定分析单个文件时，AI 执行以下简化流程：

```
1. 检查 project-profile.md 和 context.md 是否存在
   → 存在：读取作为上下文
   → 不存在：向用户询问必要的项目信息（UI 库、API 模式等）
2. 对目标文件执行场景识别
3. 向用户确认场景类型
4. 按对应 scene 手册执行分析
5. 输出描述文档
```

---

## 三、硬约束（所有执行模式均适用）

### 产出约束

- 本工具的产出是**结构化业务描述文档**，不是 React/Vue 代码
- 所有产出必须按对应模板格式填写
- 描述中使用**中性业务概念**（"状态变量"而非"ref"），参见 `scenes/identify.md` 中的映射表

### 分析约束

- 提取信息时**必须追踪到 `<script setup>` 源头**，不可只看 `<template>` 中的表象
- 遇到 `#default` / `v-slot` 插槽**必须分析插槽内容**
- 遇到 `import` 的自定义 hook/工具函数，**必须标注来源文件和功能**
- 场景分类结果**必须等待用户确认**后才能进入下一步

### 会话约束

- 每个分析会话开始时，按固定顺序读取上下文文件（见第五节）
- 每完成一个文件分析，**立即更新** `overview.md` 进度
- 上下文接近上限时，建议用户新开会话

---

## 四、步骤速查表

| 步骤 | 名称       | 必读文件                                                                    | 产出文件                         |
| ---- | ---------- | --------------------------------------------------------------------------- | -------------------------------- |
| 0    | 项目档案   | `steps/step-0-profile.md` + `templates/project-profile.md`                  | `output/project-profile.md`      |
| 1    | 场景分类   | `steps/step-1-classify.md` + `scenes/identify.md` + `templates/overview.md` | `output/{module}/overview.md`    |
| 2    | 共享上下文 | `steps/step-2-context.md` + `templates/module-context.md`                   | `output/{module}/context.md`     |
| 3    | 逐文件分析 | `steps/step-3-analyze.md` + `scenes/{场景类型}.md`                          | `output/{module}/{page-name}.md` |
| 4    | Task 拆解  | `steps/step-4-tasks.md` + `templates/tasks.md`                              | `output/{module}/tasks.md`       |

---

## 五、跨会话恢复协议

新会话启动时，按以下顺序加载上下文：

```
1. .migration/GUIDE.md                    （本文件 — 理解流程和约束）
2. .migration/output/project-profile.md   （项目档案 — 技术背景）
3. .migration/output/{module}/overview.md （模块总览 — 进度追踪）
4. .migration/output/{module}/context.md  （共享上下文 — 数据模型和 API）
```

通过 `overview.md` 的状态列定位下一个待分析文件：

- ⬜ 待分析 → 尚未开始
- ⏳ 分析中 → 上次会话中断，需继续
- ✅ 完成 → 已有产出文件
- ❌ 需重做 → 用户标记需重新分析

---

## 六、产出目录结构

```
output/
├── project-profile.md           # 项目级（全局唯一）
└── {module}/                    # 每个模块一个子目录
    ├── overview.md              # 文件清单 & 分析进度
    ├── context.md               # 模块共享上下文
    ├── {page-name}.md           # 每个页面的场景描述
    └── tasks.md                 # Task 拆解方案
```

---

## 七、文件引用关系

```
GUIDE.md（本文件）
│
├─→ steps/step-0-profile.md ──→ templates/project-profile.md
│
├─→ steps/step-1-classify.md ──→ scenes/identify.md
│                              └→ templates/overview.md
│
├─→ steps/step-2-context.md ──→ templates/module-context.md
│
├─→ steps/step-3-analyze.md ──┬→ scenes/list-page.md
│   (调度中枢)                ├→ scenes/form-page.md
│                              ├→ scenes/detail-page.md
│                              └→ scenes/complex-page.md
│
└─→ steps/step-4-tasks.md ──→ templates/tasks.md
```
