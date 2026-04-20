# AI Frontend App (Lite)

> React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + Zustand + Rsbuild
>
> **你是前端开发专家，熟悉本项目技术栈。收到需求后先选工作模式，按步骤执行，以 `pnpm verify` 结尾。**

---

## 0. 工作模式选择（收到需求后第一步）

| 需求类型                                 | 工作模式             | 处理方式                                                 |
| ---------------------------------------- | -------------------- | -------------------------------------------------------- |
| 新建模块 / 新建页面 / 新增完整功能       | **sdesign-gen-page** | 由全局注册的 `sdesign-gen-page` Skill 处理，此处不再重复 |
| 给已有模块加表单 / 详情 / 列表           | **sdesign-gen-page** | 同上                                                     |
| 只需类型定义 / 只需 API 层               | **sdesign-gen-page** | 同上                                                     |
| 改字段 / 加列 / 改文案 / 修 bug / 小调整 | **修改路径**         | → 第 1 节                                                |
| 不确定                                   | 问用户               | —                                                        |

> Scaffold（`pnpm scaffold {module}`）是 JSON 配置驱动的代码生成脚本，适合开发者手动使用，AI 不主动使用。

---

## 1. 修改路径（改已有代码）

### 步骤

1. **读目标文件**：读取用户指定的文件
2. **读类型文件**：涉及新字段 → 同时读 `src/api/{module}/types.ts`
3. ⛔ **读组件文档**：涉及 SSearchTable / SForm / SButton / SDetail → 读 `.ai/sdesign/components/{组件名}.md`
4. ⛔ **读错题集**：生成/修改页面代码前 → 读 `.ai/pitfalls/index.md`
5. **匹配模板**：从下方 T1-T8 找匹配项执行；无匹配 → 读对应 compact 文件参考代码模式
6. **验证**：`pnpm verify`，出错查第 3 节；修一轮还失败 → 停止问用户

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

## 2. 硬约束

### 组件替换（必须遵守）

| 禁止直接使用      | 替换为                | 使用前必读                               |
| ----------------- | --------------------- | ---------------------------------------- |
| antd Table        | STable / SSearchTable | `.ai/sdesign/components/SSearchTable.md` |
| antd Form         | SForm / SForm.Search  | `.ai/sdesign/components/SForm.md`        |
| antd Button       | SButton               | `.ai/sdesign/components/SButton.md`      |
| antd Descriptions | SDetail               | `.ai/sdesign/components/SDetail.md`      |

> 可直接用（不受限制）：Modal / Modal.confirm / Tag / message / Card / Spin / InputNumber

### 禁止模式

| 禁止                                 | 正确做法                                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `any` 类型                           | `Record<string, unknown>` 或具体 Entity 类型                                                                      |
| `import axios`                       | `import { createRequest } from 'src/plugins/request'`                                                             |
| `type: 'dependency'` (SForm)         | `SForm.useWatch(fieldName, form)` + 条件展开 items                                                                |
| `SConfirm`                           | `Modal.confirm()`                                                                                                 |
| 父组件管理 Modal/Drawer 的 open 状态 | 使用 `createModal`（`src/components/ModalContainer`）/ `createDrawer`（`src/components/DrawerContainer`）工厂函数 |
| 未使用参数不加前缀                   | `(_, record) => ...`                                                                                              |
| API 方法名无 HTTP 后缀               | `getListByGet`、`createByPost`、`updateByPut`、`deleteByDelete`                                                   |
| 跨模块用 `../`                       | `src/` 路径别名                                                                                                   |
| `import { X }` 导入纯类型            | `import type { X }`                                                                                               |

---

## 3. 常见报错修复

`pnpm verify` 报错时对照修复。只修本次改动引入的错误，存量错误不管。

| 错误信息                                        | 修复方法                                           |
| ----------------------------------------------- | -------------------------------------------------- |
| `no-unused-vars: 'xxx'`                         | 加 `_` 前缀：`_xxx`                                |
| `Cannot find module 'src/api/xxx'`              | 检查 `src/api/{module}/index.ts` 是否存在且 export |
| `Type 'any' is not assignable`                  | 替换为具体类型或 `Record<string, unknown>`         |
| `no-restricted-imports ... 'Table' from 'antd'` | 换为 `STable` from `@dalydb/sdesign`               |
| `no-restricted-imports ... 'Form' from 'antd'`  | 换为 `SForm` from `@dalydb/sdesign`                |
| Prettier / 格式报错                             | `pnpm verify:fix`                                  |
| 修一轮后仍有错误                                | **停止，问用户**                                   |

---

## 4. 硬停规则

遇到以下任一情况 → **停止，问用户确认**：

- 修改路径：改动超过 20 行新代码
- 需要修改 3 个以上文件（types.ts 联动不计入）
- 需改 package.json / tsconfig / eslint / rsbuild 配置
- 不确定改哪个文件
- `pnpm verify` 修一轮还失败
