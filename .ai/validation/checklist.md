# AI 生成验证清单

> 用于验证 AI 生成代码是否满足目标和规范

## API 模块验证清单

### 目标验证 (Goal Validation)
- [ ] 所有定义的接口都已实现
- [ ] 接口方法名与规范一致 (getList/getById/create/update/delete)
- [ ] 类型定义完整，无 any 类型
- [ ] 导出语句正确

### 规范验证 (Standard Validation)
- [ ] 文件路径符合 `src/api/[module]/` 结构
- [ ] 使用 `request.get/post/put/delete` 统一封装
- [ ] API 对象命名为 `[module]Api`
- [ ] 所有接口添加 JSDoc 注释
- [ ] 类型定义在 `types.ts` 中，API 在 `index.ts` 中

### 依赖验证 (Dependency Validation)
- [ ] 正确导入 `request` 实例
- [ ] 类型导入使用 `import type`
- [ ] 无未使用的导入

## 查询列表页面验证清单

### 目标验证 (Goal Validation)
- [ ] 页面能够正确展示数据列表
- [ ] 支持分页功能
- [ ] 支持搜索过滤
- [ ] 支持排序
- [ ] 有新增/编辑/删除操作入口
- [ ] 操作后有成功提示

### 规范验证 (Standard Validation)
- [ ] 使用 `SSearchTable` 或 `STable + SForm.Search`
- [ ] 使用 `useSearchTable` hook 管理状态
- [ ] 表格列配置完整
- [ ] 搜索表单项与 API 查询参数对应
- [ ] 使用 `SButton` 操作按钮

### 数据流验证 (Data Flow Validation)
- [ ] API 调用使用 `[module]Api.getList`
- [ ] 请求参数类型正确
- [ ] 响应数据处理正确
- [ ] 错误处理完善

## 表单页面验证清单

### 目标验证 (Goal Validation)
- [ ] 表单能够正确提交数据
- [ ] 支持表单验证
- [ ] 支持初始值回填（编辑场景）
- [ ] 提交成功后有反馈
- [ ] 支持取消/返回操作

### 规范验证 (Standard Validation)
- [ ] 使用 `SForm` 组件
- [ ] `items` 配置完整
- [ ] 控件类型选择正确
- [ ] 必填项标记正确
- [ ] 使用 `columns` 控制布局

### 数据流验证 (Data Flow Validation)
- [ ] 创建调用 `[module]Api.create`
- [ ] 编辑调用 `[module]Api.update`
- [ ] 表单数据类型与 API 一致
- [ ] 提交后刷新列表数据

## 详情页面验证清单

### 目标验证 (Goal Validation)
- [ ] 能够正确展示详情数据
- [ ] 数据分组清晰
- [ ] 支持返回操作

### 规范验证 (Standard Validation)
- [ ] 使用 `SDetail` 组件
- [ ] `items` 配置完整
- [ ] 使用 `dict` 类型展示枚举值
- [ ] 使用 `column` 控制布局

### 数据流验证 (Data Flow Validation)
- [ ] 调用 `[module]Api.getById` 获取数据
- [ ] URL 参数获取正确
- [ ] 加载状态处理完善
