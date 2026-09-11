# CRUD 列表页代码模板

> 组件库文档: `{project}/.ai/sdesign/components/`

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

const tableRef = useRef<SProTableRef>(null);                    // 表格 ref，调用 refresh()
const formRef = useRef<ModalContainerRef<Params>>(null);        // Modal ref，调用 open(params)
const detailRef = useRef<ModalContainerRef<{ id: string }>>(null); // 详情 Drawer ref

<SButton actionType="create" onClick={() => formRef.current?.open({ mode: 'create' })} />
<SProTable ref={tableRef} ... />
<{Entity}FormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} />
<{Entity}DetailDrawer ref={detailRef} />
```

核心：`createModal` 管理 open 生命周期 | ref 暴露 `open(params)` | Content 关闭即销毁

---

## 填空模板：index.tsx（主路径）

> **默认使用填空模板**。模板注释已内嵌组件 API 约束和常见反例，无需额外读组件文档。仅 `pnpm verify` 报错且 `.ai/pitfalls/verify-errors.md` 未匹配签名时，才按需读对应组件文档。

### 使用方法

1. **复制下方"填空模板"** 到目标 `.tsx` 文件中。
2. **对 AI 发出指令**：
   > "请根据以下需求，**只修改**代码中所有 `@FILL` 标记的内容，**严禁修改任何其他已存在的代码**。需求：……"
3. `pnpm verify` 报错时 → 先查 .ai/pitfalls/verify-errors.md 匹配签名 → 未匹配才读组件文档。

### 填空模板

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import type {
  SProTableRef,
  ModalContainerRef,
  SColumnsType,
  SFormItems,
} from '@dalydb/sdesign';
import { SProTable, SButton } from '@dalydb/sdesign';
import { message, Modal } from 'antd';
import { useRequest } from 'ahooks';
import { useRef } from 'react';
// @FILL: 导入 API 函数
// ✅ import { getListByGet, deleteByDelete } from 'src/api/{module}';
// ❌ import axios / import { createRequest }（API 层已封装，页面只导函数）
// @FILL: 导入类型 — 必须用 import type
// ✅ import type { Product } from 'src/api/{module}/types';
// ❌ import { Product }（类型导入必须加 type 关键字）
// @FILL: 导入 FormModal 组件（有弹窗时）
// ✅ import ProductFormModal from './components/ProductFormModal';
// @FILL: 导入 DetailDrawer 组件（有详情抽屉时）
// ✅ import ProductDetailDrawer from './components/ProductDetailDrawer';

export default () => {
  const tableRef = useRef<SProTableRef>(null);
  // @FILL: 定义弹窗 ref（有弹窗时）
  // ✅ const formRef = useRef<ModalContainerRef<{ mode: 'create' | 'edit'; id?: string }>>(null);
  // @FILL: 定义详情抽屉 ref（有详情时）
  // ✅ const detailRef = useRef<ModalContainerRef<{ id: string }>>(null);

  // 删除操作
  const { run: handleDelete } = useRequest(
    // @FILL: 替换为删除 API
    // ✅ deleteByDelete
    // ❌ (id: string) => deleteByDelete(id)  // 不需要额外包装，直接传函数引用
    deleteByDelete,
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功');
        tableRef.current?.refresh();
      },
    },
  );

  // ⚠️ columns 必须显式类型注解 SColumnsType<Entity>，否则 TS2322 报错
  // ✅ const columns: SColumnsType<Product> = [...]
  // ❌ const columns = [...]   // 缺类型注解 → TS 报错
  // @FILL: 将 Record<string, unknown> 替换为实际实体类型
  const columns: SColumnsType<Record<string, unknown>> = [
    // @FILL: 表格列配置
    // ✅ { title: '名称', dataIndex: 'name' }
    // ✅ { title: '时间', dataIndex: 'createTime', render: 'datetime' as const }
    // ✅ { title: '状态', dataIndex: 'status', dictKey: 'statusCode' }  // 枚举列用 dictKey，SConfigProvider 自动回显
    // ❌ { title: '状态', dataIndex: 'status', render: (text) => text === 1 ? '启用' : '禁用' }  // 禁止硬编码枚举
    // ❌ render: (text, record) => ...  // 未使用参数不加 _ 前缀 → ESLint 报错
    {
      title: '操作',
      dataIndex: 'action',
      width: 220,
      // ✅ 未使用参数加 _ 前缀；操作列用 SButton.Group + compact
      render: (_text, record: Record<string, unknown>) => (
        // ✅ SButton.Group + compact（标准操作按钮组）
        // ❌ 无包裹的独立 SButton → 按钮挤在一起
        <SButton.Group
          items={[
            {
              actionType: 'edit',
              compact: true,
              onClick: () => {
                // @FILL: 打开编辑弹窗
                // ✅ formRef.current?.open({ mode: 'edit', id: record.id as string });
              },
            },
            {
              actionType: 'delete',
              compact: true,
              onClick: () => {
                // ✅ 确认弹窗用 Modal.confirm，禁止 SConfirm
                Modal.confirm({
                  title: '确认删除',
                  // @FILL: 替换确认内容
                  content: `确定删除吗？`,
                  onOk: () => handleDelete(record.id as string),
                });
              },
            },
            // @FILL: 有详情时取消注释
            // {
            //   actionType: 'view',
            //   compact: true,
            //   onClick: () => detailRef.current?.open({ id: record.id as string }),
            // },
          ]}
        />
      ),
    },
  ];

  // ⚠️ searchItems 显式注解 SFormItems[]，确保 item 结构正确
  const searchItems: SFormItems[] = [
    // @FILL: 搜索项配置
    // ✅ { label: '名称', name: 'name', type: 'input' }
    // ✅ { label: '状态', name: 'status', type: 'select', fieldProps: { dictKey: 'statusCode' } }
    // ❌ { label: '状态', name: 'status', type: 'select', fieldProps: { options: [...] } }  // 禁止硬编码 options
    // 可选 type: input | select | datePicker | datePickerRange
  ];

  return (
    <>
      <SProTable
        ref={tableRef}
        // ⚠️ SProTable 用 title 不是 headTitle
        // ✅ title={{ children: '用户管理' }}
        // ❌ headTitle={{ children: '...' }}  // headTitle 不存在 → TS 报错
        title={{ children: '@FILL:页面标题' }}
        // @FILL: 替换为列表 API；service 传函数引用，不是调用结果
        // ✅ request={{ service: getListByGet, options: { paginationFields: { list: 'dataList', total: 'totalSize' } } }}
        request={{
          service: () => Promise.resolve({ dataList: [], totalSize: 0 }),
          options: {
            // @FILL: 按后端分页响应结构调整字段映射
            // ✅ paginationFields: { list: 'dataList', total: 'totalSize' }
            paginationFields: { list: 'dataList', total: 'totalSize' },
          },
        }}
        tableTitle={{
          actionNode: (
            <SButton
              actionType="create"
              onClick={() => {
                // @FILL: 打开新增弹窗
                // ✅ formRef.current?.open({ mode: 'create' });
              }}
            />
          ),
        }}
        // ⚠️ searchProps 不是 formProps
        // ✅ searchProps={{ items: searchItems, columns: 4 }}
        // ❌ formProps={{ items: searchItems }}  // SProTable 用 searchProps
        searchProps={{ items: searchItems, columns: 4 }}
        tableProps={{
          columns: columns,
          rowKey: '@FILL:主键字段', // 通常为 'id'
        }}
      />
      {/* @FILL: 放置弹窗组件（有弹窗时） */}
      {/* ✅ <ProductFormModal ref={formRef} onSuccess={() => tableRef.current?.refresh()} /> */}
      {/* @FILL: 放置详情抽屉（有详情时） */}
      {/* ✅ <ProductDetailDrawer ref={detailRef} /> */}
    </>
  );
};
```

---

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

```
input | inputNumber | password | textarea | select | slider |
radio | radioGroup | switch | treeSelect | upload |
datePicker | datePickerRange |
timePicker | timePickerRange | checkbox | checkGroup |
cascader | table

已废弃别名（仍可用，建议迁移为 camelCase）:
SDatePicker → datePicker | SDatePickerRange → datePickerRange | SCascader → cascader
```

> ⛔ `dependency` 已弃用。字段联动统一使用 `SForm.useWatch` + 动态 items。

## 确认弹窗

> 删除、批量操作等危险操作使用 antd `Modal.confirm`。禁止 SConfirm。

## 枚举列的字典回显

> 字典通过 SConfigProvider 全局注入，组件通过 `dictKey` 显式指定字典编码。

| 场景                 | 做法                          | 示例                                                                 |
| -------------------- | ----------------------------- | -------------------------------------------------------------------- |
| SProTable 枚举列     | `dictKey` 指定字典编码        | `{ title: '状态', dataIndex: 'statusCode', dictKey: 'statusCode' }`  |
| SForm 下拉框         | `fieldProps.dictKey` 指定     | `{ name: 'statusCode', label: '状态', type: 'select', fieldProps: { dictKey: 'statusCode' } }` |
| SDetail 枚举字段     | `dictKey` 指定，type='dict'   | `{ name: 'statusCode', label: '状态', type: 'dict', dictKey: 'statusCode' }` |
| STable 手动 render   | `dictMapData?.['code']?.[record.code] ?? '-'` | 见 dict-conventions                                     |

> **禁止在 items/columns 中写硬编码 options 或 render 枚举映射。**
