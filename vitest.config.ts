import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// WHY(pool=threads): 默认 forks 池通过 fork 子进程执行测试，在 DSH 沙箱下
// spawn 受限报 EPERM；threads 池（worker_threads）不受影响，普通机器两者皆可。
// WHY(include): 测试与被测模块同目录（*.test.ts），随 tsc/eslint/prettier 主闸门兜底。
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    pool: 'threads',
  },
});
