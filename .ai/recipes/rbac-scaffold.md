# 配方: rbac-scaffold

钩子: after-page
优先级: post
触发条件: 权限控制 / 路由守卫 / 菜单过滤 / 按钮权限 / hasPermission

做什么:

1. 改 `src/stores/user.ts` — persist partialize 白名单加 `permissions`；增加 `setPermissionsByRoles(roles)` 方法，从 localStorage 权限表将 role 的 permissionIds (ID) 解析为 code
2. 改 `src/router/guards/RequireAuth.tsx` — 增加 `requiredPermission` 可选参数；无权限时渲染 antd `<Result status="403">` 页面
3. 改 `src/layouts/MainLayout.tsx` — 增加 `menuPermissions` 映射表（key → 权限 code）；增加 `filterMenuByPermission` 递归过滤函数；菜单 children 加「权限管理」入口；渲染 `filteredMenuItems` 替代原始 `menuItems`
4. 改 `src/router/routes/index.tsx` — 系统路由（/system/user、/system/role、/system/permission）加 `<RequireAuth requiredPermission="...">` 守卫
5. 改登录页 — loginApi 从 localStorage 验证用户名密码 + 查询角色 + 解析权限 code；登录成功回调调用 `setPermissions(permissions)`
6. 改本轮生成的列表页 — 操作按钮用 `<SButton.Group items={[...]}>` 包裹，每个 item 加 `compact: true`（t-link 样式）

验证场景: admin 登录后侧边栏显示完整菜单（首页/仪表盘/系统管理>用户管理/角色管理/权限管理），viewer 用户只能看到首页

## 约束

- 不改 `src/plugins/` 目录（需确认）
- 不改 `package.json` / `tsconfig.json` / `eslint.config.mjs` / `rsbuild.config.ts`
- 所有改动文件通过 pnpm verify
