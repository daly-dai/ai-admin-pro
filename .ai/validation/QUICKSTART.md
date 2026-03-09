# AI 验证快速参考

## 一句话验证

在 AI 生成代码后，复制以下提示词：

### API 模块验证
```
请验证刚才生成的 API 模块，检查：1)所有接口是否实现 2)类型是否完整 3)命名是否符合规范 4)是否正确使用 request。输出验证报告。
```

### 列表页面验证
```
请验证列表页面，检查：1)是否使用 SSearchTable/STable 2)是否调用 {module}Api.getList 3)是否支持分页搜索 4)是否有操作按钮。输出验证报告。
```

### 表单页面验证
```
请验证表单页面，检查：1)是否使用 SForm 2)items 配置是否完整 3)是否调用 {module}Api.create/update 4)编辑页是否有初始值回填。输出验证报告。
```

### 详情页面验证
```
请验证详情页面，检查：1)是否使用 SDetail 2)是否调用 {module}Api.getById 3)items 配置是否完整。输出验证报告。
```

## 命令行验证

```bash
# 验证 API 模块
npx tsx .ai/validation/validator.ts api-module src/api/[module]/index.ts [module]

# 验证列表页面
npx tsx .ai/validation/validator.ts list-page src/pages/[module]/index.tsx [module]

# 验证表单页面
npx tsx .ai/validation/validator.ts form-page src/pages/[module]/create.tsx [module]

# 验证详情页面
npx tsx .ai/validation/validator.ts detail-page src/pages/[module]/detail.tsx [module]
```

## 验证检查项速查表

### API 模块
| 检查项 | 严重级别 | 检查内容 |
|-------|---------|---------|
| 接口完整性 | error | 所有定义的接口都已实现 |
| 类型完整性 | error | 无 any 类型 |
| 命名规范 | error | API 对象命名为 `{module}Api` |
| 请求封装 | error | 使用 `request` 实例 |
| JSDoc 注释 | warning | 有 JSDoc 注释 |

### 列表页面
| 检查项 | 严重级别 | 检查内容 |
|-------|---------|---------|
| 组件使用 | error | 使用 `SSearchTable` 或 `STable + SForm.Search` |
| API 调用 | error | 调用 `{module}Api.getList` |
| 分页功能 | warning | 支持分页 |
| 搜索功能 | warning | 支持搜索过滤 |
| 操作入口 | warning | 有新增/编辑/删除按钮 |

### 表单页面
| 检查项 | 严重级别 | 检查内容 |
|-------|---------|---------|
| 组件使用 | error | 使用 `SForm` |
| items 配置 | error | 配置了 `items` 属性 |
| API 调用 | error | 调用 `{module}Api.create/update` |
| 表单验证 | warning | 有表单验证 |
| 初始值回填 | warning | 编辑页有初始值回填 |

### 详情页面
| 检查项 | 严重级别 | 检查内容 |
|-------|---------|---------|
| 组件使用 | error | 使用 `SDetail` |
| items 配置 | error | 配置了 `items` 属性 |
| API 调用 | error | 调用 `{module}Api.getById` |

## 验证结果处理

```
✅ 通过 - 代码符合要求，可以提交
⚠️ 警告 - 建议优化，但非必须
❌ 错误 - 必须修复后才能提交
```

## 完整开发流程

```
1. 需求描述 ──▶ 2. AI 生成 ──▶ 3. AI 验证 ──▶ 4. 人工审查 ──▶ 5. 提交
                    │              │
                    └──────◄───────┘ (验证失败时重新生成)
```

## 相关文档

- [验证清单](./checklist.md) - 完整检查项列表
- [验证规则](./rules.json) - 规则配置文件
- [提示词模板](./prompt-template.md) - AI 验证提示词
- [工作流指南](./workflow.md) - 完整开发工作流
