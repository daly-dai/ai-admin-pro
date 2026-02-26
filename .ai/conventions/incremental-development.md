# 增量开发规范

> 如何让AI低成本理解现有代码，支持持续迭代开发

## 核心原则

1. **代码即文档** - 通过规范化的代码结构自解释
2. **上下文沉淀** - 将项目信息沉淀在 `.ai/context/` 目录
3. **约定优于配置** - 遵循固定模式，AI可预测代码结构

## 上下文管理

### 1. 已有API清单

文件: `.ai/context/existing-apis.md`

```markdown
# 已有API清单

## 用户模块 (api/user/)

- getList - 获取用户列表
- getById - 获取用户详情
- create - 创建用户
- update - 更新用户
- delete - 删除用户

## 订单模块 (api/order/)

- getList - 获取订单列表
- getById - 获取订单详情
- create - 创建订单
- update - 更新订单
- delete - 删除订单
- getStatistics - 获取订单统计
```

### 2. 已有组件清单

文件: `.ai/context/existing-components.md`

```markdown
# 已有组件清单

## 业务组件 (components/business/)

- UserCard - 用户卡片
- OrderList - 订单列表
- ProductSelector - 商品选择器

## 通用组件 (components/common/)

- DataTable - 数据表格
- SearchForm - 搜索表单
- ImageUpload - 图片上传
```

### 3. 已有页面清单

文件: `.ai/context/existing-pages.md`

```markdown
# 已有页面清单

- /dashboard - 首页
- /users - 用户管理
- /users/:id - 用户详情
- /orders - 订单管理
- /products - 商品管理
```

## 代码组织模式

### 模式1: 按功能模块组织

```
src/
├── api/
│   └── user/               # 用户模块API
│       ├── index.ts        # API实现
│       └── types.ts        # 类型定义
├── pages/
│   └── user/               # 用户模块页面
│       ├── index.tsx       # 列表页
│       ├── detail.tsx      # 详情页
│       └── components/     # 模块私有组件
│           ├── UserForm.tsx
│           └── UserCard.tsx
└── stores/
    └── user.ts             # 用户模块状态
```

**AI理解**: 同一模块的代码在同一目录树下

### 模式2: 组件复用层级

```
components/
├── common/                 # 全局通用（跨项目可复用）
│   ├── DataTable/
│   └── SearchForm/
├── business/               # 业务通用（本项目复用）
│   ├── UserCard/
│   └── OrderList/
└── [page]/                 # 页面私有（仅当前页面）
    └── components/
```

**AI理解**: 组件位置决定复用范围

### 模式3: 类型定义策略

```typescript
// 1. API类型 - 跟随API模块
// api/user/types.ts
export interface User {}
export interface UserQuery {}

// 2. 组件Props类型 - 跟随组件
// components/business/UserCard/index.tsx
interface UserCardProps {}

// 3. 全局类型 - 放在types/
// types/index.ts
export interface PageData<T> {}
```

**AI理解**: 类型在哪里使用，就在哪里定义

## AI对话最佳实践

### 场景1: 新增CRUD页面

**用户输入**:

```
我需要新增一个商品管理页面，接口定义如下：

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

请生成完整的代码，包括：
1. API类型定义
2. API实现
3. 列表页面
4. 表单组件
```

**AI应该**:

1. 读取 `.ai/architecture.md` 了解技术栈
2. 读取 `.ai/coding-standards.md` 了解代码规范
3. 读取 `.ai/api-conventions.md` 了解API约定
4. 检查 `.ai/context/existing-apis.md` 避免命名冲突
5. 生成符合规范的代码

### 场景2: 在现有页面添加功能

**用户输入**:

```
在订单管理页面添加导出功能，接口是：
POST /api/orders/export
参数: { ids: string[] }
响应: Blob
```

**AI应该**:

1. 读取现有订单页面代码
2. 在工具栏添加导出按钮
3. 实现导出逻辑
4. 保持原有代码风格

### 场景3: 复用现有组件

**用户输入**:

```
新增一个用户选择弹窗组件，使用项目中已有的 UserCard 组件
```

**AI应该**:

1. 读取 `.ai/context/existing-components.md`
2. 找到 UserCard 组件位置
3. 导入并复用 UserCard
4. 创建 UserSelectModal 组件

## 代码演进策略

### 1. 从简单到复杂

```typescript
// 阶段1: 简单实现
const UserPage: React.FC = () => {
  const [list, setList] = useState<User[]>([]);
  useEffect(() => { fetchUsers().then(setList); }, []);
  return <Table dataSource={list} />;
};

// 阶段2: 添加搜索
const UserPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const { data } = useRequest(() => fetchUsers({ keyword }));
  return (
    <>
      <Input.Search onSearch={setKeyword} />
      <Table dataSource={data?.list} />
    </>
  );
};

// 阶段3: 使用ProTable
const UserPage: React.FC = () => {
  return (
    <ProTable
      columns={columns}
      request={fetchUsers}
    />
  );
};
```

### 2. 提取公共逻辑

```typescript
// 提取前: 每个页面都写
const [loading, setLoading] = useState(false);
const fetchData = async () => {
  setLoading(true);
  const data = await api.getList();
  setList(data);
  setLoading(false);
};

// 提取后: 使用useRequest
const { data, loading } = useRequest(api.getList);
```

### 3. 组件抽象

```typescript
// 抽象前: 每个页面自定义
// pages/user/index.tsx
<Table columns={userColumns} />

// pages/order/index.tsx
<Table columns={orderColumns} />

// 抽象后: 统一DataTable组件
// components/business/DataTable/index.tsx
<DataTable columns={columns} request={api.getList} />
```

## 代码审查清单

### AI生成代码自检

- [ ] 是否遵循了架构规范
- [ ] 是否使用了正确的路径别名
- [ ] 类型定义是否完整
- [ ] 是否使用了ahooks的useRequest
- [ ] 错误处理是否完善
- [ ] 是否遵循了代码规范

### 人工审查要点

- [ ] 业务逻辑是否正确
- [ ] 边界情况是否处理
- [ ] 性能是否有问题
- [ ] 是否可测试
- [ ] 是否可维护

## 持续优化

### 1. 定期更新上下文

```bash
# 更新API清单
node scripts/update-context.js

# 或手动更新
# .ai/context/existing-apis.md
```

### 2. 沉淀最佳实践

```markdown
# .ai/best-practices.md

## 已验证的最佳实践

### 1. 表单处理

使用 ProForm 比手写 Form 效率更高

### 2. 表格处理

使用 ProTable 的 request 属性自动处理分页

### 3. 状态管理

服务端状态用 useRequest，客户端状态用 Zustand
```

### 3. 更新规则文件

根据实际开发经验，不断完善:

- `.ai/architecture.md`
- `.ai/coding-standards.md`
- `.ai/api-conventions.md`

## 团队协作

### 1. 代码评审

```markdown
## 评审意见模板

### 问题

[描述问题]

### 建议

[给出建议]

### 参考

[参考链接或代码示例]
```

### 2. 知识分享

```markdown
# .ai/lessons-learned.md

## 2024-01-15

问题: ProTable 的 request 返回格式不正确导致分页失效
解决: 确保返回 { data: [], total: 0, success: true }
```
