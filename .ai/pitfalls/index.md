# 错题集

> AI 生成代码时的负面参照。**读完本节即可执行**，详情按需查阅。
> 只收录**非 tsc / 非 eslint 可判**的陷阱——能自动判的交给 `pnpm verify`，不占上下文。
> 用法：按场景匹配当前页面类型，**只读相关行**；🚫 行已由工具拦截，不必细读。

> 🚫 **已移出 4 条**（工具可自动拦截；编号不重排）：`P003` → tsc `TS6133` + eslint `no-unused-vars`（详情 [unused-params-in-render](./unused-params-in-render.md)）｜ `P011`/`P014` → tsc `TS2339`｜ `P016` → eslint `id-length`。这四条的靶错误在 `raw.jsonl` 里合计 **79 次命中**——写了也拦不住。

## 规则

- **P001｜列表页 + 弹层** — 禁止在列表页管理弹层 `open` 状态；用 `createModal` / `createDrawer` 工厂函数
- **P002｜可编辑表格** — STable / SForm `type:'table'` 不支持行内编辑；用 `EditableProTable` 经 `customCom` 嵌入
- **P004｜确认弹窗** — 用 antd `Modal.confirm`，禁用 `SConfirm`
- **P005｜字段联动** — 用 `SForm.useWatch` + 条件展开 items，禁用 `type:'dependency'`
- **P006｜列/表单项类型注解** — `columns` 与 `searchItems` **都**显式注解（`SColumnsType<Entity>` / `SFormItems[]`）；禁止用 `as const` 绕开。**例外**：条件展开 `...(cond ? [{…}] : [])` 内的项注解不生效，仍需 `as const`
- **P007｜SProTable 分页** — `paginationFields` 的 key 是 `current`，不是 `pageNum`；仅 `current`/`pageSize`/`total`/`list`
- **P008｜枚举列 / 下拉** — 禁止硬编码 options 或 `{1:'启用'}`；走 `dictKey` + `useDictStore.dictMapData`
- **P009｜组件迁移** — 报 `Cannot find name` 且该名来自旧代码 → 先判断新组件是否已内置；不需要就删，禁止自动补
- **P010｜分组表单** — 用 `<SForm.Group groupItems={[...]}>`，不是 `type:'group'`；`groupItems` 注解 `GroupItemsType[]`
- **P012｜新建页面** — 先列目标目录已有文件；已有相似文件则复用 / 修改，不新建重叠文件
- **P013｜新增 vs 编辑** — 默认共用一个表单页（`?id=` 或 `mode`）；差异大时先向用户确认再拆
- **P015｜外部实现未知** — 用 `// TODO: 补充 {描述}` 占位，禁止凭空猜测实现
- **P017｜Zustand `set`** — `set` 回调内禁止 for / if / filter / map；数据处理放外部纯函数
- **P018｜表格操作列** — 用 `SButton.Group items={[{ actionType, compact: true, onClick }]}`；禁止手动排列多个 `SButton`，也禁止无包裹
- **P019｜布局** — 优先 antd `<Flex>`，细粒度再 CSS Modules；禁止 `position:absolute; inset:*` 撑满
- **P020｜非标 UI** — 非标页（工作台 / 组合详情 / 大屏）生成前先加载 `frontend-design` skill
- **P021｜API 命名** — `{Entity}{动作}By{HTTP}` 必须带实体前缀；后端统一 POST（仅只读走 `ByGet`），禁止 `ByPut`/`ByDelete`，分页用 `PageResult<T>`
- **P022｜字典回显** — 列 / 表单项必须显式给 `dictKey`，不靠 `dataIndex`/`name` 同名自动解析
- **P023｜SDetail 列宽** — 用 `columns={2}`；`column`（无 s）已废弃

## 相关

- 报错查表 → [verify-errors.md](./verify-errors.md)（含**组件文档可信度裁定**）
- API 命名 → [api-conventions.md](../conventions/api-conventions.md)｜ 字典 → [dict-conventions.md](../conventions/dict-conventions.md)
