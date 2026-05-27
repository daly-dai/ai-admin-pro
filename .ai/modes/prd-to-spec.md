# 阶段⓪a：PRD → Spec 提取

> 用户拿到单份 PRD 文档，从中拆出前端范围，生成 spec.md + progress.md。
> 适用于产品PRD或后端SDD单独到达的场景。双PRD同时到达走 ⓪b blueprint。

## 前置检查

开始前确认已获取 PRD 文档。缺 → 向用户索要。

## 触发条件

- 用户提供单份 PRD 文档 + 要求「拆前端范围/生成 spec/出开发任务」
- PRD 来源：产品 PM / 后端 SDD

## 前提假设

- PRD 内容已对齐，无第二份 PRD 需要交叉对比
- AI 负责提取 + 分类 + 拆解，用户负责确认范围
- 提取结果是前端专属 spec，不含后端/测试/运维范围

---

## 提取规则

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

> 如果 PRD 是后端 SDD（以接口/数据模型为主，缺少页面描述），则从接口模式推断页面类型，置信度标「低」，在用户确认步骤让用户确认。

## 页面类型分类

按 `page-classification.md` 的类型目录表匹配分类。分类结果标注置信度：`高` / `中` / `低`。

## Task 映射

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

## 用户确认

展示提取结果摘要：

```
📋 Spec 提取完成

功能：{feature}
页面类型：{summary}
Task 数量：{N}  前端文件预估：{M} 个

Task 清单：
  1. [api] {module} API 模块
  2. [page-list] {module} 列表页
  ...

置信度「低」的页面分类：[列出，请用户确认]

[待确认]：[不确定的前端范围项]
```

## 生成 spec.md + progress.md

按 `specs/template.md` 格式生成 spec.md。每个 Task 包含输出锁 + 验收闸门（从 task-gates.md 按类型取）。

---

## 约束

- **不写代码**：本阶段只生成 spec.md + progress.md，不写 `src/` 下任何文件
- **不确定不猜**：PRD 中模糊的功能标注 `[待确认]`
- **字段名保持 PRD 原文**：不转换命名风格，转换在代码生成阶段做
- **一个 feature 一个目录**：存入 `.ai/specs/{feature}/`
- **Task 格式统一**：所有 Task 使用 `输出锁` + `验收闸门` 格式

## 输出锁

🔒 `.ai/specs/{feature}/spec.md` + `.ai/specs/{feature}/progress.md`

## 下一步衔接

| 场景       | 下一步                                     |
| ---------- | ------------------------------------------ |
| 接口没就绪 | AGENTS.md ① 画 Demo（占位 API）            |
| 接口已就绪 | AGENTS.md ② 接口合并（Swagger → 真实 API） |
