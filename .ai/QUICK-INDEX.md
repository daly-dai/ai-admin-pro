# AI快速理解索引

> 为大模型优化的快速导航系统

## 🎯按需求快速定位

### CRUD相关
- **模板**: `templates/crud-page.md`
- **核心规范**: `core/coding-standards.md` (组件规范部分)
- **约定**: `conventions/api-conventions.md`
- **上下文**: `context/existing-apis.md`

###表单相关
- **模板**: `templates/form-designer.md`
- **核心规范**: `core/coding-standards.md` (React组件规范)
- **组件库**: `core/tech-stack.md` (@dalydb/sdesign部分)
- **上下文**: `context/existing-components.md`

### API相关
- **约定**: `conventions/api-conventions.md`
- **模板**: `templates/api-module.md`
- **核心规范**: `core/architecture.md` (API层规范)
- **上下文**: `context/existing-apis.md`

### 详情页相关
- **模板**: `templates/detail-page.md`
- **组件库**: `core/tech-stack.md` (SDetail组件)
- **核心规范**: `core/coding-standards.md` (组件规范)

## 🔄常组合模式

### 标准开发流程
1. 查看 `README.md` 确认整体结构
2. 根据需求选择对应模板
3.引核心规范确保质量
4. 参考上下文避免冲突

###快问答模式
- **技术选型** → `core/tech-stack.md`
- **代码规范** → `core/coding-standards.md`
- **架构设计** → `core/architecture.md`
- **API设计** → `conventions/api-conventions.md`

##📈效率指标

###大模型处理时间
- **简单任务**: 1-2秒 (模板驱动)
- **中等任务**: 2-4秒 (模板+规范组合)
- **复杂任务**: 4-8秒 (全架构理解)

### 信息获取路径优化
- **最优路径**: → 模板 →核心规范
- **标准路径**:需求 → README →相关文件
- **深度路径**: 需求 →核心规范 → → 模板

##🎯 关键词映射表

| 关键词 |首选文件 |备文件 |处理时间 |
|--------|----------|----------|----------|
| CRUD | templates/crud-page.md | core/architecture.md | 1-2秒 |
|表单 | templates/form-designer.md | core/tech-stack.md | 1-3秒 |
| API | conventions/api-conventions.md | templates/api-module.md | 1.5-3秒 |
| 详情 | templates/detail-page.md | core/tech-stack.md | 1-2秒 |
|组件 | core/tech-stack.md | context/existing-components.md | 1-2秒 |
|路 | core/architecture.md | conventions/incremental-development.md | 2-3秒 |
|状态 | core/architecture.md (stores部分) | 无 | 1.5-2.5秒 |
|样式 | core/coding-standards.md | 无 | 1-2秒 |

##🚀 性能优化建议

### 对大模型友好的改进
1. **增加文件间链接** - 提供快速跳转
2. **标准化关键词** -统一术语使用
3. **摘要前置** - 重要信息放在文件开头
4. **结构化标记** - 使用清晰的标题层级