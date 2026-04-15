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

| 模式       | 适用场景              | 实现方式                                  |
| ---------- | --------------------- | ----------------------------------------- |
| **Modal**  | 字段 <= 8，无复杂联动 | antd Modal + SForm，子组件管理弹层状态    |
| **独立页** | 字段 > 8，含复杂控件  | `create.tsx` / `edit.tsx`，路由跳转       |
| **Drawer** | 仅查看详情            | antd Drawer + SDetail，子组件管理抽屉状态 |

## 弹层封装原则

> Modal/Drawer 的 open/close 状态必须封装在子组件内部，列表页只做编排。

```tsx
// 正确：{Entity}FormModal.tsx — 内部管理 Modal
const {Entity}FormModal = forwardRef<{Entity}FormModalRef, Props>((props, ref) => {
  const [open, setOpen] = useState(false);
  useImperativeHandle(ref, () => ({
    open: (mode, id?) => { setOpen(true); },
  }));
  return (
    {open && (
      <Modal open onCancel={() => setOpen(false)} footer={null}>
        <{Entity}Form onSuccess={() => { setOpen(false); props.onSuccess?.(); }} />
      </Modal>
    )}
  );
});

// 列表页通过 ref 触发
const formRef = useRef<{Entity}FormModalRef>(null);
<SSearchTable
  tableTitle={{ actionNode: <SButton actionType="create" onClick={() => formRef.current?.open('create')} /> }}
/>
<{Entity}FormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} />
```

核心：列表页不管弹层生命周期 | ref 暴露 open 方法 | Modal 用 `{open && <Modal/>}` 条件渲染

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
