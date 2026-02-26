# API约定

> AI根据后端接口定义生成前端代码的约定

## 接口定义格式

后端提供的接口文档应该遵循以下格式，AI据此生成前端代码：

```yaml
# 接口定义示例
module: user # 模块名（英文）
name: 用户管理 # 模块名（中文）
basePath: /api/users # 基础路径

interfaces:
  - name: getList # 接口名
    desc: 获取用户列表 # 接口描述
    method: GET
    path: /api/users
    query: # 查询参数
      - name: page
        type: number
        required: false
        desc: 页码
      - name: pageSize
        type: number
        required: false
        desc: 每页条数
      - name: keyword
        type: string
        required: false
        desc: 搜索关键词
    response: # 响应数据
      type: PageData<User>

  - name: getById
    desc: 获取用户详情
    method: GET
    path: /api/users/{id}
    params: # URL参数
      - name: id
        type: string
        required: true
        desc: 用户ID
    response:
      type: User

  - name: create
    desc: 创建用户
    method: POST
    path: /api/users
    body: # 请求体
      - name: name
        type: string
        required: true
        desc: 用户名
      - name: email
        type: string
        required: true
        desc: 邮箱
      - name: status
        type: string
        required: true
        desc: 状态
    response:
      type: User

  - name: update
    desc: 更新用户
    method: PUT
    path: /api/users/{id}
    params:
      - name: id
        type: string
        required: true
    body:
      - name: name
        type: string
        required: false
      - name: email
        type: string
        required: false
      - name: status
        type: string
        required: false
    response:
      type: User

  - name: delete
    desc: 删除用户
    method: DELETE
    path: /api/users/{id}
    params:
      - name: id
        type: string
        required: true

types: # 类型定义
  User:
    - name: id
      type: string
      desc: 用户ID
    - name: name
      type: string
      desc: 用户名
    - name: email
      type: string
      desc: 邮箱
    - name: status
      type: UserStatus
      desc: 状态
    - name: createTime
      type: string
      desc: 创建时间

  UserStatus:
    type: enum
    values:
      - value: active
        label: 启用
      - value: inactive
        label: 禁用
```

## AI生成规则

### 1. 类型定义生成

根据接口定义生成类型文件：

```typescript
// api/user/types.ts

/** 用户状态 */
export type UserStatus = 'active' | 'inactive';

/** 用户 */
export interface User {
  /** 用户ID */
  id: string;
  /** 用户名 */
  name: string;
  /** 邮箱 */
  email: string;
  /** 状态 */
  status: UserStatus;
  /** 创建时间 */
  createTime: string;
}

/** 用户查询参数 */
export interface UserQuery {
  /** 页码 */
  page?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 搜索关键词 */
  keyword?: string;
}

/** 用户表单数据 */
export interface UserFormData {
  /** 用户名 */
  name: string;
  /** 邮箱 */
  email: string;
  /** 状态 */
  status: UserStatus;
}
```

### 2. API实现生成

```typescript
// api/user/index.ts
import type { PageData } from '@types';
import { request } from '@utils/request';

import type { User, UserFormData, UserQuery, UserStatus } from './types';

export { type User, type UserQuery, type UserFormData, type UserStatus };

export const userApi = {
  /**
   * 获取用户列表
   * @param params 查询参数
   */
  getList: (params?: UserQuery) =>
    request.get<PageData<User>>('/api/users', { params }),

  /**
   * 获取用户详情
   * @param id 用户ID
   */
  getById: (id: string) => request.get<User>(`/api/users/${id}`),

  /**
   * 创建用户
   * @param data 用户数据
   */
  create: (data: UserFormData) => request.post<User>('/api/users', data),

  /**
   * 更新用户
   * @param id 用户ID
   * @param data 用户数据
   */
  update: (id: string, data: Partial<UserFormData>) =>
    request.put<User>(`/api/users/${id}`, data),

  /**
   * 删除用户
   * @param id 用户ID
   */
  delete: (id: string) => request.delete(`/api/users/${id}`),
};
```

### 3. 页面组件生成

根据接口定义生成CRUD页面：

```typescript
// pages/user/index.tsx
import React, { useState } from 'react';
import { Card, Button, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { userApi } from '@api/user';
import type { User, UserQuery, UserFormData } from '@api/user';
import UserForm from './components/UserForm';

const UserPage: React.FC = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, loading, run: fetchList } = useRequest(userApi.getList);

  const { run: deleteUser } = useRequest(userApi.delete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      fetchList();
    },
  });

  const columns: ProColumns<User>[] = [
    {
      title: '用户名',
      dataIndex: 'name',
      search: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      search: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        active: { text: '启用', status: 'Success' },
        inactive: { text: '禁用', status: 'Default' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditingUser(record);
            setFormVisible(true);
          }}
        >
          编辑
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: `确定要删除用户 "${record.name}" 吗？`,
              onOk: () => deleteUser(record.id),
            });
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <Card>
      <ProTable<User, UserQuery>
        headerTitle="用户管理"
        rowKey="id"
        columns={columns}
        dataSource={data?.list}
        loading={loading}
        pagination={{
          pageSize: 10,
          total: data?.total,
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              setFormVisible(true);
            }}
          >
            新增
          </Button>,
        ]}
        request={fetchList}
      />

      <UserForm
        visible={formVisible}
        user={editingUser}
        onCancel={() => setFormVisible(false)}
        onSuccess={() => {
          setFormVisible(false);
          fetchList();
        }}
      />
    </Card>
  );
};

export default UserPage;
```

### 4. 表单组件生成

```typescript
// pages/user/components/UserForm.tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useRequest } from 'ahooks';
import { userApi } from '@api/user';
import type { User, UserFormData } from '@api/user';

interface UserFormProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  visible,
  user,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const isEdit = !!user;

  useEffect(() => {
    if (visible) {
      if (user) {
        form.setFieldsValue(user);
      } else {
        form.resetFields();
      }
    }
  }, [visible, user, form]);

  const { run: submit, loading } = useRequest(
    (values: UserFormData) => {
      if (user) {
        return userApi.update(user.id, values);
      }
      return userApi.create(values);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(isEdit ? '更新成功' : '创建成功');
        onSuccess();
      },
    }
  );

  return (
    <Modal
      title={isEdit ? '编辑用户' : '新增用户'}
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={submit}
      >
        <Form.Item
          name="name"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value="active">启用</Select.Option>
            <Select.Option value="inactive">禁用</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;
```

## 字段类型映射

| 后端类型      | TypeScript类型 | Antd组件             | 备注     |
| ------------- | -------------- | -------------------- | -------- |
| string        | string         | Input                | 默认     |
| string (long) | string         | Input.TextArea       | 多行文本 |
| number        | number         | InputNumber          | 数字     |
| boolean       | boolean        | Switch               | 开关     |
| date          | string         | DatePicker           | 日期     |
| datetime      | string         | DatePicker(showTime) | 日期时间 |
| enum          | string/number  | Select               | 枚举     |
| array         | T[]            | -                    | 数组     |
| object        | Record         | -                    | 对象     |

## 特殊字段处理

### 1. 状态字段

```typescript
// 自动生成valueEnum
{
  title: '状态',
  dataIndex: 'status',
  valueEnum: {
    active: { text: '启用', status: 'Success' },
    inactive: { text: '禁用', status: 'Default' },
  },
}
```

### 2. 时间字段

```typescript
// 自动使用dateTime类型
{
  title: '创建时间',
  dataIndex: 'createTime',
  valueType: 'dateTime',
  search: false,
}
```

### 3. 操作字段

```typescript
// 自动生成操作列
{
  title: '操作',
  valueType: 'option',
  render: (_, record) => [
    <Button key="edit">编辑</Button>,
    <Button key="delete" danger>删除</Button>,
  ],
}
```
