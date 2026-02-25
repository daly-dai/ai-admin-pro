# 代码规范

> AI生成代码时必须遵循的规范

## TypeScript规范

### 1. 类型定义

```typescript
// ✅ 正确：显式定义返回类型
const getUser = async (id: string): Promise<User> => {
  return request.get(`/api/users/${id}`);
};

// ❌ 错误：隐式类型
const getUser = async (id: string) => {
  return request.get(`/api/users/${id}`);
};
```

### 2. 接口命名

```typescript
// 实体类型
interface User {}
interface UserQuery {} // 查询参数
interface UserFormData {} // 表单数据
interface UserListItem {} // 列表项（可能与User不同）
```

### 3. 类型导出

```typescript
// api/user/types.ts
export interface User {}
export type UserStatus = 'active' | 'inactive';

// api/user/index.ts
export type { User, UserStatus } from './types';
```

## React组件规范

### 1. 组件结构

```typescript
import React, { useState, useCallback } from 'react';
import { Card, Button } from 'antd';
import { useRequest } from 'ahooks';
import { userApi } from '@api/user';
import type { User } from '@api/user/types';
import './index.css';

// 1. Props接口
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

// 2. 组件实现
const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  // 3. State定义
  const [expanded, setExpanded] = useState(false);

  // 4. Hooks使用
  const { loading, run: handleDelete } = useRequest(userApi.delete, {
    manual: true,
  });

  // 5. 事件处理
  const handleEdit = useCallback(() => {
    onEdit?.(user);
  }, [onEdit, user]);

  // 6. 渲染
  return (
    <Card className="user-card">
      {/* ... */}
    </Card>
  );
};

export default UserCard;
```

### 2. 组件命名

- 页面组件: `PascalCase` + `Page` 后缀，如 `UserPage`
- 业务组件: `PascalCase`，如 `UserCard`
- 通用组件: `PascalCase`，如 `DataTable`
- Hooks: `camelCase` + `use` 前缀，如 `useUserList`

### 3. 样式规范

```css
/* 组件样式文件：与组件同名 */
/* UserCard/index.css */

/* 1. 使用BEM命名 */
.user-card {
}
.user-card__header {
}
.user-card__body {
}
.user-card--active {
}

/* 2. 避免全局样式污染 */
/* ❌ 不要这样 */
.card {
}

/* ✅ 这样 */
.user-card {
}
```

## API层规范

### 1. 模块组织

```typescript
// 按业务模块组织
api/
├── user/           # 用户模块
│   ├── index.ts    # API实现
│   └── types.ts    # 类型定义
├── order/          # 订单模块
│   ├── index.ts
│   └── types.ts
└── index.ts        # 统一导出
```

### 2. API对象模式

```typescript
// ✅ 使用对象模式组织API
export const userApi = {
  getList: () => {...},
  getById: (id: string) => {...},
  create: (data: UserFormData) => {...},
  update: (id: string, data: Partial<User>) => {...},
  delete: (id: string) => {...},
};

// 使用
import { userApi } from '@api/user';
const { data } = useRequest(userApi.getList);
```

### 3. 类型定义位置

```typescript
// 类型定义在 api/[module]/types.ts
// 不要在API文件中定义类型

// api/user/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  createTime: string;
}

export type UserStatus = 'active' | 'inactive';

export interface UserQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: UserStatus;
}

export interface UserFormData {
  name: string;
  email: string;
  status: UserStatus;
}
```

## 状态管理规范

### 1. Store组织

```typescript
// stores/user.ts - 用户相关状态
// stores/app.ts - 应用级状态
// stores/index.ts - 统一导出

// stores/index.ts
export { useUserStore } from './user';
export { useAppStore } from './app';
```

### 2. Store结构

```typescript
interface StoreState {
  // 1. State定义
  data: DataType;
  loading: boolean;

  // 2. Computed（通过selector实现）
  // 不存储在store中，使用时计算

  // 3. Actions
  setData: (data: DataType) => void;
  fetchData: () => Promise<void>;
  reset: () => void;
}
```

## 导入导出规范

### 1. 导入顺序

```typescript
// 1. React相关
import React, { useEffect, useState } from 'react';
// 3. 绝对路径（@/）
import { userApi } from '@api/user';
import type { User } from '@api/user/types';
import { useUserStore } from '@stores';
import { useRequest } from 'ahooks';
// 2. 第三方库
import { Button, Card } from 'antd';

// 4. 相对路径（./）
import UserForm from './components/UserForm';

import './index.css';
```

### 2. 导出模式

```typescript
// 默认导出（组件）
export default ComponentName;

// 命名导出（API、Hooks、工具函数）
export const userApi = {...};
export const useUserList = () => {...};

// 统一导出
export * from './user';
export * from './app';
```

## 错误处理规范

### 1. API错误

```typescript
// 统一在 request.ts 中处理
// 组件中只处理业务错误

const { run: submit } = useRequest(userApi.create, {
  manual: true,
  onSuccess: () => {
    message.success('创建成功');
  },
  onError: (error) => {
    // 只处理需要特殊处理的错误
    if (error.code === 'DUPLICATE_NAME') {
      message.error('用户名已存在');
    }
  },
});
```

### 2. 表单验证

```typescript
<Form
  onFinish={async (values) => {
    try {
      await submit(values);
    } catch (error) {
      // 错误已在request层处理
    }
  }}
>
  <Form.Item
    name="email"
    rules={[
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '邮箱格式不正确' },
    ]}
  >
    <Input />
  </Form.Item>
</Form>
```

## 注释规范

### 1. JSDoc注释

```typescript
/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表数据
 * @example
 * const { list, total } = await userApi.getList({ page: 1 });
 */
const getList = (params?: UserQuery): Promise<PageData<User>> => {...};
```

### 2. 代码注释

```typescript
// ✅ 解释"为什么"，而非"做什么"
// 用户可能同时有多个角色，取最高权限
const highestRole = getHighestRole(user.roles);

// ❌ 不要注释显而易见的代码
// 设置用户名为空
setUserName('');
```

## 性能优化规范

### 1. 避免不必要的重渲染

```typescript
// ✅ 使用useMemo缓存计算结果
const filteredList = useMemo(() => {
  return list.filter((item) => item.status === 'active');
}, [list]);

// ✅ 使用useCallback缓存回调函数
const handleClick = useCallback(() => {
  onSelect(id);
}, [onSelect, id]);
```

### 2. 列表渲染优化

```typescript
// ✅ 使用key属性
{list.map(item => (
  <UserCard key={item.id} user={item} />
))}

// ✅ 大数据量使用虚拟列表
import { VirtualList } from '@components/common';
<VirtualList data={list} itemHeight={60} />
```
