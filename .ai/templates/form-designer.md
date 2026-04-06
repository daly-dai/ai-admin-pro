# 独立表单组件模板（高级模式）

> 用于非 CRUD 页面的独立表单组件。控件类型列表 → crud-page.md
> 组件库文档: .ai/sdesign/components/SForm.md

## 文件结构

- `src/components/business/[FormName]/index.tsx` - 表单组件
- `src/components/business/[FormName]/types.ts` - 类型定义
- `src/components/business/[FormName]/config.ts` - 字段配置（可选）

## 字段配置模板

```typescript
[
  {
    label: '字段标签',
    name: 'fieldName',
    type: 'input',
    required: true,
    placeholder: '占位符',
    rules: [{ required: true, message: '必填' }, { type: 'email' }],
    fieldProps: { options: [], maxLength: 100 },
    colProps: { span: 12, xs: 24, sm: 12, md: 8 },
  },
];
```

## 常用配置项

- `required`: boolean | string (自定义提示)
- `readonly`: boolean - 只读模式
- `hidden`: boolean - 隐藏但参与提交
- `regKey`: 'phone' | 'email' | 'percentage' 等内置校验
- `colProps`: 栅格布局配置

## 分组表单

```tsx
<SForm.Group
  groupItems={[
    { title: '基本信息', items: [...] },
    { title: '工作信息', items: [...] }
  ]}
/>
```

## 字段联动

```tsx
{
  type: 'dependency',
  depNames: ['type'],
  render: (form) => form.getFieldValue('type') === '1' ? <Input /> : null
}
```

> 自我修正规则 → crud-page.md「表单页修正」
