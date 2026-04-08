# 执行后合规自审提示词

> 复制下方 `<system-reminder>` 整块内容，在 AI 完成任务后发送，触发自审。

---

## 使用方式

- **方式一（推荐）**：AI 完成阶段任务后，整块发送给 AI
- **方式二**：附在每次阶段指令的末尾，让 AI 在完成时自动执行
- **方式三**：简化版——只发送「按照合规自审流程回顾你的执行步骤」（需要 AI 已加载过完整版）

---

## 完整提示词

```xml
<system-reminder>
## 执行后合规自审（Post-Execution Compliance Audit）

你刚才完成了一个开发任务。现在必须执行以下自审流程，回顾每一个执行步骤，检查是否存在不合规之处。

---

### 第一步：执行步骤回溯

以表格形式列出你在本次任务中执行的**每一个操作**：

| 步骤序号 | 操作类型 | 操作对象（文件路径/命令） | 操作目的 |
|---------|---------|------------------------|---------|
| 1       | 读取/创建/修改/删除/运行命令 | 具体路径或命令 | 简要说明 |

---

### 第二步：阶段流程合规检查

对照以下检查项逐条审查，每条标注 ✅ 或 ❌ 并说明原因：

#### A. 阶段判断与流程

- [ ] **A1 阶段识别**：是否在第一步正确判断了当前阶段（①画Demo / ②接口合并 / ③改造适配 / ④接口对接 / ⑤迭代修复）？
- [ ] **A2 判断纪律**：阶段判断阶段是否做到了"不读取任何文件，仅根据用户消息判断"？
- [ ] **A3 必读文件**：是否在进入阶段后读取了该阶段的必读文件？
  - ① 画Demo → `modes/demo.md`
  - ② 接口合并 → `modes/api-merge.md`
  - ③ 改造适配 → `modes/demo-refine.md` + 已有 feature-spec
  - ④ 接口对接 → `modes/api-connect.md`
  - ⑤ 迭代修复 → `modes/incremental.md`
- [ ] **A4 Task 与 Progress**：
  - 多页面场景：是否生成了 `specs/{feature}/spec.md` + `specs/{feature}/progress.md`？
  - 是否每完成一个 Task 就立即更新了 progress.md（禁止批量更新）？
  - 单页面场景：是否错误地生成了 spec.md/progress.md（不应生成）？

#### B. 输出锁（写操作范围）

- [ ] **B1 范围内写入**：所有创建/修改的文件是否都在当前阶段的输出锁范围内？
  - ① 画Demo → `src/api/{module}/` + `src/pages/{module}/` + `specs/{feature}/`
  - ② 接口合并（分支A）→ `src/api/{module}/` + `specs/{feature}/`
  - ② 接口合并（分支B）→ `src/api/{module}/`
  - ③ 改造适配 → `src/api/{module}/` + `src/pages/{module}/`（仅修改，禁止新建）
  - ④ 接口对接 → `src/api/{module}/` + 用户确认的页面文件
  - ⑤ 迭代修复 → 仅用户指定的目标文件及其直接关联的类型文件
- [ ] **B2 禁止越界**：是否触碰了 `src/plugins/`、`src/router/`、全局配置等范围外文件？
- [ ] **B3 文件数量**：单次创建新文件 ≤ 5 个？修改已有文件 ≤ 5 个？

#### C. 组件使用（阻断性）

- [ ] **C1 sdesign 文档前置读取**：使用 SSearchTable / SForm / SButton / SDetail 之前，是否先读取了 `.ai/sdesign/components/{组件名}.md`？**未读取则代码无效，必须回滚重做。**
- [ ] **C2 禁用 antd 原生替代**：是否在业务页面直接使用了 antd Table / Form / Button / Descriptions？（login/error/layouts/router 目录除外）
- [ ] **C3 合法 antd 组件**：使用的 antd 组件是否仅限于 Modal / Modal.confirm / Tag / message / Card / Spin / InputNumber？

#### D. 导入规则

- [ ] **D1 HTTP 请求**：是否使用了 `import { createRequest } from '@/plugins/request'`？是否存在 `import axios`？
- [ ] **D2 类型定义**：是否存在 `Record<string, any>`？（应为 `Record<string, unknown>`）
- [ ] **D3 类型导入**：纯类型导入是否使用了 `import type`？
- [ ] **D4 路径别名**：是否存在相对路径导入（`../../`）？（应使用 `@/` 别名）
- [ ] **D5 状态管理**：是否使用了 zustand？是否误用了 redux / mobx？
- [ ] **D6 未使用参数**：回调函数中未使用的参数是否加了 `_` 前缀？（如 `(_, record) => ...`）

#### E. API 规范

- [ ] **E1 方法命名**：API 方法名是否带 HTTP 后缀？（`getListByGet` / `createByPost` / `updateByPut` / `deleteByDelete`）
- [ ] **E2 占位 URL**：画 Demo 阶段的 URL 是否使用了 `'/api/TODO/{module}'` 格式？
- [ ] **E3 API 对象命名**：是否遵循 `{module}Api` 命名？（如 `productApi`）
- [ ] **E4 useRequest 包装**：页面中的 API 调用是否通过 `useRequest` 包装？是否存在手动 `useState` 管理 loading/data？
- [ ] **E5 写操作回调**：写操作的 `useRequest` 是否配置了 `manual: true` + `onSuccess`？

#### F. 全局类型

- [ ] **F1 禁止重复定义**：模块 `types.ts` 中是否重新定义了 `PageData` / `PageQuery` / `ApiResponse` / `ApiError`？（这些已在 `src/types/index.ts` 中全局定义）
- [ ] **F2 types.ts 内容**：模块 `types.ts` 是否只包含 `{Entity}` + `{Entity}Query extends PageQuery` + `{Entity}FormData`？
- [ ] **F3 泛型注解**：所有 API 方法是否都有泛型注解？是否存在 `any`？

#### G. 错题集（页面代码阶段必选）

- [ ] **G1 错题集读取**：生成页面代码前是否读取了 `.ai/pitfalls/index.md`？
- [ ] **G2 P001 弹层封装**：列表页的 Modal/Drawer 是否封装为子组件 + `useImperativeHandle`？（禁止在列表页管理 open 状态）
- [ ] **G3 P002 可编辑表格**：是否误用了 SForm `type: 'table'` 或 STable 做行内编辑？（应用 `EditableProTable`）
- [ ] **G4 P003 未使用参数**：回调中未使用的参数是否加了 `_` 前缀？
- [ ] **G5 P004 字段联动**：是否使用了 `type: 'dependency'`？（应使用 `SForm.useWatch` + 条件展开）
- [ ] **G6 P005 确认弹窗**：是否使用了 SConfirm？（应使用 `Modal.confirm`）

#### H. 验证执行

- [ ] **H1 pnpm verify**：任务完成后是否运行了 `pnpm verify`？
- [ ] **H2 修复轮次**：验证失败时是否按优先级修复（tsc > eslint > prettier），最多 3 轮？
- [ ] **H3 范围内修复**：修复错误时是否只处理了当前输出锁范围内的文件？是否越界修复了其他模块的错误？
- [ ] **H4 Level 2 自检**：Level 1 通过后是否执行了 AI 自检清单？

#### I. 风险操作

- [ ] **I1 需确认操作**：是否有删除文件、修改 package.json、修改全局配置等操作未经用户确认？
- [ ] **I2 禁止操作**：是否执行了自行安装依赖包、修改 src/plugins/ 或 src/router/ 等禁止操作？
- [ ] **I3 范围越界**：是否自行扩展了用户未要求的功能？

---

### 第三步：产出自审报告

按以下格式输出最终报告：

```

## 自审报告

### 执行概要

- 当前阶段：[阶段名]
- 模块/功能：[module/feature]
- 操作步骤总数：[N]
- 产出文件：[列出所有创建/修改的文件]

### ✅ 合规项（X/Y）

- [逐条列出通过的检查项编号和简要描述]

### ❌ 违规项（X/Y）

| 编号 | 检查项               | 违规描述                           | 发生在步骤 | 严重程度  | 修复方案               |
| ---- | -------------------- | ---------------------------------- | ---------- | --------- | ---------------------- |
| C1   | sdesign 文档前置读取 | 使用 SSearchTable 前未读取组件文档 | 步骤 4     | 🔴 阻断性 | 读取文档后重新生成代码 |

### 📊 合规率

- 总检查项：Y
- 通过：X
- 违规：Z
- 合规率：X/Y（百分比）

### 🔴 阻断性问题（必须立即修复）

[如有阻断性违规（如 C1 未读 sdesign 文档），在此列出并说明必须回滚重做]

### 🟡 建议改进

[非阻断性但建议修正的项目]

```

### 严重程度定义

| 等级 | 含义 | 处理方式 |
|------|------|---------|
| 🔴 阻断性 | 违反阻断性规则，产出代码无效 | 必须回滚重做 |
| 🟠 严重 | 违反硬约束，代码可能报错 | 必须在当前会话修复 |
| 🟡 警告 | 违反规范但不影响运行 | 建议修复 |
| ⚪ 提示 | 可优化项 | 可选修复 |

---

### 第四步：自动修复（仅限输出锁范围内）

1. 对于输出锁范围内的 🔴 和 🟠 级违规，直接修复
2. 对于输出锁范围外的违规，仅报告不修改
3. 修复后重新运行 `pnpm verify`
4. 更新自审报告中的合规率

</system-reminder>
```

---

## 简化版（日常快速触发）

当 AI 已经在同一会话中加载过完整版后，可以用这个简化指令触发：

```
回顾你刚才的所有执行步骤，对照 AGENTS.md 的硬约束（组件使用、导入规则、API 规范、全局类型、错题集、输出锁、验证流程）逐条检查，按「步骤回溯 → 逐条检查 → 自审报告」三步输出，标注合规率和违规严重程度。
```
