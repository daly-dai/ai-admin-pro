# 项目认知速览

> 所有 AI 模型的认知底座。读完本文件即可回到 `AGENTS.md` 进入阶段判断。
> 浓缩自 tech-stack / architecture / coding-standards / api-conventions，这些文件仅在需要详细模板或完整代码示例时才读取。

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

| 禁止直接使用      | 必须替换为            | 使用前必读                               |
| ----------------- | --------------------- | ---------------------------------------- |
| antd Table        | STable / SSearchTable | `.ai/sdesign/components/SSearchTable.md` |
| antd Form         | SForm / SForm.Search  | `.ai/sdesign/components/SForm.md`        |
| antd Button       | SButton               | `.ai/sdesign/components/SButton.md`      |
| antd Descriptions | SDetail               | `.ai/sdesign/components/SDetail.md`      |

**阻断性要求**：生成含上述 4 个组件的代码前，必须先读取对应组件文档。
可直接用（无需替换）：Modal / Modal.confirm / Tag / message / Card / Spin / InputNumber

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

useRequest 模式：列表 → SSearchTable.requestFn 直传 | 写操作 → `manual: true` + `onSuccess` | 详情 → `ready: !!id`

完整规范 → `.ai/conventions/api-conventions.md`

## 6. 关键陷阱

| 编号 | 规则                                                                                 |
| ---- | ------------------------------------------------------------------------------------ |
| P001 | 弹层 → `createModal`/`createDrawer`，禁止父组件管 open 状态                          |
| P002 | 可编辑表格 → `EditableProTable`（@ant-design/pro-components），非 SForm type:'table' |
| P003 | 未用参数 → 加 `_` 前缀，禁止 void / eslint-disable 绕过                              |
| P004 | 字段联动 → `SForm.useWatch` + 条件展开 items，禁止 type:'dependency'                 |
| P005 | 确认弹窗 → `Modal.confirm`，禁止 SConfirm                                            |
| P006 | 列类型 → `const columns: SColumn[] = [...]`，禁止 as const                           |

详情和正反例 → `.ai/pitfalls/index.md`

## 7. 阶段速览

| 阶段       | 触发词              | 读取                   |
| ---------- | ------------------- | ---------------------- |
| ① 画 Demo  | PRD/需求 + 画页面   | `modes/demo.md`        |
| ② 接口合并 | Swagger/接口文档    | `modes/api-merge.md`   |
| ③ 改造适配 | feature-spec + 改造 | `modes/demo-refine.md` |
| ④ 接口对接 | 联调/替换 mock      | `modes/api-connect.md` |
| ⑤ 迭代修复 | 改/加字段/修 bug    | `modes/incremental.md` |

## 8. 深入导航

| 需要             | 读取                                                            |
| ---------------- | --------------------------------------------------------------- |
| 阶段流程和输出锁 | `AGENTS.md` 阶段表 或 `modes/{mode}.md`                         |
| 代码模板         | `templates/{crud-page,form-page,detail-page,editable-table}.md` |
| 组件详细 API     | `sdesign/components/{Name}.md`                                  |
| 验证三级体系     | `conventions/verification.md`                                   |
| 纠错沉淀         | `conventions/correction-workflow.md`                            |
| 项目完整目录树   | `core/architecture.md`                                          |
