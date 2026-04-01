# 数据管理平台 - 项目规划文档

> 基于修订版需求规格书，覆盖页面规划、接口规划、数据库表设计三大部分。
> 技术栈：React 18 + TypeScript 5 + @dalydb/sdesign + antd 5 + Zustand + Rsbuild

---

# 第一部分：页面规划

## 1.1 整体信息架构

```
数据管理平台
├── 登录 /login
├── 主布局 /（MainLayout + 侧边栏 + 顶栏）
│   ├── 个人工作台 /dashboard
│   ├── 项目管理 /project
│   │   ├── 项目列表 /project/list
│   │   ├── 项目创建 /project/create
│   │   ├── 项目详情 /project/:id
│   │   └── 项目编辑 /project/:id/edit
│   ├── 数据资产 /asset
│   │   ├── 主题管理 /asset/theme
│   │   ├── 口径管理 /asset/caliber
│   │   ├── 口径详情 /asset/caliber/:id
│   │   ├── 口径版本对比 /asset/caliber/:id/compare
│   │   ├── 要素管理 /asset/element
│   │   ├── 口径台账 /asset/ledger
│   │   └── 数据血缘 /asset/lineage
│   ├── 数据看板 /dashboard-board
│   │   ├── 项目进度看板 /dashboard-board/project
│   │   ├── 口径资产概览 /dashboard-board/asset
│   │   └── 口径质量报告 /dashboard-board/quality
│   ├── 系统管理 /system
│   │   ├── 用户管理 /system/user
│   │   ├── 角色管理 /system/role
│   │   ├── 开发组管理 /system/team
│   │   ├── 数据权限 /system/data-permission
│   │   ├── 操作日志 /system/log
│   │   └── 数据导入 /system/import
│   ├── 通知中心 /notification
│   └── 个人设置 /profile
└── 404 /404
```

## 1.2 完整页面清单（35 个页面）

### A. 个人工作台（1 个页面）

| 页面       | 路由       | 交互模式 | 核心组件                                  | 说明                       |
| ---------- | ---------- | -------- | ----------------------------------------- | -------------------------- |
| 个人工作台 | /dashboard | 独立页面 | 统计卡片 + 待办列表 + 项目列表 + 动态列表 | 登录后首页，汇总待处理事项 |

**页面区块**：

- 统计卡片行：待我处理数、我参与的项目数、本月完成任务数
- 待我处理（Tab 切换）：待澄清口径 / 待审核技术口径 / 待审批技术口径 / 待验收项目 / 待重新评估
- 我参与的项目列表：最近 10 个项目，显示状态和进度
- 最近动态时间线：最近 20 条操作记录

### B. 项目管理（4 个页面）

| 页面     | 路由              | 交互模式             | 核心组件       | 说明                                        |
| -------- | ----------------- | -------------------- | -------------- | ------------------------------------------- |
| 项目列表 | /project/list     | 独立页面             | SSearchTable   | 支持按名称/状态/部门/时间检索               |
| 项目创建 | /project/create   | 独立页面（分步表单） | SForm + 步骤条 | 分 3 步：基本信息 → 关联口径 → 提交业务口径 |
| 项目详情 | /project/:id      | 独立页面（Tab 切换） | Tab + 各子面板 | 项目全貌，6 个 Tab 页                       |
| 项目编辑 | /project/:id/edit | 独立页面             | SForm          | 编辑基本信息和关联口径                      |

**项目详情的 6 个 Tab 页**：

1. **概览**：基本信息 + 项目状态流程图 + 关联口径列表 + 项目角色
2. **业务口径**：按口径分组展示业务口径列表，每个可展开查看详情/修改
3. **技术口径**：按口径分组展示技术口径列表，每个可展开查看状态/审核记录/问题列表
4. **审核审批**：技术口径的审核/审批进度看板（卡片式：审核中 → 待审批 → 已通过）
5. **验收记录**：各口径的验收结果列表
6. **评论区**：项目级别评论，支持 @成员、上传附件

**项目创建分步表单**：

- 步骤 1：项目基本信息（名称、部门、描述、期望上线时间）+ 指定项目负责人、项目开发负责人
- 步骤 2：选择关联口径（勾选表，显示锁定状态），为每个口径标记开发类型（需技术开发 / 仅业务口径调整）
- 步骤 3：为每个关联口径填写初始业务口径（业务规则 + 要素需求）

### C. 数据资产管理（7 个页面）

| 页面         | 路由                       | 交互模式             | 核心组件                    | 说明                       |
| ------------ | -------------------------- | -------------------- | --------------------------- | -------------------------- |
| 主题管理     | /asset/theme               | 列表 + Modal         | SSearchTable + Modal(SForm) | 字段少，用 Modal 新增/编辑 |
| 口径管理     | /asset/caliber             | 列表页               | SSearchTable                | 口径列表，支持多维度检索   |
| 口径详情     | /asset/caliber/:id         | 独立页面（Tab 切换） | Tab + 各子面板              | 口径全貌                   |
| 口径版本对比 | /asset/caliber/:id/compare | 独立页面             | Diff 对比面板               | 双栏对比要素变更           |
| 要素管理     | /asset/element             | 列表页               | SSearchTable                | 全局要素检索               |
| 口径台账     | /asset/ledger              | 列表页               | SSearchTable                | 核心查询页面，汇总信息     |
| 数据血缘     | /asset/lineage             | 独立页面             | 关系图谱组件                | 口径上下游关系可视化       |

**口径详情的 5 个 Tab 页**：

1. **基本信息**：SDetail 展示口径属性、标签、责任人、锁定状态
2. **要素列表**：当前版本的要素表格（STable）
3. **版本历史**：版本时间线，每个版本可展开查看关联的业务口径、技术口径
4. **关联项目**：参与过该口径的所有项目列表
5. **影响分析**：上下游血缘关系 + 引用该口径的技术口径列表

### D. 业务口径子页面（内嵌在项目详情中）

| 组件         | 位置          | 交互模式 | 说明                                       |
| ------------ | ------------- | -------- | ------------------------------------------ |
| 业务口径编辑 | 项目详情 Tab2 | Drawer   | 编辑业务规则、要素需求，提交后版本自动递增 |
| 业务口径详情 | 项目详情 Tab2 | 展开面板 | 查看业务口径完整信息                       |

### E. 技术口径子页面（内嵌在项目详情中）

| 组件             | 位置          | 交互模式     | 说明                                            |
| ---------------- | ------------- | ------------ | ----------------------------------------------- |
| 技术口径编辑     | 项目详情 Tab3 | Drawer（宽） | 编辑 SQL 代码、数据来源、加工规则，支持代码高亮 |
| 技术口径详情     | 项目详情 Tab3 | 展开面板     | 查看技术实现、审核记录、问题列表                |
| 技术口径审核     | 项目详情 Tab3 | 内嵌面板     | 组内成员查看技术口径，提出/修复/驳回问题        |
| 技术口径审批     | 项目详情 Tab4 | 内嵌面板     | 组长审批操作（通过/驳回）                       |
| 技术口径版本对比 | 项目详情 Tab3 | Modal（宽）  | 对比技术口径不同版本的变更差异                  |

### F. 数据看板（3 个页面）

| 页面         | 路由                     | 核心组件        | 说明                             |
| ------------ | ------------------------ | --------------- | -------------------------------- |
| 项目进度看板 | /dashboard-board/project | 统计图表 + 列表 | 项目状态分布、逾期预警、趋势图   |
| 口径资产概览 | /dashboard-board/asset   | 统计图表        | 资产统计、版本变更趋势、主题分布 |
| 口径质量报告 | /dashboard-board/quality | 指标卡片 + 图表 | 完整度、覆盖率、活跃度           |

### G. 系统管理（6 个页面）

| 页面       | 路由                    | 交互模式      | 核心组件                    | 说明                |
| ---------- | ----------------------- | ------------- | --------------------------- | ------------------- |
| 用户管理   | /system/user            | 列表 + Modal  | SSearchTable + Modal(SForm) | CRUD 用户           |
| 角色管理   | /system/role            | 列表 + Drawer | SSearchTable + Drawer       | 角色 + 权限树配置   |
| 开发组管理 | /system/team            | 列表 + Modal  | SSearchTable + Modal(SForm) | 团队 + 成员管理     |
| 数据权限   | /system/data-permission | 配置面板      | 角色选择 + 权限树           | 按主题/部门配置     |
| 操作日志   | /system/log             | 列表页        | SSearchTable                | 只读，多维度检索    |
| 数据导入   | /system/import          | 独立页面      | 上传组件 + 结果列表         | 模板下载 + 批量导入 |

### H. 通知与个人设置（2 个页面）

| 页面     | 路由          | 核心组件     | 说明                                |
| -------- | ------------- | ------------ | ----------------------------------- |
| 通知中心 | /notification | SSearchTable | 站内消息列表，支持标记已读/全部已读 |
| 个人设置 | /profile      | SForm        | 修改密码、通知偏好设置              |

## 1.3 前端目录结构规划

```
src/
├── api/
│   ├── auth/           # 认证
│   ├── user/           # 用户管理
│   ├── role/           # 角色管理
│   ├── team/           # 开发组管理
│   ├── permission/     # 权限管理
│   ├── theme/          # 主题管理
│   ├── caliber/        # 口径管理
│   ├── element/        # 要素管理
│   ├── project/        # 项目管理
│   ├── business-caliber/  # 业务口径
│   ├── technical-caliber/ # 技术口径
│   ├── review/         # 审核管理
│   ├── approval/       # 审批管理
│   ├── acceptance/     # 验收管理
│   ├── comment/        # 评论协作
│   ├── notification/   # 通知管理
│   ├── log/            # 操作日志
│   ├── import/         # 数据导入
│   └── dashboard/      # 看板数据
│
├── pages/
│   ├── login/
│   ├── home/           # → 重命名为 dashboard（个人工作台）
│   ├── project/
│   │   ├── list/
│   │   ├── create/
│   │   ├── detail/
│   │   │   ├── index.tsx
│   │   │   ├── components/
│   │   │   │   ├── OverviewTab.tsx
│   │   │   │   ├── BusinessCaliberTab.tsx
│   │   │   │   ├── TechnicalCaliberTab.tsx
│   │   │   │   ├── ReviewApprovalTab.tsx
│   │   │   │   ├── AcceptanceTab.tsx
│   │   │   │   └── CommentTab.tsx
│   │   │   └── hooks/
│   │   └── edit/
│   ├── asset/
│   │   ├── theme/
│   │   ├── caliber/
│   │   │   ├── list/
│   │   │   ├── detail/
│   │   │   └── compare/
│   │   ├── element/
│   │   ├── ledger/
│   │   └── lineage/
│   ├── dashboard-board/
│   │   ├── project/
│   │   ├── asset/
│   │   └── quality/
│   ├── system/
│   │   ├── user/
│   │   ├── role/
│   │   ├── team/
│   │   ├── data-permission/
│   │   ├── log/
│   │   └── import/
│   ├── notification/
│   ├── profile/
│   └── error/
│
├── components/
│   └── business/
│       ├── CaliberPicker/       # 口径选择器（项目创建用）
│       ├── VersionTimeline/     # 版本时间线组件
│       ├── VersionCompare/      # 版本对比面板
│       ├── ElementTable/        # 要素表格（可编辑模式）
│       ├── BusinessCaliberForm/ # 业务口径编辑表单
│       ├── TechnicalCaliberEditor/ # 技术口径编辑器（含代码高亮）
│       ├── IssueList/           # 问题列表组件
│       ├── ReviewPanel/         # 审核面板
│       ├── ApprovalPanel/       # 审批面板
│       ├── CommentSection/      # 评论区组件
│       ├── StatusFlow/          # 状态流程条
│       ├── LineageGraph/        # 血缘关系图谱
│       └── TagManager/          # 标签管理组件
│
├── stores/
│   ├── app.ts
│   ├── user.ts
│   └── project.ts       # 项目详情页共享状态
```

---

# 第二部分：接口规划

## 2.1 接口命名规范

- 基础路径: `/api`
- RESTful 风格: `GET /api/{module}` (列表), `GET /api/{module}/{id}` (详情)
- 非 CRUD 操作: `POST /api/{module}/{id}/{action}` (如 submit, approve)
- 分页参数: `{ current, pageSize }` → 返回 `{ list, total, current, pageSize }`

## 2.2 全量接口清单（约 90 个接口）

### 模块 1：认证（3 个）

| #   | 方法 | 路径                   | 说明             | 请求参数               | 响应                |
| --- | ---- | ---------------------- | ---------------- | ---------------------- | ------------------- |
| 1   | POST | /api/auth/login        | 登录             | { username, password } | { token, userInfo } |
| 2   | POST | /api/auth/logout       | 登出             | -                      | -                   |
| 3   | GET  | /api/auth/current-user | 获取当前用户信息 | -                      | User                |

### 模块 2：用户管理（5 个）

| #   | 方法   | 路径           | 说明                    |
| --- | ------ | -------------- | ----------------------- |
| 4   | GET    | /api/users     | 用户列表（分页 + 检索） |
| 5   | GET    | /api/users/:id | 用户详情                |
| 6   | POST   | /api/users     | 创建用户                |
| 7   | PUT    | /api/users/:id | 更新用户                |
| 8   | DELETE | /api/users/:id | 删除用户                |

### 模块 3：角色管理（6 个）

| #   | 方法   | 路径                       | 说明                   |
| --- | ------ | -------------------------- | ---------------------- |
| 9   | GET    | /api/roles                 | 角色列表               |
| 10  | GET    | /api/roles/:id             | 角色详情（含权限列表） |
| 11  | POST   | /api/roles                 | 创建角色               |
| 12  | PUT    | /api/roles/:id             | 更新角色               |
| 13  | DELETE | /api/roles/:id             | 删除角色               |
| 14  | PUT    | /api/roles/:id/permissions | 配置角色权限           |

### 模块 4：权限管理（2 个）

| #   | 方法 | 路径                  | 说明         |
| --- | ---- | --------------------- | ------------ |
| 15  | GET  | /api/permissions      | 权限树       |
| 16  | GET  | /api/permissions/flat | 权限平铺列表 |

### 模块 5：开发组管理（6 个）

| #   | 方法   | 路径                   | 说明               |
| --- | ------ | ---------------------- | ------------------ |
| 17  | GET    | /api/teams             | 团队列表           |
| 18  | GET    | /api/teams/:id         | 团队详情（含成员） |
| 19  | POST   | /api/teams             | 创建团队           |
| 20  | PUT    | /api/teams/:id         | 更新团队           |
| 21  | DELETE | /api/teams/:id         | 删除团队           |
| 22  | PUT    | /api/teams/:id/members | 管理团队成员       |

### 模块 6：数据权限（3 个）

| #   | 方法 | 路径                          | 说明                 |
| --- | ---- | ----------------------------- | -------------------- |
| 23  | GET  | /api/data-permissions/:roleId | 查询角色数据权限     |
| 24  | PUT  | /api/data-permissions/:roleId | 配置角色数据权限     |
| 25  | GET  | /api/departments              | 部门列表（下拉选项） |

### 模块 7：主题管理（5 个）

| #   | 方法   | 路径            | 说明                       |
| --- | ------ | --------------- | -------------------------- |
| 26  | GET    | /api/themes     | 主题列表（分页 + 检索）    |
| 27  | GET    | /api/themes/:id | 主题详情                   |
| 28  | POST   | /api/themes     | 创建主题                   |
| 29  | PUT    | /api/themes/:id | 更新主题                   |
| 30  | DELETE | /api/themes/:id | 删除主题（校验无关联口径） |

### 模块 8：口径管理（12 个）

| #   | 方法 | 路径                                  | 说明                                     |
| --- | ---- | ------------------------------------- | ---------------------------------------- |
| 31  | GET  | /api/calibers                         | 口径列表（分页 + 多维度检索 + 全文搜索） |
| 32  | GET  | /api/calibers/:id                     | 口径详情                                 |
| 33  | POST | /api/calibers                         | 创建口径                                 |
| 34  | PUT  | /api/calibers/:id                     | 更新口径（基本信息 + 标签）              |
| 35  | POST | /api/calibers/:id/deprecate           | 发起口径废弃（需管理员审批）             |
| 36  | GET  | /api/calibers/:id/versions            | 口径版本列表                             |
| 37  | GET  | /api/calibers/:id/versions/:versionId | 版本详情（含要素快照）                   |
| 38  | GET  | /api/calibers/:id/compare             | 版本对比 query: { versionA, versionB }   |
| 39  | GET  | /api/calibers/:id/projects            | 关联项目列表                             |
| 40  | GET  | /api/calibers/:id/lineage             | 血缘关系（上下游）                       |
| 41  | GET  | /api/calibers/:id/impact              | 影响分析                                 |
| 42  | GET  | /api/calibers/ledger                  | 口径台账（全量汇总查询）                 |

### 模块 9：要素管理（6 个）

| #   | 方法 | 路径                       | 说明                    |
| --- | ---- | -------------------------- | ----------------------- |
| 43  | GET  | /api/elements              | 要素列表（分页 + 检索） |
| 44  | GET  | /api/elements/:id          | 要素详情                |
| 45  | GET  | /api/elements/:id/changes  | 要素变更记录            |
| 46  | GET  | /api/elements/:id/versions | 要素在各版本中的状态    |
| 47  | POST | /api/elements/import       | 批量导入要素            |
| 48  | GET  | /api/elements/export       | 批量导出要素            |

### 模块 10：项目管理（14 个）

| #   | 方法   | 路径                                    | 说明                                  |
| --- | ------ | --------------------------------------- | ------------------------------------- |
| 49  | GET    | /api/projects                           | 项目列表（分页 + 检索）               |
| 50  | GET    | /api/projects/:id                       | 项目详情                              |
| 51  | POST   | /api/projects                           | 创建项目（含关联口径 + 初始业务口径） |
| 52  | PUT    | /api/projects/:id                       | 更新项目基本信息                      |
| 53  | POST   | /api/projects/:id/calibers              | 追加关联口径                          |
| 54  | DELETE | /api/projects/:id/calibers/:caliberId   | 移除关联口径（释放锁定）              |
| 55  | POST   | /api/projects/:id/confirm-clarification | 确认澄清完成 → 开发中                 |
| 56  | POST   | /api/projects/:id/submit-acceptance     | 提交验收 → 待验收                     |
| 57  | POST   | /api/projects/:id/confirm-acceptance    | 确认验收通过 → 待上线                 |
| 58  | POST   | /api/projects/:id/launch                | 执行上线 → 已上线                     |
| 59  | POST   | /api/projects/:id/pause                 | 暂停项目                              |
| 60  | POST   | /api/projects/:id/resume                | 恢复项目                              |
| 61  | POST   | /api/projects/:id/cancel                | 发起取消申请                          |
| 62  | POST   | /api/projects/:id/approve-cancel        | 审批取消申请（管理员）                |

### 模块 11：业务口径（5 个）

| #   | 方法 | 路径                               | 说明                                |
| --- | ---- | ---------------------------------- | ----------------------------------- |
| 63  | GET  | /api/business-calibers             | 业务口径列表（按项目/口径筛选）     |
| 64  | GET  | /api/business-calibers/:id         | 业务口径详情                        |
| 65  | POST | /api/business-calibers             | 提交业务口径                        |
| 66  | PUT  | /api/business-calibers/:id         | 修改业务口径（版本递增 + 影响检测） |
| 67  | POST | /api/business-calibers/:id/clarify | 标记为已澄清                        |

### 模块 12：技术口径（10 个）

| #   | 方法 | 路径                                          | 说明                                             |
| --- | ---- | --------------------------------------------- | ------------------------------------------------ |
| 68  | GET  | /api/technical-calibers                       | 技术口径列表                                     |
| 69  | GET  | /api/technical-calibers/:id                   | 技术口径详情（含审核记录 + 问题列表 + 审批记录） |
| 70  | POST | /api/technical-calibers                       | 创建技术口径                                     |
| 71  | PUT  | /api/technical-calibers/:id                   | 修改技术口径                                     |
| 72  | POST | /api/technical-calibers/:id/submit-review     | 提交审核 → 审核中                                |
| 73  | POST | /api/technical-calibers/:id/submit-approval   | 提交审批 → 待审批                                |
| 74  | POST | /api/technical-calibers/:id/confirm-no-impact | 确认无需修改（待重新评估 → 审批通过）            |
| 75  | POST | /api/technical-calibers/:id/preview-ready     | 标记预览数据已就绪                               |
| 76  | GET  | /api/technical-calibers/:id/compare           | 技术口径版本对比                                 |
| 77  | GET  | /api/technical-calibers/:id/impact            | 业务口径变更影响分析                             |

### 模块 13：审核管理（3 个）

| #   | 方法 | 路径                | 说明                           |
| --- | ---- | ------------------- | ------------------------------ |
| 78  | POST | /api/review-records | 提交审核意见                   |
| 79  | GET  | /api/review-records | 审核记录列表（按技术口径筛选） |
| 80  | GET  | /api/caliber-issues | 问题列表（按技术口径筛选）     |

### 模块 14：问题管理（4 个）

| #   | 方法 | 路径                           | 说明         |
| --- | ---- | ------------------------------ | ------------ |
| 81  | POST | /api/caliber-issues            | 提出问题     |
| 82  | PUT  | /api/caliber-issues/:id/fix    | 修复问题     |
| 83  | PUT  | /api/caliber-issues/:id/reject | 驳回问题     |
| 84  | PUT  | /api/caliber-issues/:id/reopen | 重新打开问题 |

### 模块 15：审批管理（4 个）

| #   | 方法 | 路径                      | 说明         |
| --- | ---- | ------------------------- | ------------ |
| 85  | POST | /api/approvals/approve    | 审批通过     |
| 86  | POST | /api/approvals/reject     | 审批驳回     |
| 87  | POST | /api/approval-delegations | 创建审批委托 |
| 88  | GET  | /api/approval-delegations | 审批委托列表 |

### 模块 16：验收管理（2 个）

| #   | 方法 | 路径                    | 说明         |
| --- | ---- | ----------------------- | ------------ |
| 89  | POST | /api/acceptance-records | 提交验收结果 |
| 90  | GET  | /api/acceptance-records | 验收记录列表 |

### 模块 17：评论协作（4 个）

| #   | 方法 | 路径                          | 说明                                   |
| --- | ---- | ----------------------------- | -------------------------------------- |
| 91  | GET  | /api/comments                 | 评论列表（按 target_type + target_id） |
| 92  | POST | /api/comments                 | 发表评论（含 @成员）                   |
| 93  | POST | /api/comments/:id/hide        | 隐藏评论（管理员）                     |
| 94  | POST | /api/comments/:id/attachments | 上传评论附件                           |

### 模块 18：通知管理（4 个）

| #   | 方法 | 路径                            | 说明                                 |
| --- | ---- | ------------------------------- | ------------------------------------ |
| 95  | GET  | /api/notifications              | 通知列表（分页 + 筛选类型/已读状态） |
| 96  | PUT  | /api/notifications/:id/read     | 标记单条已读                         |
| 97  | PUT  | /api/notifications/read-all     | 标记全部已读                         |
| 98  | GET  | /api/notifications/unread-count | 未读通知数量（顶栏徽标）             |

### 模块 19：操作日志（1 个）

| #   | 方法 | 路径                | 说明                              |
| --- | ---- | ------------------- | --------------------------------- |
| 99  | GET  | /api/operation-logs | 操作日志列表（分页 + 多维度检索） |

### 模块 20：数据导入（4 个）

| #   | 方法 | 路径                  | 说明                   |
| --- | ---- | --------------------- | ---------------------- |
| 100 | GET  | /api/imports/template | 下载导入模板           |
| 101 | POST | /api/imports          | 执行导入               |
| 102 | GET  | /api/imports          | 导入记录列表           |
| 103 | GET  | /api/imports/:id      | 导入详情（含错误明细） |

### 模块 21：看板数据（6 个）

| #   | 方法 | 路径                             | 说明           |
| --- | ---- | -------------------------------- | -------------- |
| 104 | GET  | /api/dashboard/my-todos          | 个人待处理事项 |
| 105 | GET  | /api/dashboard/my-projects       | 我参与的项目   |
| 106 | GET  | /api/dashboard/recent-activities | 最近动态       |
| 107 | GET  | /api/dashboard/project-stats     | 项目进度统计   |
| 108 | GET  | /api/dashboard/asset-stats       | 口径资产统计   |
| 109 | GET  | /api/dashboard/quality-stats     | 口径质量统计   |

### 模块 22：个人设置（2 个）

| #   | 方法 | 路径                                  | 说明         |
| --- | ---- | ------------------------------------- | ------------ |
| 110 | PUT  | /api/profile/password                 | 修改密码     |
| 111 | PUT  | /api/profile/notification-preferences | 更新通知偏好 |

---

# 第三部分：数据库表设计

> 基于现有 `docs/database/schema.sql`（29 张表）进行修订增量。以下仅列出**新增表**和**需修改的字段**，未修改的表保持原样。

## 3.1 修订增量汇总

| 类型 | 表名                        | 修订内容                                       |
| ---- | --------------------------- | ---------------------------------------------- |
| 修改 | prj_project                 | 新增暂停/取消状态字段                          |
| 修改 | prj_project_caliber         | 新增开发类型标记                               |
| 修改 | prj_business_caliber        | 状态值调整                                     |
| 修改 | prj_technical_caliber       | 新增待重新评估状态、预览数据字段、数据来源字段 |
| 修改 | prj_acceptance_record       | 新增驳回类型字段                               |
| 修改 | dat_caliber_version         | 新增版本状态字段                               |
| 新增 | dat_caliber_tag             | 口径标签表                                     |
| 新增 | prj_project_member          | 项目成员表（项目负责人/开发负责人）            |
| 新增 | dat_caliber_lineage         | 数据血缘关系表                                 |
| 新增 | sys_notification_preference | 通知偏好表                                     |

## 3.2 修改的表（ALTER 语句）

```sql
-- ============================================================
-- 修订增量 DDL（基于现有 schema.sql 的变更）
-- ============================================================

-- === prj_project：新增暂停/取消相关字段 ===
ALTER TABLE `prj_project`
  ADD COLUMN `pause_reason`      varchar(500) DEFAULT NULL COMMENT '暂停原因' AFTER `archived_at`,
  ADD COLUMN `paused_at`         datetime     DEFAULT NULL COMMENT '暂停时间' AFTER `pause_reason`,
  ADD COLUMN `paused_by`         bigint       DEFAULT NULL COMMENT '暂停操作人ID' AFTER `paused_at`,
  ADD COLUMN `resumed_at`        datetime     DEFAULT NULL COMMENT '恢复时间' AFTER `paused_by`,
  ADD COLUMN `status_before_pause` varchar(30) DEFAULT NULL COMMENT '暂停前状态（恢复时回退）' AFTER `resumed_at`,
  ADD COLUMN `cancel_reason`     varchar(500) DEFAULT NULL COMMENT '取消原因' AFTER `status_before_pause`,
  ADD COLUMN `cancelled_at`      datetime     DEFAULT NULL COMMENT '取消时间' AFTER `cancel_reason`,
  ADD COLUMN `cancelled_by`      bigint       DEFAULT NULL COMMENT '取消操作人ID' AFTER `cancelled_at`,
  ADD COLUMN `cancel_approved_by` bigint      DEFAULT NULL COMMENT '取消审批人ID' AFTER `cancelled_by`,
  MODIFY COLUMN `status` varchar(30) NOT NULL DEFAULT 'pending_clarification'
    COMMENT '项目状态：pending_clarification-待澄清 developing-开发中 pending_acceptance-待验收 pending_launch-待上线 launched-已上线 archived-已归档 paused-已暂停 cancelled-已取消';

-- 删除项目表的 preview_ready 字段（迁移到技术口径上）
ALTER TABLE `prj_project`
  DROP COLUMN `preview_ready`,
  DROP COLUMN `preview_ready_at`;

-- === prj_project_caliber：新增开发类型标记 ===
ALTER TABLE `prj_project_caliber`
  ADD COLUMN `dev_type` varchar(20) NOT NULL DEFAULT 'needs_tech_dev'
    COMMENT '开发类型：needs_tech_dev-需技术开发 biz_only-仅业务口径调整' AFTER `current_version_id`;

-- === prj_business_caliber：状态值调整 ===
ALTER TABLE `prj_business_caliber`
  MODIFY COLUMN `status` varchar(30) NOT NULL DEFAULT 'draft'
    COMMENT '状态：draft-草稿 submitted-已提交 clarified-已澄清 deprecated-已废弃';

-- === prj_technical_caliber：新增字段 ===
ALTER TABLE `prj_technical_caliber`
  ADD COLUMN `source_caliber_ids` text DEFAULT NULL
    COMMENT '数据来源口径ID列表（JSON数组，用于血缘关系）' AFTER `processing_rules`,
  ADD COLUMN `source_tables`      text DEFAULT NULL
    COMMENT '数据来源外部表名列表（JSON数组，非平台内口径）' AFTER `source_caliber_ids`,
  ADD COLUMN `preview_status`     varchar(20) NOT NULL DEFAULT 'not_ready'
    COMMENT '预览数据状态：not_ready-未就绪 ready-已就绪' AFTER `status`,
  ADD COLUMN `preview_description` varchar(500) DEFAULT NULL
    COMMENT '预览数据说明（数据行数、存放位置等）' AFTER `preview_status`,
  ADD COLUMN `preview_marked_by`  bigint DEFAULT NULL
    COMMENT '预览数据标记人ID' AFTER `preview_description`,
  ADD COLUMN `preview_marked_at`  datetime DEFAULT NULL
    COMMENT '预览数据标记时间' AFTER `preview_marked_by`,
  MODIFY COLUMN `status` varchar(20) NOT NULL DEFAULT 'not_started'
    COMMENT '状态：not_started-未开发 developing-开发中 reviewing-审核中 pending_approval-待审批 approved-审批通过 rejected-审批驳回 pending_reassessment-待重新评估 deprecated-已废弃';

-- === prj_acceptance_record：新增驳回类型 ===
ALTER TABLE `prj_acceptance_record`
  ADD COLUMN `reject_type` varchar(30) DEFAULT NULL
    COMMENT '驳回类型：biz_issue-业务口径问题 tech_issue-技术实现问题（result=failed时必填）'
    AFTER `result`;

-- === dat_caliber_version：新增版本状态 ===
ALTER TABLE `dat_caliber_version`
  ADD COLUMN `version_status` varchar(20) NOT NULL DEFAULT 'draft'
    COMMENT '版本状态：draft-草稿 active-生效 deprecated-已废弃' AFTER `is_current`;
```

## 3.3 新增的表

```sql
-- ============================================================
-- 新增表（修订版需求新增）
-- ============================================================

-- 口径标签表（多对多）
CREATE TABLE `dat_caliber_tag` (
  `id`         bigint       NOT NULL AUTO_INCREMENT,
  `caliber_id` bigint       NOT NULL COMMENT '口径ID',
  `tag_name`   varchar(50)  NOT NULL COMMENT '标签名称',
  `created_at` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_caliber_tag` (`caliber_id`, `tag_name`),
  KEY `idx_tag_name` (`tag_name`),
  CONSTRAINT `fk_ct_caliber` FOREIGN KEY (`caliber_id`) REFERENCES `dat_caliber` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='口径标签表';

-- 项目成员表（项目角色：负责人、开发负责人）
CREATE TABLE `prj_project_member` (
  `id`           bigint      NOT NULL AUTO_INCREMENT,
  `project_id`   bigint      NOT NULL COMMENT '项目ID',
  `user_id`      bigint      NOT NULL COMMENT '用户ID',
  `project_role` varchar(30) NOT NULL COMMENT '项目角色：owner-项目负责人 dev_leader-项目开发负责人',
  `created_at`   datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_member_role` (`project_id`, `user_id`, `project_role`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_pm_project` FOREIGN KEY (`project_id`) REFERENCES `prj_project` (`id`),
  CONSTRAINT `fk_pm_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目成员表（项目角色）';

-- 数据血缘关系表
CREATE TABLE `dat_caliber_lineage` (
  `id`                   bigint      NOT NULL AUTO_INCREMENT,
  `technical_caliber_id` bigint      NOT NULL COMMENT '技术口径ID（下游）',
  `source_type`          varchar(20) NOT NULL COMMENT '来源类型：caliber-平台内口径 external-外部表',
  `source_caliber_id`    bigint      DEFAULT NULL COMMENT '来源口径ID（source_type=caliber时有值）',
  `source_table_name`    varchar(200) DEFAULT NULL COMMENT '来源外部表名（source_type=external时有值）',
  `created_at`           datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_technical_caliber_id` (`technical_caliber_id`),
  KEY `idx_source_caliber_id` (`source_caliber_id`),
  CONSTRAINT `fk_cl_tech` FOREIGN KEY (`technical_caliber_id`) REFERENCES `prj_technical_caliber` (`id`),
  CONSTRAINT `fk_cl_source` FOREIGN KEY (`source_caliber_id`) REFERENCES `dat_caliber` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据血缘关系表';

-- 通知偏好表
CREATE TABLE `sys_notification_preference` (
  `id`                bigint      NOT NULL AUTO_INCREMENT,
  `user_id`           bigint      NOT NULL COMMENT '用户ID',
  `notification_type` varchar(50) NOT NULL COMMENT '通知类型',
  `email_enabled`     tinyint     NOT NULL DEFAULT 1 COMMENT '是否启用邮件通知：0-否 1-是',
  `created_at`        datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_notif_type` (`user_id`, `notification_type`),
  CONSTRAINT `fk_np_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知偏好配置表';
```

## 3.4 最终表清单（33 张表）

| 模块         | 表名                            | 说明             | 状态                                  |
| ------------ | ------------------------------- | ---------------- | ------------------------------------- |
| **系统基础** | sys_user                        | 用户表           | 原有                                  |
|              | sys_role                        | 角色表           | 原有                                  |
|              | sys_user_role                   | 用户角色关联     | 原有                                  |
|              | sys_permission                  | 权限表           | 原有                                  |
|              | sys_role_permission             | 角色权限关联     | 原有                                  |
|              | sys_data_permission             | 数据权限         | 原有                                  |
|              | sys_team                        | 开发团队         | 原有                                  |
|              | sys_team_member                 | 团队成员         | 原有                                  |
| **数据资产** | dat_theme                       | 主题表           | 原有                                  |
|              | dat_caliber                     | 口径表           | 原有（标签通过 dat_caliber_tag 管理） |
|              | dat_caliber_version             | 口径版本         | 原有(已修改)                          |
|              | dat_element                     | 要素表           | 原有                                  |
|              | dat_version_element             | 版本要素快照     | 原有                                  |
|              | dat_element_change              | 要素变更记录     | 原有                                  |
|              | **dat_caliber_tag**             | **口径标签**     | **新增**                              |
|              | **dat_caliber_lineage**         | **数据血缘关系** | **新增**                              |
| **项目流程** | prj_project                     | 项目表           | 原有(已修改)                          |
|              | **prj_project_member**          | **项目成员**     | **新增**                              |
|              | prj_project_caliber             | 项目口径关联     | 原有(已修改)                          |
|              | prj_business_caliber            | 业务口径         | 原有(已修改)                          |
|              | prj_technical_caliber           | 技术口径         | 原有(已修改)                          |
|              | prj_review_record               | 审核记录         | 原有                                  |
|              | prj_caliber_issue               | 问题表           | 原有                                  |
|              | prj_approval_record             | 审批记录         | 原有                                  |
|              | prj_approval_delegation         | 审批委托         | 原有                                  |
|              | prj_acceptance_record           | 验收记录         | 原有(已修改)                          |
| **协作**     | collab_comment                  | 评论表           | 原有                                  |
|              | collab_comment_mention          | 评论@成员        | 原有                                  |
|              | collab_comment_attachment       | 评论附件         | 原有                                  |
| **通知日志** | sys_notification                | 通知消息         | 原有                                  |
|              | **sys_notification_preference** | **通知偏好**     | **新增**                              |
|              | sys_operation_log               | 操作日志         | 原有                                  |
| **导入**     | sys_import_record               | 导入记录         | 原有                                  |

## 3.5 核心表 ER 关系（文字版）

```
sys_user ─┬─ sys_user_role ── sys_role ── sys_role_permission ── sys_permission
          ├─ sys_team_member ── sys_team
          ├─ prj_project_member ── prj_project
          │                         ├── prj_project_caliber ── dat_caliber ── dat_theme
          │                         ├── prj_business_caliber    │              │
          │                         │     │                     ├── dat_caliber_tag
          │                         │     └── dat_caliber_version ── dat_version_element
          │                         │                │                    │
          │                         │                └── dat_element ── dat_element_change
          │                         │
          │                         ├── prj_technical_caliber ── dat_caliber_lineage
          │                         │     ├── prj_review_record
          │                         │     ├── prj_caliber_issue
          │                         │     └── prj_approval_record
          │                         │
          │                         ├── prj_acceptance_record
          │                         └── collab_comment ── collab_comment_mention
          │                                            └── collab_comment_attachment
          │
          ├── sys_notification
          ├── sys_notification_preference
          └── sys_operation_log
```

---

# 第四部分：开发迭代计划

## 4.1 MVP（第一期）—— 核心闭环

| 顺序     | 模块                                           | 页面数 | API 数 | 目标                     |
| -------- | ---------------------------------------------- | ------ | ------ | ------------------------ |
| 1        | 系统基础（用户/角色/团队）                     | 3      | 16     | 登录 + RBAC + 开发组     |
| 2        | 数据资产（主题/口径/要素）                     | 6      | 18     | 核心资产 CRUD + 版本管理 |
| 3        | 项目流程（创建/澄清/开发/审核/审批/验收/上线） | 4      | 26     | 完整项目生命周期闭环     |
| 4        | 通知 + 日志                                    | 2      | 6      | 基础通知 + 审计          |
| 5        | 个人工作台                                     | 1      | 3      | 待办汇总                 |
| **合计** |                                                | **16** | **69** |                          |

## 4.2 V2（第二期）—— 增强体验

| 模块                | 页面数         | API 数 | 目标            |
| ------------------- | -------------- | ------ | --------------- |
| 看板报表            | 3              | 3      | 数据可视化      |
| 口径台账 + 全文搜索 | 1              | 2      | 资产发现增强    |
| 数据血缘            | 1              | 2      | 基础血缘图谱    |
| 数据导入            | 1              | 4      | 存量迁移        |
| 数据权限            | 1              | 3      | 按主题/部门隔离 |
| 口径质量            | 含在看板中     | 1      | 质量指标        |
| 通知偏好 + 邮件     | 含在个人设置中 | 2      | 多通道通知      |
| **合计**            | **7**          | **17** |                 |

## 4.3 V3（第三期）—— 远期扩展

| 功能         | 说明                  |
| ------------ | --------------------- |
| 数据元管理   | 全局字段标准化        |
| 自动化血缘   | SQL 解析自动构建      |
| 企业 IM 通知 | 企业微信/钉钉 webhook |
| 批量审批     | 组长批量操作          |
| 冷热数据迁移 | 自动归档到冷存储      |
