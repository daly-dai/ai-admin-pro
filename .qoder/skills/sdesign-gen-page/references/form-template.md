# 独立表单页代码模板

> 来源：manual-form.md §2 + §6，排除了已在 SKILL.md 中覆盖的硬约束/组件速查/验证清单

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

## 21 种控件类型

```
input | inputNumber | password | textarea | select | slider |
radio | radioGroup | switch | treeSelect | upload |
datePicker | SDatePicker | datePickerRange | SDatePickerRange |
timePicker | timePickerRange | checkbox | checkGroup |
cascader | SCascader | table
```

> dependency 已弃用，字段联动统一使用 `SForm.useWatch` + 动态 items。

## 决策点

- **新增页**：调用 `createByPost`
- **编辑页**：`getByIdByGet` 加载 + `updateByPut` 提交
- **分组表单**：`SForm.Group` + `groupItems`
- **字段联动**：`SForm.useWatch(fieldName, form)` + 条件展开 items

## 交互模式

| 模式       | 适用场景                                                |
| ---------- | ------------------------------------------------------- |
| **Modal**  | 字段 <= 8，无复杂联动 → 创建 `{Entity}FormModal` 子组件 |
| **独立页** | 字段 > 8，含复杂控件 → `create.tsx` / `edit.tsx`        |

> 弹层封装原则 → 详见 crud-template.md「弹层封装原则」

## 快速示例

```tsx
// 基础表单
<SForm items={formItems} columns={2} onFinish={save} />

// 分组表单
<SForm.Group groupItems={[
  { title: '基本信息', items: [...] },
  { title: '工作信息', items: [...] },
]} />

// 字段联动（useWatch + 动态 items）
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

---

## 填空模板（兜底方案）

> **适用场景**：多次生成偏离预期、弱模型不稳定、或希望快速产出可运行骨架时使用。
> **原理**：将"理解规范 → 组装代码"降级为"识别 `@FILL` → 文本替换"，让模型只做填空题。

### 使用方法

1. **复制下方"填空模板"** 到目标 `.tsx` 文件中。
2. **对 AI 发出指令**：
   > "请根据以下需求，**只修改**代码中所有 `@FILL` 标记的内容，**严禁修改任何其他已存在的代码**。需求：新增页面标题为'创建商品'，编辑页面标题为'编辑商品'，API 新增函数名 `createGoodsByPost`，编辑函数名 `updateGoodsByPut`，详情函数名 `getGoodsByIdByGet`，表单字段包括商品名称(name)、价格(price)、库存(stock)、描述(description)。"

### 填空模板 — create.tsx

> 适用"独立页"模式（字段 > 8 或含复杂控件）。字段 <= 8 优先用下方 Modal 模板。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm, SButton } from '@dalydb/sdesign';
import type { SFormItems } from '@dalydb/sdesign';
import { message, Card } from 'antd';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
// @FILL: 导入 API 函数，例如 import { createByPost } from 'src/api/{module}';
// @FILL: 导入类型，例如 import type { XxxFormData } from 'src/api/{module}/types';

export default () => {
  const [form] = SForm.useForm();
  const navigate = useNavigate();

  // 提交
  const { run: handleSubmit, loading } = useRequest(
    // @FILL: 替换为新增 API，例如 (values: XxxFormData) => createByPost(values)
    (values: Record<string, unknown>) => Promise.resolve(values),
    {
      manual: true,
      onSuccess: () => {
        message.success('创建成功');
        navigate(-1);
      },
    },
  );

  const formItems: SFormItems[] = [
    // @FILL: 表单项配置
    // 示例: { label: '名称', name: 'name', type: 'input', required: true },
    // 可选 type: input | inputNumber | select | datePicker | textarea | radio | switch 等 21 种
  ];

  return (
    <Card title="@FILL:页面标题">
      <SForm
        form={form}
        items={formItems}
        columns={2}
        onFinish={handleSubmit}
        loading={loading}
      />
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <SButton actionType="back" onClick={() => navigate(-1)} />
        <SButton
          actionType="submit"
          style={{ marginLeft: 16 }}
          onClick={() => form.submit()}
          loading={loading}
        />
      </div>
    </Card>
  );
};
```

### 填空模板 — edit.tsx

> 适用"独立页"模式。字段 <= 8 优先用下方 Modal 模板。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm, SButton } from '@dalydb/sdesign';
import type { SFormItems } from '@dalydb/sdesign';
import { message, Card, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @FILL: 导入 API 函数，例如 import { getByIdByGet, updateByPut } from 'src/api/{module}';
// @FILL: 导入类型，例如 import type { XxxFormData } from 'src/api/{module}/types';

export default () => {
  const [form] = SForm.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  // 加载详情
  const { loading: detailLoading } = useRequest(
    // @FILL: 替换为详情 API，例如 () => getByIdByGet(id!)
    () => Promise.resolve({} as Record<string, unknown>),
    {
      ready: !!id,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  // 提交
  const { run: handleSubmit, loading } = useRequest(
    // @FILL: 替换为更新 API，例如 (values: XxxFormData) => updateByPut({ ...values, id: id! })
    (values: Record<string, unknown>) => Promise.resolve(values),
    {
      manual: true,
      onSuccess: () => {
        message.success('编辑成功');
        navigate(-1);
      },
    },
  );

  const formItems: SFormItems[] = [
    // @FILL: 表单项配置（与 create.tsx 保持一致）
    // 示例: { label: '名称', name: 'name', type: 'input', required: true },
  ];

  return (
    <Spin spinning={detailLoading}>
      <Card title="@FILL:页面标题">
        <SForm
          form={form}
          items={formItems}
          columns={2}
          onFinish={handleSubmit}
          loading={loading}
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <SButton actionType="back" onClick={() => navigate(-1)} />
          <SButton
            actionType="submit"
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

### 填空模板 — {Entity}FormModal.tsx（createModal 弹窗表单）

> 适用"Modal"模式（字段 <= 8，无复杂联动）。父组件通过 `ref.current.open(params)` 打开。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm } from '@dalydb/sdesign';
import type { SFormItems } from '@dalydb/sdesign';
import { Modal, message } from 'antd';
import { useRequest } from 'ahooks';
import { createModal } from 'src/components/ModalContainer';
import type { ModalChildProps } from 'src/components/ModalContainer';
// @FILL: 导入 API 函数，例如 import { createByPost, updateByPut, getByIdByGet } from 'src/api/{module}';
// @FILL: 导入类型，例如 import type { XxxFormData } from 'src/api/{module}/types';

// @FILL: 定义泛型参数类型，例如 type FormParams = { mode: 'create' | 'edit'; id?: string };
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
    // @FILL: 替换为详情 API，例如 () => getByIdByGet(params.id!)
    () => Promise.resolve({} as Record<string, unknown>),
    {
      ready: isEdit && !!params.id,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  // 提交
  const { run: handleSubmit, loading } = useRequest(
    // @FILL: 替换为新增/编辑 API，例如:
    // (values: XxxFormData) => isEdit ? updateByPut({ ...values, id: params.id! }) : createByPost(values)
    (values: Record<string, unknown>) => Promise.resolve(values),
    {
      manual: true,
      onSuccess: () => {
        message.success(isEdit ? '编辑成功' : '创建成功');
        onSuccess();
      },
    },
  );

  const formItems: SFormItems[] = [
    // @FILL: 表单项配置
    // 示例: { label: '名称', name: 'name', type: 'input', required: true },
  ];

  return (
    <Modal
      open
      title={isEdit ? '@FILL:编辑标题' : '@FILL:新增标题'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <SForm
        form={form}
        items={formItems}
        columns={1}
        onFinish={handleSubmit}
      />
    </Modal>
  );
};

// @FILL: 修改导出名称，例如 export default createModal<FormParams>(FormContent);
export default createModal<FormParams>(FormContent);
```
