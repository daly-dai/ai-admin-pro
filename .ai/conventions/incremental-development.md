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

## [模块A] (api/[moduleA]/)

- getList - 获取[实体A]列表
- getById - 获取[实体A]详情
- create - 创建[实体A]
- update - 更新[实体A]
- delete - 删除[实体A]

## [模块B] (api/[moduleB]/)

- getList - 获取[实体B]列表
- getById - 获取[实体B]详情
- create - 创建[实体B]
- update - 更新[实体B]
- delete - 删除[实体B]
- [customMethod] - [自定义操作]
```

### 2. 已有组件清单

文件: `.ai/context/existing-components.md`

```markdown
# 已有组件清单

## 业务组件 (components/business/)

- [EntityA]Card - [实体A]卡片
- [EntityB]List - [实体B]列表
- [Feature]Selector - [功能]选择器

## 通用组件 (components/common/)

- SSearchTable - 搜索表格一体化组件
- SForm - 配置式表单组件
- SDetail - 分组详情展示组件
- SButton - 按钮组件
```

### 3. 已有页面清单

文件: `.ai/context/existing-pages.md`

```markdown
# 已有页面清单

- /dashboard - 首页
- /[moduleA] - [模块A]管理
- /[moduleA]/:id - [模块A]详情
- /[moduleB] - [模块B]管理
- /[moduleC] - [模块C]管理
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
│   ├── SSearchTable/
│   ├── SForm/
│   └── SDetail/
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

**用户输入模板**:

```
我需要新增一个[模块名称]管理页面，接口定义如下：

模块: [module]
基础路径: /api/[module]

接口:
1. GET /api/[module] - 获取列表
   参数: [param1], [param2], ...
   响应: { list: [Entity][], total: number }

2. GET /api/[module]/:id - 获取详情
   响应: [Entity]

3. POST /api/[module] - 创建
   参数: [field1], [field2], ...
   响应: [Entity]

4. PUT /api/[module]/:id - 更新
   参数: [field1], [field2], ...
   响应: [Entity]

5. DELETE /api/[module]/:id - 删除

类型:
[Entity] {
  id: string
  [field1]: [type1]
  [field2]: [type2]
  status: '[status1]' | '[status2]'
  createTime: string
}

请生成完整的代码，包括：
1. API类型定义
2. API实现
3. 列表页面
4. 表单组件
```

**AI应该**:

1. 读取 `.ai/core/architecture.md` 了解技术栈
2. 读取 `.ai/core/coding-standards.md` 了解代码规范
3. 读取 `.ai/conventions/api-conventions.md` 了解API约定
4. 检查 `.ai/context/existing-apis.md` 避免命名冲突
5. 生成符合规范的代码

### 场景2: 在现有页面添加功能

**用户输入模板**:

```
在[模块]管理页面添加[功能]功能，接口是：
[METHOD] /api/[module]/[action]
参数: { [param]: [type] }
响应: [ReturnType]
```

**AI应该**:

1. 读取现有[模块]页面代码
2. 在工具栏添加[功能]按钮
3. 实现[功能]逻辑
4. 保持原有代码风格

### 场景3: 复用现有组件

**用户输入模板**:

```
新增一个[功能]组件，使用项目中已有的 [ExistingComponent] 组件
```

**AI应该**:

1. 读取 `.ai/context/existing-components.md`
2. 找到 [ExistingComponent] 组件位置
3. 导入并复用 [ExistingComponent]
4. 创建 [NewComponent] 组件

## 代码演进策略

### 1. 从简单到复杂

```typescript
// 阶段1: 简单实现
const [Module]Page: React.FC = () => {
  const [list, setList] = useState<[Entity][]>([]);
  useEffect(() => { fetch[Entity]s().then(setList); }, []);
  return <Table dataSource={list} />;
};

// 阶段2: 添加搜索
const [Module]Page: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const { data } = useRequest(() => fetch[Entity]s({ keyword }));
  return (
    <>
      <Input.Search onSearch={setKeyword} />
      <Table dataSource={data?.list} />
    </>
  );
};

// 阶段3: 使用 SSearchTable 或 STable + useSearchTable
const [Module]Page: React.FC = () => {
  const { tableProps, formConfig, form } = useSearchTable(fetch[Entity]s, {
    paginationFields: {
      current: 'page',
      pageSize: 'pageSize',
      total: 'total',
      list: 'list',
    },
  });

  const searchItems = [
    { type: 'input', label: '[搜索标签]', name: '[searchField]' },
  ];

  return (
    <>
      <SForm.Search form={form} items={searchItems} {...formConfig} />
      <STable isSeq columns={columns} {...tableProps} />
    </>
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

// 提取后: 使用 useRequest
const { data, loading } = useRequest(api.getList);
```

### 3. 组件抽象

```typescript
// 抽象前: 每个页面自定义
// pages/[moduleA]/index.tsx
<Table columns={[moduleA]Columns} />

// pages/[moduleB]/index.tsx
<Table columns={[moduleB]Columns} />

// 抽象后: 使用 @dalydb/sdesign 组件库
// 列表页统一使用 SSearchTable 或 STable + useSearchTable
const { tableProps, formConfig, form } = useSearchTable(api.getList, {
  paginationFields: {
    current: 'page',
    pageSize: 'pageSize',
    total: 'total',
    list: 'list',
  },
});

const searchItems = [
  { type: 'input', label: '[搜索标签]', name: '[searchField]' },
];

<>
  <SForm.Search form={form} items={searchItems} {...formConfig} />
  <STable isSeq columns={columns} {...tableProps} />
</>
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

使用 SForm 配置式表单比手写 Form 效率更高

### 2. 表格处理

使用 SSearchTable 的 searchForm、table 和 requestFn 属性自动处理搜索、表格和分页

### 3. 状态管理

服务端状态用 useRequest，客户端状态用 Zustand

### 4. 组件库选择

优先使用 @dalydb/sdesign 组件库，Ant Design 作为辅助
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
