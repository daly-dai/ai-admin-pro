# 表单页面开发指南

> ⚠️ **前置条件**：在使用本指南生成代码之前，你必须已经完成以下步骤：
>
> 1. 阅读 `AGENTS.md` — 确认硬约束和豁免范围
> 2. 确认目标文件路径**不在**豁免目录中 → 必须使用 `SForm` 而非 antd `Form`
> 3. 准备查阅 `.ai/sdesign/components/SForm.md`

## 核心组件

- **SForm**：配置式表单，通过 `items` 数组定义字段
- **SForm.Group**：分组表单

## 22 种控件类型

```
input | inputNumber | password | textarea | select | slider |
radio | radioGroup | switch | treeSelect | upload |
datePicker | SDatePicker | datePickerRange | SDatePickerRange |
timePicker | timePickerRange | checkbox | checkGroup |
cascader | SCascader | table | dependency
```

## SFormItems 关键配置

| 属性         | 说明                                                |
| ------------ | --------------------------------------------------- |
| `label`      | 字段标签                                            |
| `name`       | 字段名                                              |
| `type`       | 控件类型（见上方列表）                              |
| `required`   | `boolean` 或 `string`（自定义提示）                 |
| `regKey`     | 内置校验：`'phone'` / `'email'` / `'percentage'` 等 |
| `readonly`   | 只读模式                                            |
| `hidden`     | 隐藏但参与提交                                      |
| `fieldProps` | 传递给底层控件的 props（如 options, maxLength）     |
| `colProps`   | 栅格布局（`{ span: 12 }`）                          |

## 决策点

> ⚠️ **强制要求**：使用 sdesign 组件前必须 Read 对应组件文档（`.ai/sdesign/components/*.md`），禁止猜测属性。

- **新增页**：调用 `createByPost`
- **编辑页**：调用 `getByIdByGet` 获取数据 + `updateByPut` 提交
- **分组表单**：使用 `SForm.Group` + `groupItems`
- **字段联动**：使用 `type: 'dependency'` + `depNames` + `render`

## 布局

- `columns` 属性控制每行列数（常用 1 / 2 / 3）
- 宽字段用 `colProps: { span: 24 }`

## 完整 API 参考

使用 SForm 时查阅：`.ai/sdesign/components/SForm.md`

## 交互模式

表单不一定是独立页面。当表单字段较少（≤ 8 个）且无复杂联动时，优先使用 Modal 模式承载。详见 `crud-page.md` 中「页面交互模式选择」章节。

### Modal 嵌套表单

当表单以 Modal 形式呈现时，应创建 `{Entity}FormModal` 容器组件，将 Modal 的 open/close 状态封装在容器组件内部管理，不由列表页控制。列表页通过 ref 调用 `open()` 方法触发弹层。

> 详见 `crud-page.md`「弹层封装原则」章节。
