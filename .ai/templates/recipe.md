# 配方: {名称}

钩子: after-page
优先级: post
触发条件: {关键词1} / {关键词2} / {关键词3}

做什么:

1. 改 `{文件路径}` — {具体操作描述}
2. 改 `{文件路径}` — {具体操作描述}
3. 改 `{文件路径}` — {具体操作描述}

验证场景: {一句话。例："执行后，admin 用户登录应能看到所有菜单，viewer 用户只能看到首页"}

## 约束

- 不改 `src/plugins/` 目录（需确认）
- 不改 `package.json` / `tsconfig.json` / `eslint.config.mjs` / `rsbuild.config.ts`
- 所有改动文件通过 pnpm verify
