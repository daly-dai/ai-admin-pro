# 详情页一站式指令（自动生成 2026-04-10，勿手动编辑）

> 页面类型: 详情页
> 源文件: AGENTS.md§II, templates/detail-page.md, sdesign/components/, pitfalls, verification

## 1. 输出锁 + 文件清单

🔒 `src/api/{module}/` + `src/pages/{module}/detail.tsx`

文件: types.ts, api/index.ts, detail.tsx

## 2. 代码模板

## 核心组件

- **SDetail**：配置式详情展示（items 数组）
- **SDetail.Group**：分组详情
- **SButton.Group**：操作按钮（actionType: edit/delete/back）

## SDetailItem 类型

| type 值       | 用途                             |
| ------------- | -------------------------------- |
| `'text'`      | 默认文本                         |
| `'dict'`      | 字典映射（配合 dictKey/dictMap） |
| `'file'`      | 文件列表                         |
| `'img'`       | 图片展示                         |
| `'rangeTime'` | 时间范围                         |
| `'checkbox'`  | 复选展示                         |

| 关键属性  | 说明                                      |
| --------- | ----------------------------------------- |
| `label`   | 字段标签                                  |
| `name`    | 字段名                                    |
| `dictKey` | 字典 key（需配合 SConfigProvider）        |
| `dictMap` | 直接提供字典 `{ value: label }`           |
| `render`  | 自定义渲染 `(value, record) => ReactNode` |

## 交互模式

- **独立页面**：字段多、需要独立路由
- **Drawer**：在列表页快速预览，创建 `{Entity}DetailDrawer` 容器组件，封装 open/close 状态

> 弹层封装原则同 Modal → 详见 `crud-page.md`「弹层封装原则」

## 快速示例

```tsx
// 基础用法
<SDetail title="详情" dataSource={data} items={items} column={2} />

// 分组展示
<SDetail.Group groupItems={[
  { groupTitle: '基本信息', items: [...] },
  { groupTitle: '金额信息', items: [...] },
]} />

// 数据加载
const { data: detail, loading } = useRequest(() => getByIdByGet(id!), { ready: !!id });
<SDetail dataSource={detail} items={items} loading={loading} />
```

## 3. 组件 API 速查

**SDetail — 详情展示，支持 8 种渲染类型（text/dict/file/img 等）**

- desc?: ReactNode — 描述文字
- dataSource?: Record<string, any> — 数据源对象
- items?: SDetailItem[] — 详情项配置数组
- title?: string | ReactNode — 标题

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

| 编号 | 适用场景 | 核心规则（直接执行）                                                                                                                                 | 详情 |
| ---- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| P003 | 所有页面 | **回调函数未使用的参数加 `_` 前缀**。如 `render: (_, record) => ...`、`render: (_text, _record, index) => ...`。禁止用 `void`、`eslint-disable` 绕过 |

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
