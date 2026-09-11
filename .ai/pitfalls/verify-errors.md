# pnpm verify 常见错误速查

> AI 看到 verify 错误时，先查此表再动手。匹配签名 → 执行修复方法 → 重新 verify。
>
> ⚠️ 表未匹配、准备去读 `.ai/sdesign/components/` 之前，**先读下面这节**。

---

## 🔴 组件文档可信度裁定（查组件文档前必读）

`.ai/sdesign/` 是 **`@dalydb/sdesign` 包内 `ai/` 的逐字节拷贝**（37 份，MD5 全等），由 `pnpm sync-ai-docs` 同步。**改它没有意义——下一次同步即被覆盖。** 它本身含以下已知失真，**读取时必须带这个裁定**：

### 1. 「首选组件」自相矛盾 → **以 `SProTable` 为准**

| 出处                                                                              | 说法                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `README.md:186,188`、`SProTable.md:1,9,16`                                        | **SProTable 新项目优先**；`SSearchTable → 历史项目兼容` |
| `README.md:197,218,257`、`SSearchTable.md:1,18`、`STable.md:12,15`、`SForm.md:27` | **SSearchTable 列表页首选**                             |

**同一个 `README.md` 里 10 行之内两种相反说法。**

**裁定依据**：`src/` 实测 `SProTable` **16 处 / 4 文件**，`SSearchTable` / `useSearchTable` **0 处**。技能侧 `references/` 同向（`SProTable` 19 处，`SSearchTable` 0 处）。

> **用 `SSearchTable` 就是与真实代码脱节。**

### 2. `headTitle` / `requestFn` / `formProps` 的来历 —— 这是高频报错的根源

`SSearchTable.md:18` 的示例用的是 **`headTitle` / `requestFn` / `formProps`** —— 那是 **SSearchTable 的 API**。
本项目用 **SProTable**，对应的是 **`title` / `request` / `searchProps`**（见 `.ai/templates/crud-page.md`）。

> 读了组件文档却用了 `headTitle`/`formProps` → TS2353/TS2322，**根因不是"记错了"，是读了另一个组件的文档**。

### 3. 已知无专属文档的组件（README 提到，但 `components/*.md` 不存在）

`SDynamicContainer` / `SNoPage` / `STextEllipsis` —— **包有导出**（`dist/index.d.ts:93,153,201`），但**没有 `components/{Name}.md`**。需要它们的 API 时**读 `node_modules/@dalydb/sdesign/dist/` 的类型声明**，不要去 `components/` 找。

### 4. `useProTable.md` 有两份且内容不同

`.ai/sdesign/components/useProTable.md`（2,480 字节）与 `.ai/sdesign/hooks/useProTable.md`（2,735 字节）**不是同一份**。引用前先确认读的是哪一份。

### 5. 只读单条以外也有 `ByGet`

`getAllDictByGet` / `getUserRolesByGet` / `getRolePermissionsByGet` 都是合法的 GET。详见 `.ai/conventions/api-conventions.md`。

---

| 错误签名                                                                       | 分类       | 修复方法                                                                                                     |
| ------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `TS2307: Cannot find module 'src/api/{xxx}'`                                   | 缺文件     | 检查 src/api/{module}/index.ts 是否存在且有导出                                                              |
| `TS2322: Type 'any' is not assignable`                                         | 类型违规   | 改 Record<string, unknown> 或从 Entity 推导                                                                  |
| `TS2345: Argument of type 'string'...type 'Key'`                               | antd 类型  | dataIndex 加 `as const` 或用 `keyof Entity`                                                                  |
| `TS2339: Property 'xxx' does not exist on type`                                | 类型缺失   | 检查 types.ts 的 Entity 是否含该字段                                                                         |
| `TS7006: Parameter implicitly has 'any' type`                                  | 缺标注     | 给参数加类型: `(record: Entity) => ...`                                                                      |
| `TS2554: Expected N arguments, but got M`                                      | 参数数量   | 检查 API 方法签名是否与调用匹配                                                                              |
| `no-unused-vars: 'text' is defined`                                            | 命名       | 加 `_` 前缀: `(_text, record)`                                                                               |
| `no-restricted-imports: 'antd' import 'Table'`                                 | 组件违规   | 换 SProTable 或 STable                                                                                       |
| `prettier: ...`                                                                | 格式       | `pnpm verify:fix` 自动修复                                                                                   |
| `TS2322: Type '"group"' is not assignable to type 'FormItemType'`              | 类型违规   | SForm 没有 `type: 'group'`。分组表单用 `<SForm.Group groupItems={[...]}>` 组件，不在 items 里加 type         |
| `TS2339: Property 'loading' does not exist on type ... 'SFormProps'`           | 属性不存在 | SForm / SForm.Group 均不支持 `loading`。需要 loading 效果用 `<Spin spinning={loading}>` 包裹                 |
| `TS7006: Parameter implicitly has 'any' type` (validator/callback)             | 缺标注     | 回调参数需显式类型: `(values: EntityFormData) => void`，validator 需 `(_: unknown, value: string)`           |
| `TS2353: Object literal may only specify known properties... 'groupItems'`     | 结构错误   | groupItems 类型为 `GroupItemsType[]`，每项含 `title?: ReactNode`、`items?: SFormItems[]`、`columns?: number` |
| `TS2322: Type 'string' is not assignable to type 'FormItemType'` (SFormItems)  | 类型宽化   | 显式注解: `const items: SFormItems[] = [...]`、`const groupItems: GroupItemsType[] = [...]`                  |
| `Cannot find name 'XXX'` (来自旧代码/猜测的常量)                               | 幽灵引用   | 先判断 XXX 在新组件中是否仍需要。大概率是旧模式残留 → 删除引用；不确定 → 问用户                              |
| `TS2339: Property 'loading' does not exist on type ... 'SDetailProps'`         | 属性不存在 | SDetail 不支持 `loading`。需要 loading 效果用 `<Spin spinning={loading}>` 包裹                               |
| `TS2339: Property 'groupItems' does not exist on type ... 'SDetailGroupProps'` | 属性不存在 | SDetail.Group 顶层 prop 是 `items`，不是 `groupItems`。`groupItems` 是分组内部嵌套子组的字段                 |

## 未匹配时的组件文档路由

> 表中未匹配到错误签名时，按报错涉及的关键词定位要读的文件：

| 报错涉及的关键词                                                                                      | 读取的组件文档                               |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `SProTable` / `STable` / `columns` / `SColumnsType` / `paginationFields` / `request`                  | `.ai/sdesign/components/SProTable.md`        |
| `SForm` / `formItems` / `SFormItems` / `SForm.Group` / `useWatch` / `GroupItemsType` / `FormItemType` | `.ai/sdesign/components/SForm.md`            |
| `SDetail` / `SDetailItem` / `SDetail.Group` / `SDetailGroupProps`                                     | `.ai/sdesign/components/SDetail.md`          |
| `SButton` / `actionType`                                                                              | `.ai/sdesign/components/SButton.md`          |
| `createRequest` / API 方法签名 / `getUserListByPost` / `createUserByPost` 等                          | `src/plugins/request/`（查源码）             |
| `PageQuery` / `PageResult` / 全局类型                                                                 | `src/types/index.ts`                         |
| `createModal` / `ModalChildProps`                                                                     | `.ai/sdesign/components/SModalContainer.md`  |
| `createDrawer` / `DrawerChildProps`                                                                   | `.ai/sdesign/components/SDrawerContainer.md` |

> ⛔ **禁止跳过此表直接改代码**。先按关键词定位文件 → 读取 → 理解正确 API → 修复。

## 修复规则

- 优先级: tsc > eslint > prettier
- 每轮只修同一类错误
- 最多 3 轮，仍有错误 → 停止，报告给用户
