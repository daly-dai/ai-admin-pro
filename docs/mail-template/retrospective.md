# mail-template v2 全量复盘（Task 0–7 + 走查返工）

> 复盘范围：模板 CRUD → 工作台 → mock 在线编辑 → 发布 → 预览/发送 全部 Task 与多轮 UI 走查返工。
> 目的：区分「PRD/口径没理清」「AI 执行失误」「环境工具陷阱」三类问题，找出**本可避免**的环节，
> 沉淀为可复利的规则（对应条目已落 `.ai/pitfalls/index.md` 与 `environment-sandbox.md`）。

## 一、需求/口径层（最贵的一类——返工按轮次计）

| # | 问题 | 现象 | 本可避免的做法 |
|---|------|------|----------------|
| 1 | 工作台布局形态没在拆 Task 前定死 | 大折叠卡→SDetail 紧凑信息条→一体面板→拆两模块，共 4 版提交；「和设想相差太大」后才多选澄清 | 非标页面开工前先用 1–2 个问句锁定关键形态：信息条长啥样 / 正文是否省略 / 权限开关放哪 / 模块怎么分隔 |
| 2 | 权限演示开关位置反复 | 报表行内 → 左栏底部折叠面板 | 同 #1：属于「主功能区 vs 界面角落」的取舍，开工前确认 |
| 3 | 阅读态导航没问 | PRD 设计了「返回报表列表」，用户实际不需要（左栏常驻可点选） | 问清"在阅读态怎么切报表/返回"即可避免一次提交 |
| 4 | **目标环境假设错误：600px 邮件宽** | 渲染内核按通用客户端内容区上限 600 缩放表格；用户公司邮件系统**正文全宽**，预览被压成竖排 + 多轮宽度修复 | PRD 先确认目标邮件系统形态（公司全宽 vs 通用客户端 600）再写渲染口径；不要替用户假设 |
| 5 | 宽表格「不挤压 vs 自适应」偏好没问 | 先 600 缩放竖排 → 原始列宽撑出横向滚动 → 等比铺满，试了 3 轮 | 产品偏好问题：多列表格期望**等比铺满容器**还是**原始宽度+内部滚动**？开工前问一次 |
| 6 | 预览是抽屉不是页面、空态入口不可见 | 用户找不到预览入口（示例模板无报表 → 按钮禁用无提示感） | 空态/禁用态也要让入口「可见且可解释」；功能形态在 PRD 确认后同步讲清入口位置 |

## 二、AI 执行层（机制性，可复利）

1. **prettier 全仓事故**：`npm run prettier-import-sort -- --write <file>` 实际执行全仓 `prettier --write .`，
   56 个文件被重排（含历史 mojibake/尾空格文件），靠 `git checkout -- .` 恢复。
   → 教训：先读 `package.json` 的 script 定义再决定传参方式；格式化单文件用 `npx prettier --write <file>`。
2. **eslint 规则未预想**：complexity 超限（拆小函数）、useEffect 内 bare `return;` 与 cleanup `return fn` 混用
   触发 consistent-return、no-nested-ternary、回调变量遮蔽 antd `message`、声明了未用的 state。
   → 写码阶段自查可省 verify 轮次。
3. **React/渲染层**：iframe `position:absolute; inset:12px` 撑满不可靠 → flex；React `style` 需 camelCase
   （曾试图"把 CSS 字符串再解析成对象"，思路错误）；CSS Modules `:global(table)` 子元素选择器不生效 → 改内联样式。
4. **时序/状态机没先画**：postMessage 握手死锁（子页等 init 才回 ready，父页等 ready 才发 init——双向等待，
   修复：子页挂载即上报 ready）；连续多次发布丢首轮编辑（编辑基座 fileBuffer 未更新为导出结果）。
5. **横向滚动问题盲改 3 轮 CSS 才停下问**：违反「能观测才存在」——视觉/布局问题应第一时间要截图或定位
   滚动条出现在哪一层，而非连续盲改。

## 三、环境/工具陷阱（与代码无关但吃掉大量轮次）

husky commit（msys sh 崩溃）绕过、write 工具对重建目录的缓存坑、pwsh ConstrainedLanguage、
exceljs CJS 导入形式、vitest 需 threads 池、node spawn 捕获输出 EPERM、fixtures 需锚 cwd、
`pnpm test`/`pnpm verify` 语义…… 全部速查已落 `.ai/pitfalls/environment-sandbox.md`。

## 四、本模块复盘确认的两条新约定（已落 pitfalls P019/P020）

1. **布局优先 antd `Flex` 组件**（用户修订措辞，非"禁止其它"，且从"优先 flex 思路"进一步收敛为"优先 Flex 组件"）：
   排布首选 antd `<Flex>`（vertical/gap/justify/align/wrap 声明式，比手写内联 flex 更可读）；Flex 表达不了的细粒度样式
   （`min-width:0` 防撑破、`overflow` 约束、CSS Grid、block）再用 CSS Modules，底层仍是 flex 思路；
   明确**禁** `position:absolute; inset:*` 撑满容器这类不可靠写法（iframe 撑满曾翻车）。新代码生效，既有代码不强制重构。
2. **非标页面生成前先调 frontend-design skill**：CRUD/标准列表+表单页有 STable/SForm/SDetail 现成组件，
   不需要设计；工作台这类**非标/视觉复杂页面**若靠 AI 裸写，样式容易扭曲——生成代码前先加载
   skill `frontend-design`，走设计引导后再动手。

## 五、可避免性小结（按 ROI 排序）

1. 非标 UI 开工前 ≤2 个口径问题 + 目标环境确认 → 省 4–5 轮返工（需求侧最贵）。
2. 视觉/布局问题先截图定位再改（省盲改轮次）。
3. 环境陷阱全部查表化（零复利 → 查表即避）。
4. 写码阶段按 eslint/React 已知坑自查（减少 verify 轮）。
