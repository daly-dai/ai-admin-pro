# Prompt: 生成CRUD页面

## 使用方式

将此模板提供给AI，AI会根据接口定义生成完整的CRUD页面代码。

## 模板

```markdown
请根据以下接口定义，生成完整的CRUD页面代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + Ant Design 5 + ahooks + Zustand
- 组件库: @dalydb/sdesign
-引用: 使用相对路径 (src/)



## 接口定义

模块名: [MODULE_NAME]
基础路径: [BASE_PATH]

### 接口列表

1. 获取列表
   - 方法: GET
   - 路径: [LIST_PATH]
   - 参数: [QUERY_PARAMS]
   - 响应: [RESPONSE_TYPE]

2. 获取详情
   - 方法: GET
   - 路径: [DETAIL_PATH]
   - 参数: [URL_PARAMS]
   - 响应: [RESPONSE_TYPE]

3. 创建
   - 方法: POST
   - 路径: [CREATE_PATH]
   - 参数: [BODY_PARAMS]
   - 响应: [RESPONSE_TYPE]

4. 更新
   - 方法: PUT
   - 路径: [UPDATE_PATH]
   - 参数: [URL_PARAMS, BODY_PARAMS]
   - 响应: [RESPONSE_TYPE]

5. 删除
   - 方法: DELETE
   - 路径: [DELETE_PATH]
   - 参数: [URL_PARAMS]

### 类型定义

[TYPE_DEFINITIONS]

## 生成要求

1. 创建文件:
   - `src/api/[module]/types.ts` - 类型定义
   - `src/api/[module]/index.ts` - API实现
   - `src/pages/[module]/index.tsx` - 列表页面
   - `src/pages/[module]/create.tsx` - 新增页面
   - `src/pages/[module]/edit.tsx` - 编辑页面
   - `src/pages/[module]/detail.tsx` - 详情页面

2. 代码规范:
   - 使用 TypeScript 严格模式
   - 使用路径别名导入
   - 使用 ahooks 的 useRequest
   - 使用 Ant Design 的 ProTable 和 ProForm
   - 类型定义完整，不使用 any

3. 功能要求:
   - 列表页: 表格展示、分页、搜索、排序
   - 新增页: 表单提交，支持表单验证
   - 编辑页: 表单提交，支持表单验证，预填数据
   - 详情页: 展示数据详情
   - 删除: 确认弹窗
   - 操作列: 编辑、删除、查看按钮
```

## 示例

```markdown
请根据以下接口定义，生成基于 @dalydb/sdesign组件库的完整CRUD页面代码。

## 项目信息

-技术栈: RSBuild + React 18 + TypeScript + @dalydb/sdesign + Ant Design 5
- 组件库: @dalydb/sdesign
-引用: 使用相对路径 (src/)

##接口定义

模块名: category
基础路径: /api/categories

### 接口列表

1. 获取列表
   - 方法: GET
   -路径: /api/categories
   - 参数: page, pageSize, keyword, status
   -响应: { list: Category[], total: number, current: number, pageSize: number }

2. 获取详情
   - 方法: GET
   -路径: /api/categories/:id
   - 参数: id (URL参数)
   -响应: Category

3. 创建
   - 方法: POST
   - 路径: /api/categories
   - 参数: name, code, sort, status, description
   - 响应: Category

4. 更新
   - 方法: PUT
   - 路径: /api/categories/:id
   - 参数: id (URL参数), name, code, sort, status, description
   - 响应: Category

5. 删除
   - 方法: DELETE
   -路径: /api/categories/:id
   - 参数: id (URL参数)

### 类型定义

Category {
id: string
name: string
code: string
sort: number
status: 0 | 1  // 0:禁, 1:启
用
description?: string
createTime: string
updateTime: string
}

CategoryFormData {
name: string
code: string
sort: number
status: 0 | 1
description?: string
}

CategorySearchParams {
keyword?: string
status?: 0 | 1
page: number
pageSize: number
}

## 生成要求

1. 创建文件:
   - `src/api/category/types.ts`
   - `src/api/category/index.ts`
   - `src/pages/category/index.tsx` (使用 SSearchTable)
   - `src/pages/category/create.tsx` (使用 SForm)
   - `src/pages/category/edit.tsx` (使用 SForm)
   - `src/pages/category/detail.tsx` (使用 SDetail)

2. 使用 @dalydb/sdesign组件:
   -列表页使用 SSearchTable 实现搜索和表格一体化
   -表单页使用 SForm 实现配置式表单
   - 详情页使用 SDetail 实现分组展示
   -组件库的 JSON配置模式
```

## AI输出示例

AI会生成以下文件：

1. `src/api/category/types.ts` - 类型定义
2. `src/api/category/index.ts` - API实现
3. `src/pages/category/index.tsx` - 列表页面 (使用 SSearchTable)
4. `src/pages/category/create.tsx` - 新增页面 (使用 SForm)
5. `src/pages/category/edit.tsx` - 编辑页面 (使用 SForm)
6. `src/pages/category/detail.tsx` - 详情页面 (使用 SDetail)

所有代码都基于 @dalydb/sdesign组件库，使用配置式开发模式，可以直接使用。