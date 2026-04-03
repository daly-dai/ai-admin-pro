# 阶段③：改造适配

> **阶段定位**：开发生命周期的第三站。阶段②产出了 feature-spec，阶段①产出了 demo 页面，
> 本阶段根据 feature-spec 改造已有 demo 页面，使页面代码对齐真实的接口定义和业务规则。

---

## 前置条件

- **必须已有 feature-spec**：`specs/[feature]/feature-spec.md`（阶段②分支A 的产出）
- **必须已有 demo 页面**：`src/pages/{module}/` 下至少有一个页面文件（阶段①的产出）

> 如果缺少 feature-spec，应引导用户先走阶段②分支A。
> 如果缺少 demo 页面，应引导用户先走阶段①。

---

## 步骤

### 1. 读 feature-spec

Read `specs/[feature]/feature-spec.md`，理解：

- 数据模型（实体字段、枚举、查询参数）
- 接口清单（标准接口、非标准接口、偏离点）
- 页面与交互设计（页面清单、搜索区域、表格列、操作列、表单字段）
- 差异决策结果（用户已确认的差异处理方式）

### 2. 读已有 demo 代码

- Read `src/api/{module}/types.ts`（已有类型定义）
- Read `src/api/{module}/index.ts`（已有 API 方法）
- Read `src/pages/{module}/` 下所有页面文件

### 3. 读错题集 + sdesign 组件文档

- **读错题集**：Read `.ai/pitfalls/index.md`，按「适用场景」匹配当前页面类型，将匹配的核心规则作为硬性约束执行。不确定时再按需 Read 对应详情文件
- **读 sdesign 组件文档**：Read 页面中使用的所有 sdesign 组件文档（`.ai/sdesign/components/{组件名}.md`），未读文档的组件禁止修改其属性

### 4. 生成变更清单

对比 feature-spec 与已有 demo 代码的差异，生成变更清单：

| 变更维度     | 对比内容                                                                |
| ------------ | ----------------------------------------------------------------------- |
| types.ts     | feature-spec 的实体字段 vs 已有临时类型（新增/删除/修改字段、类型变更） |
| index.ts     | feature-spec 的接口清单 vs 已有占位 API（新增方法、URL 更新、参数变更） |
| 页面搜索区域 | feature-spec 的搜索字段 vs 已有 searchFields                            |
| 页面表格列   | feature-spec 的列定义 vs 已有 columns                                   |
| 页面操作列   | feature-spec 的操作按钮 vs 已有操作                                     |
| 表单字段     | feature-spec 的表单定义 vs 已有 formFields                              |
| 字段联动     | feature-spec 的联动规则 vs 已有联动逻辑                                 |

### 5. 向用户确认变更范围

向用户展示变更清单摘要：

- 列出将要修改的文件和具体变更项
- 如有不确定的变更（如 feature-spec 标注了 `[待补充]` 的部分），明确告知
- 等待用户确认后执行

### 6. 判断范围

- **改动少**（涉及 1-2 个文件）→ 直接修改
- **多页面改动**（涉及 ≥ 3 个文件）→ Task 拆解
  - 创建/更新 `specs/[feature]/spec.md` + `progress.md`
  - 一个 Task = 一个页面的改造
  - 逐 Task 执行步骤 7-8

### 7. 执行改造

- **更新 types.ts**：用 feature-spec 的真实类型定义替换/更新临时类型，删除 `// TODO` 注释
- **更新 index.ts**：如 feature-spec 标注了接口偏离点（如分页参数命名不同），在代码中适配
- **更新页面代码**：
  - 搜索字段对齐 feature-spec 的查询参数定义
  - 表格列对齐 feature-spec 的展示字段定义
  - 操作列对齐 feature-spec 的操作按钮定义
  - 表单字段对齐 feature-spec 的表单定义
  - 字段联动对齐 feature-spec 的联动规则
- **保留用户手动添加的自定义逻辑**：改造是「对齐」不是「重写」

### 8. 验证

`pnpm verify`，最多 3 轮修复。

---

## 约束

- **仅修改已有文件**，不创建新文件（新增页面应回到阶段①）
- **保留自定义逻辑**：改造基于 diff，保留用户在 demo 阶段手动添加的自定义代码
- **feature-spec 中标 `[待补充]` 的部分不处理**，告知用户待信息补充后再改

---

## 输出锁

> 🔒 仅允许修改已有的 `src/api/{module}/types.ts`、`src/api/{module}/index.ts` 和 `src/pages/{module}/` 下的已有页面文件。禁止创建新文件。

---

## 会话交接（仅跨会话中断时）

多页面 Task 拆解模式下，如需跨会话中断，按 `.ai/specs/session-template.md` 生成 session 文档。
