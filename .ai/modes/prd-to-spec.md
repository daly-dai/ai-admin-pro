# 阶段⓪a：PRD → Spec 提取

> 用户拿到单份 PRD 文档，从中拆出前端范围，生成 spec.md + progress.md。
> 适用于产品PRD或后端SDD单独到达的场景。双PRD同时到达走 ⓪b blueprint。

## 触发条件

- 用户提供单份 PRD 文档 + 要求「拆前端范围/生成 spec/出开发任务」
- PRD 来源：产品 PM / 后端 SDD，格式参照 `prd-template.md`

## 前提假设

- PRD 内容已对齐，无第二份 PRD 需要交叉对比
- AI 负责提取 + 分类 + 拆解，用户负责确认范围
- 提取结果是前端专属 spec，不含后端/测试/运维范围

---

## 步骤

### 1. 读取 PRD 与参考文件

并行读取：

- 用户提供的 PRD 文档
- `.ai/specs/template.md` — spec 输出格式
- `.ai/templates/page-classification.md` — 页面类型分类目录
- `.ai/conventions/task-gates.md` — Task 输出锁 + 验收闸门模板

### 2. 提取前端范围

逐章节扫描 PRD，提取前端相关内容：

| PRD 章节       | 提取内容                                       | 用途                     |
| -------------- | ---------------------------------------------- | ------------------------ |
| 一、功能概述   | 功能名称、模块标识、业务域                     | spec「背景」             |
| 二、背景与目标 | 痛点 + 目标                                    | spec「背景」「需求概要」 |
| 三、数据模型   | 实体字段（名称/类型/必填）、枚举定义           | types.ts                 |
| 四、接口设计   | API路径/方法/参数、偏离说明                    | index.ts                 |
| 五、页面与交互 | 页面清单、搜索字段、表格列、表单字段、交互模式 | Task 拆解                |
| 六、业务规则   | 权限角色、状态流转、业务约束                   | Task「验收闸门」补充     |
| 七、关联关系   | 依赖模块、路由与导航                           | Task「输出锁」路径确认   |

**筛选规则**：

- 明确前端：页面/列表/表单/详情/弹窗/大屏/仪表盘/搜索/导出/上传 → 纳入
- 明确后端：定时任务/数据清洗/存储过程/接口开发/数据库 → 排除
- 不确定 → 标注 `[待确认]`，询问用户

> 如果 PRD 是后端 SDD（以接口/数据模型为主，缺少页面描述），则从接口模式推断页面类型，置信度标「低」，在步骤5让用户确认。

### 3. 页面类型分类

对 PRD 中每个前端功能/页面，按 `page-classification.md` 分类：

```
1. 扫描页面描述 → 匹配关键词
2. 信号 >= 2 且无竞争 → 自动分类
3. 信号弱或歧义 → AI 推断 + 标置信度「中」
4. 后端SDD缺少页面描述 → 从接口模式推断 + 标置信度「低」
5. 仍不确定 → 标记 custom
```

分类结果标注置信度：`高` / `中` / `低`

### 4. 映射为 Task

按页面分类结果，从 `task-gates.md` 取对应 Task 类型的输出锁 + 验收闸门：

| 页面分类        | Task 类型序列                                                              |
| --------------- | -------------------------------------------------------------------------- |
| crud-management | api → page-list → page-form → page-detail                                  |
| dashboard       | api → data-transform → component-chart → component-widget → page-dashboard |
| workflow        | api → page-workflow → component                                            |
| landing         | page-landing                                                               |
| form-only       | api → page-form                                                            |
| list-only       | api → page-list                                                            |
| custom          | page-custom                                                                |

> 已有模块追加功能时，跳过 api Task（复用已有 API 层）。

### 5. 用户确认

展示提取结果摘要：

```
📋 Spec 提取完成

功能：{feature}
页面类型：{summary}
Task 数量：{N}  前端文件预估：{M} 个

Task 清单：
  1. [api] {module} API 模块
  2. [page-list] {module} 列表页
  3. [page-dashboard] {module} 大屏
  ...

置信度「低」的页面分类：[列出，请用户确认]

[待确认]：[不确定的前端范围项]

确认后执行：pnpm task:prompt {feature}
```

### 6. 生成 spec.md

按 `specs/template.md` 格式，写入 `.ai/specs/{feature}/spec.md`。

**生成每个 Task 时**：

1. 从 `.ai/conventions/task-gates.md` 按 Task 类型取默认值
2. `{module}` 替换为实际模块名，`{Entity}` 替换为实际实体名
3. 输出锁和验收闸门填入 Task，不得留空

### 7. 生成 progress.md

按 `progress-template.md` 格式，写入 `.ai/specs/{feature}/progress.md`。

初始化所有 Task 为 ⬜。在「不可丢失的上下文」中记录：

- 页面类型分类决策
- 关键字段映射
- `[待确认]` 项目清单

---

## 约束

- **不写代码**：本阶段只生成 spec.md + progress.md，不写 `src/` 下任何文件
- **不确定不猜**：PRD 中模糊的功能标注 `[待确认]`，不自行判断前后端边界
- **字段名保持 PRD 原文**：不转换命名风格，转换在代码生成阶段做
- **一个 feature 一个目录**：存入 `.ai/specs/{feature}/`
- **Task 格式统一**：所有 Task 使用 `输出锁` + `验收闸门` 格式（来自 task-gates.md）

## 输出锁

🔒 `.ai/specs/{feature}/spec.md` + `.ai/specs/{feature}/progress.md`

---

## 下一步衔接

| 场景       | 下一步                                      |
| ---------- | ------------------------------------------- |
| 接口没就绪 | AGENTS.md ① 画 Demo（占位 API）             |
| 接口已就绪 | AGENTS.md ② 接口合并（Swagger → 真实 API）  |
| 想分步执行 | `pnpm task:prompt {feature}` → 逐 Task 执行 |
