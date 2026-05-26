# 页面类型分类目录

> AI 在蓝图生成阶段根据 PRD 内容匹配页面类型，确定 Task 拆解策略和执行路径。
> 新增页面类型只需在本文件末尾追加行，不改动其他文件。

## 分类维度

| 维度       | 说明                                   |
| ---------- | -------------------------------------- |
| 数据模式   | 读/写模式（CRUD / 只读 / 只写 / 流式） |
| 交互复杂度 | 组件类型（表格 / 图表 / 表单 / 卡片）  |
| 实时性     | 静态 / 轮询 / WebSocket                |
| 页面数量   | 单页面 / 多页面模块                    |

## 类型目录

| 类型 Key        | 显示名称    | 触发关键词                                                      | 数据模式    | 核心组件                     | Task 类型映射                                                          | 必读模板                                                  |
| --------------- | ----------- | --------------------------------------------------------------- | ----------- | ---------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| crud-management | CRUD 管理   | 管理、列表、增删改查、CRUD、数据维护                            | 完整 CRUD   | SSearchTable, SForm, SDetail | api, page-list, page-form, page-detail                                 | api-module.md, crud-page.md, form-page.md, detail-page.md |
| dashboard       | 大屏/仪表盘 | 大屏、仪表盘、Dashboard、统计看板、监控大屏、数据概览、实时监控 | 只读+聚合   | ECharts, StatCard, Grid      | api, data-transform, component-chart, component-widget, page-dashboard | dashboard-page.md                                         |
| workflow        | 工作流/审批 | 工作流、审批、流程、工单、流转、申请                            | 状态机+表单 | SForm, Steps, Timeline       | api, page-workflow, component                                          | workflow-page.md                                          |
| landing         | 落地/门户   | 首页、门户、导航、Portal、欢迎页、工作台                        | 静态+导航   | Card, List, StatCard         | page-landing                                                           | landing-page.md                                           |
| form-only       | 纯表单      | 配置、设置、参数                                                | 读+写标量   | SForm                        | api, page-form                                                         | form-page.md, api-module.md                               |
| list-only       | 纯列表      | 日志、操作记录、审计                                            | 只读+查询   | SSearchTable                 | api, page-list                                                         | crud-page.md, api-module.md                               |
| custom          | 自定义      | (兜底—任意未匹配)                                               | 按分析      | 按分析                       | page-custom                                                            | —（用户指定）                                             |

## 分类算法

```
1. 扫描产品PRD 第五章每个页面的标题和描述
2. 统计各类型关键词命中数
3. 最高分 >= 2 且领先次高分 >= 1 → 自动分类
4. 最高分 < 2 或与次高分差距 < 1 → AI 读完整页面描述推断
5. 推断仍不确定 → 标记 custom，在步骤5请用户确认
```

> **置信度**: `高` = 自动分类 | `中` = AI推断 | `低` = 标记custom待确认

## 新增类型

在「类型目录」表中追加一行即可：

1. 定义类型 Key（`{domain}-{pattern}` 格式）
2. 列出触发关键词（中文+英文，覆盖用户常用表达）
3. 确定数据模式 + 核心组件
4. 映射 Task 类型（在 `specs/template.md` 中同步新增）
5. 指定必读模板 → 创建或引用对应的 `.ai/templates/{name}.md`
