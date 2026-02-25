# AI Frontend 开发体系

> 让AI更懂你的架构，根据架构实现你预期的代码。

## 核心设计理念

1. **AI配置集中化** - 所有AI相关配置放在 `.ai/` 目录，与 `src/` 同级
2. **上下文驱动** - AI通过读取配置理解项目，而非硬编码
3. **增量沉淀** - 每次开发都在完善AI对项目的理解
4. **对话即开发** - 直接与AI对话生成代码，无需脚本

## 目录结构

```
my-project/
├── .ai/                      # AI配置目录（核心）
│   ├── README.md             # AI配置说明
│   ├── architecture.md       # 架构规范（AI必读）
│   ├── coding-standards.md   # 代码规范（AI必读）
│   ├── api-conventions.md    # API约定（AI必读）
│   ├── incremental-development.md  # 增量开发规范
│   ├── SUMMARY.md            # 项目概要
│   ├── prompts/              # AI对话模板
│   │   ├── crud-page.md       # 生成CRUD页面
│   │   ├── api-module.md      # 生成API模块
│   │   ├── data-visualization.md # 生成数据可视化页面
│   │   ├── form-designer.md   # 生成表单设计器/动态表单
│   │   ├── detail-page.md     # 生成详情页
│   │   ├── custom-hook.md     # 生成自定义Hook
│   │   └── workflow-page.md   # 生成工作流/审批页面
│   └── context/              # 项目上下文
│       ├── existing-apis.md   # 已有API列表
│       ├── existing-components.md # 已有组件列表
│       └── existing-pages.md  # 已有页面列表
├── scripts/                  # 脚本目录
│   └── update-context.cjs    # 自动化更新项目上下文脚本
├── src/                      # 项目源代码
│   ├── api/                  # API层
│   ├── components/           # 组件层
│   ├── hooks/                # 自定义Hooks
│   ├── pages/                # 页面层
│   ├── router/               # 路由配置
│   ├── stores/               # 状态管理
│   ├── styles/               # 全局样式
│   ├── types/                # 全局类型
│   └── utils/                # 工具函数
├── mock/                     # Mock数据
└── package.json
```

## 快速开始

### 1. 创建新项目

```bash
# 复制模板
cp -r ai-frontend-system/src my-project
cd my-project

# 复制AI配置
cp -r ai-frontend-system/.ai my-project

# 安装依赖
npm install

# 启动开发
npm run dev
```

### 2. 与AI对话生成代码

将 `.ai/` 目录添加到你的AI助手的上下文中，然后直接对话：

**示例1: 生成CRUD页面**

```
请根据以下接口定义，生成商品管理的CRUD页面：

模块: product
基础路径: /api/products

接口:
1. GET /api/products - 获取列表
   参数: page, pageSize, keyword, categoryId
   响应: { list: Product[], total: number }

2. GET /api/products/:id - 获取详情
   响应: Product

3. POST /api/products - 创建
   参数: name, price, stock, categoryId, description
   响应: Product

4. PUT /api/products/:id - 更新
   参数: name, price, stock, categoryId, description
   响应: Product

5. DELETE /api/products/:id - 删除

类型:
Product {
  id: string
  name: string
  price: number
  stock: number
  categoryId: string
  description: string
  status: 'on_sale' | 'off_sale'
  createTime: string
}
```

AI会自动：

1. 读取 `.ai/architecture.md` 了解技术栈
2. 读取 `.ai/coding-standards.md` 了解代码规范
3. 读取 `.ai/api-conventions.md` 了解API约定
4. 生成符合规范的代码

### 3. 自动化更新项目上下文

使用提供的脚本自动扫描项目并更新 `.ai/context/` 目录：

```bash
pnpm update-context
```

该脚本会自动：

- 扫描 `src/api/` 目录，更新 `existing-apis.md`
- 扫描 `src/components/` 目录，更新 `existing-components.md`
- 扫描 `src/router/` 配置，更新 `existing-pages.md`

**手动更新（可选）：**

```markdown
# .ai/context/existing-apis.md

## 商品模块 (api/product/)

- getList - 获取商品列表
- getById - 获取商品详情
- create - 创建商品
- update - 更新商品
- delete - 删除商品
```

## 技术栈

| 类别     | 技术                            | 版本              |
| -------- | ------------------------------- | ----------------- |
| 构建工具 | RSBuild                         | ^1.7.0            |
| 框架     | React                           | ^18.3.0           |
| 语言     | TypeScript                      | ^5.5.0            |
| UI库     | Ant Design                      | ^5.20.0           |
| 高级组件 | ProComponents                   | ^2.8.0            |
| 状态管理 | Zustand + immer                 | ^5.0.11           |
| 路由     | React Router                    | ^6.26.0           |
| HTTP     | Axios                           | ^1.7.0            |
| Hooks    | ahooks                          | ^3.8.0            |
| 图表     | Chart.js + react-chartjs-2      | ^4.4.0 / ^5.2.0   |
| 图标     | Lucide React + Ant Design Icons | ^0.400.0 / ^5.4.0 |

## AI配置说明

### architecture.md

定义项目的技术栈、目录结构、核心约定。AI必须遵循这些规范生成代码。

### coding-standards.md

定义代码规范，包括：

- TypeScript规范
- React组件规范
- API层规范
- 状态管理规范
- 导入导出规范

### api-conventions.md

定义AI如何根据后端接口定义生成前端代码，包括：

- 接口定义格式
- 类型定义生成规则
- API实现生成规则
- 页面组件生成规则

### incremental-development.md

定义增量开发规范，包括：

- 上下文管理策略
- 代码组织模式
- AI对话最佳实践
- 代码演进策略

## 核心Hooks

### useRequest (ahooks)

```tsx
import { userApi } from '@api/user';
import { useRequest } from 'ahooks';

const { data, loading, run } = useRequest(userApi.getList, {
  manual: true,
});

// 使用
run({ page: 1 });
```

### Zustand状态管理

```tsx
import { useUserStore } from '@stores';

const { userInfo, login } = useUserStore();
```

## 最佳实践

### 1. 新项目启动

1. 复制 `src/` 和 `.ai/` 到新项目
2. 更新 `package.json` 中的项目名称
3. 根据业务需求修改 `.ai/architecture.md`
4. 开始开发

### 2. 新增功能

1. 与AI对话描述需求
2. AI生成代码
3. 人工审查和调整
4. 更新 `.ai/context/` 目录

### 3. 代码审查

1. 检查是否符合架构规范
2. 检查类型定义是否完整
3. 检查错误处理是否完善
4. 检查是否有重复代码

### 4. 持续优化

1. 定期更新 `.ai/` 目录中的规则
2. 沉淀最佳实践到文档
3. 更新项目上下文
4. 分享经验给团队

## 常见问题

### Q: 如何让AI理解我的项目？

A: 确保 `.ai/` 目录在你的AI助手的上下文中。AI会自动读取这些配置文件。

### Q: 生成的代码不符合预期怎么办？

A: 调整 `.ai/` 目录中的规则文件，让AI更准确地理解你的需求。

### Q: 如何支持增量开发？

A: 每次新增功能后，更新 `.ai/context/` 目录，帮助AI理解项目现状。

### Q: 团队协作时如何同步AI配置？

A: 将 `.ai/` 目录提交到版本控制，团队成员共享相同的AI配置。

## 示例

### 示例1: 生成用户管理CRUD

见 `.ai/prompts/crud-page.md`

### 示例2: 生成API模块

见 `.ai/prompts/api-module.md`

## 贡献

欢迎提交Issue和PR，共同完善这套AI驱动的前端开发体系！

## 许可证

MIT
