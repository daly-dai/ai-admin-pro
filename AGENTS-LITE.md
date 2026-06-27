# AI Frontend App (Lite)

> React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + Zustand + Rsbuild
>
> **收到需求后先选工作模式，按步骤执行，以 `pnpm verify` 结尾。**

---

## 核心目标

1. **边界清晰** — 不变的给模板（填空），变化的给规约（约束怎么写才方便改和删），AI 在线内填空不越界
2. **活得久** — 生成的代码不只是能跑，是客户改需求时能改、能删，组件不互相拖累
3. **按需唤醒** — 小改（调样式、改字段、修文案）人手写更快；大改（新建图表、新模块、新组件）AI 生成骨架更快。不是越用越少，是按改动类型切换

> 所有规约、闸门、模板、修改路径、验证体系都是为这三条服务。加新东西前先问：它强化了哪一条？

---

## 0. 管道：收到需求后执行的完整流程

```
需求
  │
  ├─ 小修改（改字段/修bug/调样式，≤20行）
  │     → §1 修改路径（不经过 Lane，不走 skill）
  │
  ├─ 命中 Lane（匹配下表）→ 走对应流程
  │     ├─ CRUD / 大屏 / 多Tab详情 → skill: sdesign-gen-page
  │     │     执行完毕后 → 扫配方表 → 命中则执行配方 → pnpm verify
  │     └─ 非标 → 先扫配方表 → 命中则执行配方
  │            → 不命中 → PRD 兜底（读 `.ai/templates/prd/prd-fallback.md`）
  │
  └─ 不命中 Lane → 扫配方表 → 命中则执行
        → 不命中 → 非标 Lane（PRD 兜底）
```

### Lane 匹配表（不推理，纯关键词匹配）

| 用户意图                             | Lane      | 处理方式                            |
| ------------------------------------ | --------- | ----------------------------------- |
| 小修改（改字段/修bug/调样式，≤20行） | 修改路径  | → §1                                |
| 新建/新模块 + 列表/CRUD/增删改查     | CRUD      | skill: sdesign-gen-page（填空模板） |
| 新建 + 大屏/仪表盘/监控/统计         | 大屏      | skill: sdesign-gen-page（骨架模板） |
| 新建 + 详情（含多Tab）               | 多Tab详情 | skill: sdesign-gen-page（增量追加） |
| 无法匹配任何场景                     | 非标      | 扫配方 → PRD 兜底                   |

> Lane 详细流程（CRUD/大屏/多Tab/非标各自 SOP）→ 外部读 `.ai/conventions/lanes.md`
> 🛑 **Skill 会话状态**：同一会话中 Skill 只挂载一次。若已执行过 sdesign-gen-page，不要重新挂载或重读 Skill 文件，直接继续当前步骤。

### 配方匹配表（Lane 执行后 / 不命中 Lane 时必扫）

| 关键词                                       | 配方 | 说明 |
| -------------------------------------------- | ---- | ---- |
| （暂无配方，遇到横切场景并验证有效后再沉淀） |      |      |

> 配方是 Lane 和非标 Lane 之间的缓冲层——命中就执行，不命中才走非标 Lane 重流程。

### Task 拆解

复杂需求（涉及多个页面/模块，或需求描述超过一句话）→ 先读 `.ai/conventions/task-splitting.md`，按规则拆成 Task 清单，再逐 Task 推进。简单需求（单页面/单模块）跳过此步。

### 🛑 防循环规则（每次行动前自检，违反任一条即停止）

| #   | 规则                                                                                            | 违反后果               |
| --- | ----------------------------------------------------------------------------------------------- | ---------------------- |
| R1  | **不重读刚写的文件**：如果你在最近 3 轮内写入/编辑了文件 X，你已拥有 X 的完整内容，禁止再读取 X | 浪费轮次，车轱辘话反复 |
| R2  | **不重读已读过的文件**：如果你在最近 5 轮内读取过文件 Y，禁止再读取 Y                           | 同上                   |
| R3  | **同一文件最多编辑 3 次**：如果文件 Z 已被编辑 3 次仍有错误，**停止，报告用户**，不要继续改     | 越改越错，死循环       |
| R4  | **生成完成后直接验证**：文件写入完成后，直接 `pnpm verify`，不要重新读取刚写入的文件"检查一遍"  | 自欺欺人式检查浪费轮次 |
| R5  | **3 轮无进展即停止**：如果连续 3 轮都在修同一类错误且数量不减少，**强制停止**，报告状态         | 陷入局部修复循环       |

> ⛔ **R1-R5 优先级最高**。即使 Skill 步骤要求读取文件，也必须先对照此表——如果文件刚被读过/写过，跳过读取步骤。

### 🔒 输出锁（只允许写这些文件，其余禁止修改）

| 工作模式         | 输出锁范围                                                       |
| ---------------- | ---------------------------------------------------------------- |
| sdesign-gen-page | 由 Skill 内部定义（`src/api/{module}/` + `src/pages/{module}/`） |
| 修改路径         | 仅用户指定的目标文件 + 其关联的 `src/api/{module}/types.ts`      |
| 模板参考         | `src/api/{module}/` + `src/pages/{module}/`                      |

> ⛔ **`pnpm verify` 报错时：只修输出锁范围内文件的错误。范围外的报错 → 跳过，不修，不提。**

---

## 1. 修改路径（改已有代码）

### 步骤

1. **读目标文件**：读取用户指定的文件
2. **读类型文件**：涉及新字段 → 同时读 `src/api/{module}/types.ts`
3. ⛔ **读组件文档**：涉及 SProTable / SForm / SButton / SDetail → 读 `.ai/sdesign/components/{组件名}.md`
4. ⛔ **读错题集**：生成/修改页面代码前 → 读 `.ai/pitfalls/index.md`
5. **匹配模板**：从下方 T1-T8 找匹配项执行；无匹配 → 查 `.ai/templates/` 有无类似模板仿造；仍无 → 问用户
6. **验证**：`pnpm verify`（错误自动记录到 `.ai/error-log/raw.jsonl`），出错查第 3 节；修一轮还失败 → 停止问用户

### T1-T8 快速模板

| 模板 | 场景        | 目标文件                              | 定位点                                |
| ---- | ----------- | ------------------------------------- | ------------------------------------- |
| T1   | 加表格列    | `pages/{module}/index.tsx`            | `columns` 数组，操作列之前            |
| T2   | 加搜索字段  | `pages/{module}/index.tsx`            | `searchItems` / `items` 数组          |
| T3   | 加表单字段  | `components/{Entity}FormModal.tsx`    | `formItems` / `items` 数组            |
| T4   | 加详情字段  | `components/{Entity}DetailDrawer.tsx` | `items` 数组                          |
| T5   | 加 API 方法 | `api/{module}/index.ts`               | 最后一个 `export const` 之后          |
| T6   | 加类型字段  | `api/{module}/types.ts`               | Entity / Query / FormData 的 `}` 之前 |
| T7   | 改文案      | 用户指定文件                          | 查找旧文本替换                        |
| T8   | 加删除确认  | 含删除按钮的页面                      | 删除操作的 onClick                    |

**执行方式**：读目标文件 → 观察已有代码风格 → **按同样风格插入新内容**。

- T1-T4 如有新字段 → 同时执行 T6
- T5 如有新类型 → 同时执行 T6
- T6 根据用途判断加到哪个接口：查询 → Query，表单 → FormData，展示 → Entity
- 如需了解控件类型/Props → 读对应的 `.ai/sdesign/components/{组件名}.md`
- **T1-T4 涉及枚举字段** → 不写 valueEnum/render/options，通过 `dictKey` 显式指定字典编码（详见 §2 字典使用）

---

## 2. 硬约束

### 组件替换（必须遵守）

| 禁止直接使用      | 替换为               | 使用前必读                            |
| ----------------- | -------------------- | ------------------------------------- |
| antd Table        | STable / SProTable   | `.ai/sdesign/components/SProTable.md` |
| antd Form         | SForm / SForm.Search | `.ai/sdesign/components/SForm.md`     |
| antd Button       | SButton              | `.ai/sdesign/components/SButton.md`   |
| antd Descriptions | SDetail              | `.ai/sdesign/components/SDetail.md`   |

> 可直接用（不受限制）：Modal / Modal.confirm / Tag / message / Card / Spin / InputNumber

### 禁止模式

| 禁止                                    | 正确做法                                                                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `any` 类型                              | `Record<string, unknown>` 或具体 Entity 类型                                                                                  |
| `import axios`                          | `import { createRequest } from 'src/plugins/request'`                                                                         |
| `type: 'dependency'` (SForm)            | `SForm.useWatch(fieldName, form)` + 条件展开 items                                                                            |
| `SConfirm`                              | `Modal.confirm()`                                                                                                             |
| 父组件管理 Modal/Drawer 的 open 状态    | 使用 `createModal` / `createDrawer`（`@dalydb/sdesign`）工厂函数                                                              |
| 未使用参数不加前缀                      | `(_, record) => ...`                                                                                                          |
| API 方法名无 HTTP 后缀                  | `getListByGet`、`createByPost`、`updateByPut`、`deleteByDelete`                                                               |
| 跨模块用 `../`                          | `src/` 路径别名                                                                                                               |
| `import { X }` 导入纯类型               | `import type { X }`                                                                                                           |
| 硬编码枚举/options                      | 字典从 `useDictStore.dictMapData` 获取，sdesign 组件通过 SConfigProvider 自动消费。枚举列/下拉通过 `dictKey` 指定字典编码     |
| `columns` 缺类型注解                    | `columns` 必须显式类型注解 `SColumnsType<Entity>`                                                                             |
| `paginationFields` 的 key 写 `pageNum`  | 改为 `current`。`PaginationFields` 只有四个 key：`current`/`pageSize`/`total`/`list`（P007）                                  |
| SForm 写了 `type: 'group'`              | 分组表单用 `<SForm.Group groupItems={[...]}>` 组件包裹，不在 items 数组里写 `type: 'group'`（P010）                           |
| SForm / SDetail 写了 `loading` 属性     | 不支持 loading prop，用 `<Spin spinning={loading}>` 包裹（P011/P014）                                                         |
| SDetail.Group 顶层写 `groupItems`       | 顶层 prop 是 `items` 不是 `groupItems`：`<SDetail.Group items={[{ groupTitle, items }]}>`（P014）                             |
| 表格操作列按钮无包裹                    | 用 `<SButton.Group items={[...]}>` 或 `<Space>` 包裹，`compact` 属性（t-link 样式）。禁止无包裹裸放（P018）                   |
| 回调参数用单字母（`s`/`d`/`v`/`t`/`e`） | 禁止单字母变量名，用完整语义：`(state)` 非 `(s)`，`(date)` 非 `(d)`，`(event)` 非 `(e)`（P016）                               |
| Zustand `set()` 内写 for/if/filter/map  | 数据处理必须在 set 外纯函数完成，set 内只做 `draft.x = result` 赋值（P017）                                                   |
| 旧代码的常量在新页面中不存在就"修复"    | 新组件可能已内置旧常量（分页/loading/配置等）。`Cannot find name` 报错 → 先判断新组件是否需要，不需要则删引用，不确定则问用户 |
| 外部模块/工具函数实现未知时猜测代码     | PRD 未提供实现细节 → 用 `// TODO: 补充 {功能描述}` 占位，保证代码能通过 verify。禁止凭空猜测实现                              |

### 字典使用

> 字典已通过 SConfigProvider 全局注入，sdesign 组件通过 `dictKey` 属性消费。**不需要自己在组件里发请求或写死映射。**

**SProTable 枚举列** — 显式设置 `dictKey` 指定字典编码：

```tsx
{ title: '状态', dataIndex: 'statusCode', dictKey: 'statusCode' }
// → SProTable 通过 dictKey 从 SConfigProvider 全局字典查值回显
// ⚠️ dataIndex 需与 dict code 同名，SConfigProvider 自动匹配回显
```

**SForm / SForm.Search 下拉框** — 通过 `fieldProps.dictKey` 指定字典编码：

```tsx
{ name: 'status', label: '状态', type: 'select', fieldProps: { dictKey: 'statusCode' } }
// → SSelect 通过 dictKey 从 globalDict['statusCode'] 取 options
```

**手动取值**（非 sdesign 场景）：

```tsx
const dictMapData = useDictStore((state) => state.dictMapData);
// 展示值：dictMapData?.['statusCode']?.[record.status] ?? '-'
// 取全部：dictMapData?.['statusCode'] → { '1': '启用', '0': '禁用' }
```

---

## 3. 常见报错修复

`pnpm verify` 报错时按以下流程修复。**⛔ 只修输出锁范围内文件的错误，范围外报错一律跳过不修。**

> ⛔ **修复流程（每一步不可跳过）：**
>
> 1. **查表匹配**：在此表逐条匹配错误签名，匹配到 → 执行对应修复方法
> 2. **未匹配 → 查路由表**：读 `.ai/pitfalls/verify-errors.md` 底部「未匹配时的组件文档路由」表，按报错关键词定位要读的文件 → 读取 → 按文档正确 API 修复
> 3. **禁止行为**：不看表不读文档直接改代码、同一错误反复试不同写法超过 2 次

| 错误信息                                              | 修复方法                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `no-unused-vars: 'xxx'`                               | 加 `_` 前缀：`_xxx`                                                                                              |
| `Cannot find module 'src/api/xxx'`                    | 检查 `src/api/{module}/index.ts` 是否存在且 export                                                               |
| `Type 'any' is not assignable`                        | 替换为具体类型或 `Record<string, unknown>`                                                                       |
| `no-restricted-imports ... 'Table' from 'antd'`       | 换为 `STable` from `@dalydb/sdesign`                                                                             |
| `no-restricted-imports ... 'Form' from 'antd'`        | 换为 `SForm` from `@dalydb/sdesign`                                                                              |
| Prettier / 格式报错                                   | `pnpm verify:fix`                                                                                                |
| `'headTitle' does not exist in type`                  | SProTable 用 `title` 不是 `headTitle`。改为 `title={{ children: '标题' }}`                                       |
| `'formProps' does not exist in type`                  | SProTable 用 `searchProps` 不是 `formProps`。改为 `searchProps={{ items, columns }}`                             |
| `'requestFn' does not exist in type`                  | SProTable 用 `request={{ service: apiFn, options }}` 不是 `requestFn`                                            |
| `Type 'string' is not assignable to type...`          | `columns` 加显式类型注解 `SColumnsType<Entity>`；或 `searchItems` 去掉多余的 `: SFormItems[]` 类型注解（P006）   |
| `'pageNum' does not exist in type 'PaginationFields'` | 改为 `current`。`PaginationFields` 只有 `current`/`pageSize`/`total`/`list` 四个 key                             |
| `Cannot find name 'XXX'`                              | 检查 XXX 是否来自旧代码的常量/变量。若是且新组件已内置该功能 → 删除引用；不确定 → 问用户，不要盲目加回来         |
| 修一轮后仍有错误                                      | **停止，问用户**。连续 2 轮 verify 错误数量不减少或累计 ≥5 轮 → 强制停止，报告：已修复清单 + 剩余错误 + 根因判断 |

---

## 4. 硬停规则

遇到以下任一情况 → **停止，问用户确认**：

- 修改路径：改动超过 20 行新代码
- 需要修改 3 个以上文件（types.ts 联动不计入）
- 需改 package.json / tsconfig / eslint / rsbuild 配置
- 不确定改哪个文件
- `pnpm verify` 累计执行 ≥5 轮（无论每轮是否有进展）→ **强制停止**，向用户报告：① 已修复的错误清单 ② 当前剩余错误清单 ③ 根因判断（缺类型定义？组件 API 用法不对？缺文件？）
- `pnpm verify` 连续 2 轮错误数量不减少 → **停止**，报告当前状态
