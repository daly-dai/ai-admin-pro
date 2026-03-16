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

- **新增页**：调用 `{module}Api.create`
- **编辑页**：调用 `{module}Api.getById` 获取数据 + `{module}Api.update` 提交
- **分组表单**：使用 `SForm.Group` + `groupItems`
- **字段联动**：使用 `type: 'dependency'` + `depNames` + `render`

## 布局

- `columns` 属性控制每行列数（常用 1 / 2 / 3）
- 宽字段用 `colProps: { span: 24 }`

## 完整 API 参考

使用 SForm 时查阅：`.ai/sdesign/components/SForm.md`
