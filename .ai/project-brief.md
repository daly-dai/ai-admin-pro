# 项目认知速览

> 所有 AI 模型的认知底座。读完本文件即可回到 `AGENTS.md` 进入 Lane 分发。
> 浓缩自 tech-stack / architecture / coding-standards / api-conventions / **principles**，这些文件仅在需要详细模板或完整代码示例时才读取。
>
> ⚠️ **所有架构、流程、规约决策必须对照 AGENTS.md § 核心原则（⑨ > ① > ③ > ② > ④ > ⑦ > ⑧ > ⑤ > ⑥）**

## 1. 项目身份

| 层   | 技术                                                         |
| ---- | ------------------------------------------------------------ |
| 框架 | React 18 + TypeScript 5（严格模式）                          |
| UI   | @dalydb/sdesign + Ant Design 5                               |
| 构建 | Rsbuild                                                      |
| 状态 | Zustand + immer                                              |
| HTTP | Axios（封装在 `src/plugins/request`，禁止直接 import axios） |
| 辅助 | ahooks + dayjs + lodash-es + lucide-react                    |

禁用：Redux / Formik / react-table / ky / 原生 fetch

## 2. 项目结构（AI 写入目标）

| 路径                             | 用途                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `src/api/{module}/types.ts`      | 模块类型：Entity + EntityQuery extends PageQuery + EntityFormData              |
| `src/api/{module}/index.ts`      | 模块 API：{module}Api 对象，5 个标准方法                                       |
| `src/pages/{module}/index.tsx`   | 页面组件                                                                       |
| `src/pages/{module}/components/` | 页面私有组件（Modal/Drawer 封装）                                              |
| `src/types/index.ts`             | 全局类型：PageData\<T> / PageQuery（拦截器已解包，request.get\<T> 直接返回 T） |
| `src/plugins/request/`           | HTTP 封装（禁止直接修改）                                                      |

完整目录树 → `.ai/core/architecture.md`

## 3. 组件体系

> 组件替换规则 + 阻断性要求 → `AGENTS.md` §三

## 4. 代码规约

| 规约         | 规则                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| HTTP 请求    | `import { createRequest } from 'src/plugins/request'`                            |
| 类型安全     | 禁止 any，保底 `Record<string, unknown>`，优先实体推导                           |
| 类型导入     | 纯类型用 `import type { X }`，重导出用 `export type { X }`                       |
| 路径别名     | 跨模块用 `src/` 别名，禁止 `../`                                                 |
| API 命名     | `{动作}By{HTTP}`：getListByGet / createByPost / updateByPut / deleteByDelete     |
| 未使用参数   | 加 `_` 前缀：`(_, record) => ...`                                                |
| 全局类型     | PageData\<T>(分页响应) / PageQuery(分页基类)，拦截器自动解包 ApiResponse         |
| 状态管理     | `create` from zustand + persist + immer                                          |
| Modal/Drawer | 用 `createModal`/`createDrawer` 工厂函数（@dalydb/sdesign），禁止父组件管理 open |
| 验证         | `pnpm verify`（tsc + eslint + prettier）                                         |

## 5. API 层模式

```
实例: const {module}Api = createRequest()  // 可传 config 配置多后端
方法: getListByGet(params?) / getByIdByGet(id) / createByPost(data) / updateByPut(id, data) / deleteByDelete(id)
类型: {Entity} + {Entity}Query extends PageQuery + {Entity}FormData
```

useRequest 模式：列表 → SProTable request.service 直传 | 写操作 → `manual: true` + `onSuccess` | 详情 → `ready: !!id`

完整规范 → `.ai/conventions/api-conventions.md`

## 6. 关键陷阱

| 编号 | 规则                                                           |
| ---- | -------------------------------------------------------------- |
| P001 | 弹层 → `createModal`/`createDrawer`，禁止父组件管 open 状态    |
| P002 | 可编辑表格 → `EditableProTable`，非 SForm type:'table'         |
| P003 | 未用参数 → 加 `_` 前缀，禁止 void / eslint-disable             |
| P004 | 字段联动 → `SForm.useWatch` + 条件展开，禁止 type:'dependency' |
| P005 | 确认弹窗 → `Modal.confirm`，禁止 SConfirm                      |
| P006 | searchItems 禁止类型注解，columns 必须注解                     |
| P007 | 分页配置 `paginationFields` 用 `current`，非 `pageNum`         |
| P008 | 枚举列/下拉 → 禁止硬编码，用 `dictKey` 指定字典                |

完整 17 条 → `.ai/pitfalls/index.md`

## 7. Lane 速览

| Lane / 机制 | 触发词                           | 关键规则                                                                         |
| ----------- | -------------------------------- | -------------------------------------------------------------------------------- |
| CRUD        | 列表/CRUD/增删改查/管理          | 模板填空，不生成 PRD。后端MD→types+api→columns。修改走 T1-T8                     |
| 大屏        | 大屏/仪表盘/监控/统计            | 骨架模板 + AI生成option + 规约约束。EChartsBase 基座。修改走 D1-D6               |
| 多Tab详情   | 详情（含多Tab）                  | 初始同CRUD + 增量规则（加Tab不改已有Tab）                                        |
| 非标        | 无匹配场景                       | prd-fallback.md 兜底 → PRD → Task拆解                                            |
| 配方        | 权限控制 / 前端存储 / 非标布局 … | Lane 执行后或 Lane 不命中时扫匹配表，命中则执行 → `.ai/core/routing-strategy.md` |

## 8. 深入导航

| 需要                  | 读取                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------- |
| 执行管道              | `AGENTS.md` §一§二                                                                        |
| 修改路径              | `AGENTS.md` §五                                                                           |
| Task闸门 + 输出锁     | `conventions/task-gates.md`                                                               |
| 大屏规约              | `conventions/dashboard-conventions.md`                                                    |
| 非标 PRD→Task         | `AGENTS.md` §二.4                                                                         |
| Swagger→API 合并      | `conventions/api-conventions.md`                                                          |
| 迭代修改详细规则      | `AGENTS.md` §五                                                                           |
| 代码模板              | `templates/{crud-page,form-page,detail-page,dashboard-page,api-module,editable-table}.md` |
| 组件详细 API          | `sdesign/components/{Name}.md`                                                            |
| PRD 模板（标准/兜底） | `templates/prd/prd-standard.md` / `prd-fallback.md`                                       |
| 验证三级体系          | `conventions/verification.md`                                                             |
| 错题集                | `pitfalls/index.md`                                                                       |
| 字典使用              | `conventions/dict-conventions.md`                                                         |
| 项目完整目录树        | `core/architecture.md`                                                                    |
| 路由策略与配方        | `core/routing-strategy.md`                                                                |
| 配方格式骨架          | `templates/recipe.md`                                                                     |
| 配方闸门              | `conventions/recipe-conventions.md`                                                       |
