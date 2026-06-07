# CRUD 页面代码模板

> 组件库文档: `.ai/sdesign/components/`

## 决策点

- **标准列表** → `SProTable`（一体化方案，首选）
- **需要更多控制** → `STable` + `SForm.Search` + `useProTable`

## 文件结构

```
src/api/{module}/types.ts     — 类型定义（Entity, EntityQuery, EntityFormData）
src/api/{module}/index.ts     — API 实现（导出 {module}Api 对象）
src/pages/{module}/index.tsx  — 列表页
src/pages/{module}/components/ — 页面私有组件（FormModal/DetailDrawer 等）
```

## 核心组件

| 用途 | 组件                          | 来源              |
| ---- | ----------------------------- | ----------------- |
| 列表 | `SProTable` 或 `STable`       | `@dalydb/sdesign` |
| 搜索 | `SForm.Search`（配合 STable） | `@dalydb/sdesign` |
| 表单 | `SForm`（items 配置式）       | `@dalydb/sdesign` |
| 按钮 | `SButton`（actionType 预设）  | `@dalydb/sdesign` |
| 标题 | `STitle`                      | `@dalydb/sdesign` |

## 页面交互模式选择

> 优先从 spec.md 获取，未指定时按以下规则判断：

| 模式       | 适用场景              | 实现方式                                                   |
| ---------- | --------------------- | ---------------------------------------------------------- |
| **Modal**  | 字段 <= 6，无复杂联动 | `createModal`（`@dalydb/sdesign`）+ antd Modal + SForm     |
| **独立页** | 字段 > 6，含复杂控件  | `create.tsx` / `edit.tsx`，路由跳转                        |
| **Drawer** | 仅查看详情            | `createDrawer`（`@dalydb/sdesign`）+ antd Drawer + SDetail |

## 弹层封装原则

> 使用 `createModal` / `createDrawer` 工厂函数封装弹层。Content 在 open=false 时完全卸载，内部所有状态自动销毁，无需手动 resetFields。

```tsx
// {Entity}FormModal.tsx — 使用 createModal 工厂
import { createModal } from '@dalydb/sdesign';
import type { ModalChildProps } from '@dalydb/sdesign';

type Params = { mode: 'create' | 'edit'; id?: string };

const FormContent = ({ params, onClose, onSuccess }: ModalChildProps<Params>) => {
  const [form] = SForm.useForm();
  const isEdit = params.mode === 'edit';

  useRequest(() => getByIdByGet(params.id!), {
    ready: isEdit && !!params.id,
    onSuccess: (data) => form.setFieldsValue(data),
  });

  const { run, loading } = useRequest(
    (values) => isEdit ? updateByPut(params.id!, values) : createByPost(values),
    { manual: true, onSuccess: () => { message.success('操作成功'); onSuccess?.(); } },
  );

  return (
    <Modal open title={isEdit ? '编辑' : '新增'} onCancel={onClose} onOk={() => form.submit()} confirmLoading={loading}>
      <SForm form={form} items={formItems} columns={1} onFinish={run} />
    </Modal>
  );
};

export default createModal<Params>(FormContent);

// 列表页通过 ref 触发
import type { ModalContainerRef, SProTableRef } from '@dalydb/sdesign';
import { useRef } from 'react';

const tableRef = useRef<SProTableRef>(null);                    // 表格 ref，调用 refresh()
const formRef = useRef<ModalContainerRef<Params>>(null);        // Modal ref，调用 open(params)

<SButton actionType="create" onClick={() => formRef.current?.open({ mode: 'create' })} />
<SProTable ref={tableRef} ... />
<{Entity}FormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} />
```

核心：`createModal` 管理 open 生命周期 | ref 暴露 `open(params)` | Content 关闭即销毁

## 快速示例

```tsx
// 列表页
<SProTable
  title={{ children: '用户管理' }}
  request={{
    service: api.getUsers,
    options: {
      paginationFields: { list: 'dataList', total: 'totalSize' },
      transformRequestParams: (params) => {
        const { pageIndex, ...rest } = params;
        return { ...rest, pageNum: pageIndex };
      },
    },
  }}
  searchProps={{ items: searchItems, columns: 4 }}
  tableProps={{ columns, rowKey: 'id' }}
/>

// 表单页
<SForm items={formItems} columns={2} onFinish={save} />

// 详情页
<SDetail title="详情" dataSource={data} items={detailItems} column={2} />
```

## searchItems 定义

```tsx
// ⚠️ 禁止类型注解，让 TS 逐项推断 fieldProps 精确类型（P006）
const searchItems = [
  { label: '关键词', name: 'keyword', type: 'input' },
  {
    label: '状态',
    name: 'status',
    type: 'select',
    fieldProps: { dictKey: 'userStatus', allowClear: true },
  },
  { label: '创建时间', name: 'dateRange', type: 'datePickerRange' },
];
```

## columns 定义

```tsx
// ⚠️ 必须显式类型注解 SColumnsType<Entity>（P006）
const columns: SColumnsType<User> = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 60,
    render: (_text, _record, index) => index + 1,
  },
  { title: '用户名', dataIndex: 'username', width: 120 },
  { title: '状态', dataIndex: 'status', width: 80, dictKey: 'userStatus' },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
    render: 'datetime' as const,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 220,
    render: (_text, record) => (
      <SButton.Group
        items={[
          {
            actionType: 'edit',
            compact: true,
            onClick: () =>
              formRef.current?.open({ mode: 'edit', id: record.id }),
          },
          {
            actionType: 'delete',
            compact: true,
            onClick: () => {
              Modal.confirm({
                title: '确认删除',
                content: `确认删除？`,
                onOk: () => handleDelete(record.id),
              });
            },
          },
          {
            actionType: 'view',
            compact: true,
            onClick: () => detailRef.current?.open({ id: record.id }),
          },
        ]}
      />
    ),
  },
];
```

## 列表页完整骨架

```tsx
import type { ModalContainerRef, SColumnsType, SFormItems, SProTableRef } from '@dalydb/sdesign';
import { SButton, SProTable } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { useRef } from 'react';

const tableRef = useRef<SProTableRef>(null);
const formRef = useRef<ModalContainerRef<{ mode: 'create' | 'edit'; id?: string }>>(null);
const detailRef = useRef<ModalContainerRef<{ id: string }>>(null);

const { run: handleDelete } = useRequest(deleteByDelete, {
  manual: true,
  onSuccess: () => { message.success('删除成功'); tableRef.current?.refresh(); },
});

<SProTable
  ref={tableRef}
  title={{ children: '{模块}管理' }}
  request={{ service: getListByGet, options: { paginationFields: { list: 'dataList', total: 'totalSize' } } }}
  tableTitle={{ actionNode: <SButton actionType="create" onClick={() => formRef.current?.open({ mode: 'create' })} /> }}
  searchProps={{ items: searchItems, columns: 4 }}
  tableProps={{ columns, rowKey: 'id' }}
/>

<{Entity}FormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} />
<{Entity}DetailDrawer ref={detailRef} />
```

## useRequest 用法

```tsx
// 删除操作
const { run: handleDelete } = useRequest(deleteByDelete, {
  manual: true,
  onSuccess: () => {
    message.success('删除成功');
    tableRef.current?.refresh();
  },
});

// 新增
const { run: handleCreate } = useRequest(createByPost, {
  manual: true,
  onSuccess: () => {
    message.success('创建成功');
    navigate(-1);
  },
});

// 编辑（加载详情 + 提交）
const { data: detail } = useRequest(() => getByIdByGet(id!), { ready: !!id });
const { run: handleUpdate } = useRequest((values) => updateByPut(id!, values), {
  manual: true,
  onSuccess: () => {
    message.success('更新成功');
    navigate(-1);
  },
});
```

> 禁止手动 useState 管理 loading/data + useEffect 中直接 await，必须用 useRequest。

## SForm 控件类型

> 完整列表见 `sdesign/components/SForm.md`。联动规则见 `pitfalls/index.md` P004。

```
input | inputNumber | password | textarea | select | slider |
radio | radioGroup | switch | treeSelect | upload |
datePicker | datePickerRange |
timePicker | timePickerRange | checkbox | checkGroup |
cascader | table

已废弃别名（仍可用，建议迁移为 camelCase）:
SDatePicker → datePicker | SDatePickerRange → datePickerRange | SCascader → cascader
```

## 确认弹窗

> 删除、批量操作等危险操作使用 antd `Modal.confirm`。详见 `pitfalls/index.md` P005。

## 操作按钮组

> 表格操作列使用 `SButton.Group` + `compact`（t-link 样式），禁止无包裹。

```tsx
// ✅ SButton.Group + compact（标准操作按钮）
<SButton.Group
  items={[
    { actionType: 'edit', compact: true, onClick: handleEdit },
    { actionType: 'delete', compact: true, onClick: handleDelete },
    { actionType: 'view', compact: true, onClick: handleView },
  ]}
/>

// ✅ Space + compact（非标准按钮：含 Tooltip、Divider、自定义渲染时退回）
<Space>
  <SButton actionType="edit" compact onClick={handleEdit} />
  <Tooltip title="刷新"><Button icon={<ReloadOutlined />} onClick={refresh} /></Tooltip>
</Space>

// ❌ 错误 — 无包裹，按钮挤在一起
<>
  <SButton actionType="edit" compact onClick={...} />
  <SButton actionType="delete" compact onClick={...} />
</>
```

## STable 列配置

> `dictKey` 字典映射、`render` 快捷类型（datetime/date/ellipsis）。完整 Props 见 `sdesign/components/STable.md`。

### 枚举列的字典回显

| 场景                             | 做法                                          | 示例                                                    |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| SProTable 枚举列                 | `dataIndex` 匹配 dict code，自动回显          | `{ title: '状态', dataIndex: 'statusCode' }`            |
| SForm 下拉框                     | `name` 匹配 dict code，自动填 options         | `{ name: 'statusCode', label: '状态', type: 'select' }` |
| SDetail 枚举字段                 | 同上，name 匹配 dict code                     | `{ name: 'statusCode', label: '状态' }`                 |
| STable 手动 render（非标准场景） | `dictMapData?.['code']?.[record.code] ?? '-'` | 见 dict-conventions                                     |

> 字典已通过 SConfigProvider 全局注入。**不需要在 items/columns 中写硬编码 options。** 如果 dict code 不确定 → 问用户。
