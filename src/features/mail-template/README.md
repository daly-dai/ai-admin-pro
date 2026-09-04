# mail-template（邮件模板工作台，可整体迁移）

邮件模板编辑 + Excel 表格注入 + 成品预览微调 + 邮件安全 HTML 导出的
**单文件夹实现**。页面与全部业务逻辑都在这一个目录内，内部引用一律为
`./` 相对导入（无 `../`、无对仓内其他 `src/` 文件的依赖），复制本目录
即可迁往其他项目。

## 目录结构

```
mail-template/
  index.tsx                 页面主入口（默认导出 MailTemplatePage）
  index.module.css          页面样式（CSS Modules，变量令牌）
  MailPreviewDrawer.tsx     成品结合预览/微调抽屉（createDrawer）
  TablePreviewDrawer.tsx    表格样式核对抽屉（createDrawer）
  excel-to-html/            解析 + 邮件 HTML 渲染纯逻辑
    parseExcel.ts           .xlsx 解析（exceljs）→ ParsedSheet
    toEmailHtml.ts          ParsedSheet → 邮件安全 HTML（含网格线/主题色解析）
    numFmt.ts               Excel 数字格式子集 → 文本/日期
    placeholder.ts          插槽 token 定位/替换、表格块扫描
    types.ts                领域类型（ExcelCell/ParsedSheet/MailTableSlot…）
  README.md                 本文件
```

## 功能要点

- 富文本（wangEditor v5）预设模板，占位符 `{{table}}` / `{{table:N}}` 插槽
- 上传 `.xlsx`（纯前端解析，不上传）→「预览结合效果」把所选工作表接入
  插槽，直接预览「模板 + 表格」整封邮件并微调，应用后写回富文本
- 样式保真：字体/字号/粗斜/下划线/颜色、底色、四边框、对齐、自动换行、
  合并单元格、列宽等比缩放、常见数字格式；主题色按 Excel 索引约定
  （0=lt1 白 / 1=dk1 黑 / 2=lt2 / 3=dk2，accent 4-9 对齐）近似；
  indexed 完整 64 色调色板；无显式边框的边补浅灰网格线（所见即 Excel 屏幕）
- 内容边界裁剪：Excel「清空」残留样式的尾部空行/空列不渲染
- 导出：复制/下载完整邮件 HTML（仅 table/tr/td + 内联样式，600px，
  Outlook/Gmail 安全子集）

## 外部依赖（迁移目标项目需安装）

```jsonc
{
  "@wangeditor/editor": "^5.1.23",          // 富文本（含副作用注册）
  "@wangeditor/editor-for-react": "^1.0.6",
  "exceljs": "^4.4.0",                      // .xlsx 解析
  // 另有宿主项目常规依赖：react / antd5 / @dalydb/sdesign（SButton、
  // createDrawer）/ lodash-es / @ant-design/icons
}
```

## 迁移步骤

1. 复制本目录到目标项目（如 `src/features/mail-template/`）；
2. 安装上方依赖（注意 `@wangeditor/editor` 须先于页面 import，样式
   `@wangeditor/editor/dist/css/style.css` 已随页面引入）；
3. 注册路由：懒加载本目录默认导出，如
   `lazyPage(() => import('src/features/mail-template'))`；
4. （可选）在侧边菜单加入口，路径指向上面注册的 route path；
5. 无其他改动——本目录不依赖宿主项目任何业务代码。

## 涉及宿主项目的挂载点（仅这三处，迁移时注意）

| 位置 | 改动 |
| ---- | ---- |
| `src/router/routes/index.tsx` | 新增 `mail/template` 路由，懒加载本目录 |
| `src/layouts/MainLayout.tsx`  | 菜单组「邮件工具」加入口 |
| 依赖清单                   | 见上文「外部依赖」 |

> 行为口径：纯前端 Demo——不做真实发信、不做持久化（刷新即重置）、
> 不做邮件合并。详细需求与迭代记录见仓库 `docs/mail-template/prd.md`
> 与 `specs/mail-template-tasks.md`。
