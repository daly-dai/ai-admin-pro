# AI配置中心

>前端开发助手配置目录

##📁目录结构

```
.ai/
├── README.md              # 本文件 - 总览和导航
├── core/                  #心规范（AI必须遵循）
│   ├── architecture.md     #架规范规范
│   ├── coding-standards.md # 代码规范
│  └── tech-stack.md      #技术栈定义
├── conventions/            #📋约规范（开发指导）
│   ├── api-conventions.md  # API约定
│  └── incremental-development.md #开发规范
├── templates/             #模板（代码生成）
│   ├── api-module.md       # API模块模板
│   ├── crud-page.md        # CRUD页面模板
│   ├── detail-page.md      # 详情页面模板
│   ├── form-designer.md    #表单设计器模板
│   ├── custom-hook.md      # 自定义Hook模板
│   ├── data-visualization.md # 数据可视化模板
│  └── workflow-page.md    #工作流页面模板
└── tools/                 # 工具脚本
    └── update-context.js   # 上下文更新工具
```

##🚀快速开始

### 1. 新项目初始化
```bash
#将 .ai目录复制到新项目根目录
# AI会自动读取所有配置文件
```

### 2. 日常开发流程
1. **需求分析**:明确要实现的功能
2. **模板选择**: 根据需求选择合适的模板
3. **参数配置**:接口定义和业务需求
4. **AI生成**:让生成I生成代码
5. **代码审查**: 人工审查和调整

### 3.开发
```bash
#每次新增功能后更新项目上下文
pnpm update-context
```

## 🎯核心原则

### 1.配置即代码
- AI配置是项目的一部分
- 配置随项目演进而更新
- 所有规范都有明确的文档

### 2.约优于配置
- 固定模式，减少配置
- AI可预测代码结构
- 降低沟通成本

### 3.沉淀
- 开发都在完善AI理解
- 上下文自动更新
- 知识持续积累

### 4. 自动化优先
- 使用脚本自动更新上下文
- 减手动维护工作
- 提高一致性

##📚学路径

### 新手入门
1. [core/architecture.md](core/architecture.md) - 了解项目架构
2. 阅 [core/coding-standards.md](core/coding-standards.md) -掌代码规范
3. [core/tech-stack.md](core/tech-stack.md) -技术栈
4. 实践 [templates/crud-page.md](templates/crud-page.md) - 生成第一个CRUD页面

### 进阶应用
1. [conventions/api-conventions.md](conventions/api-conventions.md) -掌API设计
2. [conventions/incremental-development.md](conventions/incremental-development.md) -理解增量开发
3. 实践 [templates/form-designer.md](templates/form-designer.md) -构建复杂表单

### 专家级别
1. [templates/](templates/) - 创建新的模板
2. 优化 [conventions/](conventions/) -改进开发规范
3.扩 [tools/](tools/) - 开发辅助工具

##🔧常操作

### 生成API模块
```markdown
使用模板: templates/api-module.md
场景: 新增业务模块API
输出: api/[module]/types.ts + api/[module]/index.ts
```

### 生成CRUD页面
```markdown
使用模板: templates/crud-page-sdesign.md（推荐）
场景: 新增业务模块CRUD页面
输出: pages/[module]/index.tsx + pages/[module]/create.tsx + pages/[module]/edit.tsx + pages/[module]/detail.tsx
```

```markdown
使用模板: templates/crud-page.md
场景: 标准增删改查页面
输出: pages/[module]/index.tsx + pages/[module]/create.tsx + pages/[module]/edit.tsx + pages/[module]/detail.tsx
```

### 组件使用规范
```markdown
参考文档: conventions/ui-component-conventions.md
核心原则: @dalydb/sdesign (核心) + Ant Design 5 (辅助)
```

### 生成详情页面
```markdown
使用模板: templates/detail-page.md
场景: 数据详情展示
输出: pages/[module]/[id]/index.tsx
```

### 生成表单页面
```markdown
使用模板: templates/form-designer.md
场景:复表单处理
输出: components/business/[FormName]/
```

## 📊 项目状态

### 当前技术栈
- **核心**: @dalydb/sdesign (配置式组件库)
- **基础**: React 18 + TypeScript + Ant Design 5
- **状态**:稳定版本

###规范成熟度
- ✅ 架构规范 -已完善
- ✅ 代码规范 - 已完善  
- ✅ API约定 -已完善
- ✅模板库 - 8个核心模板
- ⏳ 最佳实践 - 持续积累中

##🤝贡指南

### 提交规范
1. **新增模板**: 在 [templates/](templates/)目录创建
2. **修改规范**: 更新对应的核心文件
3. **优化工具**: 在 [tools/](tools/) 目录改进

### 评审标准
- [ ] 是否符合架构规范
- [ ] 是否提高开发效率
- [ ] 是否降低维护成本
- [ ] 是否有充分的文档说明

## 📞支持与反馈

- **问题反馈**: 通过项目issue系统
- **功能建议**: 提交feature request
- **文档改进**:直提交PR
- **最佳实践**: 分享到 [conventions/best-practices.md](conventions/best-practices.md)

---
*让AI成为您最得力的开发助手！*