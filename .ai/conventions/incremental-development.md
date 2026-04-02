# 增量开发规范

> 约定驱动 + 工具原生发现 + 硬约束兜底，让 AI 低成本理解现有代码并安全迭代

## 核心原则

1. **约定即可预测** — 固定的目录/命名模式让 AI 无需预读清单即可推断代码位置
2. **搜索即上下文** — 用 Glob/Grep 动态发现真实代码，替代静态快照文件
3. **验证即安全网** — `pnpm verify` 机械化拦截所有违规，AI 根据错误信息自修复

## 动态发现策略

不维护静态清单，AI 通过工具搜索获取实时上下文：

### 发现已有模块

```bash
# 已有 API 模块
Glob: src/api/*/index.ts

# 已有页面
Glob: src/pages/*/index.tsx

# 已有业务组件
Glob: src/components/business/**/*.tsx

# 已有 Store
Glob: src/stores/*.ts
```

### 发现具体实现

```bash
# 查找某个类型定义
Grep: "export interface Product"

# 查找某个 API 导出
Grep: "export const productApi"

# 查找某个组件的用法
Grep: "import.*ProductForm"

# 查找路由配置
Grep: "path:.*'/product'"  → src/router/
```

### 参考已有模式

新增模块时，读取一个已有的同类模块作为参考：

```bash
# 要新增 order 模块？先看 product 模块怎么写的
Read: src/api/product/types.ts    → 类型定义模式
Read: src/api/product/index.ts    → API 实现模式
Read: src/pages/product/index.tsx → 页面结构模式
```

## 增量迭代工作流

> ⚠️ 每个场景的 **"前置阅读"步骤不可跳过**。跳过前置阅读直接生成代码是导致组件约束违规的首要原因。

### 场景 1: 新增 CRUD 模块

```
前置阅读（强制）: 按 AGENTS.md 步骤 2「场景预读」表中 api + page-list 类型读取对应文档

执行步骤:
1. 读 AGENTS.md（约定 + 硬约束 + 豁免范围）
2. Glob src/api/*/index.ts → 确认模块名不冲突
3. Read 一个已有模块（如 src/api/product/）→ 参考真实代码模式
4. 确认目标文件是否在豁免目录 → 决定使用 antd 还是 sdesign
5. 生成代码 → pnpm verify → 修复 → 提交
```

### 场景 2: 新增表单页（新增/编辑）

```
前置阅读（强制）: 按 AGENTS.md 步骤 2「场景预读」表中 page-form 类型读取对应文档

执行步骤:
1. 确认目标文件路径是否在豁免目录
2. Read 关联 API（types.ts + index.ts）→ 了解数据结构
3. 如有已有表单页 → Read 参考其结构
4. 生成代码 → pnpm verify → 修复 → 提交
```

### 场景 3: 新增详情页

```
前置阅读（强制）: 按 AGENTS.md 步骤 2「场景预读」表中 page-detail 类型读取对应文档

执行步骤:
1. 确认目标文件路径是否在豁免目录
2. Read 关联 API → 了解数据结构
3. 生成代码 → pnpm verify → 修复 → 提交
```

### 场景 4: 修改已有页面

```
前置阅读（按需）:
  - 如涉及组件替换 → 查阅 .ai/sdesign/components/ 下对应组件文档
  - 如不确定约束 → 重读 AGENTS.md 硬约束章节

执行步骤:
1. Read 目标页面代码（如 src/pages/product/index.tsx）
2. Read 关联 API（如 src/api/product/index.ts + types.ts）
3. 理解现有逻辑后修改
4. pnpm verify → 修复 → 提交
```

### 场景 5: 新增功能到已有模块

```
前置阅读（按需）:
  - 如新增页面类型（列表/表单/详情）→ 查阅对应 guide

执行步骤:
1. Read 目标模块的 API 和页面代码
2. Grep 确认相关组件/类型的引用关系
3. 增量修改（添加 API 方法、页面组件、路由等）
4. pnpm verify → 修复 → 提交
```

### 场景 6: 复用已有组件

```
执行步骤:
1. Glob src/components/business/**/*.tsx → 发现可复用组件
2. Read 目标组件源码 → 理解 Props 接口
3. 在新页面中导入使用
4. pnpm verify → 修复 → 提交
```

## 代码组织约定

### 模块目录结构

同一业务模块的代码在同一目录树下，AI 可通过模块名直接定位：

```
src/
├── api/order/          # API 层
│   ├── types.ts        # 类型定义（Order, OrderQuery, OrderFormData）
│   └── index.ts        # API 实现（getListByGet/getByIdByGet/createByPost/updateByPut/deleteByDelete）
├── pages/order/        # 页面层
│   ├── index.tsx       # 列表页（入口）
│   └── components/     # 页面私有组件
│       ├── OrderForm.tsx
│       └── OrderDetail.tsx
└── stores/order.ts     # 状态层（仅需跨页面共享时创建）
```

### 组件复用层级

组件位置决定复用范围：

```
components/
├── common/             # 跨项目可复用（通用 UI）
├── business/           # 本项目内复用（业务组件）
└── pages/[page]/components/  # 仅当前页面使用
```

### 类型定义策略

类型在哪里使用，就在哪里定义：

```typescript
// API 类型 → api/[module]/types.ts
export interface Order { ... }
export interface OrderQuery { ... }

// 组件 Props → 组件文件内
interface OrderFormProps { ... }

// 全局类型 → types/index.ts
export interface PageData<T> { ... }
```

## 硬约束保障

增量开发中，以下错误由工具链自动拦截，无需人工检查：

| 错误类型                   | 拦截工具   | 时机                   |
| -------------------------- | ---------- | ---------------------- |
| 导入不存在的模块           | `tsc`      | commit / push / verify |
| 使用 `any` 类型            | `eslint`   | commit / verify        |
| 直接 `import axios`        | `eslint`   | commit / verify        |
| 业务页面使用 antd 原生组件 | `eslint`   | commit / verify        |
| 类型不匹配                 | `tsc`      | push / verify          |
| 代码格式不一致             | `prettier` | commit / verify        |

**自修复循环**：生成代码 → `pnpm verify` → 解析错误 → 修复 → 再次 verify（最多 3 轮）
