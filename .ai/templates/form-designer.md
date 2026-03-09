# Prompt: 生成表单设计器/动态表单 (基于 @dalydb/sdesign)

> 组件库文档参考: `.ai/core/sdesign-docs.md`

## 使用方式

提供表单字段配置，AI 生成动态表单代码。

## 表单信息模板

表单名称: [FORM_NAME]
表单用途: [FORM_PURPOSE]
表单类型: [dynamic-form | form-designer]

## 字段配置模板

```typescript
[
  {
    label: '字段标签',
    name: 'fieldName',
    type: 'input | inputNumber | textarea | select | radio | checkbox | datePicker | datePickerRange | timePicker | switch | upload',
    required: true | false,
    placeholder: '占位符',
    rules: [{ required: true, message: '必填' }, { type: 'email' }],
    fieldProps: { options: [], maxLength: 100 },
    colProps: { span: 12, xs: 24, sm: 12, md: 8 }
  }
]
```

### SForm 控件类型
input | inputNumber | password | textarea | select | slider | radio | radioGroup | switch | treeSelect | upload | datePicker | SDatePicker | datePickerRange | SDatePickerRange | timePicker | timePickerRange | checkbox | checkGroup | cascader | SCascader | table | dependency

### 常用配置项
- `required`: boolean | string (自定义提示)
- `readonly`: boolean - 只读模式
- `hidden`: boolean - 隐藏但参与提交
- `regKey`: 'phone' | 'email' | 'percentage' 等内置校验
- `colProps`: 栅格布局配置

## 生成规范

### 文件结构
- `src/components/business/[FormName]/index.tsx` - 表单组件
- `src/components/business/[FormName]/types.ts` - 类型定义
- `src/components/business/[FormName]/config.ts` - 字段配置（可选）

### 功能要求
- 表单验证 (rules / regKey)
- 表单提交/重置
- 数据回显（编辑模式）
- 字段联动（SDependency）
- 响应式布局（colProps）
- 分组展示（SForm.Group）

## 快速示例

```tsx
import { SForm, SFormItems } from '@dalydb/sdesign';

const items: SFormItems[] = [
  { label: '姓名', name: 'name', type: 'input', required: true },
  { label: '邮箱', name: 'email', type: 'input', regKey: 'email' },
  { label: '部门', name: 'dept', type: 'select', fieldProps: { options } },
  { label: '入职日期', name: 'date', type: 'SDatePicker' },
  { 
    label: '备注', 
    name: 'remark', 
    type: 'textarea', 
    colProps: { span: 24 },
    fieldProps: { rows: 4 }
  },
];

<SForm items={items} columns={2} onFinish={handleSubmit} />
```

### 分组表单
```tsx
<SForm.Group 
  groupItems={[
    { title: '基本信息', items: [...] },
    { title: '工作信息', items: [...] }
  ]}
/>
```

### 字段联动
```tsx
{
  type: 'dependency',
  depNames: ['type'],
  render: (form) => form.getFieldValue('type') === '1' ? <Input /> : null
}
```

## 自我修正规则

生成代码后，AI 必须按照以下规则自动修正，直接输出正确代码：

参考 `.ai/self-correction/form-page.md`：
1. 修正组件：使用 `SForm` + `items` 配置，不使用 `Form`
2. 修正导入：从 `@dalydb/sdesign` 导入组件
3. 修正按钮：使用 `SButton` + `actionType` 预设
4. 修正布局：使用 `columns` 控制表单项布局
5. 修正验证：必填项配置 `required`，特殊字段使用 `regKey`

### 输出要求
- **直接输出修正后的完整代码**
- **不要输出修正过程说明**
- **不要输出检查清单**

> 完整 Props 定义和示例请参考: `.ai/core/sdesign-docs.md`

