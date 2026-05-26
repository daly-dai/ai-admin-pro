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

**类型**: api | page-list | page-form | page-detail | component | store | refactor | page-dashboard | page-workflow | page-landing | component-chart | component-widget | data-transform | page-custom

**描述**:

<!-- 具体要做的事情，1-3 句话 -->

**前置条件**:

<!-- 是否依赖其他 Task，如「Task 2」 -->

**输出锁**:

<!-- 从 .ai/conventions/task-gates.md 按Task类型取默认值，替换{module}为实际模块名 -->
<!-- 本Task只允许操作这些文件。超出范围必须先向用户确认。范围外pnpm verify报错一律忽略 -->

- src/api/{module}/types.ts (新建)
- src/api/{module}/index.ts (新建)

**验收闸门**:

<!-- 从 .ai/conventions/task-gates.md 按Task类型取默认值，保留checklist格式 -->
<!-- 逐条通过才算Task完成 -->

- [ ] Entity + Query + FormData 类型定义完整
- [ ] API 方法名带 HTTP 后缀
- [ ] 全局闸门 G1-G12 全部通过（见 task-gates.md 一、1.2）
- [ ] pnpm verify 0 error（仅本Task输出锁内文件，范围外报错忽略）

**AI 必读文档**:

<!-- 根据Task类型选择必读文档（不可跳过） -->

- [ ] .ai/templates/api-module.md
- [ ] .ai/conventions/api-conventions.md

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

| 类型             | 说明                      | 典型场景             |
| ---------------- | ------------------------- | -------------------- |
| api              | API 模块（types + index） | 新增业务模块         |
| page-list        | CRUD 列表页               | 数据管理页面         |
| page-form        | 新增/编辑表单页           | 创建、修改操作       |
| page-detail      | 详情展示页                | 数据详情查看         |
| component        | 业务组件                  | 可复用的业务组件     |
| store            | Zustand 状态管理          | 跨页面状态共享       |
| refactor         | 重构                      | 优化现有代码         |
| page-dashboard   | 大屏/仪表盘页面           | 数据大屏、实时监控   |
| page-workflow    | 工作流页面                | 审批流、工单处理     |
| page-landing     | 落地/门户页面             | 首页、导航门户       |
| component-chart  | 图表组件                  | ECharts 封装、指标卡 |
| component-widget | 大屏小组件                | StatCard、进度环     |
| data-transform   | 数据转换层                | 后端数据→图表格式    |
| page-custom      | 自定义页面（兜底）        | 非标准页面类型       |

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

**输出锁**:

- src/api/theme/types.ts (新建)
- src/api/theme/index.ts (新建)

**验收闸门**:

- [ ] Theme 接口定义完整（id, name, parentId, level, status, sort, description, createTime）
- [ ] ThemeQuery extends PageQuery，支持按名称搜索、按状态筛选
- [ ] themeApi 对象使用 createRequest 创建，方法名带 HTTP 后缀
- [ ] 全局闸门 G1-G12 全部通过（见 task-gates.md）
- [ ] pnpm verify 0 error（仅本Task输出锁内文件，范围外报错忽略）

**AI 必读文档**:

- [ ] .ai/templates/api-module.md
- [ ] .ai/conventions/api-conventions.md

### Task 2: 主题列表页

**类型**: page-list

**描述**:
创建主题管理列表页，支持搜索和分页。

**前置条件**: Task 1

**输出锁**:

- src/pages/theme/index.tsx (新建)

**验收闸门**:

- [ ] 使用 SSearchTable（非 antd Table），columns 和 searchItems 显式类型注解
- [ ] 枚举列通过 dictKey 指定字典编码，不硬编码 options
- [ ] 操作列使用 SButton（actionType 预设），删除用 Modal.confirm
- [ ] 新增/编辑弹层使用 createModal 工厂函数
- [ ] 分页配置 paginationFields 用 current（非 pageNum）
- [ ] 全局闸门 G1-G12 全部通过
- [ ] pnpm verify 0 error（仅本Task输出锁内文件，范围外报错忽略）

**AI 必读文档**:

- [ ] .ai/templates/crud-page.md
- [ ] .ai/sdesign/components/SSearchTable.md
- [ ] .ai/sdesign/components/SButton.md

### Task 3: 主题新增/编辑表单

**类型**: page-form

**描述**:
创建主题新增和编辑表单页，支持选择上级主题。

**前置条件**: Task 1

**输出锁**:

- src/pages/theme/components/ThemeFormModal.tsx (新建)

**验收闸门**:

- [ ] 使用 createModal 工厂函数，open(params) 传入 id
- [ ] 使用 SForm（非 antd Form），formItems 显式类型注解
- [ ] 上级主题使用 treeSelect，下拉框通过 fieldProps.dictKey 指定字典
- [ ] 提交按钮 actionType="save"（非 "submit"）
- [ ] 编辑模式正确回填数据，新增模式表单清空
- [ ] 全局闸门 G1-G12 全部通过
- [ ] pnpm verify 0 error（仅本Task输出锁内文件，范围外报错忽略）

**AI 必读文档**:

- [ ] .ai/templates/form-page.md
- [ ] .ai/sdesign/components/SForm.md

### Task 4: 主题详情页

**类型**: page-detail

**描述**:
创建主题详情展示页。

**前置条件**: Task 1

**输出锁**:

- src/pages/theme/components/ThemeDetailDrawer.tsx (新建)

**验收闸门**:

- [ ] 使用 createDrawer 工厂函数
- [ ] 使用 SDetail（非 antd Descriptions），items 显式类型注解
- [ ] 枚举字段渲染类型为 dict
- [ ] 分组使用 SDetail.Group + items（非 groupItems）
- [ ] 无 loading prop（用 Spin 包裹）
- [ ] 全局闸门 G1-G12 全部通过
- [ ] pnpm verify 0 error（仅本Task输出锁内文件，范围外报错忽略）

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
