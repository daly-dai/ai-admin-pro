# UI 组件使用约定

> 前端 UI 组件的使用规范和优先级

## 组件库优先级

### 核心原则

1. **优先使用 @dalydb/sdesign** - 配置式开发，效率更高
2. **Ant Design 作为辅助** - 用于基础 UI 组件和补充
3. **避免直接使用原生 HTML** - 统一使用组件库

## 组件库使用范围

### 1. @dalydb/sdesign (核心组件库)

**必须优先使用的组件：**

| 组件 | 用途 | 说明 |
|------|------|------|
| `STable` | 表格组件 | 基于 Ant Design Table 封装，内置序号列、字典回显等 |
| `SForm` | 表单组件 | 配置式表单，支持 SForm.Search、SForm.Group |
| `SDetail` | 详情组件 | 数据详情展示，支持分组 |
| `STitle` | 标题组件 | 页面标题、表单标题、表格标题 |
| `SButton` | 按钮组件 | 增强型按钮，支持 SButton.Group |
| `useSearchTable` | Hook | 搜索表格 Hook，整合搜索与表格 |

### 2. Ant Design (辅助组件库)

**仅用于以下场景：**

- 基础 UI 组件（如 `Modal`、`Popconfirm`、`Tag`、`Badge`）
- 图标库（`@ant-design/icons`）
- 样式系统和主题配置

**禁止使用的组件：**

- `Table`（使用 `STable` 替代）
- `Form`（使用 `SForm` 替代）
- `Descriptions`（使用 `SDetail` 替代）
- `Button`（使用 `SButton` 替代）

## 核心组件使用规范

### 1. STable - 表格组件

**基础使用：**

```typescript
import { STable, SColumnsType } from '@dalydb/sdesign';

const columns: SColumnsType<any> = [
  { title: '姓名', dataIndex: 'name', width: 120 },
  { title: '年龄', dataIndex: 'age', width: 80 },
  { title: '邮箱', dataIndex: 'email' },
];

<STable
  isSeq={true}
  columns={columns}
  dataSource={data}
  pagination={{ current: 1, pageSize: 10, total: 100 }}
/>
```

**内置渲染器：**

```typescript
const columns: SColumnsType<any> = [
  {
    title: '创建时间',
    dataIndex: 'createTime',
    render: 'datetime',
  },
  {
    title: '生日',
    dataIndex: 'birthday',
    render: 'date',
  },
  {
    title: '状态',
    dataIndex: 'status',
    dictKey: 'statusDict',
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: 200,
    render: 'ellipsis',
  },
];
```

### 2. SForm - 表单组件

**基础表单：**

```typescript
import { Form, Button, Space } from 'antd';
import { SForm, SFormItems } from '@dalydb/sdesign';

export default () => {
  const [form] = Form.useForm();

  const items: SFormItems[] = [
    {
      type: 'input',
      label: '用户名称',
      name: 'userName',
      required: '请输入用户名称',
    },
    {
      type: 'select',
      label: '状态',
      name: 'status',
      fieldProps: {
        options: [
          { label: '启用', value: 'active' },
          { label: '禁用', value: 'inactive' },
        ],
      },
    },
  ];

  return (
    <SForm name="basicForm" items={items} columns={3} form={form} />
  );
};
```

**搜索表单 (SForm.Search)：**

```typescript
import { Form } from 'antd';
import { SForm, SFormItems } from '@dalydb/sdesign';

export default () => {
  const [form] = Form.useForm();

  const items: SFormItems[] = [
    { type: 'input', label: '关键词', name: 'keyword' },
    { type: 'select', label: '状态', name: 'status' },
    { type: 'SDatePickerRange', label: '创建时间', name: 'createTimeRange' },
  ];

  return (
    <SForm.Search
      name="searchForm"
      form={form}
      items={items}
      columns={3}
      defaultExpand={true}
      showExpand={true}
      expandLine={2}
      onFinish={handleSearch}
      onReset={handleReset}
    />
  );
};
```

### 3. useSearchTable - 搜索表格 Hook

**基础使用：**

```typescript
import { SForm, STable, useSearchTable } from '@dalydb/sdesign';

export default () => {
  const { tableProps, formConfig, form } = useSearchTable(fetchList);

  const searchItems = [
    { type: 'input', label: '用户名', name: 'username' },
    { type: 'select', label: '状态', name: 'status' },
  ];

  const tableColumns = [
    { title: '用户名', dataIndex: 'username' },
    { title: '状态', dataIndex: 'status' },
    { title: '创建时间', dataIndex: 'createTime', render: 'datetime' },
  ];

  return (
    <>
      <SForm.Search form={form} items={searchItems} {...formConfig} />
      <STable isSeq columns={tableColumns} {...tableProps} />
    </>
  );
};
```

**自定义分页字段：**

```typescript
const { tableProps, formConfig, form } = useSearchTable(fetchList, {
  extraParams: { type: 1 },
  paginationFields: {
    current: 'page',
    pageSize: 'size',
    total: 'total',
    list: 'records',
  },
  transformRequestParams: (params) => ({
    ...params,
    keyword: params.keyword?.trim(),
  }),
  transformResponseData: (response) => ({
    ...response,
    records: response.records.map((item) => ({
      ...item,
      createTime: item.createdAt,
    })),
  }),
});
```

### 4. SDetail - 详情组件

**基础详情：**

```typescript
import { SDetail, SDetailItem } from '@dalydb/sdesign';

const items: SDetailItem[] = [
  { label: '姓名', name: 'name' },
  {
    label: '状态',
    name: 'status',
    type: 'dict',
    dictMap: { '0': '禁用', '1': '启用' },
  },
  {
    label: '有效期',
    name: ['startTime', 'endTime'],
    type: 'rangeTime',
  },
];

<SDetail
  title="用户详情"
  dataSource={dataSource}
  items={items}
  column={2}
/>
```

### 5. STitle - 标题组件

```typescript
import { STitle } from '@dalydb/sdesign';
import { Button, Tag } from 'antd';

// 主页面标题
<STitle>首页管理</STitle>

// 子页面带返回
<STitle goBack={true}>编辑页面</STitle>

// 带描述和操作
<STitle
  desc={<Tag color="blue">进行中</Tag>}
  actionNode={<Button type="primary">新增</Button>}
>
  订单管理
</STitle>
```

### 6. SButton - 按钮组件

```typescript
import { SButton } from '@dalydb/sdesign';

// 单个按钮
<SButton type="primary">提交</SButton>
<SButton>取消</SButton>
<SButton danger>删除</SButton>
<SButton actionType="save">保存</SButton>

// 按钮组
<SButton.Group
  items={[
    { children: '编辑', onClick: handleEdit },
    { children: '保存', type: 'primary', onClick: handleSave },
    { children: '删除', danger: true, onClick: handleDelete },
  ]}
/>

// 预定义操作按钮
<SButton.Group
  items={[
    { actionType: 'view', onClick: handleView },
    { actionType: 'edit', onClick: handleEdit },
    { actionType: 'delete', danger: true, onClick: handleDelete },
  ]}
/>
```

## 完整示例：搜索 + 表格 + 详情 + 编辑

```typescript
import { useState } from 'react';
import { Modal, Form, message } from 'antd';
import {
  SForm,
  STable,
  SDetail,
  STitle,
  SButton,
  useSearchTable,
} from '@dalydb/sdesign';

export default () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [editForm] = Form.useForm();

  const { tableProps, formConfig, form } = useSearchTable(userApi.getList, {
    paginationFields: {
      current: 'page',
      pageSize: 'pageSize',
      total: 'total',
      list: 'list',
    },
  });

  const searchItems = [
    { type: 'input', label: '用户名', name: 'name' },
    { type: 'select', label: '状态', name: 'status' },
  ];

  const tableColumns = [
    { title: '用户名', dataIndex: 'name', width: 120 },
    { title: '邮箱', dataIndex: 'email', width: 200 },
    { title: '状态', dataIndex: 'status', width: 100 },
    { title: '创建时间', dataIndex: 'createTime', render: 'datetime', width: 180 },
    {
      title: '操作',
      dataIndex: 'id',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <SButton.Group
          size="small"
          items={[
            { actionType: 'view', onClick: () => handleView(record) },
            { actionType: 'edit', onClick: () => handleEdit(record) },
            { actionType: 'delete', danger: true, onClick: () => handleDelete(record) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <STitle
        actionNode={
          <SButton
            actionType="create"
            type="primary"
            onClick={() => setEditVisible(true)}
          >
            新增
          </SButton>
        }
      >
        用户管理
      </STitle>

      <SForm.Search form={form} items={searchItems} {...formConfig} />

      <STable isSeq columns={tableColumns} {...tableProps} />

      {/* 详情弹窗 */}
      <Modal title="用户详情" open={detailVisible} onCancel={() => setDetailVisible(false)}>
        <SDetail dataSource={currentRecord} items={detailItems} column={1} />
      </Modal>

      {/* 编辑弹窗 */}
      <Modal title={currentRecord?.id ? '编辑用户' : '新增用户'} open={editVisible} footer={null}>
        <SForm form={editForm} items={editItems} columns={1} />
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <SButton.Group
            items={[
              { children: '取消', onClick: () => setEditVisible(false) },
              { children: '保存', type: 'primary', onClick: handleSubmit },
            ]}
          />
        </div>
      </Modal>
    </>
  );
};
```

## 最佳实践

### 1. 组件组合

- 优先使用 `useSearchTable` + `SForm.Search` + `STable` 组合
- `tableProps` 和 `formConfig` 可直接透传，减少样板代码

### 2. 分页约定

- 后端接口尽量遵循默认字段名：`pageNum`, `pageSize`, `totalSize`, `dataList`
- 如需自定义字段，使用 `paginationFields` 配置映射

### 3. 类型安全

- 充分利用 TypeScript 类型定义，如 `SFormItems[]`, `SColumnsType[]`, `SDetailItem[]`

### 4. 性能优化

- 重型组件（cascader, table, upload, treeSelect）已自动懒加载
- 合理使用 `hidden` 而非条件渲染，保持组件状态

---

*遵循以上约定，确保代码一致性和开发效率！*
