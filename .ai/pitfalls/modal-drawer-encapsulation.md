# P001：Modal/Drawer 弹层封装

> 错误类型：架构设计 | 影响范围：所有含弹层的页面

## 错误写法 A（❌）—— 列表页管理 open 状态

```tsx
// {Entity}Page.tsx — 列表页不应管理 Modal 状态
const {Entity}Page = () => {
  const [modalOpen, setModalOpen] = useState(false);  // ❌ 弹层状态泄漏到列表页
  const [editingId, setEditingId] = useState<string>();

  return (
    <>
      <SSearchTable columns={columns} requestFn={getListByGet} />
      {modalOpen && (
        <Modal open onCancel={() => setModalOpen(false)}>  {/* ❌ */}
          <{Entity}Form id={editingId} onSuccess={() => setModalOpen(false)} />
        </Modal>
      )}
    </>
  );
};
```

## 错误写法 B（❌）—— 手动 forwardRef + 遗漏状态重置

```tsx
// {Entity}FormModal.tsx — 手动管理生命周期，复杂弹框易遗漏 resetFields
const {Entity}FormModal = forwardRef<Ref, Props>((props, ref) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string>();
  const [form] = SForm.useForm();
  const [step, setStep] = useState(0);       // ❌ 关闭后不会重置
  const [fileList, setFileList] = useState([]); // ❌ 关闭后不会重置

  useImperativeHandle(ref, () => ({
    open: (m, id?) => {
      setMode(m); setEditId(id); setOpen(true);
      if (m === 'create') form.resetFields(); // 需要手动重置，容易遗漏 step/fileList
    },
  }));

  return open ? <Modal ...>...</Modal> : null;
});
```

## 正确写法（✅）—— 使用 createModal 工厂

```tsx
// {Entity}FormModal.tsx
import { createModal } from '@dalydb/sdesign';
import type { ModalContainerRef } from '@dalydb/sdesign';

type Params = { mode: 'create' | 'edit'; id?: string };

const {Entity}FormModal = createModal<Params>(({ params, onClose, onSuccess }) => {
  const [form] = SForm.useForm();       // ✅ 关闭自动销毁
  const [step, setStep] = useState(0);  // ✅ 关闭自动销毁
  const [fileList, setFileList] = useState([]); // ✅ 关闭自动销毁
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

export default {Entity}FormModal;

// {Entity}Page.tsx — 列表页保持简洁
const formRef = useRef<ModalContainerRef<Params>>(null);
<SButton actionType="create" onClick={() => formRef.current?.open({ mode: 'create' })} />
<{Entity}FormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} />
```

Drawer 同理，使用 `createDrawer`（`@dalydb/sdesign`）。

## 原因

1. **状态自动销毁**：`createModal` 在 open=false 时完全卸载 Content，所有 useState/useForm 自动重置，从根本上消除状态泄漏
2. **职责分离**：列表页不关心弹层生命周期，只通过 ref 触发
3. **泛型参数**：`open(params)` 的数据结构由泛型 P 定义，适配任意业务场景（CRUD、审批、预览等）
4. **零样板代码**：业务组件不需要写 forwardRef / useImperativeHandle / open 状态管理

## 相关规范

- `@dalydb/sdesign` — createModal / createDrawer 工厂函数
- `.ai/templates/crud-page.md`「弹层封装原则」
