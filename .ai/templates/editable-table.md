# 可编辑表格页代码模板

> 适用场景：需要行内编辑、动态增删行的表格。普通只读表格仍用 SSearchTable / STable。
> 组件来源：`EditableProTable` from `@ant-design/pro-components`。完整 API 见根目录 `EditableProTable-API.md`。

## 范例一：受控模式完整页面

```tsx
import { useState } from 'react';
import { EditableProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';

// 类型定义（生产环境从 src/api/{module}/types.ts 导入）
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  remark?: string;
}

const columns: ProColumns<OrderItem>[] = [
  {
    title: '序号',
    dataIndex: 'index',
    valueType: 'indexBorder',
    width: 48,
    editable: false,
  },
  {
    title: '商品名称',
    dataIndex: 'name',
    formItemProps: { rules: [{ required: true, message: '请输入商品名称' }] },
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    valueType: 'digit',
    width: 120,
    formItemProps: { rules: [{ required: true, message: '请输入数量' }] },
  },
  {
    title: '单价',
    dataIndex: 'price',
    valueType: 'money',
    width: 120,
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
  {
    title: '操作',
    valueType: 'option',
    width: 120,
    render: (_text, record, _, action) => [
      <a key="edit" onClick={() => action?.startEditable?.(record.id)}>
        编辑
      </a>,
      <a key="delete" onClick={() => action?.deleteEditableRow?.(record.id)}>
        删除
      </a>,
    ],
  },
];

const OrderItemTable = () => {
  const [dataSource, setDataSource] = useState<OrderItem[]>([]);
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);

  return (
    <EditableProTable<OrderItem>
      rowKey="id"
      columns={columns}
      value={dataSource}
      onChange={setDataSource}
      controlled
      recordCreatorProps={{
        record: () => ({
          id: String(Date.now()),
          name: '',
          quantity: 1,
          price: 0,
        }),
        newRecordType: 'dataSource',
        creatorButtonText: '新增一行',
      }}
      editable={{
        type: 'multiple',
        editableKeys,
        onChange: setEditableKeys,
        onSave: async (_key, record) => {
          console.log('保存行:', record);
        },
        onDelete: async (_key, _row) => {
          console.log('删除行');
        },
      }}
    />
  );
};

export default OrderItemTable;
```

## 范例二：SForm + customCom 嵌入

```tsx
import { SForm } from '@dalydb/sdesign';
import { EditableProTable } from '@ant-design/pro-components';
import type { SFormItems } from '@dalydb/sdesign';

// columns 定义同范例一，此处省略

const formItems: SFormItems = [
  {
    label: '订单名称',
    name: 'orderName',
    type: 'input',
    rules: [{ required: true }],
  },
  { label: '订单日期', name: 'orderDate', type: 'datePicker' },
  {
    label: '明细列表',
    name: 'items',
    customCom: (
      <EditableProTable<OrderItem>
        rowKey="id"
        columns={columns}
        controlled
        recordCreatorProps={{
          record: () => ({
            id: String(Date.now()),
            name: '',
            quantity: 1,
            price: 0,
          }),
          newRecordType: 'dataSource',
          creatorButtonText: '新增明细',
        }}
        editable={{ type: 'multiple' }}
      />
    ),
  },
];

// 使用：<SForm items={formItems} onFinish={handleSubmit} />
```

## 做/不做速查

| #   | 做                                                            | 不做                                             |
| --- | ------------------------------------------------------------- | ------------------------------------------------ |
| 1   | `EditableProTable` from `@ant-design/pro-components`          | SForm `type: 'table'` / STable（不支持行内编辑） |
| 2   | `controlled` + `value/onChange` 受控模式                      | `defaultValue` 非受控（状态难追踪）              |
| 3   | `recordCreatorProps.record` 用函数返回唯一 id（`Date.now()`） | 硬编码固定 id（导致 key 冲突）                   |
| 4   | `editableKeys` + `onChange` 受控管理编辑行                    | 不传 `editableKeys`（默认单行，不灵活）          |
| 5   | 普通只读表格用 `SSearchTable` / `STable`                      | 只读场景也用 EditableProTable                    |
