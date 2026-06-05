# 页面类型分类目录

> AI 在场景匹配时根据需求内容确定页面类型和 Task 拆解策略。
> 新增页面类型只需在本文件末尾追加行，不改动其他文件。

## 类型目录

| 类型 Key        | 显示名称    | 触发关键词                                                      | 数据模式    | 核心组件                  | Task 类型映射                                                          | 必读模板                                                  |
| --------------- | ----------- | --------------------------------------------------------------- | ----------- | ------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| crud-management | CRUD 管理   | 管理、列表、增删改查、CRUD、数据维护                            | 完整 CRUD   | SProTable, SForm, SDetail | api, page-list, page-form, page-detail                                 | api-module.md, crud-page.md, form-page.md, detail-page.md |
| dashboard       | 大屏/仪表盘 | 大屏、仪表盘、Dashboard、统计看板、监控大屏、数据概览、实时监控 | 只读+聚合   | ECharts, StatCard, Grid   | api, data-transform, component-chart, component-widget, page-dashboard | dashboard-page.md                                         |
| workflow        | 工作流/审批 | 工作流、审批、流程、工单、流转、申请                            | 状态机+表单 | SForm, Steps, Timeline    | api, page-workflow, component                                          | —（规划中）                                               |
| landing         | 落地/门户   | 首页、门户、导航、Portal、欢迎页、工作台                        | 静态+导航   | Card, List, StatCard      | page-landing                                                           | —（规划中）                                               |
| form-only       | 纯表单      | 配置、设置、参数                                                | 读+写标量   | SForm                     | api, page-form                                                         | form-page.md, api-module.md                               |
| list-only       | 纯列表      | 日志、操作记录、审计                                            | 只读+查询   | SProTable                 | api, page-list                                                         | crud-page.md, api-module.md                               |
| custom          | 自定义      | (兜底—任意未匹配)                                               | 按分析      | 按分析                    | page-custom                                                            | —（用户指定）                                             |

> **置信度**: `高` = 自动分类 | `中` = AI推断 | `低` = 标记custom待确认

## 新增类型

在「类型目录」表中追加一行即可：

1. 定义类型 Key（`{domain}-{pattern}` 格式）
2. 列出触发关键词（中文+英文，覆盖用户常用表达）
3. 确定数据模式 + 核心组件
4. 映射 Task 类型（在 `task-gates.md` 中同步新增）
5. 指定必读模板 → 创建或引用对应的 `.ai/templates/{name}.md`
