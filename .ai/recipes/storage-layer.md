# 配方: storage-layer

钩子: after-page
优先级: post
触发条件: 前端存储 / localStorage mock / 无后端先行

做什么:

1. 新建 `src/plugins/storage/index.ts` — 通用 CRUD 封装（getList / getById / create / update / remove / buildTree）；`applyStorageInterceptor(instance)` 从 config.baseURL 提取 resource，通过 config.adapter 短路 HTTP 请求；`STORAGE_MODE` 开关（local / remote）
2. 新建 `src/plugins/storage/seed.ts` — `initSeedData()` 写入预置用户/角色/权限到 localStorage；`INIT_FLAG` 标记保证幂等
3. 改 `src/plugins/request/index.ts` — 导入 `applyStorageInterceptor`；在 `createRequest` 创建新实例后调用 `applyStorageInterceptor(instance)`；默认 `dataKey` 改为 `'data'`（响应拦截器自动拆包）
4. 改 `src/main.tsx` — 调用 `initSeedData()`

验证场景: 启动后 admin/admin123 登录，用户列表/角色列表/权限树数据正常加载，无网关错误

## 约束

- 不改 `src/plugins/` 目录（需确认）
- 不改 `package.json` / `tsconfig.json` / `eslint.config.mjs` / `rsbuild.config.ts`
- 所有改动文件通过 pnpm verify
