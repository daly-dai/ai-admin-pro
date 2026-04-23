# CRUD 列表页代码模板

> 来源：manual-crud.md §2 + §6，排除了已在 SKILL.md 中覆盖的硬约束/组件速查/验证清单

## 决策点

- **标准列表** → `SSearchTable`（一体化方案，首选）
- **需要更多控制** → `STable` + `SForm.Search` + `useSearchTable`

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
| 列表 | `SSearchTable` 或 `STable`    | `@dalydb/sdesign` |
| 搜索 | `SForm.Search`（配合 STable） | `@dalydb/sdesign` |
| 表单 | `SForm`（items 配置式）       | `@dalydb/sdesign` |
| 按钮 | `SButton`（actionType 预设）  | `@dalydb/sdesign` |
| 标题 | `STitle`                      | `@dalydb/sdesign` |

## 页面交互模式选择

> 优先从 spec.md 获取，未指定时按以下规则判断：

| 模式       | 适用场景              | 实现方式                                    |
| ---------- | --------------------- | ------------------------------------------- |
| **Modal**  | 字段 <= 8，无复杂联动 | `createModal` 工厂 + antd Modal + SForm     |
| **独立页** | 字段 > 8，含复杂控件  | `create.tsx` / `edit.tsx`，路由跳转         |
| **Drawer** | 仅查看详情            | `createDrawer` 工厂 + antd Drawer + SDetail |

## 弹层封装原则

> 使用 `createModal` / `createDrawer` 工厂函数封装弹层，Content 在 open=false 时完全卸载，内部所有状态自动销毁，无需手动 resetFields。

```tsx
// {Entity}FormModal.tsx — 使用 createModal 工厂
import { createModal } from '@dalydb/sdesign';
import type { ModalChildProps } from '@dalydb/sdesign';

type Params = { mode: 'create' | 'edit'; id?: string };

const UserFormModal = createModal<Params>(({ params, onClose, onSuccess }) => {
  const [form] = SForm.useForm(); // 关闭自动销毁，无需 resetFields
  const { mode, id } = params;

  useRequest(() => getByIdByGet(id!), {
    ready: mode === 'edit' && !!id,
    onSuccess: (data) => form.setFieldsValue(data),
  });

  const { run, loading } = useRequest(
    mode === 'create' ? createByPost : (v) => updateByPut(id!, v),
    { manual: true, onSuccess: () => { message.success('操作成功'); onSuccess(); } },
  );

  return (
    <Modal open title={mode === 'create' ? '新增' : '编辑'} onCancel={onClose} footer={null}>
      <SForm form={form} items={formItems} onFinish={run} />
    </Modal>
  );
});

export default UserFormModal;

// 列表页通过 ref 触发（用法不变）
import type { ModalContainerRef } from '@dalydb/sdesign';

const formRef = useRef<ModalContainerRef<Params>>(null);
<SButton actionType="create" onClick={() => formRef.current?.open({ mode: 'create' })} />
<UserFormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} />
```

核心：`createModal` 管理 open 生命周期 | ref 暴露 `open(params)` | Content 关闭即销毁

## 快速示例

```tsx
// 列表页
<SSearchTable
  headTitle={{ children: '用户管理' }}
  requestFn={api.getUsers}
  formProps={{ items: searchItems, columns: 3 }}
  tableProps={{ columns, rowKey: 'id' }}
/>

// 表单页
<SForm items={formItems} columns={2} onFinish={save} />

// 详情页
<SDetail title="详情" dataSource={data} items={detailItems} column={2} />
```

## useRequest 用法

```tsx
// 删除操作
const { run: handleDelete } = useRequest(deleteByDelete, {
  manual: true,
  onSuccess: () => {
    message.success('删除成功');
    actionRef.current?.reload();
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

```
input | inputNumber | password | textarea | select | slider |
radio | radioGroup | switch | treeSelect | upload |
datePicker | SDatePicker | datePickerRange | SDatePickerRange |
timePicker | timePickerRange | checkbox | checkGroup |
cascader | SCascader | table
```

> dependency 已弃用，字段联动统一使用 `SForm.useWatch` + 动态 items。

## 确认弹窗

> 删除、批量操作等危险操作使用 antd `Modal.confirm` 进行二次确认。

```tsx
import { Modal } from 'antd';

// 删除确认
const handleDelete = (id: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '删除后不可恢复，确认删除？',
    onOk: () => runDelete(id),
  });
};
```

## STable 列配置

- `dictKey`: 字典映射 key
- `render`: 支持 `'datetime'` | `'date'` | `'ellipsis'` 快捷类型

---

## 填空模板（兜底方案）

> **适用场景**：多次生成偏离预期、弱模型不稳定、或希望快速产出可运行骨架时使用。
> **原理**：将"理解规范 → 组装代码"降级为"识别 `@FILL` → 文本替换"，让模型只做填空题。

### 使用方法

1. **复制下方"填空模板"** 到目标 `.tsx` 文件中（替换原有内容）。
2. **对 AI 发出指令**（建议选中整个文件后输入）：
   > "请根据以下需求，**只修改**代码中所有 `@FILL` 标记的内容，**严禁修改任何其他已存在的代码**。需求：页面标题为'商品管理'，API 函数名为 `queryGoodsPage`，返回结构 `{ records: [], total: 0 }`，搜索项包括商品名称(name)和状态(status)，表格列包括商品名称、价格、库存、创建时间。"

### 填空模板 — index.tsx

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import type { SSearchTableRef } from '@dalydb/sdesign';
import { SSearchTable, SButton } from '@dalydb/sdesign';
import { message, Modal } from 'antd';
import { useRequest } from 'ahooks';
import { useRef } from 'react';
import type { ModalContainerRef } from '@dalydb/sdesign';
// @FILL: 导入 API 函数，例如 import { getListByGet, deleteByDelete } from 'src/api/{module}';
// @FILL: 导入类型，例如 import type { XxxQuery } from 'src/api/{module}/types';
// @FILL: 导入 FormModal 组件，例如 import XxxFormModal from './components/XxxFormModal';

export default () => {
  const tableRef = useRef<SSearchTableRef>(null);
  // @FILL: 定义弹窗 ref，例如 const formRef = useRef<ModalContainerRef<{ mode: 'create' | 'edit'; id?: string }>>(null);

  // 删除操作
  const { run: handleDelete } = useRequest(
    // @FILL: 替换为删除 API，例如 (id: string) => deleteByDelete(id)
    (id: string) => Promise.resolve(id),
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功');
        tableRef.current?.refresh();
      },
    },
  );

  const columns = [
    // @FILL: 表格列配置
    // 示例: { title: '名称', dataIndex: 'name' },
    // 支持 render: 'datetime' | 'date' | 'ellipsis'
    {
      title: '操作',
      dataIndex: 'action',
      width: 150,
      render: (_: unknown, record: Record<string, unknown>) => (
        <>
          <SButton
            actionType="edit"
            compact
            onClick={() => {
              // @FILL: 打开编辑弹窗，例如 formRef.current?.open({ mode: 'edit', id: record.id as string });
            }}
          />
          <SButton
            actionType="delete"
            compact
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                // @FILL: 替换确认内容
                content: `确定删除吗？`,
                onOk: () => handleDelete(record.id as string),
              });
            }}
          />
        </>
      ),
    },
  ];

  const searchItems = [
    // @FILL: 搜索项配置
    // 格式: { label: '名称', name: 'name', type: 'input' }
    // 可选 type: input | select | datePicker | datePickerRange
  ];

  return (
    <>
      <SSearchTable
        ref={tableRef}
        headTitle={{ children: '@FILL:页面标题' }}
        // @FILL: 替换为列表 API 函数引用，例如 requestFn={getListByGet}
        requestFn={() => Promise.resolve({ dataList: [], totalSize: 0 })}
        tableTitle={{
          actionNode: (
            <SButton
              actionType="create"
              onClick={() => {
                // @FILL: 打开新增弹窗，例如 formRef.current?.open({ mode: 'create' });
              }}
            />
          ),
        }}
        formProps={{
          items: searchItems,
          columns: 3,
        }}
        tableProps={{
          columns: columns,
          rowKey: '@FILL:主键字段', // 通常为 'id'
        }}
      />
      {/* @FILL: 放置弹窗组件，例如 <XxxFormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} /> */}
    </>
  );
};
```
