# AI 驱动前端架构设计与创新 — 组内分享

> 基于 AI-Admin-Pro 项目，分享 AI 时代前端工程化的实践探索

---

## 一、项目技术栈概览

| 类别      | 选型                                                   |
| --------- | ------------------------------------------------------ |
| 构建工具  | RSBuild                                                |
| 框架      | React 18 + TypeScript 5（strict 模式）                 |
| UI 层     | Ant Design 5 + @dalydb/sdesign（CRUD 业务增强层）      |
| 状态管理  | Zustand + immer + persist                              |
| HTTP      | Axios（统一封装为 request，禁止裸用）                  |
| 路由      | React Router DOM 6                                     |
| 数据请求  | ahooks useRequest                                      |
| 代码质量  | ESLint + Prettier + TypeScript strict + lint-staged    |
| Git Hooks | Husky（pre-commit: lint-staged, pre-push: type-check） |

---

## 二、架构设计基础

### 2.1 三层隔离的模块化结构

```
src/
├── api/{module}/          # API 层：types.ts + index.ts，导出 {module}Api
├── pages/{module}/        # 页面层：index.tsx 入口 + components/ 私有组件
├── components/            # 组件层：common/（通用）+ business/（业务）
├── stores/                # 状态层：app.ts + user.ts，Zustand store
└── plugins/request/       # 基础设施：Axios 封装
```

**设计意图**：API 层只管数据获取和类型定义，页面层只管 UI 编排和交互，组件层负责可复用的 UI 单元。这种职责分明的约定式目录让代码位置可预测——无论是人还是 AI，都能快速定位目标文件。

### 2.2 sdesign 与 antd 的分工

**@dalydb/sdesign 是 antd 的业务增强层，不是替代品。**

| sdesign 管理                             | antd 管理                                         |
| ---------------------------------------- | ------------------------------------------------- |
| SSearchTable（搜索 + 表格 + 分页一体化） | Layout/Menu/Breadcrumb/Tabs（导航布局）           |
| SForm / SForm.Search（配置式表单）       | Modal/Drawer/message/notification（反馈交互）     |
| SButton（预设 actionType）               | Tag/Badge/Avatar/Card/Statistic（数据展示）       |
| SDetail（配置式描述列表）                | Input/Select/DatePicker（表单控件，SForm 外使用） |

**核心原则**：sdesign 管 CRUD 四件套，antd 管其余一切。这种分工让 AI 不会在业务页面中错用 antd 原生组件，同时保留了 antd 生态的完整能力。

### 2.3 工程化保障

- **TypeScript strict 模式 + noImplicitAny**：类型安全是基础，any 是绝对禁止的
- **ESLint 硬约束规则**：禁 any、禁裸 axios、业务页面禁用 antd CRUD 组件
- **Prettier + import 排序**：代码风格统一，import 顺序自动排序
- **Git Hooks**：pre-commit（lint-staged）+ pre-push（type-check）
- **pnpm verify**：`tsc --noEmit && eslint src/ && prettier --check src/` 全量验证

---

## 三、AI 驱动开发的核心创新（重点章节）

这是本文档的核心部分，详细阐述 AI 协作开发的架构创新。

### 3.1 Spec-Driven Development（SDD）— 从需求到代码的完整闭环

```
检查 specs/ + 会话恢复 → 拆解需求 → [循环执行]
  → 场景预读 → 参考已有模块 → 生成代码
  → 组件约束速查 → 验证循环(pnpm verify)
  → 更新进度 + 生成会话文档 → 下一个 Task
```

#### 为什么要从 Spec 开始而不是直接写代码？

传统开发中，需求→代码的转换主要依赖开发者的理解和经验。但 AI 缺乏对业务上下文的先验知识，直接让 AI "写一个用户管理页面" 会导致：

1. **范围蔓延**：AI 可能过度设计或遗漏功能点
2. **交付模糊**：无法判断"完成"的标准
3. **难以验收**：缺乏对照的验证依据

SDD 将需求拆解为结构化的 spec.md，每个 Task 有明确的输入、输出、完成标准。这让 AI 的工作边界清晰可控。

#### Task 拆解原则

- **一个 Task = 一个明确交付物**：一个页面 / 一个 API 模块 / 一个组件
- **先数据后展示**：API → 列表页 → 表单页 → 详情页
- **依赖关系必须声明**：Task 2 依赖 Task 1 的类型定义

#### "禁止跳步"的铁律及其意义

```
⚠️ 跳过步骤 1 直接写代码，或跳过步骤 2 直接生成代码，均属于流程违规。
```

这条规则看似严苛，实则是 AI 代码质量的关键保障。跳过场景预读直接生成代码，是组件约束违规的首要原因——因为 AI 会基于通用知识而非项目特定规范来生成代码。

---

### 3.2 渐进式知识库（.ai 目录）— 让 AI "读懂"项目

这是本项目最有创新价值的部分。.ai 目录是专门为 AI 设计的"项目知识库"，采用分层架构：

```
.ai/
├── core/          → 核心规范（架构、编码、技术栈）
├── guides/        → 场景开发指南（API、CRUD、表单、详情）
├── conventions/   → 开发约定（API约定、验证体系、增量开发、纠错流程）
├── specs/         → 需求规格（模板、进度追踪）
├── sdesign/       → 组件库文档（自动同步）
├── templates/     → 代码模板
├── pitfalls/      → 踩坑记录（纠错沉淀）
└── tools/         → 工具脚本（文档同步等）
```

#### 分层逻辑详解

| 层级    | 目录/文件                | 特点               | 加载时机                 |
| ------- | ------------------------ | ------------------ | ------------------------ |
| Layer 0 | AGENTS.md                | 硬约束 + 工作流    | 常驻上下文，每次会话必读 |
| Layer 1 | guides/                  | 场景触发的必读文档 | Task 类型匹配时加载      |
| Layer 2 | core/                    | 深度参考           | 首次/新增模块时读取      |
| Layer 3 | specs/                   | 需求驱动           | 每个功能的 Task 定义     |
| Layer 4 | conventions/ + pitfalls/ | 约定和纠错沉淀     | 特定场景触发             |

#### 核心设计目的

**控制 Token 消耗的同时保证 AI 拥有足够的上下文**

如果把所有文档一股脑全部塞给 AI，会导致：

1. Token 成本爆炸（每次请求都携带大量无关信息）
2. 信息噪音干扰（AI 可能被无关信息误导）
3. 上下文窗口溢出（超出模型限制后信息被截断）

分层按需加载的设计，让 AI 在每个 Task 只读取必要的文档，既节省成本又保证质量。

---

### 3.3 场景预读机制 — AI 的"按需学习"

场景预读是 SDD 流程的关键环节，根据当前 Task 类型精准加载相关文档：

| Task 类型   | 必读文档                                                              |
| ----------- | --------------------------------------------------------------------- |
| api         | guides/api-module.md + conventions/api-conventions.md                 |
| page-list   | guides/crud-page.md + sdesign/components/SSearchTable.md + SButton.md |
| page-form   | guides/form-page.md + sdesign/components/SForm.md                     |
| page-detail | guides/detail-page.md + sdesign/components/SDetail.md                 |
| component   | core/coding-standards.md（组件规范部分）                              |
| store       | core/architecture.md（状态管理规范部分）                              |
| incremental | conventions/incremental-development.md                                |
| verify      | conventions/verification.md                                           |
| correction  | conventions/correction-workflow.md                                    |

#### 为什么要这样设计？

1. **避免 AI 盲读全部文档浪费 Token**：一个列表页 Task 不需要读表单文档
2. **确保 AI 在生成代码前拥有当前 Task 类型所需的完整上下文**：SSearchTable 的 Props 必须在列表页生成前被读取
3. **"跳过预读直接写代码 = 组件约束违规的首要原因"**：这是血的教训

预读顺序也有讲究：

1. 先读 guides/（场景指南，了解"怎么做"）
2. 再读 sdesign/components/（组件 API，了解"用什么"）
3. 最后读 core/（仅首次或新模块时，了解"为什么"）

---

### 3.4 三级验证循环 — 不信任一次生成

AI 生成的代码必须经过三级验证才能认定为"完成"：

```
Task 开发完成
    ↓
【Level 1】代码级验证（自动化）
    ↓ 通过
【Level 2】功能级验证（AI 自检 + 人工）
    ↓ 通过
【Level 3】业务级验证（人工）
    ↓ 通过
Task 完成 ✓
```

#### Level 1（代码级 — 机械化）

```bash
pnpm verify  # tsc + eslint + prettier
```

- **执行者**：AI 自动执行
- **自修复流程**：有错误 → 按优先级修复（tsc > eslint > prettier）→ 再次 verify，最多 3 轮
- **特点**：0 人工成本，100% 可靠拦截

#### Level 2（功能级 — AI 自检）

AI 在提交代码前，必须逐条自检以下清单：

**组件约束检查**：

- [ ] 目标文件不在豁免目录（login/error/layouts/router）
- [ ] 业务页面使用 SSearchTable 而非 antd Table
- [ ] 业务页面使用 SForm 而非 antd Form
- [ ] 业务页面使用 SButton 而非 antd Button
- [ ] 未使用 sdesign 中不存在的组件（如 ~~SModal~~、~~SDrawer~~）

**代码质量检查**：

- [ ] 无 any 类型
- [ ] 未直接 import axios，使用 request 封装
- [ ] API 对象命名正确（{module}Api）

**文件完整性检查**：

- [ ] types.ts 中类型定义完整
- [ ] 页面私有组件放在 components/ 子目录

#### Level 3（业务级 — 人工）

对照 spec.md 需求逐条验证，确保功能符合业务预期。

#### 设计哲学

**AI 会犯错，但通过多级验证循环，错误一定会被捕获。**

- Level 1 拦截语法和规范错误（机械化，无遗漏）
- Level 2 拦截约定违规（AI 自检，有上下文）
- Level 3 拦截业务偏差（人工把关，有判断力）

---

### 3.5 会话恢复与上下文传递 — 跨会话的记忆

AI 会话有生命周期，但项目开发是连续的。session-\*.md 机制解决了"AI 失忆"问题。

#### 会话交接文档的核心内容

```markdown
# [功能名称] - Session #N

## 完成状态

- ✅ 已完成：{file_path}: {具体功能点}
- ⏳ 部分完成：{file_path}: 已完成 X，剩余 Y
- 🔴 未完成：{功能点}: {失败原因}

## 关键决策

| 决策点       | 选择方案  | 原因             |
| ------------ | --------- | ---------------- |
| 交互模式     | Modal     | 字段少，适合弹层 |
| API 签名偏离 | POST body | 参数复杂度高     |

## 验证状态

| Level   | 结果 | 详情             |
| ------- | ---- | ---------------- |
| Level 1 | ✅   | pnpm verify 通过 |
| Level 2 | ✅   | 自检清单通过     |

## 下一步

- 下一个 Task: #3 商品表单页
- 预读文档: guides/form-page.md, sdesign/components/SForm.md
```

#### 新会话的标准加载顺序

```
AGENTS.md → spec.md → progress.md → 最新 session
```

**意义**：即使隔了一周，AI 也能快速恢复上下文，不会"失忆"。关键决策被记录下来，避免新会话"纠正"回错误写法。

---

### 3.6 纠错沉淀机制 — 知识库的自我进化

当用户纠正 AI 的错误写法时，不是简单地修复代码了事，而是将这个错误"沉淀"到知识库中，防止下次再犯。

#### 四层防御体系

```
Layer 1: ESLint 机械拦截      → 0 Token 成本，100% 可靠
Layer 2: AGENTS.md 核心速查    → 常驻上下文，高频错误预防
Layer 3: .ai/pitfalls/         → 按需加载，场景触发
Layer 4: 错题集 index.md       → 按需查询
```

#### 沉淀决策流程

```
用户纠正了一个错误写法
         ↓
Step 1: 能否用 ESLint 机械检测？
  ├─ 能 → 写入 Layer 1（eslint.config.mjs）→ ✅ 结束
  └─ 不能 → Step 2
         ↓
Step 2: 此错误是否高频（>30% 的同类场景会触发）？
  ├─ 是 → 写入 Layer 2（AGENTS.md 步骤 5）→ ✅ 结束
  └─ 否 → Step 3
         ↓
Step 3: 此错误是否绑定特定文件模式？
  ├─ 是 → 写入 Layer 3（.ai/pitfalls/{pattern}.md）→ ✅ 结束
  └─ 否 → 写入 Layer 4（错题集）→ ✅ 结束
```

#### 具体案例：弹层封装错误

**场景**：用户纠正"Modal 的 open 状态不应由列表页管理"

**沉淀过程**：

1. 判断：无法用 ESLint 机械检测（需要理解代码语义）→ 跳过 Layer 1
2. 判断：这是高频错误吗？是，几乎所有 CRUD 页面都会遇到 → 写入 Layer 2
3. 同时创建 pitfalls/modal-drawer-encapsulation.md 详细说明

**效果**：

- AGENTS.md 步骤 5 增加速查项："Modal/Drawer 是否封装在子组件内部，而非由列表页管理 open 状态？"
- 下次生成含 Modal + SForm 的文件时，AI 自动预读 pitfalls 文件

**核心价值**：每一次纠错都让知识库更完善，AI 的代码质量逐次提升。

---

### 3.7 组件库文档自动同步 — 永远面对最新 API

sdesign 组件库会持续迭代，如果 AI 使用过时的 API 文档，会产生"幻觉"（生成不存在的方法或过时的用法）。

#### postinstall 自动同步机制

```json
// package.json
{
  "scripts": {
    "postinstall": "pnpm sync-ai-docs",
    "sync-ai-docs": "tsx .ai/tools/sync-sdesign-docs.ts"
  }
}
```

**工作流程**：

1. 执行 `pnpm install` 后自动触发
2. 从 node_modules/@dalydb/sdesign 中提取最新组件文档
3. 同步到 .ai/sdesign/components/ 目录
4. AI 读取的始终是当前安装版本的文档

**意义**：确保 AI 始终使用最新的组件 API，不会幻觉出过时的方法（如已废弃的 Props 或已更名的事件）。

---

### 3.8 ESLint 作为 AI 的"护栏" — 机械化约束

ESLint 规则不仅服务于人类开发者，更是 AI 的"不可逾越的护栏"。

#### 关键规则设计

| 规则类型               | 配置示例                                       | 作用                             |
| ---------------------- | ---------------------------------------------- | -------------------------------- |
| 禁止 any 类型          | @typescript-eslint/no-explicit-any: error      | 强制类型安全                     |
| 禁止直接 import axios  | no-restricted-imports: paths['axios']          | 强制使用封装的 request           |
| 业务页面禁用 antd CRUD | 自定义规则 + 目录判断                          | 强制使用 sdesign                 |
| 禁止 destroyOnClose    | no-restricted-syntax: JSXAttribute[name="..."] | 强制条件渲染 {open && \<Modal/>} |

#### 按目录路由的豁免机制

```
豁免目录：login/ | error/ | register/ | layouts/ | router/
```

这些基础设施代码可以使用原生 antd，因为它们不属于"业务 CRUD 页面"。

#### 对 AI 的意义

ESLint 规则是 0 Token 成本的机械化拦截。即使 AI 试图生成违规代码，也会在 `pnpm verify` 阶段被拦截。这种"硬编码"的约束比"软提示"的文档更可靠。

---

## 四、AI 架构的五大核心理念

| 理念             | 含义                         | 体现                                      |
| ---------------- | ---------------------------- | ----------------------------------------- |
| **规范即约束**   | 不靠自觉，靠工具链机械化强制 | ESLint/TS/Prettier 硬规则                 |
| **文档即代码**   | .ai/ 是 AI 执行的"源代码"    | guides 定义生成方式，conventions 定义签名 |
| **约定即可预测** | 固定目录/命名让 AI 无需搜索  | {module}Api、src/pages/{module}/index.tsx |
| **验证即保障**   | 三级验证循环，不信任一次生成 | 机械拦截 → AI 自检 → 人工确认             |
| **增量即沉淀**   | 每次开发完善 AI 理解         | 纠错沉淀、会话交接、错题集积累            |

### 理念详解

**规范即约束**：传统开发中，规范靠人的自觉遵守；AI 时代，规范必须通过工具链强制执行。因为 AI 不会"不好意思"，它只会"不知道"或"知道但没约束"。

**文档即代码**：.ai/ 目录不是给人看的说明书，而是 AI 的"执行代码"。guides 告诉 AI "怎么生成"，conventions 告诉 AI "签名长什么样"。文档的质量直接决定生成代码的质量。

**约定即可预测**：约定式目录结构让 AI 不需要搜索"API 应该放哪里"——永远是 src/api/{module}/index.ts。这种可预测性大幅降低了 AI 的决策负担。

**验证即保障**：AI 不是万能的，它会犯错。三级验证是"承认 AI 会犯错"的务实态度，通过多层防线确保最终交付质量。

**增量即沉淀**：每次纠错、每次会话交接、每个错题记录，都是知识库的增量积累。项目越用越"聪明"，AI 的表现越来越好。

---

## 五、CRUD 开发全流程示例

以"商品管理"为例，展示 SDD 的完整流程。

### 1. 需求拆解

创建 `specs/product/spec.md`：

```markdown
## Task 列表

### Task 1: API 模块（api）

- 输出：src/api/product/types.ts + index.ts
- 完成标准：pnpm verify 通过，导出 productApi

### Task 2: 列表页（page-list）

- 依赖：Task 1
- 输出：src/pages/product/index.tsx
- 完成标准：SSearchTable 渲染，支持搜索/分页

### Task 3: 表单弹层（page-form）

- 依赖：Task 1
- 输出：src/pages/product/components/ProductFormModal.tsx
- 完成标准：SForm 配置式，新增/编辑复用

### Task 4: 详情抽屉（page-detail）

- 依赖：Task 1
- 输出：src/pages/product/components/ProductDetailDrawer.tsx
- 完成标准：SDetail 配置式
```

### 2. Task 1 开发：API 模块

**场景预读**：`guides/api-module.md` + `conventions/api-conventions.md`

**参考已有模块**：`Glob: src/api/*/index.ts`

**生成代码**：

```typescript
// src/api/product/types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export interface ProductQuery {
  name?: string;
  status?: Product['status'];
  page: number;
  pageSize: number;
}

export interface ProductFormData {
  name: string;
  price: number;
  status: Product['status'];
}
```

```typescript
// src/api/product/index.ts
import { request } from '@/plugins/request';
import type { Product, ProductFormData, ProductQuery } from './types';

export const productApi = {
  getList: (params: ProductQuery) =>
    request.get<{ list: Product[]; total: number }>('/api/products', {
      params,
    }),

  getById: (id: string) => request.get<Product>(`/api/products/${id}`),

  create: (data: ProductFormData) =>
    request.post<Product>('/api/products', data),

  update: (id: string, data: ProductFormData) =>
    request.put<Product>(`/api/products/${id}`, data),

  delete: (id: string) => request.delete(`/api/products/${id}`),
};
```

**验证**：`pnpm verify` → 更新 progress.md → 生成 session-task1.md

### 3. Task 2 开发：列表页

**场景预读**：`guides/crud-page.md` + `sdesign/components/SSearchTable.md` + `SButton.md`

**生成代码**：

```tsx
// src/pages/product/index.tsx
import { useRef } from 'react';
import { SSearchTable, SButton } from '@dalydb/sdesign';
import type { SSearchTableRef, SSearchTableProps } from '@dalydb/sdesign';
import { productApi } from '@/api/product';
import type { Product, ProductQuery } from '@/api/product/types';
import {
  ProductFormModal,
  type ProductFormModalRef,
} from './components/ProductFormModal';
import {
  ProductDetailDrawer,
  type ProductDetailDrawerRef,
} from './components/ProductDetailDrawer';

const ProductPage = () => {
  const tableRef = useRef<SSearchTableRef>(null);
  const formRef = useRef<ProductFormModalRef>(null);
  const detailRef = useRef<ProductDetailDrawerRef>(null);

  const columns: SSearchTableProps<Product, ProductQuery>['columns'] = [
    { title: '商品名称', dataIndex: 'name', search: true },
    { title: '价格', dataIndex: 'price', render: (v) => `¥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      search: true,
      valueEnum: { draft: '草稿', published: '已发布' },
    },
    {
      title: '操作',
      render: (_, record) => (
        <>
          <SButton
            actionType="view"
            onClick={() => detailRef.current?.open(record.id)}
          />
          <SButton
            actionType="edit"
            onClick={() => formRef.current?.open('edit', record.id)}
          />
          <SButton
            actionType="delete"
            onConfirm={() => handleDelete(record.id)}
          />
        </>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    await productApi.delete(id);
    tableRef.current?.refresh();
  };

  return (
    <>
      <SSearchTable
        ref={tableRef}
        tableTitle={{
          title: '商品管理',
          actionNode: (
            <SButton
              actionType="create"
              onClick={() => formRef.current?.open('create')}
            />
          ),
        }}
        columns={columns}
        requestFn={productApi.getList}
      />
      <ProductFormModal
        ref={formRef}
        onSuccess={() => tableRef.current?.refresh()}
      />
      <ProductDetailDrawer ref={detailRef} />
    </>
  );
};

export default ProductPage;
```

**约束速查**：✅ 使用 SSearchTable ✅ 使用 SButton ✅ Modal 封装在子组件

**验证**：`pnpm verify` → 更新 progress.md

### 4. 循环直到所有 Task 完成

每个 Task 遵循相同的流程：场景预读 → 参考模块 → 生成代码 → 约束速查 → 验证 → 更新进度

---

## 六、当前架构可改善的方向

### 6.1 测试体系缺失

**现状**：当前项目没有单元测试和集成测试框架（无 Jest/Vitest/Testing Library）。

**改进建议**：

- 引入 Vitest + @testing-library/react，构建组件级和页面级测试
- 在 SDD 流程中增加 "test" 类型的 Task
- 为 AI 提供测试模板，让 AI 能够生成符合规范的测试用例

**预期收益**：Level 1 验证从静态检查扩展到运行时验证，代码质量进一步提升。

### 6.2 AI 验证可深化

**现状**：Level 1 验证仅覆盖静态检查（tsc/eslint/prettier），无运行时验证。

**改进建议**：

- 引入 AI 驱动的视觉回归测试（如 Playwright 截图对比）
- 在验证循环中增加 mock 数据的运行时渲染检查
- 探索 AI 自动化 E2E 测试生成

**预期收益**：从"代码能编译"提升到"页面能渲染"的验证级别。

### 6.3 状态管理边界可更清晰

**现状**：ahooks useRequest（服务端状态）和 Zustand（客户端状态）的边界在复杂场景下可能模糊。

**改进建议**：

- 考虑引入 TanStack Query（React Query）替代 ahooks useRequest，获得更强的缓存和状态管理能力
- 在 .ai/core/architecture.md 中补充状态选择决策树：
  ```
  需要缓存/去重？ → TanStack Query
  需要跨组件共享？ → Zustand
  仅组件内部状态？ → useState
  ```

**预期收益**：AI 在生成代码时能更准确地选择状态管理方案。

### 6.4 组件库文档可增强

**现状**：sdesign 组件文档是静态 markdown，缺少交互式示例和反模式说明。

**改进建议**：

- 为 AI 提供更多"反模式"文档（什么不该做），减少幻觉
- 组件 Props 的类型定义可以直接从 .d.ts 生成，减少文档维护成本
- 增加常见错误用法的 ESLint 规则

**预期收益**：减少 AI 的"创造性"错误，文档维护成本降低。

### 6.5 CI/CD 集成

**现状**：验证仅在本地（Git Hooks + pnpm verify），没有 CI 管道。

**改进建议**：

- 在 GitHub Actions 中配置完整的验证流水线
- 增加 PR 自动化检查：type-check → lint → build
- 配置自动化部署和预览环境

**预期收益**：团队协作时代码质量有保障，AI 生成的代码也受 CI 约束。

### 6.6 性能监控缺失

**现状**：没有 Web Vitals 或性能监控集成，没有 Bundle 分析工具。

**改进建议**：

- 引入 rsbuild-bundle-analyzer 进行包体积分析
- 集成 Web Vitals 监控（LCP/FID/CLS）
- 在构建流程中增加包体积检查和性能基线

**预期收益**：及时发现性能退化，防止 AI 生成的代码引入性能问题。

### 6.7 错误监控和日志

**现状**：缺少前端错误监控（如 Sentry），缺少结构化日志系统。

**改进建议**：

- 引入 Sentry 或类似的错误监控服务
- 封装 ErrorBoundary 组件，统一错误处理和上报
- 建立结构化日志规范

**预期收益**：线上问题可追溯，AI 生成代码的问题能快速定位。

### 6.8 国际化准备

**现状**：当前未考虑 i18n 支持。

**改进建议**：

- 如有国际化需求，尽早引入 react-intl 或 i18next
- 在代码规范中增加文案硬编码的检查
- 为 AI 提供 i18n 模板

**预期收益**：避免后期大规模重构，AI 生成的代码天然支持多语言。

### 6.9 AI 知识库版本管理

**现状**：.ai/ 目录的变更缺少版本控制策略。

**改进建议**：

- 为 .ai/ 目录建立变更日志（CHANGELOG），追踪规范演进
- 考虑 .ai/ 目录的"快照"机制，方便回溯
- 重大规范变更时增加迁移指南

**预期收益**：规范演进有迹可循，新成员能理解"为什么这样规定"。

### 6.10 微前端/模块联邦预留

**现状**：如果项目规模增长，当前架构没有微前端的扩展预留。

**改进建议**：

- 评估 RSBuild 的 Module Federation 支持
- 预留模块边界，为未来拆分做准备
- 在 architecture.md 中增加扩展性说明

**预期收益**：项目规模增长时能平滑演进，不需要大规模重构。

---

## 七、总结

### 核心价值

这套架构的核心价值不是"简单的 AI 代码生成工具"，而是**完整的 AI 协作工程体系**。

传统的 AI 代码生成往往是一次性的：用户输入需求，AI 输出代码，用户手动检查和修改。这种模式的问题在于：

- AI 不理解项目特定的规范和约定
- 生成的代码质量参差不齐
- 每次生成都是"从零开始"，没有积累

本架构通过 SDD 流程、渐进式知识库、三级验证循环、纠错沉淀机制，构建了一个**可持续演进的 AI 协作系统**：

- AI 理解项目规范（.ai/ 知识库）
- AI 生成的代码质量可控（三级验证）
- 每次开发都让系统更"聪明"（纠错沉淀）

### 五大理念回顾

1. **规范即约束**：不靠自觉，靠工具链机械化强制
2. **文档即代码**：.ai/ 是 AI 执行的"源代码"
3. **约定即可预测**：固定目录/命名让 AI 无需搜索
4. **验证即保障**：三级验证循环，不信任一次生成
5. **增量即沉淀**：每次开发完善 AI 理解

### 适用场景

- **管理后台**：CRUD 为主的业务系统，本架构的主战场
- **中小型 SaaS**：功能模块相对独立，适合 Task 化开发
- **AI + 人工混合开发**：AI 负责模板化代码，人工负责复杂业务逻辑

### 未来方向

1. **测试体系完善**：引入 Vitest，将测试纳入 SDD 流程
2. **CI/CD 集成**：GitHub Actions 自动化验证和部署
3. **性能监控**：Web Vitals + Bundle 分析，防止性能退化
4. **知识库增强**：更多反模式文档，更智能的触发机制

---

> 本文档基于 AI-Admin-Pro 项目实践，持续迭代中。欢迎反馈和讨论。
