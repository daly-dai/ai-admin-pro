# 独立表单页一站式指令（自动生成 2026-04-10，勿手动编辑）

> 页面类型: 独立表单页
> 源文件: AGENTS.md§II, templates/form-page.md, sdesign/components/, pitfalls, verification

## 1. 输出锁 + 文件清单

🔒 `src/api/{module}/` + `src/pages/{module}/create.tsx` + `edit.tsx`

文件: types.ts, api/index.ts, create.tsx, edit.tsx

## 2. 代码模板

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

> ⛔ `dependency` 已弃用，字段联动统一使用 `SForm.useWatch` + 动态 items。

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

> 弹层封装原则 → 详见 `crud-page.md`「弹层封装原则」

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

## 3. 组件 API 速查

**SForm — 配置化表单，items 数组声明 22 种控件、联动、分组、搜索**

- items?: Array<SFormItems<FormItemType>> — 表单项配置数组，核心属性
- columns?: number — 列数，表单项自动等分排列
- required?: string | boolean — 全局必填设置 - true: 所有项必填 - string: 所有项必填且使用该提示
- onFinish?: (e?: any) => void — 表单提交回调
- readonly?: boolean — 只读模式

**SButton — 增强按钮，支持 actionType 预设操作类型和按钮组**

- actionType?: SButtonActionType — 预设操作类型，自动设置文字和样式
- compact?: boolean — 紧凑模式，样式与 t-link 相同

## 4. 核心规则（AGENTS.md 硬约束摘要）

> **新代码**严格遵守硬约束。**修改已有代码**以已有风格为准，新增片段沿用同文件风格。

> ⛔ 生成 SSearchTable/SForm/SButton/SDetail 代码前，**必须读取** `.ai/sdesign/components/{组件名}.md`。

| 禁止直接使用      | 必须替换为            | Why                         |
| ----------------- | --------------------- | --------------------------- |
| antd Table        | STable / SSearchTable | 内置分页/搜索/loading 联动  |
| antd Form         | SForm / SForm.Search  | 配置式，减 50% 样板代码     |
| antd Button       | SButton               | actionType 预设统一操作交互 |
| antd Descriptions | SDetail               | 配置式分组，dataSource 驱动 |

> 可直接用: Modal / Modal.confirm / Tag / message / Card / Spin / InputNumber

| 规则       | 正确写法                                              | Why                            |
| ---------- | ----------------------------------------------------- | ------------------------------ |
| HTTP 请求  | `import { createRequest } from 'src/plugins/request'` | 统一拦截/鉴权/错误处理         |
| 类型安全   | `Record<string, unknown>`                             | any 绕过类型检查，隐患累积     |
| 类型导入   | `import type { User } from './types'`                 | 树摇优化，运行时零残留         |
| 路径别名   | `import { X } from 'src/components/X'`                | 重构安全，路径不因移动断裂     |
| 状态管理   | `import { create } from 'zustand'`                    | 轻量零 boilerplate，immer 友好 |
| API 命名   | `getListByGet()` / `createByPost()`                   | 一眼识别 HTTP 方法             |
| 未使用参数 | `(_, record) => ...`                                  | ESLint no-unused-vars          |

> 保底类型: `Record<string, unknown>`，优先推导 `Partial<Entity>`。

**全局类型**（`src/types/index.ts`，禁止重复定义）

- `PageData<T>` — 分页响应 | `PageQuery` — 分页查询基类
- 模块 types.ts 只定义：`{Entity}` + `{Entity}Query extends PageQuery` + `{Entity}FormData`

`pnpm verify`（tsc+eslint+prettier） | `pnpm verify:fix`（自动修复）

## 5. 验证清单

### 错题集

| 编号 | 适用场景             | 核心规则（直接执行）                                                                                                                                                                          | 详情 |
| ---- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| P002 | 含可编辑表格的表单页 | **SForm `type: 'table'` 和 STable 不支持行内编辑**。可编辑表格场景使用 `EditableProTable`（来自 `@ant-design/pro-components`），可通过 SForm 的 `customCom` 嵌入或直接用 antd Form 组合       |
| P003 | 所有页面             | **回调函数未使用的参数加 `_` 前缀**。如 `render: (_, record) => ...`、`render: (_text, _record, index) => ...`。禁止用 `void`、`eslint-disable` 绕过                                          |
| P004 | 含字段联动的表单页   | **禁止 `type: 'dependency'`**。字段联动统一使用 `SForm.useWatch(fieldName, form)` 获取响应式值，然后在 items 数组中用 `...(value === 'x' ? [item] : [])` 条件展开。禁止 `depNames` / `render` |

### AI 自检

- [ ] 业务页面使用 sdesign 组件（SSearchTable/SForm/SButton/SDetail），未使用不存在的 sdesign 组件
- [ ] 无 any 类型，未直接 import axios，类型导入用 `import type`
- [ ] API 方法名带 HTTP 后缀（getListByGet/createByPost 等）
- [ ] SForm 字段联动用 `SForm.useWatch` + 动态 items 条件展开（禁止 `type: 'dependency'`）
- [ ] 确认弹窗用 antd `Modal.confirm`（禁止 SConfirm）
- [ ] Modal/Drawer 使用 `createModal`/`createDrawer` 工厂函数（`src/components/ModalContainer`、`src/components/DrawerContainer`），禁止手动管理 open 状态
- [ ] 所有 API 调用通过 useRequest 包装（SSearchTable.requestFn 除外）
- [ ] 写操作 useRequest 配置了 onSuccess（提示 + 刷新/跳转）
- [ ] types.ts 类型完整（Entity + EntityQuery + EntityFormData）

---

> `pnpm verify` 通过后完成。详细信息 → 读取对应源文件。

## 6. 安全模式：填空式生成（兜底方案）

> **适用场景**：多次生成偏离预期、弱模型不稳定、或希望快速产出可运行骨架时使用。
> **原理**：将"理解规范 → 组装代码"降级为"识别 `@FILL` → 文本替换"，让模型只做填空题。

### 使用方法

1. **复制下方"填空模板"** 到目标 `.tsx` 文件中（替换原有内容）。
2. **对 AI 发出指令**（建议选中整个文件后输入）：
   > "请根据以下需求，**只修改**代码中所有 `@FILL` 标记的内容，**严禁修改任何其他已存在的代码**。需求：新增页面标题为'创建商品'，编辑页面标题为'编辑商品'，API 新增函数名 `createGoodsByPost`，编辑函数名 `updateGoodsByPut`，详情函数名 `getGoodsByIdByGet`，表单字段包括商品名称(name)、价格(price)、库存(stock)、描述(description)。"

### 填空模板 — create.tsx

> 适用"独立页"模式（字段 > 8 或含复杂控件）。字段 ≤ 8 优先用下方 Modal 模板。

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

> 适用"独立页"模式。字段 ≤ 8 优先用下方 Modal 模板。

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

> 适用"Modal"模式（字段 ≤ 8，无复杂联动）。父组件通过 `ref.current.open(params)` 打开。

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm } from '@dalydb/sdesign';
import type { SFormItems } from '@dalydb/sdesign';
import { Modal, message } from 'antd';
import { useRequest } from 'ahooks';
import { createModal } from '@/components/ModalContainer';
import type { ModalChildProps } from '@/components/ModalContainer';
// @FILL: 导入 API 函数，例如 import { createByPost, updateByPut, getByIdByGet } from '@/api/{module}';
// @FILL: 导入类型，例如 import type { XxxFormData } from '@/api/{module}/types';

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
