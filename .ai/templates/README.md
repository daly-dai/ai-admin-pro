# AI 模板库

> 用于 AI 生成代码的标准化模板

## 📋 模板分类

### 🎯 核心模板

- [crud-page.md](crud-page.md) - CRUD 页面生成（通用版，使用 Ant Design）
- [crud-page-sdesign.md](crud-page-sdesign.md) - CRUD 页面生成（@dalydb/sdesign 版，推荐）
- [api-module.md](api-module.md) - API 模块生成
- [detail-page.md](detail-page.md) - 详情页面生成

### 🛠️ 功能模板

- [form-designer.md](form-designer.md) - 表单设计器
- [custom-hook.md](custom-hook.md) - 自定义 Hook
- [data-visualization.md](data-visualization.md) - 数据可视化

### 📈 业务模板

- [workflow-page.md](workflow-page.md) - 工作流页面

## 🚀 使用流程

### 1. 选择模板

根据需求选择合适的模板文件：

| 场景 | 推荐模板 | 说明 |
|------|----------|------|
| 通用 CRUD | crud-page.md | 使用 Ant Design 组件 |
| 配置式 CRUD | crud-page-sdesign.md | 使用 @dalydb/sdesign 组件库（推荐） |
| API 模块 | api-module.md | 生成 API 接口和类型定义 |
| 详情页 | detail-page.md | 生成详情展示页面 |

### 2. 填参数

按照模板格式填写业务参数和接口定义

### 3. 生成代码

将完整模板提供给 AI 生成代码

### 4. 代码审查

人工审查生成的代码并进行必要调整

## 📊 模板成熟度

| 模板 | 状态 | 使用频率 | 稳定性 |
|------|------|----------|--------|
| CRUD 页面（通用版） | ✅ 生产就绪 | ⭐⭐⭐⭐ | 高 |
| CRUD 页面（sdesign 版） | ✅ 生产就绪 | ⭐⭐⭐⭐⭐ | 高 |
| API 模块 | ✅ 生产就绪 | ⭐⭐⭐⭐ | 高 |
| 详情页面 | ✅ 生产就绪 | ⭐⭐⭐⭐ | 高 |
| 表单设计器 | ✅ 生产就绪 | ⭐⭐⭐ | 中 |
| 自定义 Hook | ⚠️ 测试中 | ⭐⭐ | 中 |
| 数据可视化 | ⚠️ 测试中 | ⭐⭐ | 中 |
| 工作流页面 | ⚠️ 测试中 | ⭐ | 低 |

## 🎯 最佳实践

### 模板使用建议

1. **优先使用 sdesign 模板** - 配置式开发，效率更高
2. **通用模板作为备选** - 适用于特殊场景
3. **功能模板按需选择** - 根据具体场景
4. **业务模板谨慎使用** - 可能需要调整

### 参数填写要点

- 接口定义要完整准确
- 类型定义要明确
- 业务逻辑要清晰描述
- 特殊需求要详细说明

## 📝 指南

### 新增模板

1. 在 templates 目录创建新文件
2. 遵循现有模板格式
3. 提供完整的使用示例
4. 经充分测试验证

### 模板改进

1. 收集使用反馈
2. 识别常见问题
3. 优化模板结构
4. 更新文档说明

---

*让模板成为 AI 开发的标准化工具！*
