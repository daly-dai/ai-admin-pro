# mail-template（邮件模板 v2，可整体迁移）

给用户讲解的纯前端 Demo：**模板管理 → 报表上传 → mock 在线编辑 → 发布 → 预览结合 → 发送**。
全部代码收敛在 `src/features/mail-template/` 单目录内（模块内部跨子目录用 `./`、`../`
相对导入，不依赖模块外业务代码）；复制整个目录即可迁往其他项目。详细需求与迭代记录见
仓库 `docs/mail-template/prd.md` 与 `docs/mail-template/tasks.md`。

## 页面与路由

| 页面              | 路由                    | 说明                                                    |
| ----------------- | ----------------------- | ------------------------------------------------------- |
| 模板列表（CRUD）  | `/mail/template`        | 列表/搜索/新增/编辑/删除；「进入工作台」                |
| 工作台（详情）    | `/mail/template/:id`    | 信息条 + 报表列表/平铺/iframe；权限演示；预览/发送入口  |
| mock 在线编辑平台 | `/mail/template/editor` | iframe 目标（顶层路由，不带后台布局），`?reportId&mode` |

预览结合 = 工作台顶栏「预览结合效果」按钮打开的**抽屉**（非独立路由）。

## 目录结构（v2）

```
mail-template/
  index.tsx                   列表页主入口（STable CRUD）
  TemplateFormModal.tsx       新增/编辑抽屉（wangEditor 富文本 + 通讯录多选）
  presetBodies.ts             预设正文（均含恰好 1 个 {{table}}）
  workspace/                  工作台：信息条 + 报表工作区 + 阅读/编辑 iframe + 权限演示
  mock-editor/                mock 在线编辑平台页（阅读/可编辑/无权限三态）
    communication.ts          postMessage 协议纯函数（解析校验 + 编辑记录收集）
  preview/                    预览结合抽屉（宽度模式选择）+ 发送链路
    payload.ts                payload 组装纯函数（{{table}} 注入等）
  excel-to-html/              渲染内核：解析 + 邮件安全表格 HTML + exceljs 回写
    parseExcel.ts             .xlsx → ParsedSheet（样式快照、内容边界裁剪）
    toEmailHtml.ts            ParsedSheet → 保真表格 HTML（preserveWidth 可保留原始列宽）
    applyCellEdits.ts         编辑记录 → exceljs 回写导出（样式 100% 保留）
    placeholder.ts            {{table}} token 定位/替换
    numFmt.ts / types.ts      数字格式 / 领域类型
  service/                    mock 数据层（localStorage）+ 接口化门面
    templateService.ts        模板 CRUD（校验单一来源 templateRules）
    reportService.ts          报表列表/上传/下载/权限/发布存回
    mailSender.ts             mock 发送（延迟成功 + payload 回显）
    types.ts                  MailTemplate/Report/SendMailPayload
    users.ts                  通讯录 mock（userInfo，不展示邮箱）
```

## 功能要点

- **模板 CRUD**：名称（=邮件主题）/收件人/抄送（userInfo 通讯录多选）/富文本正文
  （wangEditor + 2 套预设，校验恰好 1 个 `{{table}}`）；localStorage 持久化、刷新不丢。
- **工作台**：顶部紧凑信息条（SDetail）+ 报表工作区（左列表 | 右平铺/iframe）；
  上传 `.xlsx`（扩展名/大小/PK 校验、同名覆盖确认）；权限演示面板（禁止上传 /
  无查看权限 → 列表消失 / 仅查看 → 编辑被平台拦截）。
- **mock 在线编辑**：报表阅读/编辑 = iframe 切 `?mode=read|edit`，父页 ⇄ iframe 走
  postMessage（init/ready/save-request/saved/error）模拟跨域平台；编辑仅改单元格值，
  发布 = exceljs 回写原 workbook 重新导出 → 存回报表。
- **预览结合**：模板正文 + 所选报表表格注入 `{{table}}`（保真渲染）；宽度模式可选
  「全宽」（贴合公司邮件）/「邮件宽 600px」；信纸可点按微调；**发送** = 确认框 →
  mock 发送 → toast + console 完整 payload；无保存/下载/复制，发送后数据不变。
- **渲染保真**：颜色/字体/边框/底色/合并单元格 100% 忠于文件字节；无显式边框补浅灰
  网格线；按内容边界裁空行/空列；列宽默认按 Excel 原始宽度展示（preserveWidth），
  超宽横向滚动，不压缩列。

## service 替换点（接真实后端）

| 模块     | 替换对象                                                                   |
| -------- | -------------------------------------------------------------------------- |
| 模板     | `service/templateService.ts` 各 `ByPost/ByGet` 方法                        |
| 报表     | `service/reportService.ts`（列表/上传/下载/权限/发布存回）                 |
| 发送     | `service/mailSender.ts` `sendMailByPost`（真实后端按 userInfo 换邮箱发信） |
| 本地存储 | `service/templateStore.ts`（localStorage 适配器，只换它即可）              |

业务规则全部下沉纯函数（`templateRules`/`reportAccess`/`reportFileValidation`/
`mock-editor/communication.ts`/`preview/payload.ts` 等），接后端时逻辑核与测试原样保留。

## 测试命令

- 全量用例：`pnpm test`（= `vitest run`；沙箱环境需 threads 池，原因见根
  `vitest.config.ts` 注释；用例与被测模块同目录 `*.test.ts`，显式 import vitest）。
- 三闸门：`pnpm verify`（tsc + eslint + prettier）。
- 手工演示回归文件在 `.debug/`（测试工具.xlsx / 标准答案.xlsx / 红底黑字.xlsx）。

## 外部依赖（迁移目标项目需安装）

```jsonc
{
  "@wangeditor/editor": "^5.1.23", // 富文本（含副作用注册，先于页面 import）
  "@wangeditor/editor-for-react": "^1.0.6",
  "exceljs": "^4.4.0", // .xlsx 解析 + 回写
  // 宿主常规依赖：react / antd5 / @dalydb/sdesign（SButton/SDetail/createDrawer）/
  // @ant-design/icons / dayjs / ahooks
}
```

## 涉及宿主项目的挂载点（仅这三处，迁移时注意）

| 位置                          | 改动                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| `src/router/routes/index.tsx` | 列表 `/mail/template`、工作台 `/mail/template/:id`、mock 编辑 `/mail/template/editor`（顶层） |
| `src/layouts/MainLayout.tsx`  | 菜单组「邮件工具 → 邮件模板」指向 `/mail/template`                                            |
| 依赖清单                      | 见上文「外部依赖」                                                                            |
