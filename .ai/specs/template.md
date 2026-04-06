# 需求拆解模板

> 将需求拆解为独立、可验证、边界清晰的执行单元（Task）

## 使用说明

1. 复制本模板到 specs/[feature-name]/spec.md
2. 填写需求背景和 Task 拆解
3. 每个 Task 开发完成后，在 progress.md 中勾选

---

## 模板

`markdown

# [功能名称]

> [一句话描述这个功能要解决什么问题]

## 背景

<!-- 为什么要做这个功能？用户/业务的痛点是什么？ -->
<!-- 如果有原型图、接口文档链接，放在这里 -->

## 需求概要

<!-- 用 3-5 句话描述核心需求 -->
<!-- 不要写实现细节，只写「做什么」和「做到什么程度」 -->

## Task 拆解

> 每个 Task 必须满足：
>
> - **独立可执行**：不依赖其他 Task 的代码（依赖关系需声明）
> - **可验证**：有明确的完成标准
> - **边界清晰**：范围明确，不模糊

### Task 1: [Task 标题]

**类型**: api | page-list | page-form | page-detail | component | store |
efactor

**描述**:

<!-- 具体要做的事情，1-3 句话 -->

**前置条件**:

<!-- 是否依赖其他 Task，如「Task 2」 -->

**文件清单**:

<!-- 预期会创建/修改的文件 -->

- src/api/[module]/types.ts (新建)
- src/api/[module]/index.ts (新建)
- src/pages/[module]/index.tsx (新建)

**完成标准**:

<!-- 什么情况下算完成？逐条列出 -->

- [ ] 类型定义完整，字段与接口文档一致
- [ ] API 对象导出，5 个标准方法齐全
- [ ] 列表页渲染正常，搜索/分页可用
- [ ] pnpm verify 通过

**AI 必读文档**:

<!-- 根据类型选择必读文档（不可跳过） -->

- [ ] .ai/templates/api-module.md
- [ ] .ai/templates/crud-page.md
- [ ] .ai/sdesign/components/SSearchTable.md

**关键决策**:

<!-- Task 执行中做出的重要技术决策，防止后续会话"纠正"回错误写法 -->
<!-- 格式：决策点 | 选择方案 | 原因 -->
<!-- 示例：API 签名偏离 | getList 用 POST | 后端要求复杂查询条件走 body -->

### Task 2: [Task 标题]

（同上格式）

---

## 验证计划

> 拆解完成后，在这里定义整体验证方案

| 验证层级 | 验证方式         | 覆盖范围  |
| -------- | ---------------- | --------- |
| 代码级   | pnpm verify      | 所有 Task |
| 功能级   | 页面交互测试     | 所有 Task |
| 业务级   | 对照需求逐条检查 | 整个功能  |

## 风险与备注

<!-- 开发过程中发现的额外需求、技术风险、待确认项 -->

`

## Task 类型说明

| 类型        | 说明                      | 典型场景         |
| ----------- | ------------------------- | ---------------- |
| api         | API 模块（types + index） | 新增业务模块     |
| page-list   | CRUD 列表页               | 数据管理页面     |
| page-form   | 新增/编辑表单页           | 创建、修改操作   |
| page-detail | 详情展示页                | 数据详情查看     |
| component   | 业务组件                  | 可复用的业务组件 |
| store       | Zustand 状态管理          | 跨页面状态共享   |

|
efactor | 重构 | 优化现有代码 |

## 拆解原则

1. **一个 Task 对应一个明确的交付物**（一个页面、一个 API 模块、一个组件）
2. **粒度适中**：太大无法验证，太小浪费拆解时间
   - ✅ 「创建需求列表页」— 一个完整页面
   - ❌ 「做前端」— 太模糊
   - ❌ 「写第三行的 CSS」— 太细
3. **先数据后展示**：API 模块 → 列表页 → 表单页 → 详情页
4. **依赖声明**：Task B 依赖 Task A 的代码，必须在「前置条件」中写明
5. **不跨模块**：一个 Task 不要同时涉及两个不相关的业务模块

## 示例：数据主题管理

<details>
<summary>点击展开完整示例</summary>

`markdown

# 数据主题管理

> 为数据治理平台提供数据主题域的增删改查能力

## 背景

数据开发团队需要按业务主题组织数据资产，当前缺乏统一的主题管理入口。

## 需求概要

提供数据主题域的管理功能，包括主题的新增、编辑、删除、启用/停用。
支持主题层级结构（一级主题 → 二级主题）。

## Task 拆解

### Task 1: 主题 API 模块

**类型**: api

**描述**:
创建主题管理的 API 模块，定义数据类型和接口方法。

**前置条件**: 无

**文件清单**:

- src/api/theme/types.ts (新建)
- src/api/theme/index.ts (新建)

**完成标准**:

- [ ] Theme 接口定义完整（id, name, parentId, level, status, sort, description, createTime）
- [ ] ThemeQuery 支持按名称搜索、按状态筛选
- [ ] themeApi 对象导出 getList/getById/create/update/delete
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/api-module.md
- [ ] .ai/conventions/api-conventions.md

### Task 2: 主题列表页

**类型**: page-list

**描述**:
创建主题管理列表页，支持搜索和分页。

**前置条件**: Task 1

**文件清单**:

- src/pages/theme/index.tsx (新建)
- src/router/routes/theme.tsx (新建/修改)

**完成标准**:

- [ ] SSearchTable 渲染正常，展示主题名称、层级、状态、创建时间
- [ ] 支持按名称搜索
- [ ] 支持按状态筛选
- [ ] 操作列：编辑、删除、启用/停用
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/crud-page.md
- [ ] .ai/sdesign/components/SSearchTable.md
- [ ] .ai/sdesign/components/SButton.md

### Task 3: 主题新增/编辑表单

**类型**: page-form

**描述**:
创建主题新增和编辑表单页，支持选择上级主题。

**前置条件**: Task 1

**文件清单**:

- src/pages/theme/components/ThemeForm.tsx (新建)
- src/pages/theme/create.tsx (新建)
- src/pages/theme/edit.tsx (新建)

**完成标准**:

- [ ] SForm 包含：主题名称、上级主题（树形选择）、排序号、描述
- [ ] 主题名称必填校验
- [ ] 编辑模式回填数据
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/form-page.md
- [ ] .ai/sdesign/components/SForm.md

### Task 4: 主题详情页

**类型**: page-detail

**描述**:
创建主题详情展示页。

**前置条件**: Task 1

**文件清单**:

- src/pages/theme/components/ThemeDetail.tsx (新建)

**完成标准**:

- [ ] SDetail 展示所有字段，分 2 列布局
- [ ] 状态字段使用 Tag 展示
- [ ] pnpm verify 通过

**AI 必读文档**:

- [ ] .ai/templates/detail-page.md
- [ ] .ai/sdesign/components/SDetail.md

## 验证计划

| 验证层级 | 验证方式                                   | 覆盖范围 |
| -------- | ------------------------------------------ | -------- |
| 代码级   | pnpm verify                                | Task 1-4 |
| 功能级   | 启动开发服务器，逐页测试交互               | Task 2-4 |
| 业务级   | 对照需求检查：增删改查、搜索筛选、层级关系 | 整个功能 |

`

</details>
