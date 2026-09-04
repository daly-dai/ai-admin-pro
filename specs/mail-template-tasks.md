# mail-template-tasks.md — Task 拆解与执行记录

> 需求 PRD：`docs/mail-template/prd.md`
> 场景：非标 Lane（交互导向），拆 Task 遵循 `task-splitting.md` 规约；Demo 一次性交付。
> 执行日期：2025-09-03。结论：Task 1-4 ✅ 全部完成；Task 5 部分完成（见复盘）。

## 整体进度

| 阶段   | Task 数 | 完成 | 待实施 |
| ------ | ------- | ---- | ------ |
| 解析层 | 2       | 2    | 0      |
| 转换层 | 1       | 1    | 0      |
| 交互层 | 2       | 2    | 0      |
| 收尾   | 1       | 1    | 0      |

> 基线已修复（用户授权）：`src/components/DisguiseTextarea/index.tsx` 缺失的 `../DebounceTextArea` 以 antd `Input.TextArea` 兜底（含 TODO 说明），`pnpm verify` 三闸（tsc/eslint/prettier）现已全绿，`pnpm build` 通过。

## Task 列表

### Task 1 — Excel 解析模块 ✅

| 项         | 内容                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **类型**   | 非标                                                                                                                                                        |
| **输出锁** | `src/features/excel-to-html/types.ts` `src/features/excel-to-html/numFmt.ts` `src/features/excel-to-html/parseExcel.ts`                                     |
| **模板**   | 无                                                                                                                                                          |
| **做什么** | ExcelJS 解析 .xlsx：文本/数值/日期/布尔/错误/公式结果、样式快照（字体/填充/边框/对齐/数字格式）、合并区域、列宽；含文件头与体积校验、行/列截断与 warnings。 |

**验收标准**：

- [x] 类型定义零 any，覆盖 CellStyle/ParsedSheet/ExcelParseResult/EmailTableResult/MailTableSlot
- [x] parseExcelFile(File) 对常规样例 .xlsx 返回正确行列与样式快照（字体色/底色/边框/合并 spans）
- [x] 非法文件（非 PK、超限）抛可读错误；warnings 覆盖降级项

### Task 2 — 邮件 HTML 转换器 ✅

| 项         | 内容                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **类型**   | 非标                                                                                                                                                                                             |
| **输出锁** | `src/features/excel-to-html/toEmailHtml.ts` `src/features/excel-to-html/placeholder.ts`                                                                                                          |
| **模板**   | 无                                                                                                                                                                                               |
| **做什么** | 纯函数：ParsedSheet → 邮件安全 HTML（9 项样式映射、合并 colspan/rowspan、列宽 600px 收敛、超链接、换行转 `<br>`、默认数字右对齐）；文档包装 buildEmailDocument；占位符扫描/表格块定位/替换工具。 |

**验收标准**：

- [x] 输出仅 table/tr/td + 内联样式，无 `<style>`/`<script>`
- [x] 合并区域生成正确 colspan/rowspan，非主单元格不输出
- [x] 生成 HTML 可被 iframe sandbox 正常渲染（预览即所得）

### Task 3 — 预览抽屉 ✅

| 项         | 内容                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| **类型**   | 非标                                                                                    |
| **输出锁** | `src/pages/mail/template/components/TablePreviewDrawer.tsx`                             |
| **模板**   | 无（P001：createDrawer 工厂）                                                           |
| **做什么** | createDrawer 封装：sheet 切换、iframe sandbox 预览、warnings 展示、插槽选择与应用回调。 |

**验收标准**：

- [x] 遵循 createDrawer 工厂模式，params 泛型定义完整（含 onApply 回调，因 createDrawer 无结果载荷）
- [x] 关闭即卸载、状态自毁；应用按钮在无插槽时禁用并提示

### Task 4 — 模板页面与接线 ✅

| 项         | 内容                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **类型**   | 非标                                                                                                                                      |
| **输出锁** | `src/pages/mail/template/index.tsx` `src/pages/mail/template/index.module.css` `src/router/routes/index.tsx` `src/layouts/MainLayout.tsx` |
| **模板**   | 无                                                                                                                                        |
| **做什么** | wangEditor 集成（工具栏/占位符插入/注入换表移除）、上传解析、导出复制/下载、路由与菜单注册。                                              |

**验收标准**：

- [x] 页面默认示例模板含变量与 `{{table}}` 插槽
- [x] 注入 → 编辑器内可见表格；换表/移除采用「表格块结构定位 + 槽位顺序」策略
- [x] 导出件用保真 sourceHtml 从右往左替换编辑器表格块；变量残留有提示
- [x] 路由 `/mail/template` + 侧边菜单可达；页面零 antd Table/Form/Button/Descriptions
- [x] `pnpm build` 通过（exceljs 浏览器构建、wangEditor css 均打包成功）

### Task 5 — 验证收尾 ✅

| 项         | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| **类型**   | 非标                                                                             |
| **输出锁** | 本文件 + 基线修复文件（经用户授权）：`src/components/DisguiseTextarea/index.tsx` |
| **模板**   | 无                                                                               |
| **做什么** | 校验收口：tsc/eslint/prettier + 构建冒烟；复盘三问与配方扫描记录。               |

**验收标准**：

- [x] 改动文件 tsc 零错误；eslint src/ 0 error；prettier --check src/ 通过
- [x] `pnpm build` 通过
- [x] `pnpm verify` 三闸全绿（基线 DisguiseTextarea 已授权修复收口）

## 执行规则

1. 逐 Task 推进；每 Task 完成后立即更新状态与复盘三问（见下）
2. 输出锁纪律：一个 Task 的文件不被其他 Task 修改
3. 配方扫描：`.ai/recipes/index.md` 仅含 constant-wiring-check（针对 constants/ 导出），本模块无常量导出，未命中
4. verify 最多 3 轮；同文件反复出错即停（本次未触发）

## 配方扫描记录

| 模块          | 命中配方                                   | 沉淀提议 |
| ------------- | ------------------------------------------ | -------- |
| mail-template | 未命中（无 constants/ 导出，无需接线检查） | 无       |

## Task 复盘三问

### Task 1 — Excel 解析模块

- Q1: eslint 报错：`complexity` 超标（readCellValue 17 / snapshotCellStyle 30 / parseSheet 11）、`max-params`（parseSheet 4 参）；tsc 报错：exceljs `Font.underline` 无 `false`、`Fill` 成员字段为 `pattern` 而非 `patternType`、`TableBlockRange` 从错误模块导入。
- Q2: 根因：① 解析器单函数内 if/switch 分支过多，违反 eslint complexity≤10/max-params≤3；② exceljs 4.4 类型与直觉字段名不一致（underline: boolean\|'none'\|…；FillPattern.pattern）；③ 跨文件类型误引。
- Q3: 有沉淀价值：exceljs 读取样式时 fill 字段是 `pattern`、字体下划线判 `!== 'none'`——写入错题集可避免重踩。

### Task 2 — 邮件 HTML 转换器

- Q1: eslint 报错：`cellInlineStyle` complexity 15 超标。
- Q2: 根因：单元格内联样式拼接的 if 分支过多（字体/背景/边框/对齐/盒子属性全在一个函数）。
- Q3: 有沉淀价值：样式字符串拼接类函数按「属性族」拆小函数（pushFontAppearance/pushBorders…）后复杂度天然达标——可沉淀为邮件 HTML 生成类功能的通用写法。

### Task 3 — 预览抽屉

- Q1: 0 error（首轮修复即过）。补充发现：createDrawer 的 Wrapper 只有 onSuccess/onClose、无结果载荷。
- Q2: 根因：无——设计上提前用「params 携带 onApply 回调」绕开了载荷缺失。
- Q3: 有沉淀价值：sdesign createDrawer 无回调结果通道，需要回传值时用 params 携带回调；可写入组件笔记。

### Task 4 — 模板页面与接线

- Q1: eslint 报错：`no-useless-assignment`（nextHtml 初值 null 被无条件覆盖）；tsc 报错：TableBlockRange 从 types 导入（实际定义在 placeholder）。
- Q2: 根因：① 变量初值设计多余；② 跨模块类型导入路径笔误。
- Q3: 无沉淀必要（一次性笔误）。

### Task 5 — 验证收尾

- Q1: tsc 全仓失败 1 条：`src/components/DisguiseTextarea/index.tsx(4,30): TS2307 Cannot find module '../DebounceTextArea'`——git status 显示该文件未改动，属 HEAD 既有基线问题；本次改动文件全部通过 tsc/eslint/prettier/build。
- Q2: 根因：仓库基线缺失组件文件（可能是进行中的工作，或误删未提交）。
- Q3: 已处理（用户授权）：DisguiseTextarea 以 antd `Input.TextArea` 兜底 + TODO 说明防抖能力暂缺；`pnpm verify` 三闸全绿收口。沉淀价值：跨 Task 遇到「基线文件损坏」时先 git status 确认归属 → 输出锁外一律先征求授权再动，符合规约。

## v2 迭代记录（frontend-design 需求反馈）

> 反馈：① 页面丑；② 表头字体颜色不对；③ 预览时要能对整封邮件微调；④ 抽屉太窄。

| #   | 处理                                                                                                                                                                                                                                                                                                  | 文件                                                                                                                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ②   | 根因：表头常用「主题色 + tint」（默认表格样式白字蓝底），旧实现只解析 argb、主题色被丢弃。新增 Office 默认主题 12 色表 + tint 向白/黑线性混合近似 + indexed 0-7 基础色兜底                                                                                                                            | `src/features/excel-to-html/parseExcel.ts`                                                                                                                                                                  |
| ①③④ | 页面重构为「邮件工作台」：左栏撰写 + 素材、右栏点阵工作台 + 664px 白色信纸实时成品预览（跟随编辑防抖刷新，表格以保真 sourceHtml 组装）；新增「成品预览/微调」抽屉（宽 ≤1120px、可编辑信纸，微调写回编辑器并按块同步 slot.sourceHtml，支持就地复制/下载成品）；表格预览抽屉加宽至 920px 并置于浅灰衬底 | `src/pages/mail/template/index.tsx` `index.module.css` `components/MailPreviewDrawer.tsx`（新增）`components/TablePreviewDrawer.tsx` `src/features/excel-to-html/toEmailHtml.ts`（buildMailCanvasDocument） |

**校验**：tsc 0 error / eslint 0 / prettier 通过 / `pnpm build` 通过。

**v2 复盘三问**

- Q1: 0 error（首轮即绿）。
- Q2: 根因：无类型/规范报错；设计重构主要在 CSS 变量令牌 + 组件拆分（新增一个抽屉文件、主页面按「组合式 composeBody」复用组装逻辑）。
- Q3: 有沉淀价值：① Excel 主题色+索引色解析是可复用能力；②「编辑器内容（归一化）与成品导出（保真）双轨」模式在邮件类功能中通用；③ contentEditable 微调 + 按块回写 slot 的做法可作为同类“预览微调”参考。

**遗留手工验证**（需要浏览器 + 真实 xlsx）：

1. 表头主题色白字蓝底是否按预期显示（预览抽屉/信纸画布）；
2. 可编辑信纸的微调 → 「应用微调并回到编辑器」后：正文文字改动保留、表格微调保留、导出与画布一致；
3. 窄屏（<1240px）下页面切换为单栏布局是否可用。

## v3 迭代记录（表头颜色/边框复现修复）

> 反馈：表头字体颜色仍不对；表格边框完全没有。用户提供复现样表 `.debug/测试表格.xlsx`，并提示可结合本地 xlsx（openpyxl）技能交叉分析。

**诊断（对拍实证，非猜测）**：exceljs 逐格 dump + 解包 xlsx 对拍 `sheet1.xml / styles.xml / theme1.xml` 三方交叉验证，样表真实内容是：

- 表头 = 红底 `#C00000`（argb 正常）+ 字体 `theme 0`（标准 Office 主题 = dk1 黑），仅一条 thin 下边框；
- 正文 = 字体 `theme 1`（lt1 **白**）+ **无底色、无任何边框**；
- 即：文件本身是「白字无底、无边框」的坏数据（疑似生成器/工具产物），Excel 里同样看不清——忠实还原必然「看着坏」。
- 附带发现：样表主题为 WPS 风格（accent1=5B9BD5 / accent5=4472C4 与 Office 相反），字体色不受影响。

| #                | 处理                                                                                                                                                                                                                                  | 文件                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A 可读性兜底     | 文字与底色对比度 < WCAG AA(4.5) 时强制换可读色（浅底→深墨 `#333`，深底→纯白）：表头「黑字红底」→ 白字红底（经典观感）；正文「白字白底」→ 黑字，不再隐身。白字在深/中色底（Excel 自带表格样式）不受影响。邮件正文禁止出现隐身/发闷文字 | `toEmailHtml.ts`（新增 `effectiveFontColor` / `channelLuminance` / `hexLuminance` / `contrastRatio`） |
| B 网格线兜底     | 单元格某边无显式边框 → 补浅灰细线 `1px solid #d9d9d9`（Excel 默认网格线色），显式边框优先——所见即 Excel 屏幕观感，无边框表格不再"光秃"                                                                                                | `toEmailHtml.ts`（`pushBorders` 重写 + `GRIDLINE_CSS`）                                               |
| C indexed 全色板 | indexed 调色板从 0-7 扩为完整 64 色经典表；64/65 等系统色（auto/windowText）越界返回 undefined（随主题环境变化，不硬猜）                                                                                                              | `parseExcel.ts`（`INDEXED_PALETTE_COLORS`）                                                           |

**校验**：tsc 0 error / eslint 0 / prettier 通过 / `pnpm build` 通过。

**v3 复盘三问**

- Q1: tsc 报错 `toEmailHtml.ts` TS2538/TS18048（可选链下 `sideBorder` 未收窄）；改写为先取 `styleName` 再收窄后 0 error。eslint/prettier 0。
- Q2: 根因：`!css \|\| sideBorder.style === 'none'` 中 TS 无法在第二个操作数收窄可选链结果。
- Q3: 有沉淀价值：①「样式忠于文件 ≠ 忠于用户观感」——邮件转换须加可读性兜底，坏数据/生成器假文件会产出隐身文字；② Excel 网格线是视图层属性、不在文件里，无边框表需补网格线才贴近用户屏幕预期；③ 排查"颜色/边框读不对"应解包 xlsx 对拍 `styles/sheet/theme` XML，而非反复改映射猜测。

**v3 遗留**：非 Office/WPS 主题的真实色仍按默认 12 色近似（含 accent1/5 顺序差异）；如需 100% 还原需浏览器端解析 `xl/theme/theme1.xml`（需 zip 解压能力，另立任务）。`.debug/` 内保留样表与诊断脚本，仅作回归用。

## v4 修正记录（theme 索引映射反转 —— 真正根因）

> 触发：用户用 Excel/WPS 手工新建「红底白字表头 + 黑字正文」标准答案文件 `.debug/标准答案.xlsx`，dump 结果与样表一致（表头 font `theme=0`、正文 `theme=1`）——证明**白字就是存成 theme=0**，文件从头到尾都是正常的。

**根因更正**：styles.xml 的 `CT_Color@theme` 索引遵循 **Excel 约定，与 theme1.xml clrScheme 子节点顺序不同**：

- Excel 约定：**0=lt1（白）、1=dk1（黑）、2=lt2、3=dk2**（dk/lt 两对互换），4-9=accent1-6、10=hlink、11=folHlink（与 XML 顺序一致）；
- 旧实现误按 XML 顺序把 0 当 dk1 黑、1 当 lt1 白 → **白字表头读出黑、黑字正文读出白**，v2 起一直反着；
- v3 的「样表是坏数据」结论**不成立**，予以撤销（文件正常，是映射反了）。

**修正**：`OFFICE_THEME_COLORS` 调整为 Excel 索引约定顺序（0=白/1=黑/2=lt2/3=dk2/4-9=accent…），附注释说明互换原因。表头 theme0 → `#FFFFFF`，正文 theme1 → `#000000`。

**校验**：tsc 0 error / eslint 0 / prettier 通过 / `pnpm build` 通过。

**v4 复盘三问**

- Q1: 0 error（仅常量顺序 + 注释变更）。
- Q2: 根因：对 SpreadsheetML 主题索引语义理解错误——误把 clrScheme XML 子节点顺序当作索引表；实际 Excel 在 dk/lt 两对上与 XML 顺序互换（accent 对齐）。真实用户文件（theme0=白字）一锤定音。
- Q3: 有沉淀价值（强烈）：**styles.xml theme 索引 ≠ theme1.xml 子节点顺序**——0=lt1 白、1=dk1 黑、2=lt2、3=dk2；这是 Excel/WPS 转换的经典陷阱，必须写入错题集。另沉淀排查方法：让用户用 Excel 手工做一个"已知期望"的最小文件当标准答案，dump 对拍，比任何语义猜测都快。

## v5 修正记录（撤销"可读性兜底"，颜色完全忠于文件）

> 触发：映射修正后用户重测「红底黑字.xlsx」，预览却被渲染成**白字红底**——v3 加的 WCAG AA(4.5) 可读性兜底把黑字（对比度 3.24 < 4.5）强制翻白。

**处理**：删除 `toEmailHtml.ts` 中全部对比度改写逻辑（`MIN_CONTRAST_RATIO` / `INK_FALLBACK` / `PAPER_FALLBACK` / `channelLuminance` / `hexLuminance` / `contrastRatio` / `effectiveFontColor`），`pushFontAppearance` 恢复直接输出 `style.fontColor`。**颜色 100% 忠于文件，包括用户刻意做的黑字深底等低对比组合**；网格线兜底（v3-B）保留（贴近 Excel 屏幕观感，非颜色改写）。

**校验**：tsc 0 error / eslint 0 / prettier 通过。

**v5 复盘三问**

- Q1: 0 error（纯删除）。
- Q2: 根因：v3 在映射反转的误判下引入了"观感优先"改写，映射修正后该改写反而破坏用户刻意样式——**渲染层不得替用户做审美决策**。
- Q3: 有沉淀价值：样式转换类功能只允许"降级到接近值/明示警告"，不允许"改写用户显式指定的颜色"；对比度兜底若确有必要，应作为可选项而非默认。

## v6 迭代记录（主流程对齐：预览 = 模板+Excel 结合后的整封邮件）

> 反馈：① 红底黑字预览成红底白字（v5 已修）；② 主流程与约定不符——约定为「预设模板 → 上传 Excel → 点预览将模板与 excel 结合在富文本里渲染用于微调 → 保存」，而旧实现「预览表格样式」只弹孤表抽屉，需再选插槽点应用才结合。用户选定：预览应直接看结合后的整封邮件；保存本期不处理。

**处理**：

- 主路径改为「预览结合效果」（上传后主按钮 + 工作表 Select）：点击即把**所选工作表接入正文首个空闲插槽**，打开成品结合预览抽屉（可编辑信纸，width ≤1120px）——所见即"模板+表格"成品，可直接点改；
- 「应用微调并回到编辑器」：先落槽（applySheetToSlot 记录 token→sheet 绑定与保真 sourceHtml），再 handleApplyDraft 把微调后正文写回富文本编辑器并同步表格块改动到槽位；
- 已全部注入后同一入口退化为"当前成品整封微调"（meta 为空）；孤表核对降级为次级入口「表格样式核对」（多表多槽高级路径保留）；
- 文件：`src/pages/mail/template/index.tsx`（openCombinedPreview / handleApplyCombined / sheetIndex Select）、`components/MailPreviewDrawer.tsx`（MailApplyMeta + applyMeta/applyHint 参数），`docs/mail-template/prd.md` 交互细节同步。

**校验**：tsc 0 error / eslint 0 / prettier 通过 / `pnpm build` 通过。

**v6 复盘三问**

- Q1: 0 error（首轮即绿；openCombinedPreview 分支数在复杂度限内，handleApplyCombined 复用了既有 applySheetToSlot + handleApplyDraft）。
- Q2: 根因：无类型/规范报错；交互重构基于"把绑定动作从孤表抽屉前移到预览动作本身"。
- Q3: 有沉淀价值：① 需求里的"预览"若语义含糊，先问清「预览什么」（孤表 or 结合成品）再动手，避免做出第二个入口；② 复用既有 apply+writeback 原语组装新流程，新增代码量最小化。

## v7 修正记录（裁剪尾部空行/空列）

> 触发：原表 7 列，用户清空 4 列内容（含表头）后，渲染仍把 4 个空列画出来。

**根因**：Excel「清空」只删内容、样式仍残留（单元格带 `s` 引用留在 XML），exceljs 的 `worksheet.columnCount/rowCount` 会把这些"空但有样式"的行列计入 → 渲染出空列。

**验证（Node 复现）**：exceljs 生成 A-C 有内容、D-G 仅有样式（fill/border）的文件，重载后 `columnCount = 7`（预期 3），内容边界算法得 `3` ✓。

**处理**：`parseExcel.ts` 新增 `contentBounds()`——按"非空文本单元格 + 其合并跨度的右/下边界"计算 1-based 内容边界，`parseSheet` 据此裁剪尾部空行/空列后再算列宽与行列数；全空工作表提示跳过。列/行裁剪不截断有效合并跨区。

**校验**：tsc 0 error / eslint 0 / prettier 通过 / `pnpm build` 通过。

**v7 复盘三问**

- Q1: 0 error（首轮即绿；parseSheet 分支数未超限）。
- Q2: 根因：对 exceljs 语义理解不足——rowCount/columnCount 含"仅样式"单元格；Excel 清除内容不清样式。
- Q3: 有沉淀价值：exceljs 的行列计数 ≠ 内容边界，导出/渲染前须按内容裁剪；"清空"（Delete）与"删列"（Delete Columns）在文件里完全不同，排查用户"删了还显示"类问题先确认操作类型。

## v8 变更记录（功能收敛为单文件夹，便于迁移）

> 诉求：把散落在 `src/pages/mail/template`（页面+抽屉）与 `src/features/excel-to-html`（解析/渲染逻辑）的功能收到一个文件夹，方便整体迁移到其他项目。

**处理**：收敛为 `src/features/mail-template/`，结构见其 `README.md`：

```
src/features/mail-template/
  index.tsx / index.module.css     页面（默认导出）+ 样式
  MailPreviewDrawer.tsx            成品结合预览/微调抽屉
  TablePreviewDrawer.tsx           表格样式核对抽屉
  excel-to-html/                   解析 + 邮件 HTML 渲染（5 文件原样迁入）
  README.md                        依赖清单 + 迁移步骤 + 挂载点说明
```

- 内部引用全部改为 `./` 相对导入（无 `../`、不依赖仓内其他 `src/` 业务代码），整目录可复制迁移；
- 挂载点仅剩两处：`src/router/routes/index.tsx` 懒加载路径改为 `src/features/mail-template`；侧边菜单入口路径不变（`/mail/template`）；
- 旧目录 `src/pages/mail/template`、`src/features/excel-to-html` 已删除；本文档 v8 之前记录中的旧路径为历史快照（迁移前位置），不再更新。
- 说明：页面移出 `src/pages` 后不再命中「antd 组件替换」的 pages eslint 作用域，但代码本就合规（SButton/createDrawer/纯 antd 非禁用组件）。

**校验**：tsc 0 error / eslint 0 / prettier 通过 / `pnpm build` 通过。

**v8 复盘三问**

- Q1: 0 error（纯文件移动 + 导入路径改写）。
- Q2: 根因：无——结构重构；关键点是保持 feature 内无 `../` 与仓内业务依赖，才能"整包可迁"。
- Q3: 有沉淀价值：需要"可迁移单文件夹"时，约束= ①内部全部 `./` 相对引用；②不 import 仓内其他业务模块（只允许第三方包 + 宿主壳（路由/菜单）单向引用它）；③附 README 写明依赖与注册点。
