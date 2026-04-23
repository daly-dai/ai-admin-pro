# 错题集

> AI 生成代码时的负面参照。**读完本文件即可执行**，详情文件仅在不确定时按需查阅。

## 核心规则速查

| 编号 | 适用场景              | 核心规则（直接执行）                                                                                                                                                                                        | 快速修复                             | 详情                                                                  |
| ---- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| P001 | 列表页 + Modal/Drawer | **禁止在列表页管理弹层 open 状态，禁止手动 forwardRef 管理弹层生命周期**。使用 `createModal` 或 `createDrawer`（`@dalydb/sdesign`）工厂函数，泛型定义 `open(params)` 参数，Content 关闭即卸载、状态自动销毁 | 用 `createModal`/`createDrawer` 包装 | [详情](./modal-drawer-encapsulation.md)                               |
| P002 | 含可编辑表格的表单页  | **SForm `type: 'table'` 和 STable 不支持行内编辑**。可编辑表格场景使用 `EditableProTable`（来自 `@ant-design/pro-components`），可通过 SForm 的 `customCom` 嵌入或直接用 antd Form 组合                     | 替换为 EditableProTable              | [详情](./editable-table.md) \| [模板](../templates/editable-table.md) |
| P003 | 所有页面              | **回调函数未使用的参数加 `_` 前缀**。如 `render: (_, record) => ...`、`render: (_text, _record, index) => ...`。禁止用 `void`、`eslint-disable` 绕过                                                        | 加 `_` 前缀                          | [详情](./unused-params-in-render.md)                                  |
| P004 | 含字段联动的表单页    | **禁止 `type: 'dependency'`**。字段联动统一使用 `SForm.useWatch(fieldName, form)` 获取响应式值，然后在 items 数组中用 `...(value === 'x' ? [item] : [])` 条件展开。禁止 `depNames` / `render`               | `SForm.useWatch` + 条件展开 items    | —                                                                     |
| P005 | 含确认弹窗的页面      | **优先使用 `Modal.confirm` 而非 SConfirm**。确认弹窗推荐 antd `Modal.confirm({ title, content, onOk })`，命令式调用更简洁                                                                                   | `Modal.confirm()` 替代               | —                                                                     |
| P006 | SSearchTable 列配置   | **避免使用 `as const` 处理字面量类型**。弱模型应使用显式类型注解 `const columns: SColumn[] = [...]` 替代 `{ fixed: 'right' as const }`，更直观且类型安全                                                    | `const columns: SColumn[] = [...]`   | —                                                                     |

## 使用方式

1. **读完上表即可**——核心规则列已包含足够的执行信息
2. **按「适用场景」匹配**——只关注与当前页面类型相关的行
3. **仅在不确定时按需 读取 详情文件**——如需查看完整正反例代码再读
