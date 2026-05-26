# 阶段验收闸门（聚合视图）

> 阶段闸门 = 本阶段所有 Task 闸门的并集 + 阶段特有约束。
> Task 级别的输出锁和验收闸门是唯一权威来源 → `.ai/conventions/task-gates.md`

## 阶段 → Task 类型映射

| 阶段 | 典型 Task 类型                                            | 阶段特有约束                                        |
| ---- | --------------------------------------------------------- | --------------------------------------------------- |
| ⓪a   | 仅生成文档                                                | 不写 `src/` 下任何文件                              |
| ⓪b   | 仅生成文档                                                | 🔴冲突全部决策 + 页面类型全部确认                   |
| ①    | api, page-list, page-form, page-detail, page-dashboard 等 | URL 用 `/api/TODO/{module}` 占位                    |
| ②    | api                                                       | 字段以 Swagger 为准；分支A 必须产出 feature-spec.md |
| ③    | page-list, page-form, page-detail                         | 仅修改已有文件，不新建；变更清单先确认              |
| ④    | api, page-list                                            | 零 TODO + 零占位URL                                 |
| ⑤    | 任意                                                      | 改动 ≤20/50行；无顺手重构                           |

## 阶段完成 = 本阶段所有 Task 闸门通过

阶段本身的验收 = 逐 Task 检查其输出锁 + 验收闸门是否全部通过。不再单独定义阶段级闸门。

## 跨阶段交接

交接内容在 `task-gates.md` 各 Task 的验收闸门中定义。阶段切换时确认本阶段所有 Task 的闸门均已通过即可。
