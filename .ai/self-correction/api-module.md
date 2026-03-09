# API 模块自我修正规则

> AI 生成 API 模块后，按以下规则自动修正，直接输出正确代码

## 修正步骤（按顺序执行）

### 步骤 1: 修正文件结构
- 确保文件位于 `src/api/{module}/index.ts`
- 确保同级目录有 `types.ts` 文件

### 步骤 2: 修正导入语句
- 检查：是否从 `@/plugins/request` 导入 `request`
- 如果不是：将 `import axios from 'axios'` 或其他导入改为 `import { request } from '@/plugins/request'`
- 检查：类型导入是否使用 `import type`
- 如果不是：将类型导入改为 `import type { ... } from './types'`

### 步骤 3: 修正 API 对象命名
- 检查：API 对象命名是否为 `{module}Api`（小写模块名 + Api）
- 如果不是：
  - `ProductAPI` → `productApi`
  - `productAPI` → `productApi`
  - `ProductApi` → `productApi`

### 步骤 4: 补全标准方法
- 检查：是否包含以下 5 个标准方法
  - `getList` - 获取列表
  - `getById` - 获取详情
  - `create` - 创建
  - `update` - 更新
  - `delete` - 删除
- 如果缺少：根据已有方法的模式补充缺失方法

### 步骤 5: 修正请求调用
- 检查：是否使用 `request.get/post/put/delete`
- 如果不是：将 `axios.get` 或 `fetch` 改为 `request.get` 等

### 步骤 6: 添加 JSDoc 注释
- 检查：每个方法是否有 JSDoc 注释（`/** */`）
- 如果没有：添加标准注释

```typescript
/**
 * 获取{实体}列表
 * @param params 查询参数
 * @returns {实体}列表数据
 */
```

### 步骤 7: 修正类型使用
- 检查：是否有 `any` 类型
- 如果有：替换为具体类型或泛型参数

## 输出格式

直接输出修正后的完整代码，格式如下：

```typescript
import { request } from '@/plugins/request';
import type { {Entity}, {Entity}Query } from './types';

/**
 * {模块} API
 */
export const {module}Api = {
  /**
   * 获取{实体}列表
   */
  getList: (params?: {Entity}Query) =>
    request.get<PageData<{Entity}>>('/api/{module}', { params }),

  /**
   * 获取{实体}详情
   */
  getById: (id: string) =>
    request.get<{Entity}>(`/api/{module}/${id}`),

  /**
   * 创建{实体}
   */
  create: (data: Omit<{Entity}, 'id'>) =>
    request.post<{Entity}>('/api/{module}', data),

  /**
   * 更新{实体}
   */
  update: (id: string, data: Partial<{Entity}>) =>
    request.put<{Entity}>(`/api/{module}/${id}`, data),

  /**
   * 删除{实体}
   */
  delete: (id: string) =>
    request.delete(`/api/{module}/${id}`),
};
```

## 禁止事项

- 不要输出修正过程说明
- 不要输出检查清单
- 只输出最终代码
