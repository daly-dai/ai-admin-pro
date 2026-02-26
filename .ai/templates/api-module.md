# Prompt: 生成API模块 (基于 @dalydb/sdesign项目)

## 使用方式

提供接口定义，AI生成基于 @dalydb/sdesign项目的完整API模块代码。

##模板

```markdown
请根据以下接口定义，生成API模块代码。

## 项目信息

- HTTP客户端: 使用 `src/plugins/request` 中的 request
- 类型定义:单独放在 types.ts 文件中
-导出方式: 使用对象模式导出

##接口定义

模块名: [MODULE_NAME]
基础路径: [BASE_PATH]

[接口列表...]

## 生成要求

1. 创建文件:
   - `src/api/[module]/types.ts` - 类型定义（包含JSDoc注释）
   - `src/api/[module]/index.ts` - API实现（使用对象模式）

2. 代码规范:
   -接口都有JSDoc注释
   - 类型定义完整
   - 使用 request.get/post/put/delete
   -导出类型和API对象
   - 与 @dalydb/sdesign组件库配合使用
```

## 示例

```markdown
请根据以下接口定义，生成API模块代码。

模块名: tag
基础路径: /api/tags

接口列表:

1. GET /api/tags - 获取标签列表
   参数: page, pageSize, keyword
   响应: PageData<Tag>

2. GET /api/tags/:id - 获取标签详情
   参数: id
   响应: Tag

3. POST /api/tags - 创建标签
   参数: name, color
   响应: Tag

4. PUT /api/tags/:id - 更新标签
   参数: id, name, color
   响应: Tag

5. DELETE /api/tags/:id - 删除标签
   参数: id

类型定义:
Tag {
id: string
name: string
color: string
createTime: string
}
```

## AI输出

```typescript
// api/tag/types.ts

/** 标签 */
export interface Tag {
  /** 标签ID */
  id: string;
  /** 标签名称 */
  name: string;
  /** 标签颜色 */
  color: string;
  /** 创建时间 */
  createTime: string;
}

/** 标签查询参数 */
export interface TagQuery {
  /** 页码 */
  page?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 搜索关键词 */
  keyword?: string;
}

/** 标签表单数据 */
export interface TagFormData {
  /** 标签名称 */
  name: string;
  /** 标签颜色 */
  color: string;
}
```

```typescript
// api/tag/index.ts
import type { Tag, TagFormData, TagQuery } from './types';
import { request } from 'src/plugins/request';
import type { PageData } from 'src/types';

export type { Tag, TagQuery, TagFormData };

export const tagApi = {
  /**
   * 获取标签列表
   * @param params 查询参数
   */
  getList: (params?: TagQuery) =>
    request.get<PageData<Tag>>('/api/tags', { params }),

  /**
   * 获取标签详情
   * @param id 标签ID
   */
  getById: (id: string) => request.get<Tag>(`/api/tags/${id}`),

  /**
   * 创建标签
   * @param data 标签数据
   */
  create: (data: TagFormData) => request.post<Tag>('/api/tags', data),

  /**
   * 更新标签
   * @param id 标签ID
   * @param data 标签数据
   */
  update: (id: string, data: Partial<TagFormData>) =>
    request.put<Tag>(`/api/tags/${id}`, data),

  /**
   * 删除标签
   * @param id 标签ID
   */
  delete: (id: string) => request.delete(`/api/tags/${id}`),
};
```
