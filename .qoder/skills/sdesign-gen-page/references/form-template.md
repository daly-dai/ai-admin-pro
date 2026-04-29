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

## 20 种控件类型（+ 3 个已废弃别名）

```
input | inputNumber | password | textarea | select | slider |
radio | radioGroup | switch | treeSelect | upload |
datePicker | datePickerRange |
timePicker | timePickerRange | checkbox | checkGroup |
cascader | table | dependency

已废弃别名（仍可用，建议迁移为 camelCase）:
SDatePicker → datePicker | SDatePickerRange → datePickerRange | SCascader → cascader
```

> dependency 已弃用，字段联动统一使用 `SForm.useWatch` + 动态 items。

## 决策点

- **统一表单页**（首选）：新增和编辑差异小时使用，通过 `?id=xxx` 区分模式，`isEdit = !!id`
  - 新增：调用 `createByPost`
  - 编辑：`getByIdByGet` 加载回显 + `updateByPut` 提交
- **拆分表单页**（仅差异大时）：新增和编辑字段、布局、区块明显不同时，**向用户确认后**拆分为 `create.tsx` + `edit.tsx`
- **分组表单**：`SForm.Group` + `groupItems`
- **字段联动**：`SForm.useWatch(fieldName, form)` + 条件展开 items

## 交互模式

| 模式       | 适用场景                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| **Modal**  | 字段 <= 8，无复杂联动 → 创建 `{Entity}FormModal` 子组件（已内置 mode 切换）                                    |
| **独立页** | 字段 > 8，含复杂控件 → 默认单个 `form.tsx` 通过 `?id` 参数区分；差异大时确认后拆分为 `create.tsx` + `edit.tsx` |

> 弹层封装原则 → 详见 crud-template.md「弹层封装原则」

---

## 填空模板（主路径）

> **默认使用填空模板**。模板注释已内嵌组件 API 约束和常见反例，无需额外读组件文档。仅 `pnpm verify` 报错且 `.ai/pitfalls/verify-errors.md` 未匹配签名时，才按需读对应组件文档。

### 使用方法

1. **复制下方"填空模板"** 到目标 `.tsx` 文件中。
2. **对 AI 发出指令**：
   > "请根据以下需求，**只修改**代码中所有 `@FILL` 标记的内容，**严禁修改任何其他已存在的代码**。需求：新增页面标题为'创建商品'，编辑页面标题为'编辑商品'，API 新增函数名 `createGoodsByPost`，编辑函数名 `updateGoodsByPut`，详情函数名 `getGoodsByIdByGet`，表单字段包括商品名称(name)、价格(price)、库存(stock)、描述(description)。"
3. `pnpm verify` 报错时 → 先查 .ai/pitfalls/verify-errors.md 匹配签名 → 未匹配才读组件文档。

### 填空模板 — 独立表单页（统一新增/编辑，首选）

> 适用"独立页"模式（字段 > 8 或含复杂控件）。**新增和编辑差异小时使用**，通过 URL 参数 `?id=xxx` 区分模式。差异大（字段、布局、区块明显不同）→ 向用户确认后用下方拆分模板。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm, SButton } from '@dalydb/sdesign';
import type { SFormItems } from '@dalydb/sdesign';
import { message, Card, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @FILL: 导入 API 函数
// ✅ import { createByPost, updateByPut, getByIdByGet } from 'src/api/{module}';
// @FILL: 导入类型 — 必须用 import type
// ✅ import type { ProductFormData } from 'src/api/{module}/types';
// ❌ import { ProductFormData }（类型导入必须加 type 关键字）

export default () => {
  const [form] = SForm.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const isEdit = !!id;

  // 编辑模式：加载详情回显
  const { loading: detailLoading } = useRequest(
    // @FILL: 替换为详情 API
    // ✅ () => getByIdByGet(id!)
    () => Promise.resolve({} as Record<string, unknown>),
    {
      ready: isEdit,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  // 提交（新增或编辑）
  const { run: handleSubmit, loading } = useRequest(
    // @FILL: 替换为新增/编辑 API
    // ✅ (values: ProductFormData) => isEdit ? updateByPut({ ...values, id: id! }) : createByPost(values)
    (values: Record<string, unknown>) => Promise.resolve(values),
    {
      manual: true,
      onSuccess: () => {
        message.success(isEdit ? '编辑成功' : '创建成功');
        navigate(-1);
      },
    },
  );

  // ⚠️ 必须用显式类型注解
  // ✅ const formItems: SFormItems[] = [...]
  const formItems: SFormItems[] = [
    // @FILL: 表单项配置（新增和编辑共用同一套 items）
    // ✅ { label: '名称', name: 'name', type: 'input', required: true }
    // ✅ { label: '状态', name: 'status', type: 'select', fieldProps: { dictKey: 'statusCode' } }
    // ❌ { label: '状态', name: 'status', type: 'select', fieldProps: { options: [...] } }  // 禁止硬编码 options
    // ❌ { type: 'dependency' }  // 已弃用，联动用 SForm.useWatch + 条件展开 items
    // 可选 type: input | inputNumber | select | datePicker | textarea | radio | switch | textarea | upload | checkbox | cascader | datePickerRange 等
    // 校验: required: true | { required: true, message: '不能为空' } | regKey: 'phone' | 'email'
  ];

  return (
    // ⚠️ SForm 不支持 loading prop，用 Spin 包裹
    // ✅ <Spin spinning={loading}><SForm ... /></Spin>
    // ❌ <SForm loading={loading} ... />  // loading 不是合法 prop → TS 报错
    <Spin spinning={detailLoading || loading}>
      <Card title={isEdit ? '@FILL:编辑标题' : '@FILL:新增标题'}>
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

> 差异大需拆分时 → 读取 `references/form-split-template.md`

### 填空模板 — {Entity}FormModal.tsx（createModal 弹窗表单）

> 适用"Modal"模式（字段 <= 8，无复杂联动）。父组件通过 `ref.current.open(params)` 打开。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm } from '@dalydb/sdesign';
import type { SFormItems } from '@dalydb/sdesign';
import { Modal, message } from 'antd';
import { useRequest } from 'ahooks';
import { createModal } from '@dalydb/sdesign';
import type { ModalChildProps } from '@dalydb/sdesign';
// @FILL: 导入 API 函数
// ✅ import { createByPost, updateByPut, getByIdByGet } from 'src/api/{module}';
// @FILL: 导入类型 — 必须用 import type
// ✅ import type { ProductFormData } from 'src/api/{module}/types';
// ❌ import { ProductFormData }（类型导入必须加 type 关键字）

// @FILL: 定义泛型参数类型
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

  // 提交
  const { run: handleSubmit, loading } = useRequest(
    // @FILL: 替换为新增/编辑 API
    // ✅ (values: ProductFormData) => isEdit ? updateByPut({ ...values, id: params.id! }) : createByPost(values)
    (values: Record<string, unknown>) => Promise.resolve(values),
    {
      manual: true,
      onSuccess: () => {
        message.success(isEdit ? '编辑成功' : '创建成功');
        onSuccess();
      },
    },
  );

  // ⚠️ 必须用显式类型注解
  // ✅ const formItems: SFormItems[] = [...]
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
// ✅ export default createModal<ProductFormParams>(FormContent);
export default createModal<FormParams>(FormContent);
```
