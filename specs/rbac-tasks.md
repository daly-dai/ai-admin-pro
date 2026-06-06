# RBAC 用户-角色-权限 — 实施 Task 拆解

> PRD：`specs/rbac-design.md`
> 架构：每 Task 独立执行 → 独立 verify → 完成即标记。出问题只影响当前 Task。

---

## 整体进度

| 阶段                        | Task 数 | 完成  | 待实施 |
| --------------------------- | ------- | ----- | ------ |
| 阶段一：地基                | 3       | 0     | 3      |
| 阶段二：权限页面            | 3       | 0     | 3      |
| 阶段三：管控集成 + 配方沉淀 | 3       | 0     | 3      |
| 阶段四：收尾 + 已有模块改造 | 8       | 0     | 8      |
| **合计**                    | **17**  | **0** | **17** |

---

## 阶段一：地基

### Task 1.1 — 前端存储层

| 项         | 内容                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **类型**   | 非标（infra — 首次直接处理，成功后沉淀为 storage-layer 配方）                                                                                                             |
| **输出锁** | `src/plugins/storage/index.ts`（新建）                                                                                                                                    |
| **做什么** | 创建 localStorage 通用 CRUD 封装：分页查询、单条查询、新增（自动生成 ID + 时间戳）、部分更新、删除。覆盖 user / role / permission 三个存储 key。配置开关 `STORAGE_MODE`。 |

**验收标准**：

- [ ] `src/plugins/storage/index.ts` 存在
- [ ] 导出 `getList` / `getById` / `create` / `update` / `delete` 五个通用方法
- [ ] 支持分页参数 `pageNum` / `pageSize` + 关键词筛选
- [ ] `create` 自动生成 UUID + createTime / updateTime
- [ ] `update` 为部分更新（浅合并）
- [ ] `STORAGE_MODE` 开关：`'local'` / `'remote'`
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 1.2 — 种子数据

| 项         | 内容                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| **类型**   | 非标（infra — 同 Task 1.1 的延续，同文件内完成）                                                                          |
| **输出锁** | `src/plugins/storage/seed.ts`（新建）                                                                                     |
| **做什么** | 创建种子数据模块：3 个角色 + 14 个权限点 + 1 个 admin 用户。首次加载时自动写入 localStorage（通过标记判断是否已初始化）。 |

**验收标准**：

- [ ] `src/plugins/storage/seed.ts` 存在
- [ ] 导出 `initSeedData()` 函数
- [ ] 含 SUPER_ADMIN / ADMIN / VIEWER 三个角色
- [ ] 含 14 个权限点（见 PRD §二.3）
- [ ] 含 1 个 admin 用户（关联 SUPER_ADMIN）
- [ ] 重复调用不重复写入（幂等）
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 1.3 — axios 拦截器注入

| 项         | 内容                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **类型**   | 非标（infra — 同 Task 1.1 延续）                                                                                                                                                                                  |
| **输出锁** | `src/plugins/storage/index.ts`（修改，追加）、`src/main.tsx`（修改，加一行初始化调用）                                                                                                                            |
| **做什么** | 在 `STORAGE_MODE === 'local'` 时，注册 axios 请求拦截器，将 `/api/user` / `/api/role` / `/api/permission` 的请求透明转发到 localStorage CRUD。`STORAGE_MODE === 'remote'` 时放行。入口文件调用 `initSeedData()`。 |

**验收标准**：

- [ ] 拦截器注册逻辑在 storage/index.ts 中
- [ ] GET 请求匹配 `/api/{resource}` → 调用 `getList`
- [ ] GET 请求匹配 `/api/{resource}/{id}` → 调用 `getById`
- [ ] POST 请求 → 调用 `create`，返回完整实体
- [ ] PUT 请求 → 调用 `update`
- [ ] DELETE 请求 → 调用 `delete`
- [ ] `/api/permission/tree` 路径 → 调用树形构建方法
- [ ] `STORAGE_MODE === 'remote'` 时不拦截
- [ ] `src/main.tsx` 中调用 `initSeedData()`
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

## 阶段二：权限管理页面

### Task 2.1 — api/permission 模块

| 项         | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| **类型**   | api                                                                          |
| **输出锁** | `src/api/permission/types.ts`（新建）、`src/api/permission/index.ts`（新建） |
| **模板**   | `.ai/templates/api-module.md`                                                |

**验收标准**：

- [ ] `Permission` 实体类型完整（id / code / name / type / parentId / sort / status / description / createTime / updateTime）
- [ ] `PermissionQuery extends PageQuery`（keyword / type / status）
- [ ] `PermissionFormData` 完整（code / name / type / parentId / sort / status / description）
- [ ] 6 个 API 方法：`getListByGet` / `getByIdByGet` / `createByPost` / `updateByPut` / `deleteByDelete` / `getTreeByGet`
- [ ] 方法签名类型正确
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 2.2 — 权限管理列表页

| 项         | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| **类型**   | page-list（改造：左树右详情，非标准 SProTable 列表）                   |
| **输出锁** | `src/pages/permission/index.tsx`（新建）                               |
| **模板**   | 无匹配模板 → 首次直接处理（规约兜底），成功后沉淀为 non-crud-page 配方 |

**验收标准**：

- [ ] 左侧 antd Tree，默认全部展开，数据来自 `getPermissionTreeByGet`
- [ ] 右侧选中节点后展示详情（SDetail）+ 操作按钮（SButton：编辑/停用/删除）
- [ ] 新增按钮在顶部工具栏
- [ ] Tree 点击节点 → 右侧刷新
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 2.3 — 权限新增/编辑 Modal

| 项         | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| **类型**   | page-form                                                         |
| **输出锁** | `src/pages/permission/components/PermissionFormModal.tsx`（新建） |
| **模板**   | `.ai/templates/form-page.md`                                      |

**验收标准**：

- [ ] 使用 `createModal` 工厂函数
- [ ] SForm，items 禁止类型注解
- [ ] 字段：code / name / type（select） / parentId（TreeSelect） / sort / status / description
- [ ] parentId 支持选择父级（不选 = 顶级）
- [ ] 编辑模式回填数据
- [ ] 提交后刷新列表
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

## 阶段三：管控集成 + 配方沉淀

### Task 3.1 — Store 调整

| 项         | 内容                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **类型**   | 非标（store 改造 — 粒度闸门放行：~10 行改动）                                                                                                  |
| **输出锁** | `src/stores/user.ts`（修改）                                                                                                                   |
| **做什么** | permissions 加入 persist 白名单（当前不持久化）。增加 `setPermissionsByRoles(roles)` 方法：根据角色列表的 permissionIds 去重并集计算最终权限。 |

**验收标准**：

- [ ] persist `partialize` 包含 `permissions`
- [ ] `setPermissionsByRoles` 从 roles 提取所有 permissionIds 去重，解析 ID 为 code
- [ ] `hasPermission` 支持通配符 `*`
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 3.2 — 路由守卫增强

| 项         | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| **类型**   | 非标（guard 改造 — 粒度闸门：~15 行）                                                        |
| **输出锁** | `src/router/guards/RequireAuth.tsx`（修改）                                                  |
| **做什么** | 增加 `requiredPermission` 可选参数。有值时检查 `hasPermission`，无权限渲染 403 Result 页面。 |

**验收标准**：

- [ ] `RequireAuth` props 增加 `requiredPermission?: string`
- [ ] 无权限时渲染 antd `<Result status="403">` 页面
- [ ] 不影响已有 token 检查逻辑
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 3.3 — RBAC 配方沉淀

| 项         | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **类型**   | 配方沉淀                                                                                                                                                         |
| **做什么** | Task 3.1 + 3.2 跑通后，将其操作步骤 + MainLayout 菜单过滤 + 按钮权限控制沉淀为 `rbac-scaffold` 配方。在 `routing-strategy.md` 匹配表和 `recipes/index.md` 注册。 |

**验收标准**：

- [ ] `.ai/recipes/rbac-scaffold.md` 文件存在
- [ ] 按 `templates/recipe.md` 格式：钩子/优先级/触发条件/做什么/验证场景
- [ ] 在 `routing-strategy.md` 和 `recipes/index.md` 注册
- [ ] 用户已确认

**状态**：⬜ 待实施

---

## 阶段四：已有模块改造

### Task 4.1 — api/user 模块

| 项         | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| **类型**   | api                                                              |
| **输出锁** | `src/api/user/types.ts`（新建）、`src/api/user/index.ts`（新建） |
| **模板**   | `.ai/templates/api-module.md`                                    |

**验收标准**：

- [ ] `User` 实体类型完整（id / username / password / nickname / email / phone / avatar / status / roleIds / remark / createTime / updateTime）
- [ ] `UserQuery extends PageQuery`（keyword / status / dateRange）
- [ ] `UserFormData` 完整（username / password / nickname / email / phone / status / roleIds / remark）
- [ ] 5 个 API 方法：`getListByGet` / `getByIdByGet` / `createByPost` / `updateByPut` / `deleteByDelete`
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 4.2 — pages/user 列表页

| 项         | 内容                               |
| ---------- | ---------------------------------- |
| **类型**   | page-list                          |
| **输出锁** | `src/pages/user/index.tsx`（新建） |
| **模板**   | `.ai/templates/crud-page.md`       |

**验收标准**：

- [ ] 使用 SProTable
- [ ] columns 显式类型注解 `SColumnsType<User>`
- [ ] searchItems 禁止类型注解
- [ ] 枚举列用 dictKey
- [ ] 分页配置 `paginationFields` 用 `current`
- [ ] 操作按钮用 SButton（actionType 预设）
- [ ] 新增/编辑弹窗用 createModal 工厂函数
- [ ] 删除确认用 Modal.confirm
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 4.3 — pages/user 表单 Modal

| 项         | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| **类型**   | page-form                                             |
| **输出锁** | `src/pages/user/components/UserFormModal.tsx`（新建） |
| **模板**   | `.ai/templates/form-page.md`                          |

**验收标准**：

- [ ] 使用 `createModal` 工厂函数
- [ ] SForm，formItems 禁止类型注解
- [ ] 字段：username / password（新增必填编辑选填）/ nickname / email / phone / roleIds（多选）/ status（switch）/ remark
- [ ] 编辑模式通过 `open({ mode, id })` 回填
- [ ] 提交后 `onSuccess` 刷新列表
- [ ] 无 loading prop（用 Spin 包裹）
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 4.4 — pages/user 详情 Drawer

| 项         | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| **类型**   | page-detail                                              |
| **输出锁** | `src/pages/user/components/UserDetailDrawer.tsx`（新建） |
| **模板**   | `.ai/templates/detail-page.md`                           |

**验收标准**：

- [ ] 使用 `createDrawer` 工厂函数
- [ ] SDetail，items 显式类型注解
- [ ] 字段：username / nickname / email / phone / roleIds / status（dict）/ remark / createTime / updateTime
- [ ] 枚举字段渲染类型为 `dict`
- [ ] 无 loading prop（用 Spin 包裹）
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 4.5 — api/role 模块

| 项         | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| **类型**   | api                                                              |
| **输出锁** | `src/api/role/types.ts`（新建）、`src/api/role/index.ts`（新建） |
| **模板**   | `.ai/templates/api-module.md`                                    |

**验收标准**：

- [ ] `Role` 实体类型完整（id / code / name / description / status / permissionIds / createTime / updateTime）
- [ ] `RoleQuery extends PageQuery`（keyword / status）
- [ ] `RoleFormData` 完整（code / name / description / status / permissionIds）
- [ ] 5 个 API 方法：`getListByGet` / `getByIdByGet` / `createByPost` / `updateByPut` / `deleteByDelete`
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 4.6 — pages/role 列表页

| 项         | 内容                               |
| ---------- | ---------------------------------- |
| **类型**   | page-list                          |
| **输出锁** | `src/pages/role/index.tsx`（新建） |
| **模板**   | `.ai/templates/crud-page.md`       |

**验收标准**：

- [ ] 使用 SProTable
- [ ] columns 显式类型注解 `SColumnsType<Role>`
- [ ] searchItems 禁止类型注解
- [ ] 分页配置 `paginationFields` 用 `current`
- [ ] 操作按钮用 SButton（actionType 预设）
- [ ] 新增/编辑跳转独立表单页 `/system/role/form`
- [ ] 删除确认用 Modal.confirm
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 4.7 — pages/role 表单页

| 项         | 内容                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **类型**   | 独立表单页（非标布局 — Card + SForm + Tree）                                                                        |
| **输出锁** | `src/pages/role/form.tsx`（新建）                                                                                   |
| **做什么** | 新建角色新增/编辑独立页面。SForm + Card 布局，权限分配用 antd Tree 组件，数据从 `getPermissionTreeByGet` API 获取。 |

**验收标准**：

- [ ] 路由 `/system/role/form`，通过 URL 参数 `?id=xxx` 区分新增/编辑
- [ ] SForm：code / name / description / status（switch）
- [ ] 权限分配：antd Tree checkable，数据来自 `getPermissionTreeByGet`
- [ ] Tree `checkedKeys` 与 form `permissionIds` 双向绑定
- [ ] 编辑模式回填数据 + 权限树正确勾选
- [ ] 保存按钮 + 返回按钮
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

### Task 4.8 — MainLayout 菜单过滤 + 权限管理入口

| 项         | 内容                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **类型**   | 非标（layout 改造 — 粒度闸门：~20 行）                                                                                                                 |
| **输出锁** | `src/layouts/MainLayout.tsx`（修改）                                                                                                                   |
| **做什么** | 菜单每项加 `permission` 字段。递归过滤：用户无权限的菜单项不渲染，父菜单所有子项都无权限时父菜单也不显示。加"权限管理"菜单项（`/system/permission`）。 |

**验收标准**：

- [ ] menuItems 每项含 `permission` 字段
- [ ] 菜单根据 `hasPermission` 动态过滤
- [ ] "系统管理"下增加"权限管理"菜单项
- [ ] 路由 `/system/permission` 已注册
- [ ] pnpm verify 通过

**状态**：⬜ 待实施

---

## 执行规则

1. **逐 Task 推进**：完成一个 → verify → 标记完成 → 复盘 → 下一个
2. **输出锁纪律**：不改锁外文件，不顺手重构
3. **配方沉淀**：Task 3.1+3.2+4.8 跑通后，按 `recipe-conventions.md` 沉淀 `rbac-scaffold`
4. **storage-layer 沉淀**：Task 1.1+1.2+1.3 跑通后，按 `recipe-conventions.md` 沉淀 `storage-layer`
5. **强制**：多 Task 执行时调用 Skill: `task-executor` 逐 Task 推进

---

## Task 复盘记录

> 每个 Task 验收通过后，在此记录卡点和归因。

### 复盘格式

```
### Task X.X — {名称} — 完成时间: {日期}

**执行是否顺利**: 顺利 / 有卡点 / 严重阻塞

**卡点清单**（无则写"无"）：

| # | 卡点描述 | 归因 | 优化建议 |
|---|---------|------|---------|
| 1 | {具体卡点} | 规约缺失 / PRD 不完整 / 模板问题 / 错题集缺失 / 架构设计 / 我的失误 | {建议改什么文件} |
```

### 归因分类

| 归因           | 说明                                   | 优化目标                            |
| -------------- | -------------------------------------- | ----------------------------------- |
| **规约缺失**   | conventions 没覆盖到的坑               | 补到对应 conventions 文件           |
| **PRD 不完整** | PRD 中字段、接口、业务规则有遗漏或错误 | 修改 `specs/rbac-design.md`         |
| **模板问题**   | 模板骨架与实际情况不匹配               | 修改对应 `.ai/templates/`           |
| **错题集缺失** | 犯了 pitfalls 未收录的低级错误         | 补到 `.ai/pitfalls/index.md`        |
| **架构设计**   | 路由策略、粒度闸门、匹配机制等设计缺陷 | 修改 `.ai/core/routing-strategy.md` |
| **我的失误**   | AI 自身判断错误、漏读文件、误解需求    | 记录供后续模式识别                  |

### 复盘记录

（每个 Task 完成后在此追加）
