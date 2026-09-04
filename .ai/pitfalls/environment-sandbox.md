# 环境/沙箱陷阱速查（本仓开发时踩过，先查表再执行）

> 与业务代码无关，但与「能不能顺利 verify / commit / 跑测试」强相关。踩过即记，避免二次踩。

| # | 场景 | 陷阱 | 正确做法 |
|---|------|------|----------|
| E01 | git commit | husky v9 `core.hooksPath` + msys sh 在 Windows 崩溃 → commit 失败 | `git -c core.hooksPath= commit --no-verify -F <msgfile>`（或 `-m` 多段） |
| E02 | 写 commit message 文件 | write 工具对「重建过的目录」有缓存坑（报 file no longer exists） | 用全新文件名，或直接 `git commit -m "..."` 多段，不用 msgfile |
| E03 | pwsh 只读模式 | ConstrainedLanguage：`.NET 静态调用`（`[IO.File]::*`、`[math]::` 等）报 "only core types" | 用 cmdlet（`Set-Content`/`Get-Content`）与核心类型；先跑一次看是否被拒 |
| E04 | exceljs 导入 | exceljs 是 CJS，`import { Workbook } from 'exceljs'` 运行时炸 | `import exceljs from 'exceljs'; const { Workbook } = exceljs;` |
| E05 | vitest | 沙箱 forks 池 spawn EPERM（子进程管道受限） | vitest.config.ts 用 `pool: 'threads'`（WHY 已写注释） |
| E06 | node 子进程 | `child_process.spawn/exec` 默认 `stdio:'pipe'` 捕获输出在沙箱 EPERM | 用 `stdio:'inherit'/'ignore'`，或换 PowerShell 管道 |
| E07 | 测试 fixtures | 用例里相对路径随 cwd 漂移 | fixtures 用 `resolve(process.cwd(), '.debug/…')` 锚定 |
| E08 | prettier 单文件 | `npm run prettier-import-sort -- --write <file>` 实际跑**全仓** `prettier --write .`（script 本身是全仓） | 单文件用 `npx prettier --write <file>`；全仓历史文件有 mojibake/尾空格，别误触发 |
| E09 | 测试命令 | 沙箱内 `pnpm verify` 里嵌套脚本可能受限 | 直接 `npx tsc --noEmit` / `npx eslint <files>` / `npx prettier --check <files>` / `npx vitest run` |
| E10 | 端口 | dev server 端口被占 | `rsbuild.config.ts` `server.port` 调空闲端口（本仓当前 3002） |

## 使用方式

同 `.ai/pitfalls/index.md`：执行有风险/环境敏感的命令前先扫本表；命中即按「正确做法」执行。
