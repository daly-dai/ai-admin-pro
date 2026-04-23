# P002：表单内可编辑表格场景的组件选型

> 错误类型：组件选型 | 影响范围：含可编辑表格的表单页面

## 错误写法（❌）

强行用 SForm 的 `type: 'table'` 或 STable 处理可编辑表格：

```tsx
// SForm type='table' 只渲染普通只读表格，不支持行内编辑和动态增删行
<SForm
  items={[
    {
      label: '明细',
      name: 'items',
      type: 'table',
      fieldProps: { columns, dataSource },
    },
  ]}
/>
```

## 正确写法（✅）

可编辑表格场景使用 `@ant-design/pro-components` 的 `EditableProTable`：

```tsx
import { EditableProTable } from '@ant-design/pro-components';

// 方式一：SForm + customCom 嵌入（表单复杂度可控时）
<SForm
  items={[
    { label: '基本信息', name: 'name', type: 'input' },
    {
      label: '明细',
      name: 'items',
      customCom: <EditableProTable columns={columns} recordCreatorProps={{ newRecordType: 'dataSource' }} />,
    },
  ]}
/>

// 方式二：antd Form + EditableProTable 自由组合（复杂交互超出 SForm items 表达能力时）
<Form form={form}>
  <Form.Item label="名称" name="name"><Input /></Form.Item>
  <Form.Item label="明细" name="items">
    <EditableProTable columns={columns} recordCreatorProps={{ newRecordType: 'dataSource' }} />
  </Form.Item>
</Form>
```

## 原因

1. SForm 的 `type: 'table'` 底层是普通 antd Table，**不具备行内编辑、动态增删行能力**
2. STable 是只读增强表格（字典映射、序号列、快捷 render），同样不支持编辑
3. 项目已安装 `@ant-design/pro-components`，`EditableProTable` 是此场景的标准方案
4. **普通只读表格仍必须使用 STable / SSearchTable**，`EditableProTable` 仅限可编辑场景

## 完整范例

→ `.ai/templates/editable-table.md`（受控模式完整页面 + SForm 嵌入 + 做/不做速查）
