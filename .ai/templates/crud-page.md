# Prompt: 生成基于 @dalydb/sdesign 的 CRUD 页面

> 优先使用 @dalydb/sdesign 组件库，配置式开发模式

## 使用方式

将此模板提供给AI，AI会根据接口定义生成完整的CRUD页面代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + @dalydb/sdesign + Ant Design 5
- 组件库: @dalydb/sdesign (核心) + Ant Design 5 (辅助)
- 引用: 使用路径别名导入 (@/)

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

### 1. 创建文件:

- `src/api/[module]/types.ts` - 类型定义
- `src/api/[module]/index.ts` - API实现
- `src/pages/[module]/index.tsx` - 列表页面 (使用 STable + SForm.Search + useSearchTable)
- `src/pages/[module]/create.tsx` - 新增页面 (使用 SForm)
- `src/pages/[module]/edit.tsx` - 编辑页面 (使用 SForm)
- `src/pages/[module]/detail.tsx` - 详情页面 (使用 SDetail)

### 2. 组件使用规范:

#### 列表页 (STable + SForm.Search + useSearchTable)
- ✅ **必须**使用 `STable` + `SForm.Search` + `useSearchTable` 组合
- ✅ 使用 `useSearchTable` Hook 管理搜索和表格
- ✅ 使用 `SForm.Search` 组件实现搜索表单
- ✅ 使用 `STable` 组件展示表格数据
- ✅ 配置操作列（编辑、删除、查看）使用 SButton.Group
- ✅ 使用 STitle 组件展示页面标题

#### 表单页 (SForm)
- ✅ **必须**使用 `SForm` 组件替代 Ant Design Form
- ✅ 使用 items 配置表单字段
- ✅ 支持表单验证
- ✅ 支持表单联动
- ✅ 支持表单提交

#### 详情页 (SDetail)
- ✅ **必须**使用 `SDetail` 组件替代 Ant Design Descriptions
- ✅ 使用分组展示详情信息
- ✅ 支持自定义布局

### 3. 代码规范:

- ✅ 使用 TypeScript 严格模式
- ✅ 使用路径别名导入 (@/)
- ✅ 使用 ahooks 的 useRequest
- ✅ 类型定义完整，不使用 any
- ✅ 遵循项目代码规范

### 4. 功能要求:

- 列表页: 搜索、分页、排序、批量操作
- 新增页: 表单提交、验证、重置
- 编辑页: 数据回显、更新、验证
- 详情页: 分组展示、信息查看
- 删除: 确认弹窗、批量删除
- 操作列: 编辑、删除、查看按钮

## 示例

```markdown
请根据以下接口定义，生成基于 @dalydb/sdesign 组件库的完整 CRUD 页面代码。

## 项目信息

- 技术栈: RSBuild + React 18 + TypeScript + @dalydb/sdesign + Ant Design 5
- 组件库: @dalydb/sdesign
- 引用: 使用路径别名导入 (@/)

## 接口定义

模块名: user
基础路径: /api/users

### 接口列表

1. 获取列表
   - 方法: GET
   - 路径: /api/users
   - 参数: keyword, status, gender, page, pageSize
   - 响应: { list: User[], total: number, page: number, pageSize: number }

2. 获取详情
   - 方法: GET
   - 路径: /api/users/:id
   - 参数: id (URL参数)
   - 响应: User

3. 创建
   - 方法: POST
   - 路径: /api/users
   - 参数: username, nickname, realName, email, phone, gender, status, departmentId, roles, password
   - 响应: User

4. 更新
   - 方法: PUT
   - 路径: /api/users/:id
   - 参数: id (URL参数), nickname, realName, email, phone, gender, status, departmentId, roles
   - 响应: User

5. 删除
   - 方法: DELETE
   - 路径: /api/users/:id
   - 参数: id (URL参数)

### 类型定义

```typescript
// 用户状态
export type UserStatus = 'active' | 'inactive';

// 用户性别
export type UserGender = 'male' | 'female' | 'unknown';

// 用户信息
export interface User {
  id: string;
  username: string;
  nickname: string;
  realName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  gender: UserGender;
  status: UserStatus;
  departmentId?: string;
  departmentName?: string;
  roles?: string[];
  lastLoginTime?: string;
  createTime: string;
  updateTime: string;
}

// 用户表单数据
export interface UserFormData {
  username: string;
  nickname: string;
  realName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  gender: UserGender;
  status: UserStatus;
  departmentId?: string;
  roles?: string[];
  password?: string;
}

// 用户查询参数
export interface UserQuery {
  keyword?: string;
  status?: UserStatus;
  gender?: UserGender;
  page?: number;
  pageSize?: number;
}
```

## 生成要求

1. **必须**使用 @dalydb/sdesign 组件库:
   - 列表页使用 STable + SForm.Search + useSearchTable 组合
   - 表单页使用 SForm 实现配置式表单
   - 详情页使用 SDetail 实现分组展示
   - 使用 STitle 展示页面标题
   - 使用 SButton 和 SButton.Group 展示操作按钮

2. 代码规范:
   - 使用 TypeScript 严格模式
   - 使用路径别名导入
   - 使用 ahooks 的 useRequest
   - 类型定义完整，不使用 any

3. 功能要求:
   - 列表页: 表格展示、分页、搜索、排序
   - 新增页: 表单提交，支持表单验证
   - 编辑页: 表单提交，支持表单验证，预填数据
   - 详情页: 展示数据详情
   - 删除: 确认弹窗
   - 操作列: 编辑、删除、查看按钮

## AI 输出示例

AI 会生成以下文件：

1. `src/api/user/types.ts` - 类型定义
2. `src/api/user/index.ts` - API 实现
3. `src/pages/user/index.tsx` - 列表页面 (使用 STable + SForm.Search + useSearchTable)
4. `src/pages/user/create.tsx` - 新增页面 (使用 SForm)
5. `src/pages/user/edit.tsx` - 编辑页面 (使用 SForm)
6. `src/pages/user/detail.tsx` - 详情页面 (使用 SDetail)

所有代码都基于 @dalydb/sdesign 组件库，使用配置式开发模式，可以直接使用。
