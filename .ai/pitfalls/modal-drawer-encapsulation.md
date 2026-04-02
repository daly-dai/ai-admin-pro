# P001：Modal/Drawer 弹层封装

> 错误类型：架构设计 | 影响范围：所有 CRUD 列表页

## 错误写法（❌）

列表页直接管理 Modal/Drawer 的 open 状态：

```tsx
// {Entity}Page.tsx — 列表页不应管理 Modal 状态
const {Entity}Page = () => {
  const [modalOpen, setModalOpen] = useState(false);  // ❌ 弹层状态泄漏到列表页
  const [editingId, setEditingId] = useState<string>();

  return (
    <>
      <SSearchTable
        columns={columns}
        requestFn={getListByGet}
      />
      {modalOpen && (
        <Modal open onCancel={() => setModalOpen(false)}>  {/* ❌ */}
          <{Entity}Form id={editingId} onSuccess={() => setModalOpen(false)} />
        </Modal>
      )}
    </>
  );
};
```

## 正确写法（✅）

创建容器组件，在子组件内部管理弹层状态：

```tsx
// {Entity}FormModal.tsx — 容器组件，内部管理 Modal
export interface {Entity}FormModalRef {
  open: (mode: 'create' | 'edit', id?: string) => void;
}

const {Entity}FormModal = forwardRef<{Entity}FormModalRef, Props>((props, ref) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string>();

  useImperativeHandle(ref, () => ({
    open: (m, id?) => {
      setMode(m);
      setEditId(id);
      setOpen(true);
    },
  }));

  return (
    {open && (
      <Modal open title={mode === 'create' ? '新增' : '编辑'} onCancel={() => setOpen(false)} footer={null}>
        <{Entity}Form
          id={editId}
          onSuccess={() => {
            setOpen(false);
            props.onSuccess?.();
          }}
        />
      </Modal>
    )}
  );
});

// {Entity}Page.tsx — 列表页保持简洁
const {Entity}Page = () => {
  const tableRef = useRef<SSearchTableRef>(null);
  const formRef = useRef<{Entity}FormModalRef>(null);

  return (
    <>
      <SSearchTable
        ref={tableRef}
        tableTitle={{ actionNode: <SButton actionType="create" onClick={() => formRef.current?.open('create')} /> }}
        columns={columns}
        requestFn={getListByGet}
      />
      <{Entity}FormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} />
    </>
  );
};
```

## 原因

1. **职责分离**：列表页只负责列表编排，不应关心弹层的生命周期
2. **状态内聚**：弹层的 open/close、mode、editId 等状态应内聚在容器组件中
3. **复用性**：容器组件可以在多处复用，而不需要重复实现弹层逻辑
4. **可测试性**：容器组件独立测试更容易

## 相关规范

- `.ai/guides/crud-page.md`「弹层封装原则」
- `.ai/core/coding-standards.md`「容器组件说明」
- `AGENTS.md` 步骤 5 组件约束速查
