# AI 模板库

> 用于 AI 生成代码的标准化模板

## 📋 核心模板（常用）

| 模板 | 用途 | 输出 |
|------|------|------|
| [crud-page.md](crud-page.md) | CRUD 页面生成 | `pages/[module]/*.tsx` |
| [form-designer.md](form-designer.md) | 表单页面生成 | `components/business/[Form]/` |
| [detail-page.md](detail-page.md) | 详情页面生成 | `pages/[module]/[id].tsx` |
| [api-module.md](api-module.md) | API 模块生成 | `api/[module]/*.ts` |

## 📁 归档模板（按需使用）

位于 [archived/](archived/) 目录：

- `custom-hook.md` - 自定义 Hook
- `data-visualization.md` - 数据可视化

## 🚀 使用流程

1. **选择模板** - 根据需求选择对应模板
2. **填写参数** - 按模板格式填写业务参数
3. **生成代码** - 将完整模板提供给 AI
4. **审查调整** - 人工审查并微调

## 💡 最佳实践

- 优先使用 **@dalydb/sdesign** 组件库（配置式开发）
- 组件库文档：`.ai/core/sdesign-docs.md`
- 接口定义要完整，类型要明确
