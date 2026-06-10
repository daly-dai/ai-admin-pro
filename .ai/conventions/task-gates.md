# Task 闸门与输出锁

> 每个 Task 执行时必须同时遵守两层闸门：全局闸门（所有Task通用）+ Task闸门（按Task类型确定）。
> 输出锁定义本 Task 允许操作的文件范围。超出范围 → 向用户确认。范围外报错 → 忽略。

---

## 一、全局闸门（所有 Task 必须遵守）

### 1.1 全局输出锁（禁止修改的路径）

以下文件/目录**任何 Task 都不允许修改**，除非用户明确要求：

| 禁止路径                     | 例外条件           |
| ---------------------------- | ------------------ |
| `package.json`               | 用户明确要求       |
| `tsconfig.json`              | 用户明确要求       |
| `eslint.config.mjs`          | 用户明确要求       |
| `rsbuild.config.ts`          | 用户明确要求       |
| `src/plugins/`               | 用户明确要求       |
| `src/router/`                | 用户明确要求       |
| `.ai/` 下规范文件            | 用户明确要求       |
| 非本 Task 输出锁内的任何文件 | 向用户确认后才能改 |

### 1.2 全局验收闸门（写代码时必须全部通过）

| #   | 规则                                                                                                                  | 检查方式            |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------------------- |
| G1  | 零 `any` 类型（保底 `Record<string, unknown>`）                                                                       | eslint              |
| G2  | 零 `import axios`（使用 `createRequest`）                                                                             | eslint              |
| G3  | 纯类型导入用 `import type { X }`                                                                                      | eslint              |
| G4  | 跨模块导入用 `src/` 别名，禁止 `../`                                                                                  | review              |
| G5  | API 方法名带 HTTP 后缀（`getListByGet` / `createByPost` 等）                                                          | review              |
| G6  | 未使用参数加 `_` 前缀                                                                                                 | eslint              |
| G7  | 无 SConfirm（用 `Modal.confirm`）                                                                                     | review              |
| G8  | 弹层用 `createModal` / `createDrawer` 工厂函数                                                                        | review              |
| G9  | SForm / SDetail 无 `loading` prop（用 `<Spin>` 包裹）                                                                 | review              |
| G10 | 枚举列/下拉不硬编码 options（通过 `dictKey` 指定字典编码）                                                            | review              |
| G11 | `pnpm verify` 通过（0 error，warning 可忽略）                                                                         | tsc+eslint+prettier |
| G12 | Task 验收后必须更新状态 + 回答复盘三问（Q1: verify 报错记录 Q2: 根因分类 Q3: 是否沉淀错题集），禁止连续执行后批量补填 | review              |
| G13 | 圈复杂度 ≤ 10                                                                                                         | eslint `complexity` |
| G14 | 嵌套深度 ≤ 3 层                                                                                                       | eslint `max-depth`  |
| G15 | 函数参数 ≤ 3 个（超过用对象参数）                                                                                     | eslint `max-params` |

### 1.3 验证边界（❗关键）

```
pnpm verify 报错时：
  ✅ 本 Task 输出锁内的文件 → 必须修复
  ❌ 本 Task 输出锁外的文件 → 跳过，不修，不提
  ❌ 已有代码的存量错误 → 跳过，不修，仅在报告中列出
```

> 禁止"顺手"修输出锁外的报错。禁止重构输出锁外的代码。这是防止强模型粉饰太平的核心约束。

### 1.4 越界确认

如需修改输出锁外的文件：

```
1. 暂停当前 Task
2. 告知用户：要改什么文件 + 为什么必须改
3. 等用户确认
4. 用户拒绝 → 用 // TODO 占位或寻找输出锁内的替代方案
```

---

## 二、Task 闸门（按 Task 类型确定）

> 每个 Task 生成时，从下表取对应类型的输出锁模板 + 验收闸门，填入 spec.md 的 Task 条目。

### api — API 模块

**输出锁**:

- `src/api/{module}/types.ts` (新建/修改)
- `src/api/{module}/index.ts` (新建/修改)

**验收闸门**:

- [ ] Entity 类型定义完整，字段与后端SDD一致
- [ ] EntityQuery extends PageQuery，查询参数完整
- [ ] EntityFormData 类型定义（新增/编辑表单字段）
- [ ] 枚举类型单独定义（如有）
- [ ] API 对象使用 `createRequest()` 创建
- [ ] 5 个标准方法齐全（按需：getListByGet / getByIdByGet / createByPost / updateByPut / deleteByDelete）
- [ ] 非标准方法名也带 HTTP 后缀
- [ ] 方法签名类型正确（泛型返回值 + params/data 参数）
- [ ] 全局闸门 G1-G12 全部通过
- [ ] `pnpm verify` 0 error（仅本Task输出锁内文件）

### page-list — CRUD 列表页

**输出锁**:

- `src/pages/{module}/index.tsx` (新建/修改)

**验收闸门**:

- [ ] 使用 SProTable（非 antd Table）
- [ ] columns 显式类型注解：`const columns: SColumnsType<Entity> = [...]`
- [ ] searchItems 禁止类型注解（让 TS point-wise 推断 fieldProps 精确类型，见 P006）
- [ ] 枚举列通过 `dictKey` 指定字典编码，不硬编码 options/render
- [ ] 分页配置 `paginationFields` 用 `current`（非 `pageNum`）
- [ ] 操作列使用 SButton（actionType 预设）
- [ ] 新增/编辑弹层使用 createModal 工厂函数
- [ ] 删除确认使用 Modal.confirm
- [ ] API 请求通过 SProTable request.service 或 useRequest
- [ ] 写操作 useRequest 配置了 onSuccess（提示 + 刷新）
- [ ] 全局闸门 G1-G12 全部通过
- [ ] `pnpm verify` 0 error（仅本Task输出锁内文件）

### page-form — 新增/编辑表单页

**输出锁**:

- `src/pages/{module}/components/{Entity}FormModal.tsx` (新建/修改)
- 或 `src/pages/{module}/form.tsx` (新建/修改，独立页面模式)

**验收闸门**:

- [ ] 使用 createModal 工厂函数（非手动管理 open）
- [ ] 使用 SForm（非 antd Form）
- [ ] formItems 禁止类型注解（同 searchItems，让 TS 逐项推断 fieldProps）
- [ ] 控件类型使用 sdesign 支持的值（input/select/datePicker/...）
- [ ] 下拉框通过 `fieldProps: { dictKey }` 指定字典
- [ ] 校验规则通过 `regKey` 或自定义 validator
- [ ] 提交按钮 actionType="save"（非 "submit"）
- [ ] 编辑模式正确回填数据（通过 open({ id }) 传入）
- [ ] 分组表单使用 SForm.Group + groupItems（非 type:'group'）
- [ ] 无 loading prop（用 Spin 包裹）
- [ ] 全局闸门 G1-G12 全部通过
- [ ] `pnpm verify` 0 error（仅本Task输出锁内文件）

### page-detail — 详情展示页

**输出锁**:

- `src/pages/{module}/components/{Entity}DetailDrawer.tsx` (新建/修改)

**验收闸门**:

- [ ] 使用 createDrawer 工厂函数（非手动管理 open）
- [ ] 使用 SDetail（非 antd Descriptions）
- [ ] items 显式类型注解
- [ ] 枚举字段渲染类型为 `dict`
- [ ] 分组使用 SDetail.Group + items（非 groupItems）
- [ ] 无 loading prop（用 Spin 包裹）
- [ ] 时间字段使用 `rangeTime` 渲染类型
- [ ] 全局闸门 G1-G12 全部通过
- [ ] `pnpm verify` 0 error（仅本Task输出锁内文件）

### component — 业务组件

**输出锁**:

- `src/pages/{module}/components/{Name}.tsx` (新建/修改)

**验收闸门**:

- [ ] Props 类型完整定义（interface 或 type）
- [ ] 无 any 类型
- [ ] 组件声明式命名（非匿名导出）
- [ ] 全局闸门 G1-G12 全部通过
- [ ] `pnpm verify` 0 error（仅本Task输出锁内文件）

### store — Zustand 状态管理

**输出锁**:

- `src/pages/{module}/store.ts` (新建/修改)

**验收闸门**:

- [ ] 使用 `create` from zustand
- [ ] Store 接口类型完整定义
- [ ] 如有持久化需求，使用 `persist` middleware
- [ ] 全局闸门 G1-G12 全部通过
- [ ] `pnpm verify` 0 error（仅本Task输出锁内文件）

### 非标准类型 — 兜底

> page-dashboard / page-workflow / page-landing / page-custom 等非常规页面类型，其 Task 闸门由用户按实际情况逐 Task 定义，遵循全局闸门 G1-G12 + 用户指定验收项。

---

## 三、使用方式

### Task 生成时

生成每个 Task 时，按 Task 类型从上表取：

1. **输出锁** → 填入 Task 的 `**输出锁**` 字段，替换 `{module}` 为实际模块名
2. **验收闸门** → 填入 Task 的 `**验收闸门**` 字段，保留 checklist 格式
3. 全局闸门不需要逐 Task 重复列出，Task 闸门中已包含 `全局闸门 G1-G12 全部通过` 一项

### Task 执行时

```
拿到 Task → 读输出锁（知道能碰哪些文件）
          → 读验收闸门（知道做到什么程度算完成）
          → 执行
          → pnpm verify → 只修输出锁内的报错
          → 逐条对照闸门自检
          → 全部通过 → Task 完成
```

### 越界处理

```
需要改输出锁外的文件？
  → 暂停 + 告知用户 + 等确认
  → 用户同意 → 更新输出锁范围 → 继续
  → 用户拒绝 → 用 // TODO 占位 → 继续
```
