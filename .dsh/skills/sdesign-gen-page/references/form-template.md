# 表单页代码模板

> 组件库文档: `{project}/.ai/sdesign/components/SForm.md`

## 核心组件

- **SForm**：配置式表单（items 数组）
- **SForm.Group**：分组表单

## SFormItems 关键配置

| 属性         | 说明                                                |
| ------------ | --------------------------------------------------- |
| `label`      | 字段标签                                            |
| `name`       | 字段名                                              |
| `type`       | 控件类型（见下方列表）                              |
| `required`   | boolean 或 string（自定义提示）                     |
| `regKey`     | 内置校验：`'phone'` / `'email'` / `'percentage'` 等 |
| `readonly`   | 只读模式                                            |
| `hidden`     | 隐藏但参与提交                                      |
| `fieldProps` | 传递给底层控件的 props（options, maxLength 等）     |
| `colProps`   | 栅格布局（`{ span: 12 }`）                          |

## 20 种控件类型（+ 3 个已废弃别名）

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

## 决策点

- **新增页** → `create.tsx`：调用 `createByPost`
- **编辑页** → `edit.tsx`：`getByIdByGet` 加载回显 + `updateByPut` 提交
- **Modal 弹窗** → `FormModal.tsx`（createModal 工厂）：字段 <= 8，通过 `mode: 'create' | 'edit'` 区分
- **分组表单**：`SForm.Group` + `groupItems`
- **字段联动**：`SForm.useWatch(fieldName, form)` + 条件展开 items

## 交互模式

| 模式       | 适用场景                                                             |
| ---------- | -------------------------------------------------------------------- |
| **独立页** | 字段 > 8，含复杂控件 → `create.tsx` + `edit.tsx`                     |
| **Modal**  | 字段 <= 8，无复杂联动 → `createModal`（`@dalydb/sdesign`）封装子组件 |

> 弹层封装原则（createModal 工厂模式）→ 详见 `crud-template.md`「弹层封装原则」

---

## 填空模板：create.tsx（独立页 — 新增）

> 使用方法：复制到 `create.tsx`，只修改 `@FILL` 标记内容。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm, SButton } from '@dalydb/sdesign';
import type { SFormItems } from '@dalydb/sdesign';
import { message, Card, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
// @FILL: 导入 API 函数
// ✅ import { createByPost } from 'src/api/{module}';
// @FILL: 导入类型 — 必须用 import type
// ✅ import type { ProductFormData } from 'src/api/{module}/types';
// ❌ import { ProductFormData }（类型导入必须加 type 关键字）

export default () => {
  const [form] = SForm.useForm();
  const navigate = useNavigate();

  const { run: handleSubmit, loading } = useRequest(
    // @FILL: 替换为新增 API
    // ✅ (values: ProductFormData) => createByPost(values)
    (values: Record<string, unknown>) => Promise.resolve(values),
    {
      manual: true,
      onSuccess: () => {
        message.success('创建成功');
        navigate(-1);
      },
    },
  );

  // ⚠️ 必须用显式类型注解: const formItems: SFormItems[] = [...]
  const formItems: SFormItems[] = [
    // @FILL: 新增页表单项配置
    // ✅ { label: '名称', name: 'name', type: 'input', required: true }
    // ✅ { label: '状态', name: 'status', type: 'select', fieldProps: { dictKey: 'statusCode' } }
    // ❌ { label: '状态', name: 'status', type: 'select', fieldProps: { options: [...] } }  // 禁止硬编码 options
    // ❌ { type: 'dependency' }  // 已弃用，联动用 SForm.useWatch
  ];

  return (
    // ⚠️ SForm 不支持 loading prop，用 Spin 包裹
    // ✅ <Spin spinning={loading}><SForm ... /></Spin>
    // ❌ <SForm loading={loading} ... />  // loading 不是合法 prop → TS 报错
    <Spin spinning={loading}>
      <Card title="@FILL:新增标题">
        <SForm
          form={form}
          items={formItems}
          columns={2}
          onFinish={handleSubmit}
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <SButton actionType="back" onClick={() => navigate(-1)} />
          <SButton
            actionType="save"
            style={{ marginLeft: 16 }}
            onClick={() => form.submit()}
            loading={loading}
          />
        </div>
      </Card>
    </Spin>
  );
};
```

---

## 填空模板：edit.tsx（独立页 — 编辑）

> 使用方法：复制到 `edit.tsx`，只修改 `@FILL` 标记内容。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm, SButton } from '@dalydb/sdesign';
import type { SFormItems } from '@dalydb/sdesign';
import { message, Card, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @FILL: 导入 API 函数
// ✅ import { getByIdByGet, updateByPut } from 'src/api/{module}';
// @FILL: 导入类型 — 必须用 import type
// ✅ import type { ProductFormData } from 'src/api/{module}/types';
// ❌ import { ProductFormData }（类型导入必须加 type 关键字）

export default () => {
  const [form] = SForm.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  // 编辑模式：加载详情回显
  const { loading: detailLoading } = useRequest(
    // @FILL: 替换为详情 API
    // ✅ () => getByIdByGet(id!)
    () => Promise.resolve({} as Record<string, unknown>),
    {
      ready: !!id,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  // 提交更新
  const { run: handleSubmit, loading } = useRequest(
    // @FILL: 替换为更新 API
    // ✅ (values: ProductFormData) => updateByPut(id!, values)
    (values: Record<string, unknown>) => Promise.resolve(values),
    {
      manual: true,
      onSuccess: () => {
        message.success('编辑成功');
        navigate(-1);
      },
    },
  );

  // ⚠️ 必须用显式类型注解: const formItems: SFormItems[] = [...]
  const formItems: SFormItems[] = [
    // @FILL: 编辑页表单项配置（通常与新增页相同）
    // ✅ { label: '名称', name: 'name', type: 'input', required: true }
    // ❌ { type: 'dependency' }  // 已弃用
  ];

  return (
    // ⚠️ SForm 不支持 loading prop，用 Spin 包裹
    <Spin spinning={detailLoading || loading}>
      <Card title="@FILL:编辑标题">
        <SForm
          form={form}
          items={formItems}
          columns={2}
          onFinish={handleSubmit}
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <SButton actionType="back" onClick={() => navigate(-1)} />
          <SButton
            actionType="save"
            style={{ marginLeft: 16 }}
            onClick={() => form.submit()}
            loading={loading}
          />
        </div>
      </Card>
    </Spin>
  );
};
```

---

## 填空模板：{Entity}FormModal.tsx（createModal 弹窗表单）

> 使用方法：复制到 `components/{Entity}FormModal.tsx`，只修改 `@FILL` 标记内容。
> 父组件通过 `ref.current.open({ mode: 'create' | 'edit', id? })` 打开。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm, createModal } from '@dalydb/sdesign';
import type { SFormItems, ModalChildProps } from '@dalydb/sdesign';
import { Modal, message } from 'antd';
import { useRequest } from 'ahooks';
// @FILL: 导入 API 函数
// ✅ import { createByPost, updateByPut, getByIdByGet } from 'src/api/{module}';
// @FILL: 导入类型 — 必须用 import type
// ✅ import type { ProductFormData } from 'src/api/{module}/types';

// @FILL: 替换泛型参数类型名
// ✅ type FormParams = { mode: 'create' | 'edit'; id?: string };
type FormParams = { mode: 'create' | 'edit'; id?: string };

const FormContent = ({
  params,
  onClose,
  onSuccess,
}: ModalChildProps<FormParams>) => {
  const [form] = SForm.useForm();
  const isEdit = params.mode === 'edit';

  // 编辑时加载详情
  useRequest(
    // @FILL: 替换为详情 API
    // ✅ () => getByIdByGet(params.id!)
    () => Promise.resolve({} as Record<string, unknown>),
    {
      ready: isEdit && !!params.id,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  // 提交（新增或编辑）
  const { run: handleSubmit, loading } = useRequest(
    // @FILL: 替换为新增/编辑 API
    // ✅ (values) => isEdit ? updateByPut(params.id!, values) : createByPost(values)
    (values: Record<string, unknown>) => Promise.resolve(values),
    {
      manual: true,
      onSuccess: () => {
        message.success(isEdit ? '编辑成功' : '创建成功');
        onSuccess?.();
      },
    },
  );

  // ⚠️ 必须用显式类型注解
  const formItems: SFormItems[] = [
    // @FILL: 表单项配置
    // ✅ { label: '名称', name: 'name', type: 'input', required: true }
    // ✅ { label: '状态', name: 'status', type: 'select', fieldProps: { dictKey: 'statusCode' } }
    // ❌ { label: '状态', name: 'status', type: 'select', fieldProps: { options: [...] } }  // 禁止硬编码 options
    // ❌ { type: 'dependency' }  // 已弃用，联动用 SForm.useWatch
  ];

  return (
    <Modal
      open
      title={isEdit ? '@FILL:编辑标题' : '@FILL:新增标题'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      {/* ⚠️ SForm 不支持 loading prop */}
      <SForm
        form={form}
        items={formItems}
        columns={1}
        onFinish={handleSubmit}
      />
    </Modal>
  );
};

// @FILL: 修改导出名称
// ✅ export default createModal<FormParams>(FormContent);
export default createModal<FormParams>(FormContent);
```

---

## 字段联动示例

```tsx
// SForm.useWatch + 条件展开 items（禁止 type: 'dependency'）
const typeValue = SForm.useWatch('type', form);

const formItems: SFormItems[] = [
  { label: '类型', name: 'type', type: 'select', fieldProps: { options: typeOptions } },
  // 条件展开：仅当 type === '1' 时显示
  ...(typeValue === '1'
    ? [{ label: '扩展字段', name: 'extra', type: 'input' as const }]
    : []),
];
```

## 布局

- `columns` 属性控制每行列数（常用 1 / 2 / 3）
- 宽字段用 `colProps: { span: 24 }`

> 完整 Props → `{project}/.ai/sdesign/components/SForm.md`
