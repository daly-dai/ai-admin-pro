# AI Frontend App (Lite)

> React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + Zustand + Rsbuild
>
> **你是前端开发专家，熟悉本项目技术栈。收到需求后先选工作模式，按步骤执行，以 `pnpm verify` 结尾。**

---

## ⛔ 阻断性必读（违反则代码无效，必须回滚重做）

| 触发条件              | 执行前必须读取                                            |
| --------------------- | --------------------------------------------------------- |
| 使用 Scaffold 路径    | `.ai/tools/scaffold/types.ts` + `temp/scaffold/user.json` |
| 代码涉及 SSearchTable | `.ai/sdesign/components/SSearchTable.md`                  |
| 代码涉及 SForm        | `.ai/sdesign/components/SForm.md`                         |
| 代码涉及 SButton      | `.ai/sdesign/components/SButton.md`                       |
| 代码涉及 SDetail      | `.ai/sdesign/components/SDetail.md`                       |
| 生成/修改页面代码     | `.ai/pitfalls/index.md`                                   |
| 写 API 层代码         | `.ai/conventions/api-conventions.md`                      |
| 新建模块目录结构      | `.ai/core/architecture.md`                                |

> **先读文档，再写代码。** 未读取对应文档就生成的代码视为无效。

---

## 0. 工作模式选择（收到需求后第一步）

| 需求类型                                 | 工作模式               | 跳转      |
| ---------------------------------------- | ---------------------- | --------- |
| 新建模块 / 新建页面 / 新增完整功能       | **Scaffold**           | → 第 1 节 |
| 给已有模块加表单 / 详情 / 列表           | **Scaffold（单场景）** | → 第 1 节 |
| 只需类型定义 / 只需 API 层               | **Scaffold（单场景）** | → 第 1 节 |
| 改字段 / 加列 / 改文案 / 修 bug / 小调整 | **修改路径**           | → 第 2 节 |
| 不确定                                   | 问用户                 | —         |

> **优先选 Scaffold**。只有改已有代码时才走修改路径。

---

## 1. Scaffold 路径（新建模块/页面）

### 场景选择

| 需求                      | scene    | 生成内容                                         |
| ------------------------- | -------- | ------------------------------------------------ |
| 完整 CRUD（新模块）       | `crud`   | types + api + list + form + detail（5-6 个文件） |
| 新增列表页                | `list`   | index.tsx (SSearchTable)                         |
| 新增弹框表单 / 独立表单页 | `form`   | FormModal 或 Create+Edit 页面                    |
| 新增详情抽屉 / 详情页     | `detail` | DetailDrawer 或 DetailPage                       |
| 只需类型定义              | `types`  | types.ts                                         |
| 只需 API 层               | `api`    | api/index.ts                                     |

### 步骤

1. ⛔ **读 JSON Schema**：读取 `.ai/tools/scaffold/types.ts` 了解配置结构
2. ⛔ **看真实示例**：读取 `temp/scaffold/user.json` 作为参考
3. **写配置**：生成 `temp/scaffold/{module}.json`（不确定的字段 → 停下问用户）
4. **执行生成**：`pnpm scaffold {module}`
5. **验证**：`pnpm verify`，出错 → `pnpm verify:fix`
6. **报告**：列出生成的文件清单

---

## 2. 修改路径（改已有代码）

### 步骤

1. **读目标文件**：读取用户指定的文件
2. **读类型文件**：涉及新字段 → 同时读 `src/api/{module}/types.ts`
3. ⛔ **读组件文档**：涉及 SSearchTable / SForm / SButton / SDetail → 读 `.ai/sdesign/components/{组件名}.md`
4. ⛔ **读错题集**：生成/修改页面代码前 → 读 `.ai/pitfalls/index.md`
5. **匹配模板**：从下方 T1-T8 找匹配项执行；无匹配 → 走降级路径（第 5 节）
6. **验证**：`pnpm verify`，出错查第 4 节；修一轮还失败 → 停止问用户

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

---

## 3. 硬约束

### 组件替换（必须遵守）

| 禁止直接使用      | 替换为                | 使用前必读                               |
| ----------------- | --------------------- | ---------------------------------------- |
| antd Table        | STable / SSearchTable | `.ai/sdesign/components/SSearchTable.md` |
| antd Form         | SForm / SForm.Search  | `.ai/sdesign/components/SForm.md`        |
| antd Button       | SButton               | `.ai/sdesign/components/SButton.md`      |
| antd Descriptions | SDetail               | `.ai/sdesign/components/SDetail.md`      |

> 可直接用（不受限制）：Modal / Modal.confirm / Tag / message / Card / Spin / InputNumber

### 禁止模式

| 禁止                                 | 正确做法                                                        |
| ------------------------------------ | --------------------------------------------------------------- |
| `any` 类型                           | `Record<string, unknown>` 或具体 Entity 类型                    |
| `import axios`                       | `import { createRequest } from '@/plugins/request'`             |
| `type: 'dependency'` (SForm)         | `SForm.useWatch(fieldName, form)` + 条件展开 items              |
| `SConfirm`                           | `Modal.confirm()`                                               |
| 父组件管理 Modal/Drawer 的 open 状态 | 子组件内管理 + useImperativeHandle 暴露 ref                     |
| 未使用参数不加前缀                   | `(_, record) => ...`                                            |
| API 方法名无 HTTP 后缀               | `getListByGet`、`createByPost`、`updateByPut`、`deleteByDelete` |
| 跨模块用 `../`                       | `@/` 路径别名                                                   |
| `import { X }` 导入纯类型            | `import type { X }`                                             |

---

## 4. 常见报错修复

`pnpm verify` 报错时对照修复。只修本次改动引入的错误，存量错误不管。

| 错误信息                                        | 修复方法                                           |
| ----------------------------------------------- | -------------------------------------------------- |
| `no-unused-vars: 'xxx'`                         | 加 `_` 前缀：`_xxx`                                |
| `Cannot find module '@/api/xxx'`                | 检查 `src/api/{module}/index.ts` 是否存在且 export |
| `Type 'any' is not assignable`                  | 替换为具体类型或 `Record<string, unknown>`         |
| `no-restricted-imports ... 'Table' from 'antd'` | 换为 `STable` from `@dalydb/sdesign`               |
| `no-restricted-imports ... 'Form' from 'antd'`  | 换为 `SForm` from `@dalydb/sdesign`                |
| Prettier / 格式报错                             | `pnpm verify:fix`                                  |
| 修一轮后仍有错误                                | **停止，问用户**                                   |

---

## 5. 降级路径

当 T1-T8 不匹配，且不适合 scaffold 时，读取**一个** compact 文件获取完整代码模式：

| 页面类型      | 读取                           |
| ------------- | ------------------------------ |
| 列表页 / CRUD | `.ai/compact/manual-crud.md`   |
| 表单页        | `.ai/compact/manual-form.md`   |
| 详情页        | `.ai/compact/manual-detail.md` |

> compact 文件自包含模板 + 组件 Props + 规则 + 验证清单。最多读一个，不追踪其中引用。

---

## 6. 硬停规则

遇到以下任一情况 → **停止，问用户确认**：

- Scaffold：JSON 配置中有不确定的字段值
- 修改路径：改动超过 20 行新代码
- 需要修改 3 个以上文件（types.ts 联动不计入）
- 需改 package.json / tsconfig / eslint / rsbuild 配置
- 不确定改哪个文件
- `pnpm verify` 修一轮还失败
