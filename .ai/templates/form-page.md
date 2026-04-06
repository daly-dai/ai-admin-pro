# 表单页代码模板

> 组件库文档: `.ai/sdesign/components/SForm.md`

## 核心组件

- **SForm**：配置式表单（items 数组）
- **SForm.Group**：分组表单

## SFormItems 关键配置

| 属性         | 说明                                                |
| ------------ | --------------------------------------------------- |
| `label`      | 字段标签                                            |
| `name`       | 字段名                                              |
| `type`       | 控件类型（见下方列表）                              |
| `required`   | boolean 或 string（自定义提示）                     |
| `regKey`     | 内置校验：`'phone'` / `'email'` / `'percentage'` 等 |
| `readonly`   | 只读模式                                            |
| `hidden`     | 隐藏但参与提交                                      |
| `fieldProps` | 传递给底层控件的 props（options, maxLength 等）     |
| `colProps`   | 栅格布局（`{ span: 12 }`）                          |

## 22 种控件类型

```
input | inputNumber | password | textarea | select | slider |
radio | radioGroup | switch | treeSelect | upload |
datePicker | SDatePicker | datePickerRange | SDatePickerRange |
timePicker | timePickerRange | checkbox | checkGroup |
cascader | SCascader | table | dependency
```

## 决策点

- **新增页**：调用 `createByPost`
- **编辑页**：`getByIdByGet` 加载 + `updateByPut` 提交
- **分组表单**：`SForm.Group` + `groupItems`
- **字段联动**：`type: 'dependency'` + `depNames` + `render`

## 交互模式

| 模式       | 适用场景                                                |
| ---------- | ------------------------------------------------------- |
| **Modal**  | 字段 <= 8，无复杂联动 → 创建 `{Entity}FormModal` 子组件 |
| **独立页** | 字段 > 8，含复杂控件 → `create.tsx` / `edit.tsx`        |

> 弹层封装原则 → 详见 `crud-page.md`「弹层封装原则」

## 快速示例

```tsx
// 基础表单
<SForm items={formItems} columns={2} onFinish={save} />

// 分组表单
<SForm.Group groupItems={[
  { title: '基本信息', items: [...] },
  { title: '工作信息', items: [...] },
]} />

// 字段联动
{
  type: 'dependency',
  depNames: ['type'],
  render: (form) => form.getFieldValue('type') === '1' ? <Input /> : null
}
```

## 布局

- `columns` 属性控制每行列数（常用 1 / 2 / 3）
- 宽字段用 `colProps: { span: 24 }`

> 完整 Props → `.ai/sdesign/components/SForm.md`
