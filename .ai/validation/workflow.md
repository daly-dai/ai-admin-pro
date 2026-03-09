# AI 驱动开发工作流

> 完整的 AI 优先开发流程，包含验证机制

## 工作流概览

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI 驱动开发工作流                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ 需求输入  │───▶│ AI 生成  │───▶│ AI 验证  │───▶│ 人工审查  │  │
│  └──────────┘    └──────────┘    └────┬─────┘    └──────────┘  │
│                                       │                         │
│                                  ┌────▼─────┐                   │
│                                  │ 验证失败  │                   │
│                                  │ 重新生成  │                   │
│                                  └──────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 场景 1: 完整 CRUD 开发

### 步骤 1: 定义接口规范

向 AI 提供接口定义：

```yaml
module: product
name: 商品管理
basePath: /api/products

interfaces:
  - name: getList
    desc: 获取商品列表
    method: GET
    path: /api/products
    query:
      - name: keyword
        type: string
        required: false
      - name: status
        type: string
        required: false
    response:
      type: PageData<Product>

  - name: getById
    desc: 获取商品详情
    method: GET
    path: /api/products/{id}
    params:
      - name: id
        type: string
        required: true
    response:
      type: Product

  - name: create
    desc: 创建商品
    method: POST
    path: /api/products
    body:
      - name: name
        type: string
        required: true
      - name: price
        type: number
        required: true
    response:
      type: Product

  - name: update
    desc: 更新商品
    method: PUT
    path: /api/products/{id}
    params:
      - name: id
        type: string
        required: true
    body:
      - name: name
        type: string
        required: false
      - name: price
        type: number
        required: false
    response:
      type: Product

  - name: delete
    desc: 删除商品
    method: DELETE
    path: /api/products/{id}
    params:
      - name: id
        type: string
        required: true

types:
  Product:
    - name: id
      type: string
    - name: name
      type: string
    - name: price
      type: number
    - name: status
      type: 'active' | 'inactive'
    - name: createTime
      type: string
```

### 步骤 2: AI 生成 API 模块

**提示词:**
```
请根据以下接口定义生成 API 模块：

{粘贴接口定义}

要求：
1. 参考模板 .ai/templates/api-module.md
2. 生成文件：
   - src/api/product/types.ts
   - src/api/product/index.ts
3. 生成完成后，使用 .ai/validation/checklist.md 进行自检

请生成代码并进行自我验证。
```

### 步骤 3: AI 验证 API 模块

**验证提示词:**
```
请对刚才生成的 API 模块进行验证：

模块: product
文件: src/api/product/index.ts, src/api/product/types.ts

按照 .ai/validation/checklist.md 中的 "API 模块验证清单" 逐项检查：

### 目标验证
- [ ] 所有接口是否都已实现？
- [ ] 类型定义是否完整无 any？

### 规范验证
- [ ] API 对象是否命名为 productApi？
- [ ] 是否使用 request 实例发送请求？
- [ ] 是否有 JSDoc 注释？

### 依赖验证
- [ ] 是否正确导入 request？

请输出验证报告，如果有错误请修复。
```

### 步骤 4: AI 生成列表页面

**提示词:**
```
请生成商品列表页面：

模块: product
API: 已生成 src/api/product/index.ts

要求：
1. 参考模板 .ai/templates/crud-page.md
2. 生成文件：src/pages/product/index.tsx
3. 使用 SSearchTable 组件
4. 搜索条件：keyword(输入框), status(下拉选择)
5. 表格列：名称、价格、状态、创建时间、操作
6. 操作按钮：编辑、删除

生成完成后进行自我验证。
```

### 步骤 5: AI 验证列表页面

**验证提示词:**
```
请对生成的列表页面进行验证：

页面: src/pages/product/index.tsx
对应 API: product

按照 .ai/validation/checklist.md 中的 "查询列表页面验证清单" 逐项检查：

### 目标验证
- [ ] 是否能正确展示数据列表？
- [ ] 是否支持分页？
- [ ] 是否支持搜索？
- [ ] 是否有新增/编辑/删除操作入口？

### 规范验证
- [ ] 是否使用 SSearchTable 或 STable + SForm.Search？
- [ ] 是否使用 useSearchTable？
- [ ] 操作按钮是否使用 SButton？

### 数据流验证
- [ ] 是否调用 productApi.getList？
- [ ] 是否有错误处理？

### 交叉验证
- [ ] 导入的 API 路径是否正确？
- [ ] 使用的 API 方法名是否正确？
- [ ] 传递的参数类型是否匹配？

请输出验证报告，如果有错误请修复。
```

### 步骤 6: AI 生成表单页面

**提示词:**
```
请生成商品表单页面：

模块: product
类型: create / edit
API: 已生成 src/api/product/index.ts

要求：
1. 参考模板 .ai/templates/crud-page.md 中的表单部分
2. 生成文件：
   - src/pages/product/create.tsx
   - src/pages/product/edit.tsx
3. 使用 SForm 组件
4. 表单字段：
   - 名称(name): input, 必填
   - 价格(price): inputNumber, 必填
   - 状态(status): select, 选项: active/inactive
5. 编辑页需要回填数据

生成完成后进行自我验证。
```

### 步骤 7: AI 验证表单页面

**验证提示词:**
```
请对生成的表单页面进行验证：

页面: src/pages/product/create.tsx, src/pages/product/edit.tsx
对应 API: product

按照 .ai/validation/checklist.md 中的 "表单页面验证清单" 逐项检查：

### 目标验证
- [ ] 是否能正确提交表单？
- [ ] 是否有表单验证？
- [ ] 编辑页是否有初始值回填？

### 规范验证
- [ ] 是否使用 SForm 组件？
- [ ] 是否配置 items？
- [ ] 是否使用 columns 控制布局？

### 数据流验证
- [ ] 创建页是否调用 productApi.create？
- [ ] 编辑页是否调用 productApi.update？
- [ ] 编辑页是否调用 productApi.getById 获取初始值？

### 交叉验证
- [ ] 表单数据类型是否与 API 一致？
- [ ] 提交后是否刷新列表数据？

请输出验证报告，如果有错误请修复。
```

### 步骤 8: 人工审查

AI 验证通过后，进行人工审查：

1. **功能审查**: 是否满足业务需求？
2. **代码审查**: 是否符合团队规范？
3. **UI 审查**: 界面是否符合设计稿？
4. **性能审查**: 是否有性能隐患？

## 场景 2: 单个页面修改

### 示例: 给列表页添加导出功能

**步骤 1: 需求描述**
```
请在商品列表页添加导出功能：

需求：
1. 添加"导出"按钮
2. 调用 API: productApi.export(params)
3. 导出当前筛选条件下的数据
4. 显示导出进度

请修改 src/pages/product/index.tsx 并进行验证。
```

**步骤 2: AI 修改并验证**

AI 修改代码后，使用验证提示词：
```
请验证修改后的列表页面：

### 新增功能验证
- [ ] 导出按钮是否正确添加？
- [ ] 是否调用 productApi.export？
- [ ] 是否传递当前筛选参数？
- [ ] 是否有导出进度提示？

### 回归验证
- [ ] 原有功能是否正常？
- [ ] 列表展示是否正常？
- [ ] 搜索功能是否正常？

请输出验证报告。
```

## 验证失败处理

### 常见错误及修复

| 错误类型 | 示例 | 修复方案 |
|---------|------|---------|
| 命名错误 | API 对象命名为 `productAPI` 而非 `productApi` | AI 自动重命名 |
| 导入错误 | 使用 `axios` 而非 `request` | AI 自动替换导入 |
| 方法缺失 | 缺少 `delete` 方法 | AI 自动补充 |
| 类型不匹配 | 表单数据类型与 API 不一致 | AI 自动对齐类型 |
| 组件错误 | 使用 `Table` 而非 `STable` | AI 自动替换组件 |

### 验证失败重试流程

```
验证失败
    │
    ▼
┌─────────────┐
│ 分析错误原因 │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ 可自动修复？  │──否──▶│ 人工介入    │
└──────┬──────┘     └─────────────┘
       │是
       ▼
┌─────────────┐
│ AI 自动修复  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 重新验证    │
└──────┬──────┘
       │
       ▼
    通过？
   /      \
  是        否
  │         │
  ▼         ▼
完成    再次修复
```

## 最佳实践

### 1. 验证粒度

- **API 模块**: 必须 100% 通过所有验证项
- **页面组件**: 关键验证项必须通过，警告项可人工判断
- **样式调整**: 可跳过验证，直接人工审查

### 2. 验证顺序

```
1. API 模块验证（基础层）
   └─▶ 2. 列表页面验证（依赖 API）
        └─▶ 3. 表单页面验证（依赖 API 和列表）
             └─▶ 4. 详情页面验证（依赖 API）
```

### 3. 验证记录

建议保存每次验证报告：

```
.ai/validation/reports/
├── 2024-01-15/
│   ├── product-api.md
│   ├── product-list.md
│   └── product-form.md
└── 2024-01-16/
    └── order-api.md
```

## 工具集成

### 与 Git Hooks 集成

```bash
# .husky/pre-commit
#!/bin/sh

# 验证修改的文件
for file in $(git diff --cached --name-only | grep "src/api"); do
  npx tsx .ai/validation/validator.ts api-module "$file"
done

for file in $(git diff --cached --name-only | grep "src/pages"); do
  # 推断页面类型并验证
  npx tsx .ai/validation/validator.ts auto "$file"
done
```

### 与 CI/CD 集成

```yaml
# .github/workflows/validate.yml
name: AI Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate API Modules
        run: |
          for file in $(find src/api -name "index.ts"); do
            npx tsx .ai/validation/validator.ts api-module "$file"
          done
      - name: Validate Pages
        run: |
          for file in $(find src/pages -name "index.tsx"); do
            npx tsx .ai/validation/validator.ts list-page "$file"
          done
```
