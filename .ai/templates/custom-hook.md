# Prompt: 生成自定义 Hook (基于 @dalydb/sdesign项目)

## 使用方式

提供 Hook功能描述，AI 会生成适配 @dalydb/sdesign项目的自定义 Hook。

##模板

````markdown
请根据以下需求，生成自定义 Hook。

## 项目信息

-技术栈: React 18 + TypeScript + @dalydb/sdesign + ahooks
-路径引用: 使用相对路径 (src/)

## Hook 信息

Hook 名称: use[HookName]
Hook 用途: [HOOK_PURPOSE]
Hook描述: [HOOK_DESCRIPTION]

##功能需求

[详细描述 Hook需要实现的功能

##接口定义（如需要）

### 接口列表

[接口定义]

### 类型定义

[类型定义]

## Hook API

### 参数

- [PARAM_NAME]: [PARAM_TYPE] - [PARAM_DESC]

### 返回值

- [RETURN_NAME]: [RETURN_TYPE] - [RETURN_DESC]

## 示例

### 使用示例

```typescript
const { data, loading, error, run } = use[HookName](params);
```
````

## 生成要求

1. 创建文件:
   - `hooks/use[HookName].ts

2. 代码规范:
   - 使用 TypeScript 严格模式
   - 使用相对路径导入 (src/)
   -可结合 @dalydb/sdesign组件的特性
   - 类型定义完整，不使用 any
   - 添加 JSDoc 注释
````

## 示例

```markdown
请根据以下需求，生成自定义 Hook。

## 项目信息
-技术栈: React 18 + TypeScript + @dalydb/sdesign
-路径引用: 使用相对路径 (src/)

## Hook 信息
Hook 名称: usePagination
Hook 用途: 通用分页 Hook
Hook描述:封分页逻辑，支持数据获取、分页状态管理

##功能需求
1. 自动管理分页状态（page、pageSize、total）
2. 支持数据获取
3. 支持分页变化时重新获取数据
4.支持手动刷新数据
5. 支持搜索参数
6.支持加载状态和错误处理

##接口定义

###接口列表

1. 获取列表
   - 方法: GET
   -路径: [LIST_PATH]
   - 参数: page, pageSize, ...otherParams

### 类型定义

PageData<T> {
  list: T[]
  total: number
}

## Hook API

### 参数
- apiFn: (params: { page: number; pageSize: number; [key: string]: any }) => Promise<PageData<T>>
- options?: { defaultPageSize?: number; defaultPage?: number; [key: string]: any }

### 返回值
- data: T[] | undefined
- loading: boolean
- error: Error | undefined
- page: number
- pageSize: number
- total: number
- refresh: () => void
- setPage: (page: number) => void
- setPageSize: (pageSize: number) => void
- run: (params?: any) => void

## 示例

### 使用示例

```typescript
const { data, loading, page, pageSize, total, refresh, setPage, setPageSize } = usePagination(userApi.getList, {
  defaultPageSize: 10
});
````