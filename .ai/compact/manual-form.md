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

| 规则       | 正确写法                                            | Why                            |
| ---------- | --------------------------------------------------- | ------------------------------ |
| HTTP 请求  | `import { createRequest } from '@/plugins/request'` | 统一拦截/鉴权/错误处理         |
| 类型安全   | `Record<string, unknown>`                           | any 绕过类型检查，隐患累积     |
| 类型导入   | `import type { User } from './types'`               | 树摇优化，运行时零残留         |
| 路径别名   | `import { X } from '@/components/X'`                | 重构安全，路径不因移动断裂     |
| 状态管理   | `import { create } from 'zustand'`                  | 轻量零 boilerplate，immer 友好 |
| API 命名   | `getListByGet()` / `createByPost()`                 | 一眼识别 HTTP 方法             |
| 未使用参数 | `(_, record) => ...`                                | ESLint no-unused-vars          |

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
- [ ] Modal 用条件渲染 `{open && <Modal/>}`，封装在子组件内
- [ ] 所有 API 调用通过 useRequest 包装（SSearchTable.requestFn 除外）
- [ ] 写操作 useRequest 配置了 onSuccess（提示 + 刷新/跳转）
- [ ] types.ts 类型完整（Entity + EntityQuery + EntityFormData）

---

> `pnpm verify` 通过后完成。详细信息 → 读取对应源文件。
