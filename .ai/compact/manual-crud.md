# CRUD 列表页一站式指令（自动生成 2026-04-10，勿手动编辑）

> 页面类型: CRUD 列表页
> 源文件: AGENTS.md§II, templates/crud-page.md, sdesign/components/, pitfalls, verification

## 1. 输出锁 + 文件清单

🔒 `src/api/{module}/` + `src/pages/{module}/` + `specs/{feature}/`

文件: types.ts, api/index.ts, index.tsx, components/{Entity}FormModal.tsx (+ DetailDrawer)

## 2. 代码模板

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

```
input | inputNumber | password | textarea | select | slider |
radio | radioGroup | switch | treeSelect | upload |
datePicker | SDatePicker | datePickerRange | SDatePickerRange |
timePicker | timePickerRange | checkbox | checkGroup |
cascader | SCascader | table
```

> ⛔ `dependency` 已弃用，字段联动统一使用 `SForm.useWatch` + 动态 items（详见 `form-page.md`）。

## 确认弹窗

> 删除、批量操作等危险操作使用 antd `Modal.confirm` 进行二次确认。

```tsx
import { Modal } from 'antd';

// 删除确认
const handleDelete = (id: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '删除后不可恢复，确认删除？',
    onOk: () => runDelete(id),
  });
};

## STable 列配置

- `dictKey`: 字典映射 key
- `render`: 支持 `'datetime'` | `'date'` | `'ellipsis'` 快捷类型

```

## 3. 组件 API 速查

**SSearchTable — SForm.Search + STable 一体化，列表页首选**

- headTitle?: STitleProps — 页面顶部标题配置
- tableTitle?: STitleProps — 表格区域标题配置
- requestFn: (data?: any) => Promise<any> — 数据请求函数 接收搜索参数 + 分页参数，返回包含列表数据和总数的对象。 默认字段映射: `{ dataList, totalSize, pageNum, pageSize }`， 可通过 options.paginationFields 自定义。
- options?: Omit<useSearchTableOptions, 'form'> — useSearchTable 的配置选项
- tableProps?: STableProps<any> — 表格 props，会合并到 useSearchTable 返回的 tableProps 中
- formProps?: SearchProps — 搜索表单 props，透传给 SForm.Search

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

| 编号 | 适用场景              | 核心规则（直接执行）                                                                                                                                                          | 详情 |
| ---- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| P001 | 列表页 + Modal/Drawer | **禁止在列表页管理弹层 open 状态**。必须创建容器组件（如 `{Entity}FormModal`），内部管理 open/mode/editId，通过 `useImperativeHandle` 暴露 `open()` 方法，列表页通过 ref 调用 |
| P003 | 所有页面              | **回调函数未使用的参数加 `_` 前缀**。如 `render: (_, record) => ...`、`render: (_text, _record, index) => ...`。禁止用 `void`、`eslint-disable` 绕过                          |
| P005 | 含确认弹窗的页面      | **禁止 SConfirm 组件**。确认弹窗统一使用 antd `Modal.confirm({ title, content, onOk })`，命令式调用                                                                           |

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
