# Prompt: 生成CRUD页面

## 使用方式

将此模板提供给AI，AI会根据接口定义生成完整的CRUD页面代码。

## 模板

```markdown
请根据以下接口定义，生成完整的CRUD页面代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + Ant Design 5 + ahooks + Zustand

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
   - `api/[module]/types.ts` - 类型定义
   - `api/[module]/index.ts` - API实现
   - `pages/[module]/index.tsx` - 列表页面
   - `pages/[module]/components/[Module]Form.tsx` - 表单组件

2. 代码规范:
   - 使用 TypeScript 严格模式
   - 使用路径别名导入
   - 使用 ahooks 的 useRequest
   - 使用 Ant Design 的 ProTable 和 ProForm
   - 类型定义完整，不使用 any

3. 功能要求:
   - 列表页: 表格展示、分页、搜索、排序
   - 新增/编辑: 弹窗表单，支持表单验证
   - 删除: 确认弹窗
   - 操作列: 编辑、删除按钮
```

## 示例

```markdown
请根据以下接口定义，生成完整的CRUD页面代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + Ant Design 5 + ahooks + Zustand
- 路径别名: @/ 指向 src/

## 接口定义

模块名: category
基础路径: /api/categories

### 接口列表

1. 获取列表
   - 方法: GET
   - 路径: /api/categories
   - 参数: page, pageSize, keyword
   - 响应: { list: Category[], total: number }

2. 获取详情
   - 方法: GET
   - 路径: /api/categories/:id
   - 参数: id (URL参数)
   - 响应: Category

3. 创建
   - 方法: POST
   - 路径: /api/categories
   - 参数: name, sort, status
   - 响应: Category

4. 更新
   - 方法: PUT
   - 路径: /api/categories/:id
   - 参数: id (URL参数), name, sort, status
   - 响应: Category

5. 删除
   - 方法: DELETE
   - 路径: /api/categories/:id
   - 参数: id (URL参数)

### 类型定义

Category {
id: string
name: string
sort: number
status: 'active' | 'inactive'
createTime: string
}

## 生成要求

...
```

## AI输出示例

AI会生成以下文件：

1. `api/category/types.ts`
2. `api/category/index.ts`
3. `pages/category/index.tsx`
4. `pages/category/components/CategoryForm.tsx`

所有代码都遵循项目规范，可以直接使用。
