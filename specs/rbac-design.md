# RBAC 用户-角色-权限 功能设计文档

> **设计目标**：完善用户、角色、权限三模块功能，前端 localStorage 先行存储，后续 Java + MySQL 后端接入时无缝切换（只换数据源，不改页面代码）。
>
> **设计原则**：⑨（人是最终责任者）→ ①（复杂度不灭）→ ③（边界是宪法）→ ②（为修改而设计）

---

## 一、系统概述

### 1.1 当前状态

| 模块     | 状态        | 说明                                                      |
| -------- | ----------- | --------------------------------------------------------- |
| 用户管理 | ✅ 已实现   | 列表 + 新增/编辑 Modal + 详情 Drawer，`roleIds` 关联角色  |
| 角色管理 | ✅ 已实现   | 列表 + 独立表单页，`permissionIds` 关联权限，权限树硬编码 |
| 权限管理 | ❌ 缺失     | 无独立模块，权限树硬编码在角色表单中                      |
| 权限管控 | ⚠️ 部分     | `hasPermission()` 已定义，路由守卫不检查权限，菜单不过滤  |
| 数据存储 | ❌ 无前端层 | API 直调后端路径，无 localStorage mock 层                 |

### 1.2 目标状态

```
┌─────────────────────────────────────────────────────┐
│                    前端应用                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ 用户管理  │  │ 角色管理  │  │   权限管理 (新增)  │   │
│  │ (已实现)  │  │ (已实现)  │  │   权限点 CRUD     │   │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │             │                 │              │
│  ┌────┴─────────────┴─────────────────┴──────────┐   │
│  │              统一 API 层 (createRequest)        │   │
│  │  api/user/  │  api/role/  │  api/permission/   │   │
│  └────────────────────┬───────────────────────────┘   │
│                       │                               │
│  ┌────────────────────┴───────────────────────────┐   │
│  │           数据源适配层 (新增)                     │   │
│  │  前端模式: localStorage mock                    │   │
│  │  后端模式: Java HTTP API                       │   │
│  │  切换: 改 createRequest config.prefix           │   │
│  └────────────────────────────────────────────────┘   │
│                                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │           权限管控体系 (增强)                     │   │
│  │  路由守卫 → 菜单过滤 → 按钮控制 (三级递进)       │   │
│  │  useUserStore.hasPermission() 驱动全部           │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 二、数据模型设计

### 2.1 核心实体

#### User（用户）— 已有，微调

```typescript
// src/api/user/types.ts
interface User {
  id: string;
  username: string; // 登录名，唯一
  nickname: string; // 显示名
  email: string;
  phone: string;
  avatar: string;
  status: number; // 0=停用 1=启用
  roleIds: string[]; // 关联角色 ID 列表
  remark: string;
  createTime: string;
  updateTime: string;
}
```

**变更**：无需变更。`roleIds` 已支持多角色。

#### Role（角色）— 已有，微调

```typescript
// src/api/role/types.ts
interface Role {
  id: string;
  code: string; // 角色编码，唯一（如 SUPER_ADMIN、EDITOR）
  name: string; // 角色名
  description: string;
  status: number; // 0=停用 1=启用
  permissionIds: string[]; // 关联权限点 ID 列表
  createTime: string;
  updateTime: string;
}
```

**变更**：无需变更。`permissionIds` 已支持多权限。

#### Permission（权限点）— 新增

```typescript
// src/api/permission/types.ts (新建)
interface Permission {
  id: string; // 权限点唯一标识
  code: string; // 权限编码（如 'user:create'、'role:delete'）
  name: string; // 权限名称（如 '新增用户'）
  type: 'menu' | 'button' | 'api';
  // menu=菜单权限, button=操作按钮权限, api=接口权限
  parentId: string | null; // 父级权限 ID（null=顶级），形成权限树
  sort: number; // 排序号
  status: number; // 0=停用 1=启用
  description: string;
  createTime: string;
  updateTime: string;
}

interface PermissionQuery extends PageQuery {
  keyword?: string;
  type?: 'menu' | 'button' | 'api';
  status?: number;
}

interface PermissionFormData {
  code: string;
  name: string;
  type: 'menu' | 'button' | 'api';
  parentId: string | null;
  sort: number;
  status: number;
  description?: string;
}
```

### 2.2 实体关系

```
User ──(N:M)── Role ──(N:M)── Permission

用户.roleIds        → 关联 Role.id[]
角色.permissionIds   → 关联 Permission.id[]

用户最终权限 = 所有关联角色的 permissionIds 去重并集
```

### 2.3 预置权限树

> 基于已有硬编码权限树扩展，覆盖用户/角色/权限三个模块。

```
系统管理 (sys)
├── 用户管理 (user-mgmt)
│   ├── 查看用户列表  (user:list)     [menu]
│   ├── 新增用户      (user:create)   [button]
│   ├── 编辑用户      (user:update)   [button]
│   ├── 删除用户      (user:delete)   [button]
│   └── 查看用户详情  (user:detail)   [button]
├── 角色管理 (role-mgmt)
│   ├── 查看角色列表  (role:list)     [menu]
│   ├── 新增角色      (role:create)   [button]
│   ├── 编辑角色      (role:update)   [button]
│   ├── 删除角色      (role:delete)   [button]
│   └── 分配角色权限  (role:perm)     [button]
└── 权限管理 (perm-mgmt)
    ├── 查看权限列表  (perm:list)     [menu]
    ├── 新增权限点    (perm:create)   [button]
    ├── 编辑权限点    (perm:update)   [button]
    └── 删除权限点    (perm:delete)   [button]
```

### 2.4 预置角色

| 角色编码      | 角色名     | 权限范围                            | 说明               |
| ------------- | ---------- | ----------------------------------- | ------------------ |
| `SUPER_ADMIN` | 超级管理员 | 全部权限点                          | 不可删除，不可停用 |
| `ADMIN`       | 管理员     | 用户管理 + 角色管理（不含权限管理） | 日常运维           |
| `VIEWER`      | 只读用户   | 所有 `*:list` + `*:detail` 权限     | 只能看不能改       |

---

## 三、前端存储层设计

### 3.1 核心思路

**不引入重型 mock 库**（如 MSW、json-server），利用已有的 `zustand persist` 机制，在 localStorage 中存储完整的业务数据，同时保持 API 接口签名与预期后端完全一致。

### 3.2 存储结构

```
localStorage
├── rbac-users        → User[]
├── rbac-roles        → Role[]
├── rbac-permissions  → Permission[]
├── user-store        → { token, userInfo }     (已有)
├── app-store         → { sidebarCollapsed, ... }(已有)
└── ...
```

### 3.3 数据源切换机制

利用已有的 `createRequest` 的 `prefix` 机制：

```typescript
// 前端模式
const userApi = createRequest({
  prefix: '/api/user', // → 被 localStorage 拦截器接管
});

// 后端模式（迁移时）
const userApi = createRequest({
  prefix: 'http://localhost:8080/api/user', // → 指向 Java 后端
});
```

核心方案：在 `src/plugins/request/` 中增加一个 **localStorage 拦截器**，按配置开关决定 axios 请求是发到 localStorage 还是真实后端。

### 3.4 拦截器设计

文件位置：`src/plugins/storage/`（独立文件夹，不影响 `src/plugins/request/` 的禁止修改约束）。

```typescript
// src/plugins/storage/index.ts (新建)

// 配置开关：环境变量或全局配置控制
const STORAGE_MODE: 'local' | 'remote' = 'local';

// localStorage 数据表
const STORAGE_KEYS = {
  user: 'rbac-users',
  role: 'rbac-roles',
  permission: 'rbac-permissions',
} as const;

// 通用 CRUD 操作封装
// - getList(key, query)  → 分页 + 筛选
// - getById(key, id)     → 单条查询
// - create(key, data)    → 新增（自动生成 ID + 时间戳）
// - update(key, id, data)→ 部分更新
// - delete(key, id)      → 删除
```

### 3.5 预置种子数据

系统首次加载时自动写入预置数据：

- 3 个预置角色（SUPER_ADMIN / ADMIN / VIEWER）
- 14 个权限点（按 §2.3 权限树）
- 1 个超级管理员用户（admin / admin123，关联 SUPER_ADMIN 角色）

种子数据只写入一次（通过 localStorage 标记判断）。

### 3.6 与后端接口的一致性保证

| 维度     | 前端 localStorage 实现                                    | 预期后端 Java 实现  |
| -------- | --------------------------------------------------------- | ------------------- |
| 分页查询 | `GET /api/user?pageNum=1&pageSize=20&keyword=xxx`         | 同                  |
| 返回格式 | `{ dataList: T[], totalSize: number, pageNum, pageSize }` | 同（PageData\<T\>） |
| 单条查询 | `GET /api/user/{id}` → 返回实体                           | 同                  |
| 新增     | `POST /api/user` + body → 返回实体                        | 同                  |
| 更新     | `PUT /api/user/{id}` + body → 返回实体                    | 同                  |
| 删除     | `DELETE /api/user/{id}`                                   | 同                  |
| 错误响应 | `{ code: 500, message: '...', success: false }`           | 同                  |
| 鉴权     | Bearer token（localStorage token）                        | 同（JWT）           |

### 3.7 关键约束

- **不修改已有的 5 个 API 文件**（`api/user/index.ts`、`api/role/index.ts` 等），拦截器在 axios 实例层透明接管
- 新增 `api/permission/index.ts` 和 `api/permission/types.ts`，同样走拦截器
- 切换后端时：改 1 行配置（`STORAGE_MODE = 'remote'`）+ 更新 `prefix`

---

## 四、权限管控体系设计

### 4.1 三级管控模型

```
请求进入
  │
  ▼
┌──────────────┐
│ 一级：路由守卫  │ RequireAuth 增强：检查 token + 检查是否有访问该路由的权限
└──────┬───────┘
       │ 通过
       ▼
┌──────────────┐
│ 二级：菜单过滤  │ 侧边栏菜单根据用户权限动态显示/隐藏
└──────┬───────┘
       │ 进入页面
       ▼
┌──────────────┐
│ 三级：按钮控制  │ 页面内"新增/编辑/删除"等操作按钮根据权限显示/禁用
└──────────────┘
```

### 4.2 一级：路由守卫增强

**现状**：`RequireAuth` 只检查 `token` 是否存在。

**增强**：增加权限检查参数 `requiredPermission`：

```typescript
// 用法示例
<RequireAuth requiredPermission="user:list">
  <UserPage />
</RequireAuth>
```

无权限时 → 跳转 403 页面（`pages/error/403.tsx` 已有 error 路由体系可复用）。

### 4.3 二级：菜单动态过滤

**现状**：`MainLayout.tsx` 中 `menuItems` 是静态数组。

**增强**：菜单项增加 `permission` 字段，渲染前用 `useUserStore.hasPermission()` 过滤：

```typescript
// 菜单项增加 permission 字段
const menuItems = [
  { key: '/system/user', label: '用户管理', permission: 'user:list' },
  { key: '/system/role', label: '角色管理', permission: 'role:list' },
  { key: '/system/permission', label: '权限管理', permission: 'perm:list' },
];

// 过滤函数：递归过滤有子菜单的项
// 用户无权限的菜单项不渲染；父菜单所有子项都无权限时父菜单也不显示
```

### 4.4 三级：按钮级权限控制

**现状**：`useUserStore.hasPermission()` 已定义但未在页面中使用。

**增强**：在所有操作按钮上增加权限判断：

```typescript
// 用户列表页 — "新增用户"按钮
{hasPermission('user:create') && (
  <SButton actionType="create" onClick={...} />
)}

// 操作列 — "编辑"按钮
{hasPermission('user:update') && (
  <SButton actionType="edit" onClick={...} />
)}
```

**已有页面改动清单**（最小改动）：

| 文件                            | 改动                                           | 影响   |
| ------------------------------- | ---------------------------------------------- | ------ |
| `pages/user/index.tsx`          | 新增按钮加 `hasPermission('user:create')` 包裹 | 1 行   |
| `pages/user/index.tsx`          | 编辑/删除按钮加权限判断                        | ~6 行  |
| `pages/role/index.tsx`          | 同用户页                                       | ~7 行  |
| `router/routes/index.tsx`       | 路由加 `requiredPermission`                    | ~3 行  |
| `router/guards/RequireAuth.tsx` | 增加权限检查逻辑                               | ~15 行 |
| `layouts/MainLayout.tsx`        | 菜单项加 `permission` 字段 + 过滤逻辑          | ~20 行 |

### 4.5 Store 调整

`useUserStore` 需要微调：

1. `permissions` 字段加入 `persist` 白名单（目前不持久化，导致刷新后权限丢失）
2. 增加 `setPermissionsByRoles(roles: Role[])` 方法：根据角色列表计算最终权限集合

---

## 五、模块功能设计

### 5.1 用户管理（已有，微调）

**已有功能**：

| 功能      | 状态 | 说明                        |
| --------- | ---- | --------------------------- |
| 用户列表  | ✅   | SProTable + 搜索 + 分页     |
| 新增用户  | ✅   | Modal + SForm，支持分配角色 |
| 编辑用户  | ✅   | 同上，数据回填              |
| 删除用户  | ✅   | Modal.confirm 二次确认      |
| 用户详情  | ✅   | Drawer + SDetail            |
| 启用/停用 | ✅   | Switch 切换状态             |

**需调整**：

1. 操作按钮增加权限控制（`hasPermission` 包裹）
2. 角色选择下拉的数据源改为从 localStorage/Store 获取（目前是从 API 获取角色列表，前端模式下需调整为从本地数据读取）

### 5.2 角色管理（已有，微调）

**已有功能**：

| 功能          | 状态 | 说明                            |
| ------------- | ---- | ------------------------------- |
| 角色列表      | ✅   | SProTable + 搜索 + 分页         |
| 新增/编辑角色 | ✅   | 独立表单页 + SForm + 权限树分配 |
| 删除角色      | ✅   | Modal.confirm                   |
| 启用/停用     | ✅   | Switch                          |

**需调整**：

1. **权限树动态化**（关键改动）：当前硬编码在 `pages/role/form.tsx` 中，改为从 `api/permission` 获取
2. 操作按钮增加权限控制
3. 删除角色时检查是否有用户关联此角色（前端模式下从 localStorage 检查）

### 5.3 权限管理（新增）

**设计原则**：方便客户理解、方便操作优先。采用 **左树右表** 布局——左侧权限树直观展示层级关系，右侧显示选中节点的详情和操作。

**页面布局**：

```
┌──────────────────┬──────────────────────────────────────┐
│   权限树 (左侧)   │        详情/操作 (右侧)               │
│                  │                                      │
│  📁 系统管理      │  ┌─────────────────────────────────┐ │
│  ├─ 📁 用户管理   │  │ 权限名称: 查看用户列表            │ │
│  │  ├─ 查看列表  │  │ 权限编码: user:list               │ │
│  │  ├─ 新增用户  │  │ 权限类型: menu                    │ │
│  │  ├─ 编辑用户  │  │ 所属父级: 用户管理                 │ │
│  │  ├─ 删除用户  │  │ 排序: 1                           │ │
│  │  └─ 查看详情  │  │ 状态: ✅ 启用                      │ │
│  ├─ 📁 角色管理   │  │                                   │ │
│  │  └─ ...       │  │ [编辑] [停用] [删除]               │ │
│  └─ 📁 权限管理   │  └─────────────────────────────────┘ │
│     └─ ...       │                                      │
│                  │                                      │
│  [+ 新增权限点]   │                                      │
└──────────────────┴──────────────────────────────────────┘
```

**交互说明**：

- 左侧：antd Tree 组件，默认全部展开，点击节点 → 右侧显示详情
- 右侧：选中节点后显示详情（名称/编码/类型/父级/排序/状态）+ 操作按钮（编辑/停用/删除）
- 新增权限点：顶部"+ 新增权限点"按钮 → 弹出 Modal，可选父级节点（不选即为顶级）
- 编辑：右侧"编辑"按钮 → 同 Modal，回填数据
- 删除：检查是否有子节点（有则提示先删除子节点）+ 检查是否被角色引用（有则提示先解除）

**功能清单**：

| 功能       | 说明                                      | 组件/模式           |
| ---------- | ----------------------------------------- | ------------------- |
| 权限树     | 左侧 Tree 展示层级，点击选中              | antd Tree           |
| 权限详情   | 右侧展示选中节点信息 + 操作按钮           | SDetail + SButton   |
| 新增权限点 | Modal，选择父级 + 填写编码/名称/类型/排序 | createModal + SForm |
| 编辑权限点 | 同上，数据回填                            | 同 Modal            |
| 删除权限点 | 检查子节点 + 角色引用                     | Modal.confirm       |
| 启用/停用  | 右侧 Switch                               | —                   |

**页面路由**：`/system/permission`

**API 设计**（5 标准方法）：

| 方法                       | 路径                          | 说明                          |
| -------------------------- | ----------------------------- | ----------------------------- |
| `getPermissionListByGet`   | `GET /api/permission`         | 支持 keyword/type/status 筛选 |
| `getPermissionByIdByGet`   | `GET /api/permission/{id}`    | 单条查询                      |
| `createPermissionByPost`   | `POST /api/permission`        | 新增                          |
| `updatePermissionByPut`    | `PUT /api/permission/{id}`    | 更新                          |
| `deletePermissionByDelete` | `DELETE /api/permission/{id}` | 删除                          |

**额外 API**：
| 方法 | 路径 | 说明 |
|------|------|------|
| `getPermissionTreeByGet` | `GET /api/permission/tree` | 返回树形结构，供角色表单权限分配使用 |

**新增文件清单**：

```
src/api/permission/types.ts        # Permission / PermissionQuery / PermissionFormData
src/api/permission/index.ts        # 6 个 API 方法
src/pages/permission/index.tsx     # 权限管理页（左树右表布局）
src/pages/permission/components/PermissionFormModal.tsx  # 新增/编辑弹窗
```

### 5.4 菜单集成

权限管理页面需要出现在侧边栏"系统管理"菜单下：

```
系统管理
├── 用户管理    (/system/user)
├── 角色管理    (/system/role)
└── 权限管理    (/system/permission)  ← 新增
```

---

## 六、后端迁移方案

### 6.1 迁移路径

```
阶段一（当前）：localStorage 前端存储
  │  所有 CRUD 操作读写 localStorage
  │  系统可独立运行，无需后端
  │
  ▼
阶段二（后端就绪）：切换数据源
  │  改 1 个配置：STORAGE_MODE = 'remote'
  │  改 prefix：指向 Java 后端地址
  │  localStorage 拦截器停用
  │
  ▼
阶段三（生产优化）：后端接管
  │  删除 localStorage mock 代码（或保留用于开发/演示）
  │  JWT 认证 + 数据库持久化
```

### 6.2 切换检查清单

| 检查项            | 说明                                                        |
| ----------------- | ----------------------------------------------------------- |
| API 路径一致      | Java 后端的 Controller 路径与前端 API 定义一致              |
| 请求/响应格式一致 | 入参字段名、分页格式 `PageData<T>`、错误格式 `ApiResponse`  |
| 认证方式一致      | Bearer token → JWT                                          |
| 权限编码一致      | `user:list` 等编码在后端权限表中一致                        |
| 预置数据一致      | 3 个角色 + 14 个权限点 + admin 用户在数据库初始化脚本中对应 |

### 6.3 前端需要改什么

| 改动                           | 说明                                       |
| ------------------------------ | ------------------------------------------ |
| `src/plugins/storage/index.ts` | 停用拦截器或设置 `STORAGE_MODE = 'remote'` |
| `createRequest` 的 `prefix`    | 指向真实后端地址                           |
| 种子数据初始化                 | 停用（后端数据库已初始化）                 |

**页面代码 0 改动** — 这是整个设计的核心承诺。

### 6.4 后端接口契约（给后端开发参考）

```
# 用户模块
GET    /api/user              → PageData<User>
GET    /api/user/{id}         → User
POST   /api/user              → User
PUT    /api/user/{id}         → User
DELETE /api/user/{id}         → void

# 角色模块
GET    /api/role              → PageData<Role>
GET    /api/role/{id}         → Role
POST   /api/role              → Role
PUT    /api/role/{id}         → Role
DELETE /api/role/{id}         → void

# 权限模块
GET    /api/permission        → PageData<Permission>
GET    /api/permission/tree   → Permission[]  (树形)
GET    /api/permission/{id}   → Permission
POST   /api/permission        → Permission
PUT    /api/permission/{id}   → Permission
DELETE /api/permission/{id}   → void

# 统一响应格式
{ "code": 200, "data": {...}, "message": "success", "success": true }
# 分页响应
{ "code": 200, "data": { "dataList": [...], "totalSize": 100, "pageNum": 1, "pageSize": 20 }, ... }
```

---

## 七、实现优先级与阶段计划

### 阶段一：地基（核心基础设施）

| 优先级 | 任务                            | 说明                                                   | 新建/修改 |
| ------ | ------------------------------- | ------------------------------------------------------ | --------- |
| P0     | 前端存储层 `storage-adapter.ts` | localStorage 拦截器 + 通用 CRUD + 种子数据             | 新建      |
| P0     | `api/permission/` 模块          | types + 6 个 API 方法                                  | 新建      |
| P1     | Store 调整                      | `permissions` 加入 persist + `setPermissionsByRoles()` | 修改      |

### 阶段二：权限管理模块

| 优先级 | 任务                | 说明                     | 新建/修改 |
| ------ | ------------------- | ------------------------ | --------- |
| P1     | 权限列表页          | 树形展示                 | 新建      |
| P1     | 权限新增/编辑 Modal | createModal + SForm      | 新建      |
| P1     | 权限删除            | Modal.confirm + 关联检查 | 新建      |

### 阶段三：权限管控集成

| 优先级 | 任务                 | 说明                                  | 新建/修改 |
| ------ | -------------------- | ------------------------------------- | --------- |
| P2     | 路由守卫增强         | `RequireAuth` 加 `requiredPermission` | 修改      |
| P2     | 菜单动态过滤         | 菜单项加 `permission` + 过滤逻辑      | 修改      |
| P2     | 角色表单权限树动态化 | 硬编码 → API 获取                     | 修改      |
| P3     | 按钮级权限控制       | 用户/角色/权限三个列表页操作按钮      | 修改      |

### 阶段四：后端迁移（待后端就绪后）

| 优先级 | 任务                | 说明         |
| ------ | ------------------- | ------------ |
| —      | 切换 `STORAGE_MODE` | 1 行配置     |
| —      | 更新 `prefix`       | 指向后端地址 |
| —      | 停用种子数据初始化  | 后端已初始化 |

---

## 八、风险与约束

### 8.1 技术风险

| 风险                          | 等级 | 缓解                                             |
| ----------------------------- | ---- | ------------------------------------------------ |
| localStorage 容量限制（5MB）  | 低   | 管理数据量小，即使千级用户+角色+权限也在 KB 级别 |
| 多 Tab 数据不同步             | 低   | 单用户后台管理场景，很少多 Tab 同时操作          |
| 拦截器与 createRequest 兼容性 | 低   | 在 axios 实例层透明拦截，不改变已有 API 调用方式 |
| 权限树性能                    | 低   | 权限点数量有限（<100），Tree 组件足够            |

### 8.2 设计约束

- **禁止修改** `src/plugins/request/` 目录（拦截器在 `src/plugins/storage/` 独立文件夹，通过 axios interceptor 注入，不动 request 核心逻辑）
- **禁止修改** `package.json` / `tsconfig.json` / `eslint.config.mjs` / `rsbuild.config.ts`
- **已有页面风格优先**：新增的权限管理页应遵循用户/角色页面的 SProTable + createModal 模式
- **遵循错题集 P001-P017**：所有新增代码通过 `pnpm verify`

### 8.3 已确认事项

| #   | 问题                    | 决策                                               |
| --- | ----------------------- | -------------------------------------------------- |
| 1   | localStorage 拦截器位置 | ✅ `src/plugins/storage/` 独立文件夹               |
| 2   | 403 页面                | ✅ 功能优先、样式其次，复用已有 error 路由体系即可 |
| 3   | 权限管理页 UI           | ✅ 左树右详情面板，方便客户理解和操作              |

---

## 九、附录

### A. 文件变更总览

```
新建文件 (6):
  src/api/permission/types.ts
  src/api/permission/index.ts
  src/pages/permission/index.tsx
  src/pages/permission/components/PermissionFormModal.tsx
  src/plugins/storage/index.ts                (独立文件夹)

修改文件 (6):
  src/stores/user.ts                          (permissions 持久化)
  src/router/guards/RequireAuth.tsx            (权限检查)
  src/router/routes/index.tsx                  (加权限管理路由 + requiredPermission)
  src/layouts/MainLayout.tsx                   (菜单动态过滤 + 权限管理菜单项)
  src/pages/user/index.tsx                     (按钮权限控制)
  src/pages/role/index.tsx                     (按钮权限控制)
  src/pages/role/form.tsx                      (权限树动态化)

不变文件:
  src/api/user/index.ts / types.ts             (完全不动)
  src/api/role/index.ts / types.ts             (完全不动)
  src/plugins/request/index.ts                 (完全不动，拦截器通过 axios interceptor 注入)
  src/stores/app.ts / dict.ts                  (完全不动)
  src/types/index.ts                           (完全不动)
```

### B. 权限编码规范

```
格式: {模块}:{操作}

模块: user | role | perm
操作: list | create | update | delete | detail | perm(分配权限)

示例:
  user:list     → 查看用户列表
  user:create   → 新增用户
  role:delete   → 删除角色
  perm:list     → 查看权限列表
```

### C. 数据库表结构（MySQL DDL）

> 供后端 Java 开发参考。表名前缀 `sys_`，字段命名同前端接口（驼峰 → 下划线由 MyBatis 映射处理，本文档统一用驼峰便于对照）。

#### C.1 用户表 `sys_user`

```sql
CREATE TABLE sys_user (
  id          VARCHAR(32)  NOT NULL COMMENT '主键',
  username    VARCHAR(50)  NOT NULL COMMENT '登录名，唯一',
  password    VARCHAR(255) NOT NULL COMMENT '密码（BCrypt 加密）',
  nickname    VARCHAR(50)  NOT NULL COMMENT '显示名',
  email       VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  phone       VARCHAR(20)  DEFAULT NULL COMMENT '手机号',
  avatar      VARCHAR(255) DEFAULT NULL COMMENT '头像 URL',
  status      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：0=停用 1=启用',
  remark      VARCHAR(500) DEFAULT NULL COMMENT '备注',
  create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户';
```

#### C.2 角色表 `sys_role`

```sql
CREATE TABLE sys_role (
  id          VARCHAR(32)  NOT NULL COMMENT '主键',
  code        VARCHAR(50)  NOT NULL COMMENT '角色编码，唯一（如 SUPER_ADMIN）',
  name        VARCHAR(50)  NOT NULL COMMENT '角色名',
  description VARCHAR(200) DEFAULT NULL COMMENT '描述',
  status      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：0=停用 1=启用',
  create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色';
```

#### C.3 权限表 `sys_permission`

```sql
CREATE TABLE sys_permission (
  id          VARCHAR(32)  NOT NULL COMMENT '主键',
  code        VARCHAR(50)  NOT NULL COMMENT '权限编码（如 user:create）',
  name        VARCHAR(50)  NOT NULL COMMENT '权限名称（如 新增用户）',
  type        VARCHAR(10)  NOT NULL COMMENT '权限类型：menu/button/api',
  parent_id   VARCHAR(32)  DEFAULT NULL COMMENT '父级权限 ID（null=顶级）',
  sort        INT          NOT NULL DEFAULT 0 COMMENT '排序号',
  status      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：0=停用 1=启用',
  description VARCHAR(200) DEFAULT NULL COMMENT '描述',
  create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code),
  KEY idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统权限';
```

#### C.4 用户角色关联表 `sys_user_role`

```sql
CREATE TABLE sys_user_role (
  id      VARCHAR(32) NOT NULL COMMENT '主键',
  user_id VARCHAR(32) NOT NULL COMMENT '用户 ID',
  role_id VARCHAR(32) NOT NULL COMMENT '角色 ID',
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_role (user_id, role_id),
  KEY idx_user_id (user_id),
  KEY idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联';
```

#### C.5 角色权限关联表 `sys_role_permission`

```sql
CREATE TABLE sys_role_permission (
  id            VARCHAR(32) NOT NULL COMMENT '主键',
  role_id       VARCHAR(32) NOT NULL COMMENT '角色 ID',
  permission_id VARCHAR(32) NOT NULL COMMENT '权限 ID',
  PRIMARY KEY (id),
  UNIQUE KEY uk_role_permission (role_id, permission_id),
  KEY idx_role_id (role_id),
  KEY idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联';
```

### D. 接口详细定义（含传参和示例）

> 统一响应信封：
>
> ```json
> // 成功
> { "code": 200, "data": { ... }, "message": "success", "success": true }
> // 失败
> { "code": 500, "data": null, "message": "错误描述", "success": false }
> ```
>
> 分页响应 `data` 内格式：`{ "dataList": [...], "totalSize": N, "pageNum": N, "pageSize": N }`

---

#### D.1 用户模块

##### D.1.1 查询用户列表

```
GET /api/user
```

| 参数      | 位置  | 类型     | 必填 | 说明                                        |
| --------- | ----- | -------- | ---- | ------------------------------------------- |
| pageNum   | query | number   | 否   | 页码，默认 1                                |
| pageSize  | query | number   | 否   | 每页条数，默认 20                           |
| keyword   | query | string   | 否   | 用户名/昵称模糊搜索                         |
| status    | query | number   | 否   | 状态筛选：0=停用 1=启用                     |
| dateRange | query | string[] | 否   | 创建时间范围 `["2024-01-01", "2024-12-31"]` |

请求示例：

```bash
curl -X GET "http://localhost:8080/api/user?pageNum=1&pageSize=20&keyword=admin&status=1" \
  -H "Authorization: Bearer {token}"
```

返回示例：

```json
{
  "code": 200,
  "data": {
    "dataList": [
      {
        "id": "u-001",
        "username": "admin",
        "nickname": "超级管理员",
        "email": "admin@example.com",
        "phone": "13800138000",
        "avatar": null,
        "status": 1,
        "roleIds": ["r-001"],
        "remark": "系统内置",
        "createTime": "2024-01-01 00:00:00",
        "updateTime": "2024-06-15 10:30:00"
      }
    ],
    "totalSize": 1,
    "pageNum": 1,
    "pageSize": 20
  },
  "message": "success",
  "success": true
}
```

##### D.1.2 查询用户详情

```
GET /api/user/{id}
```

| 参数 | 位置 | 类型   | 必填 | 说明    |
| ---- | ---- | ------ | ---- | ------- |
| id   | path | string | 是   | 用户 ID |

请求示例：

```bash
curl -X GET "http://localhost:8080/api/user/u-001" \
  -H "Authorization: Bearer {token}"
```

返回示例：

```json
{
  "code": 200,
  "data": {
    "id": "u-001",
    "username": "admin",
    "nickname": "超级管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "avatar": null,
    "status": 1,
    "roleIds": ["r-001", "r-002"],
    "remark": "系统内置",
    "createTime": "2024-01-01 00:00:00",
    "updateTime": "2024-06-15 10:30:00"
  },
  "message": "success",
  "success": true
}
```

##### D.1.3 新增用户

```
POST /api/user
Content-Type: application/json
```

| 参数     | 位置 | 类型     | 必填 | 说明                |
| -------- | ---- | -------- | ---- | ------------------- |
| username | body | string   | 是   | 登录名，唯一        |
| nickname | body | string   | 是   | 显示名              |
| email    | body | string   | 是   | 邮箱                |
| phone    | body | string   | 是   | 手机号              |
| status   | body | number   | 是   | 0=停用 1=启用       |
| roleIds  | body | string[] | 否   | 关联角色 ID 列表    |
| remark   | body | string   | 否   | 备注（最多 200 字） |

请求示例：

```bash
curl -X POST "http://localhost:8080/api/user" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "zhangsan",
    "nickname": "张三",
    "email": "zhangsan@example.com",
    "phone": "13900139000",
    "status": 1,
    "roleIds": ["r-002"],
    "remark": "运维人员"
  }'
```

返回示例：

```json
{
  "code": 200,
  "data": {
    "id": "u-002",
    "username": "zhangsan",
    "nickname": "张三",
    "email": "zhangsan@example.com",
    "phone": "13900139000",
    "avatar": null,
    "status": 1,
    "roleIds": ["r-002"],
    "remark": "运维人员",
    "createTime": "2024-06-20 14:00:00",
    "updateTime": "2024-06-20 14:00:00"
  },
  "message": "success",
  "success": true
}
```

##### D.1.4 编辑用户

```
PUT /api/user/{id}
Content-Type: application/json
```

| 参数     | 位置 | 类型     | 必填 | 说明             |
| -------- | ---- | -------- | ---- | ---------------- |
| id       | path | string   | 是   | 用户 ID          |
| nickname | body | string   | 否   | 显示名           |
| email    | body | string   | 否   | 邮箱             |
| phone    | body | string   | 否   | 手机号           |
| status   | body | number   | 否   | 0=停用 1=启用    |
| roleIds  | body | string[] | 否   | 关联角色 ID 列表 |
| remark   | body | string   | 否   | 备注             |

请求示例：

```bash
curl -X PUT "http://localhost:8080/api/user/u-002" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "张三(已离职)",
    "status": 0
  }'
```

返回示例：

```json
{
  "code": 200,
  "data": {
    "id": "u-002",
    "username": "zhangsan",
    "nickname": "张三(已离职)",
    "email": "zhangsan@example.com",
    "phone": "13900139000",
    "status": 0,
    "roleIds": ["r-002"],
    "remark": "运维人员",
    "createTime": "2024-06-20 14:00:00",
    "updateTime": "2024-06-21 09:00:00"
  },
  "message": "success",
  "success": true
}
```

##### D.1.5 删除用户

```
DELETE /api/user/{id}
```

| 参数 | 位置 | 类型   | 必填 | 说明    |
| ---- | ---- | ------ | ---- | ------- |
| id   | path | string | 是   | 用户 ID |

请求示例：

```bash
curl -X DELETE "http://localhost:8080/api/user/u-002" \
  -H "Authorization: Bearer {token}"
```

返回示例：

```json
{
  "code": 200,
  "data": null,
  "message": "success",
  "success": true
}
```

---

#### D.2 角色模块

##### D.2.1 查询角色列表

```
GET /api/role
```

| 参数     | 位置  | 类型   | 必填 | 说明                    |
| -------- | ----- | ------ | ---- | ----------------------- |
| pageNum  | query | number | 否   | 页码，默认 1            |
| pageSize | query | number | 否   | 每页条数，默认 20       |
| keyword  | query | string | 否   | 角色名/编码模糊搜索     |
| status   | query | number | 否   | 状态筛选：0=停用 1=启用 |

请求示例：

```bash
curl -X GET "http://localhost:8080/api/role?pageNum=1&pageSize=20&status=1" \
  -H "Authorization: Bearer {token}"
```

返回示例：

```json
{
  "code": 200,
  "data": {
    "dataList": [
      {
        "id": "r-001",
        "code": "SUPER_ADMIN",
        "name": "超级管理员",
        "description": "拥有系统全部权限",
        "status": 1,
        "permissionIds": [
          "p-001",
          "p-002",
          "p-003",
          "p-004",
          "p-005",
          "p-006",
          "p-007",
          "p-008",
          "p-009",
          "p-010",
          "p-011",
          "p-012",
          "p-013",
          "p-014"
        ],
        "createTime": "2024-01-01 00:00:00",
        "updateTime": "2024-01-01 00:00:00"
      }
    ],
    "totalSize": 3,
    "pageNum": 1,
    "pageSize": 20
  },
  "message": "success",
  "success": true
}
```

##### D.2.2 查询角色详情

```
GET /api/role/{id}
```

| 参数 | 位置 | 类型   | 必填 | 说明    |
| ---- | ---- | ------ | ---- | ------- |
| id   | path | string | 是   | 角色 ID |

返回示例：

```json
{
  "code": 200,
  "data": {
    "id": "r-001",
    "code": "SUPER_ADMIN",
    "name": "超级管理员",
    "description": "拥有系统全部权限",
    "status": 1,
    "permissionIds": ["p-001","p-002",..."p-014"],
    "createTime": "2024-01-01 00:00:00",
    "updateTime": "2024-01-01 00:00:00"
  },
  "message": "success",
  "success": true
}
```

##### D.2.3 新增角色

```
POST /api/role
Content-Type: application/json
```

| 参数          | 位置 | 类型     | 必填 | 说明                                            |
| ------------- | ---- | -------- | ---- | ----------------------------------------------- |
| code          | body | string   | 是   | 角色编码（大写字母+下划线，如 `CONTENT_ADMIN`） |
| name          | body | string   | 是   | 角色名                                          |
| description   | body | string   | 否   | 描述（最多 200 字）                             |
| status        | body | number   | 是   | 0=停用 1=启用                                   |
| permissionIds | body | string[] | 否   | 关联权限 ID 列表                                |

请求示例：

```bash
curl -X POST "http://localhost:8080/api/role" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CONTENT_ADMIN",
    "name": "内容管理员",
    "description": "管理内容模块",
    "status": 1,
    "permissionIds": ["p-001","p-002","p-003","p-004","p-005"]
  }'
```

返回示例：

```json
{
  "code": 200,
  "data": {
    "id": "r-004",
    "code": "CONTENT_ADMIN",
    "name": "内容管理员",
    "description": "管理内容模块",
    "status": 1,
    "permissionIds": ["p-001", "p-002", "p-003", "p-004", "p-005"],
    "createTime": "2024-06-20 14:30:00",
    "updateTime": "2024-06-20 14:30:00"
  },
  "message": "success",
  "success": true
}
```

##### D.2.4 编辑角色

```
PUT /api/role/{id}
Content-Type: application/json
```

| 参数          | 位置 | 类型     | 必填 | 说明                             |
| ------------- | ---- | -------- | ---- | -------------------------------- |
| id            | path | string   | 是   | 角色 ID                          |
| name          | body | string   | 否   | 角色名                           |
| description   | body | string   | 否   | 描述                             |
| status        | body | number   | 否   | 0=停用 1=启用                    |
| permissionIds | body | string[] | 否   | 关联权限 ID 列表（**全量替换**） |

##### D.2.5 删除角色

```
DELETE /api/role/{id}
```

| 参数 | 位置 | 类型   | 必填 | 说明    |
| ---- | ---- | ------ | ---- | ------- |
| id   | path | string | 是   | 角色 ID |

删除前建议检查关联用户（有用户关联时提示先解除）。

---

#### D.3 权限模块

##### D.3.1 查询权限列表（平铺）

```
GET /api/permission
```

| 参数     | 位置  | 类型   | 必填 | 说明                      |
| -------- | ----- | ------ | ---- | ------------------------- |
| pageNum  | query | number | 否   | 页码                      |
| pageSize | query | number | 否   | 每页条数                  |
| keyword  | query | string | 否   | 权限名称/编码模糊搜索     |
| type     | query | string | 否   | 权限类型：menu/button/api |
| status   | query | number | 否   | 0=停用 1=启用             |

请求示例：

```bash
curl -X GET "http://localhost:8080/api/permission?type=menu&status=1" \
  -H "Authorization: Bearer {token}"
```

返回示例：

```json
{
  "code": 200,
  "data": {
    "dataList": [
      {
        "id": "p-001",
        "code": "user:list",
        "name": "查看用户列表",
        "type": "menu",
        "parentId": "p-100",
        "sort": 1,
        "status": 1,
        "description": "用户管理列表页查看权限",
        "createTime": "2024-01-01 00:00:00",
        "updateTime": "2024-01-01 00:00:00"
      }
    ],
    "totalSize": 14,
    "pageNum": 1,
    "pageSize": 20
  },
  "message": "success",
  "success": true
}
```

##### D.3.2 查询权限树

```
GET /api/permission/tree
```

| 参数   | 位置  | 类型   | 必填 | 说明                     |
| ------ | ----- | ------ | ---- | ------------------------ |
| status | query | number | 否   | 筛选状态，默认只返回启用 |

> 无需分页。返回完整的嵌套树形结构，供角色表单分配权限时用。

请求示例：

```bash
curl -X GET "http://localhost:8080/api/permission/tree" \
  -H "Authorization: Bearer {token}"
```

返回示例：

```json
{
  "code": 200,
  "data": [
    {
      "id": "p-100",
      "code": "sys",
      "name": "系统管理",
      "type": "menu",
      "parentId": null,
      "sort": 1,
      "status": 1,
      "children": [
        {
          "id": "p-101",
          "code": "user-mgmt",
          "name": "用户管理",
          "type": "menu",
          "parentId": "p-100",
          "sort": 1,
          "status": 1,
          "children": [
            {
              "id": "p-001",
              "code": "user:list",
              "name": "查看用户列表",
              "type": "menu",
              "parentId": "p-101",
              "sort": 1,
              "status": 1,
              "children": []
            },
            {
              "id": "p-002",
              "code": "user:create",
              "name": "新增用户",
              "type": "button",
              "parentId": "p-101",
              "sort": 2,
              "status": 1,
              "children": []
            },
            {
              "id": "p-003",
              "code": "user:update",
              "name": "编辑用户",
              "type": "button",
              "parentId": "p-101",
              "sort": 3,
              "status": 1,
              "children": []
            },
            {
              "id": "p-004",
              "code": "user:delete",
              "name": "删除用户",
              "type": "button",
              "parentId": "p-101",
              "sort": 4,
              "status": 1,
              "children": []
            },
            {
              "id": "p-005",
              "code": "user:detail",
              "name": "查看用户详情",
              "type": "button",
              "parentId": "p-101",
              "sort": 5,
              "status": 1,
              "children": []
            }
          ]
        },
        {
          "id": "p-102",
          "code": "role-mgmt",
          "name": "角色管理",
          "type": "menu",
          "parentId": "p-100",
          "sort": 2,
          "status": 1,
          "children": [
            {
              "id": "p-006",
              "code": "role:list",
              "name": "查看角色列表",
              "type": "menu",
              "parentId": "p-102",
              "sort": 1,
              "status": 1,
              "children": []
            },
            {
              "id": "p-007",
              "code": "role:create",
              "name": "新增角色",
              "type": "button",
              "parentId": "p-102",
              "sort": 2,
              "status": 1,
              "children": []
            },
            {
              "id": "p-008",
              "code": "role:update",
              "name": "编辑角色",
              "type": "button",
              "parentId": "p-102",
              "sort": 3,
              "status": 1,
              "children": []
            },
            {
              "id": "p-009",
              "code": "role:delete",
              "name": "删除角色",
              "type": "button",
              "parentId": "p-102",
              "sort": 4,
              "status": 1,
              "children": []
            },
            {
              "id": "p-010",
              "code": "role:perm",
              "name": "分配角色权限",
              "type": "button",
              "parentId": "p-102",
              "sort": 5,
              "status": 1,
              "children": []
            }
          ]
        },
        {
          "id": "p-103",
          "code": "perm-mgmt",
          "name": "权限管理",
          "type": "menu",
          "parentId": "p-100",
          "sort": 3,
          "status": 1,
          "children": [
            {
              "id": "p-011",
              "code": "perm:list",
              "name": "查看权限列表",
              "type": "menu",
              "parentId": "p-103",
              "sort": 1,
              "status": 1,
              "children": []
            },
            {
              "id": "p-012",
              "code": "perm:create",
              "name": "新增权限点",
              "type": "button",
              "parentId": "p-103",
              "sort": 2,
              "status": 1,
              "children": []
            },
            {
              "id": "p-013",
              "code": "perm:update",
              "name": "编辑权限点",
              "type": "button",
              "parentId": "p-103",
              "sort": 3,
              "status": 1,
              "children": []
            },
            {
              "id": "p-014",
              "code": "perm:delete",
              "name": "删除权限点",
              "type": "button",
              "parentId": "p-103",
              "sort": 4,
              "status": 1,
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "message": "success",
  "success": true
}
```

##### D.3.3 查询权限详情

```
GET /api/permission/{id}
```

| 参数 | 位置 | 类型   | 必填 | 说明    |
| ---- | ---- | ------ | ---- | ------- |
| id   | path | string | 是   | 权限 ID |

返回示例：

```json
{
  "code": 200,
  "data": {
    "id": "p-001",
    "code": "user:list",
    "name": "查看用户列表",
    "type": "menu",
    "parentId": "p-101",
    "sort": 1,
    "status": 1,
    "description": "用户管理列表页查看权限",
    "createTime": "2024-01-01 00:00:00",
    "updateTime": "2024-01-01 00:00:00"
  },
  "message": "success",
  "success": true
}
```

##### D.3.4 新增权限点

```
POST /api/permission
Content-Type: application/json
```

| 参数        | 位置 | 类型         | 必填 | 说明                                            |
| ----------- | ---- | ------------ | ---- | ----------------------------------------------- |
| code        | body | string       | 是   | 权限编码（`{模块}:{操作}`，如 `report:export`） |
| name        | body | string       | 是   | 权限名称                                        |
| type        | body | string       | 是   | 类型：menu/button/api                           |
| parentId    | body | string\|null | 否   | 父级 ID（null=顶级权限）                        |
| sort        | body | number       | 是   | 排序号（同级内排序）                            |
| status      | body | number       | 是   | 0=停用 1=启用                                   |
| description | body | string       | 否   | 描述                                            |

请求示例：

```bash
curl -X POST "http://localhost:8080/api/permission" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "report:export",
    "name": "导出报表",
    "type": "button",
    "parentId": "p-200",
    "sort": 1,
    "status": 1,
    "description": "报表模块导出按钮权限"
  }'
```

返回示例：

```json
{
  "code": 200,
  "data": {
    "id": "p-015",
    "code": "report:export",
    "name": "导出报表",
    "type": "button",
    "parentId": "p-200",
    "sort": 1,
    "status": 1,
    "description": "报表模块导出按钮权限",
    "createTime": "2024-06-20 15:00:00",
    "updateTime": "2024-06-20 15:00:00"
  },
  "message": "success",
  "success": true
}
```

##### D.3.5 编辑权限点

```
PUT /api/permission/{id}
Content-Type: application/json
```

| 参数        | 位置 | 类型         | 必填 | 说明            |
| ----------- | ---- | ------------ | ---- | --------------- |
| id          | path | string       | 是   | 权限 ID         |
| name        | body | string       | 否   | 权限名称        |
| type        | body | string       | 否   | menu/button/api |
| parentId    | body | string\|null | 否   | 父级 ID         |
| sort        | body | number       | 否   | 排序号          |
| status      | body | number       | 否   | 0=停用 1=启用   |
| description | body | string       | 否   | 描述            |

##### D.3.6 删除权限点

```
DELETE /api/permission/{id}
```

| 参数 | 位置 | 类型   | 必填 | 说明    |
| ---- | ---- | ------ | ---- | ------- |
| id   | path | string | 是   | 权限 ID |

> 有子权限时拒绝删除（返回错误 `"请先删除子权限点"`）。
> 有角色关联时提示确认（返回警告 `"权限点被 N 个角色引用"`）。

---

#### D.4 错误响应示例

```json
// 参数校验失败 (400)
{
  "code": 400,
  "data": null,
  "message": "用户名不能为空",
  "success": false
}

// 未登录 (401)
{
  "code": 401,
  "data": null,
  "message": "登录已过期，请重新登录",
  "success": false
}

// 无权限 (403)
{
  "code": 403,
  "data": null,
  "message": "没有权限访问",
  "success": false
}

// 资源不存在 (404)
{
  "code": 404,
  "data": null,
  "message": "用户不存在",
  "success": false
}

// 业务规则冲突 (409)
{
  "code": 409,
  "data": null,
  "message": "请先删除子权限点",
  "success": false
}

// 服务器错误 (500)
{
  "code": 500,
  "data": null,
  "message": "服务器内部错误",
  "success": false
}
```

### E. 预置种子数据 JSON

> 前端 localStorage 模式首次初始化时的种子数据，与后端 `data.sql` 内容一致。

```json
{
  "roles": [
    {
      "id": "r-001",
      "code": "SUPER_ADMIN",
      "name": "超级管理员",
      "description": "拥有全部权限",
      "status": 1,
      "permissionIds": [
        "p-001",
        "p-002",
        "p-003",
        "p-004",
        "p-005",
        "p-006",
        "p-007",
        "p-008",
        "p-009",
        "p-010",
        "p-011",
        "p-012",
        "p-013",
        "p-014"
      ]
    },
    {
      "id": "r-002",
      "code": "ADMIN",
      "name": "管理员",
      "description": "日常运维管理",
      "status": 1,
      "permissionIds": [
        "p-001",
        "p-002",
        "p-003",
        "p-004",
        "p-005",
        "p-006",
        "p-007",
        "p-008",
        "p-009",
        "p-010"
      ]
    },
    {
      "id": "r-003",
      "code": "VIEWER",
      "name": "只读用户",
      "description": "仅查看权限",
      "status": 1,
      "permissionIds": ["p-001", "p-005", "p-006", "p-011"]
    }
  ],
  "permissions": [
    {
      "id": "p-100",
      "code": "sys",
      "name": "系统管理",
      "type": "menu",
      "parentId": null,
      "sort": 1,
      "status": 1
    },
    {
      "id": "p-101",
      "code": "user-mgmt",
      "name": "用户管理",
      "type": "menu",
      "parentId": "p-100",
      "sort": 1,
      "status": 1
    },
    {
      "id": "p-001",
      "code": "user:list",
      "name": "查看用户列表",
      "type": "menu",
      "parentId": "p-101",
      "sort": 1,
      "status": 1
    },
    {
      "id": "p-002",
      "code": "user:create",
      "name": "新增用户",
      "type": "button",
      "parentId": "p-101",
      "sort": 2,
      "status": 1
    },
    {
      "id": "p-003",
      "code": "user:update",
      "name": "编辑用户",
      "type": "button",
      "parentId": "p-101",
      "sort": 3,
      "status": 1
    },
    {
      "id": "p-004",
      "code": "user:delete",
      "name": "删除用户",
      "type": "button",
      "parentId": "p-101",
      "sort": 4,
      "status": 1
    },
    {
      "id": "p-005",
      "code": "user:detail",
      "name": "查看用户详情",
      "type": "button",
      "parentId": "p-101",
      "sort": 5,
      "status": 1
    },
    {
      "id": "p-102",
      "code": "role-mgmt",
      "name": "角色管理",
      "type": "menu",
      "parentId": "p-100",
      "sort": 2,
      "status": 1
    },
    {
      "id": "p-006",
      "code": "role:list",
      "name": "查看角色列表",
      "type": "menu",
      "parentId": "p-102",
      "sort": 1,
      "status": 1
    },
    {
      "id": "p-007",
      "code": "role:create",
      "name": "新增角色",
      "type": "button",
      "parentId": "p-102",
      "sort": 2,
      "status": 1
    },
    {
      "id": "p-008",
      "code": "role:update",
      "name": "编辑角色",
      "type": "button",
      "parentId": "p-102",
      "sort": 3,
      "status": 1
    },
    {
      "id": "p-009",
      "code": "role:delete",
      "name": "删除角色",
      "type": "button",
      "parentId": "p-102",
      "sort": 4,
      "status": 1
    },
    {
      "id": "p-010",
      "code": "role:perm",
      "name": "分配角色权限",
      "type": "button",
      "parentId": "p-102",
      "sort": 5,
      "status": 1
    },
    {
      "id": "p-103",
      "code": "perm-mgmt",
      "name": "权限管理",
      "type": "menu",
      "parentId": "p-100",
      "sort": 3,
      "status": 1
    },
    {
      "id": "p-011",
      "code": "perm:list",
      "name": "查看权限列表",
      "type": "menu",
      "parentId": "p-103",
      "sort": 1,
      "status": 1
    },
    {
      "id": "p-012",
      "code": "perm:create",
      "name": "新增权限点",
      "type": "button",
      "parentId": "p-103",
      "sort": 2,
      "status": 1
    },
    {
      "id": "p-013",
      "code": "perm:update",
      "name": "编辑权限点",
      "type": "button",
      "parentId": "p-103",
      "sort": 3,
      "status": 1
    },
    {
      "id": "p-014",
      "code": "perm:delete",
      "name": "删除权限点",
      "type": "button",
      "parentId": "p-103",
      "sort": 4,
      "status": 1
    }
  ],
  "users": [
    {
      "id": "u-001",
      "username": "admin",
      "nickname": "超级管理员",
      "email": "admin@example.com",
      "phone": "13800138000",
      "status": 1,
      "roleIds": ["r-001"],
      "remark": "系统内置"
    }
  ]
}
```

> admin 初始密码：`admin123`（前端 localStorage 模式明文存储，后端 BCrypt 加密）。
