# CRUD 页面代码模板

> 组件库文档: `.ai/sdesign/components/`

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

| 模式       | 适用场景              | 实现方式                                                   |
| ---------- | --------------------- | ---------------------------------------------------------- |
| **Modal**  | 字段 <= 8，无复杂联动 | `createModal`（`@dalydb/sdesign`）+ antd Modal + SForm     |
| **独立页** | 字段 > 8，含复杂控件  | `create.tsx` / `edit.tsx`，路由跳转                        |
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
    { manual: true, onSuccess: () => { message.success('操作成功'); onSuccess(); } },
  );

  return (
    <Modal open title={isEdit ? '编辑' : '新增'} onCancel={onClose} onOk={() => form.submit()} confirmLoading={loading}>
      <SForm form={form} items={formItems} columns={1} onFinish={run} />
    </Modal>
  );
};

export default createModal<Params>(FormContent);

// 列表页通过 ref 触发
import type { ModalContainerRef } from '@dalydb/sdesign';

const formRef = useRef<ModalContainerRef<Params>>(null);
<SButton actionType="create" onClick={() => formRef.current?.open({ mode: 'create' })} />
<{Entity}FormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} />
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
datePicker | SDatePicker | datePickerRange | SDatePickerRange |
timePicker | timePickerRange | checkbox | checkGroup |
cascader | SCascader | table
```

## 确认弹窗

> 删除、批量操作等危险操作使用 antd `Modal.confirm`。详见 `pitfalls/index.md` P005。

## STable 列配置

> `dictKey` 字典映射、`render` 快捷类型（datetime/date/ellipsis）。完整 Props 见 `sdesign/components/STable.md`。
