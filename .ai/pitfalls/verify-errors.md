# pnpm verify 常见错误速查

> AI 看到 verify 错误时，先查此表再动手。匹配签名 → 执行修复方法 → 重新 verify。

| 错误签名                                                                       | 分类       | 修复方法                                                                                                     |
| ------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `TS2307: Cannot find module 'src/api/{xxx}'`                                   | 缺文件     | 检查 src/api/{module}/index.ts 是否存在且有导出                                                              |
| `TS2322: Type 'any' is not assignable`                                         | 类型违规   | 改 Record<string, unknown> 或从 Entity 推导                                                                  |
| `TS2345: Argument of type 'string'...type 'Key'`                               | antd 类型  | dataIndex 加 `as const` 或用 `keyof Entity`                                                                  |
| `TS2339: Property 'xxx' does not exist on type`                                | 类型缺失   | 检查 types.ts 的 Entity 是否含该字段                                                                         |
| `TS7006: Parameter implicitly has 'any' type`                                  | 缺标注     | 给参数加类型: `(record: Entity) => ...`                                                                      |
| `TS2554: Expected N arguments, but got M`                                      | 参数数量   | 检查 API 方法签名是否与调用匹配                                                                              |
| `no-unused-vars: 'text' is defined`                                            | 命名       | 加 `_` 前缀: `(_text, record)`                                                                               |
| `no-restricted-imports: 'antd' import 'Table'`                                 | 组件违规   | 换 SSearchTable 或 STable                                                                                    |
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

| 报错涉及的关键词                                                                                      | 读取的组件文档                                                                             |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `SSearchTable` / `STable` / `columns` / `SColumnsType` / `paginationFields` / `requestFn`             | `.ai/sdesign/components/SSearchTable.md`                                                   |
| `SForm` / `formItems` / `SFormItems` / `SForm.Group` / `useWatch` / `GroupItemsType` / `FormItemType` | `.ai/sdesign/components/SForm.md`                                                          |
| `SDetail` / `SDetailItem` / `SDetail.Group` / `SDetailGroupProps`                                     | `.ai/sdesign/components/SDetail.md`                                                        |
| `SButton` / `actionType`                                                                              | `.ai/sdesign/components/SButton.md`                                                        |
| `createRequest` / API 方法签名 / `getListByGet` / `createByPost` 等                                   | `src/plugins/request/`（查源码）                                                           |
| `PageQuery` / `PageData` / 全局类型                                                                   | `src/types/index.ts`                                                                       |
| `createModal` / `createDrawer` / `ModalChildProps` / `DrawerChildProps`                               | `.ai/sdesign/components/SForm.md`（Modal）或 `.ai/sdesign/components/SDetail.md`（Drawer） |

> ⛔ **禁止跳过此表直接改代码**。先按关键词定位文件 → 读取 → 理解正确 API → 修复。

## 修复规则

- 优先级: tsc > eslint > prettier
- 每轮只修同一类错误
- 最多 3 轮，仍有错误 → 停止，报告给用户
