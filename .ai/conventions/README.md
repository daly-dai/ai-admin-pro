# 开发约定

> 前端开发的规范和约定

## 📋 约定分类

### 🎯 核心约定

- [api-conventions.md](api-conventions.md) - API 接口定义约定
- [ui-component-conventions.md](ui-component-conventions.md) - UI 组件使用约定
- [incremental-development.md](incremental-development.md) - 增量开发规范

### 📖 文档说明

| 文档 | 用途 | 优先级 |
|------|------|--------|
| api-conventions.md | 后端接口定义格式 | ⭐⭐⭐⭐⭐ |
| ui-component-conventions.md | UI 组件使用规范 | ⭐⭐⭐⭐⭐ |
| incremental-development.md | 增量开发流程 | ⭐⭐⭐⭐ |

## 🚀 使用流程

### 1. API 开发

1. 后端提供符合 [api-conventions.md](api-conventions.md) 格式的接口定义
2. AI 根据接口定义生成前端 API 代码
3. 开发人员进行必要调整

### 2. UI 开发

1. 遵循 [ui-component-conventions.md](ui-component-conventions.md) 组件使用规范
2. 优先使用 @dalydb/sdesign 组件库
3. Ant Design 作为辅助组件库

### 3. 增量开发

1. 遵循 [incremental-development.md](incremental-development.md) 规范
2. 沉淀项目上下文信息
3. 支持持续迭代开发

## 🎯 最佳实践

### 1. 组件使用优先级

```
@dalydb/sdesign (核心) > Ant Design (辅助) > 原生 HTML (禁止)
```

### 2. 代码组织模式

```
按功能模块组织 > 按类型组织 > 混合组织
```

### 3. 开发流程

```
接口定义 > 代码生成 > 人工调整 > 测试验证
```

---

*遵循以上约定，确保代码一致性和开发效率！*
