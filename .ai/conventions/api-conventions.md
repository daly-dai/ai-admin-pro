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
import { Modal, Form, message } from 'antd';
import {
  SForm,
  STable,
  SDetail,
  STitle,
  SButton,
  useSearchTable,
} from '@dalydb/sdesign';
import { userApi } from '@api/user';
import type { User, UserQuery, UserFormData } from '@api/user';

const UserPage: React.FC = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<User | null>(null);
  const [editForm] = Form.useForm();

  // 使用 useSearchTable 管理搜索和表格
  const { tableProps, formConfig, form } = useSearchTable(userApi.getList, {
    paginationFields: {
      current: 'page',
      pageSize: 'pageSize',
      total: 'total',
      list: 'list',
    },
  });

  // 搜索表单配置
  const searchItems = [
    { type: 'input', label: '用户名', name: 'name' },
    { type: 'input', label: '邮箱', name: 'email' },
  ];

  // 表格列配置
  const tableColumns = [
    { title: '用户名', dataIndex: 'name', width: 120 },
    { title: '邮箱', dataIndex: 'email', width: 200 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: string) => (
        <span style={{ color: value === 'active' ? '#52c41a' : '#ff4d4f' }}>
          {value === 'active' ? '启用' : '禁用'}
        </span>
      ),
    },
    { title: '创建时间', dataIndex: 'createTime', render: 'datetime', width: 180 },
    {
      title: '操作',
      dataIndex: 'id',
      width: 200,
      fixed: 'right',
      render: (_, record: User) => (
        <SButton.Group
          size="small"
          items={[
            {
              actionType: 'view',
              onClick: async () => {
                const detail = await userApi.getById(record.id);
                setCurrentRecord(detail);
                setDetailVisible(true);
              },
            },
            {
              actionType: 'edit',
              onClick: async () => {
                const detail = await userApi.getById(record.id);
                setCurrentRecord(detail);
                editForm.setFieldsValue(detail);
                setEditVisible(true);
              },
            },
            {
              actionType: 'delete',
              danger: true,
              onClick: () => {
                Modal.confirm({
                  title: '确认删除',
                  content: `确定要删除用户 "${record.name}" 吗？`,
                  onOk: async () => {
                    await userApi.delete(record.id);
                    message.success('删除成功');
                    formConfig.onFinish();
                  },
                });
              },
            },
          ]}
        />
      ),
    },
  ];

  // 详情配置
  const detailItems = [
    { label: '用户名', name: 'name' },
    { label: '邮箱', name: 'email' },
    { label: '状态', name: 'status' },
    { label: '创建时间', name: 'createTime' },
  ];

  // 编辑表单配置
  const editItems = [
    { type: 'input', label: '用户名', name: 'name', required: true },
    { type: 'input', label: '邮箱', name: 'email', required: true },
    {
      type: 'select',
      label: '状态',
      name: 'status',
      fieldProps: { options: [{ label: '启用', value: 'active' }, { label: '禁用', value: 'inactive' }] },
      required: true,
    },
  ];

  const handleEditSubmit = async () => {
    await editForm.validateFields();
    const values = editForm.getFieldsValue();
    if (currentRecord?.id) {
      await userApi.update(currentRecord.id, values);
      message.success('更新成功');
    } else {
      await userApi.create(values);
      message.success('创建成功');
    }
    setEditVisible(false);
    formConfig.onFinish();
  };

  return (
    <>
      <STitle
        actionNode={
          <SButton
            actionType="create"
            type="primary"
            onClick={() => {
              setCurrentRecord(null);
              editForm.resetFields();
              setEditVisible(true);
            }}
          >
            新增
          </SButton>
        }
      >
        用户管理
      </STitle>

      <SForm.Search form={form} items={searchItems} {...formConfig} />

      <STable isSeq columns={tableColumns} {...tableProps} />

      <Modal
        title="用户详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <SButton key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </SButton>,
        ]}
        width={600}
      >
        <SDetail dataSource={currentRecord} items={detailItems} column={1} />
      </Modal>

      <Modal
        title={currentRecord?.id ? '编辑用户' : '新增用户'}
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        width={600}
      >
        <SForm form={editForm} items={editItems} columns={1} />
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <SButton.Group
            items={[
              { children: '取消', onClick: () => setEditVisible(false) },
              { children: '保存', type: 'primary', onClick: handleEditSubmit },
            ]}
          />
        </div>
      </Modal>
    </>
  );
};

export default UserPage;
```

### 4. 表单组件生成

```typescript
// pages/user/components/UserForm.tsx
import React, { useEffect } from 'react';
import { Modal, Form, message } from 'antd';
import { SForm, SButton } from '@dalydb/sdesign';
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
    if (visible && user) {
      form.setFieldsValue(user);
    }
  }, [visible, user, form]);

  const handleSubmit = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    if (isEdit) {
      await userApi.update(user!.id, values);
      message.success('更新成功');
    } else {
      await userApi.create(values);
      message.success('创建成功');
    }
    onSuccess();
  };

  const formItems = [
    { type: 'input', label: '用户名', name: 'name', required: true },
    { type: 'input', label: '邮箱', name: 'email', required: true },
    {
      type: 'select',
      label: '状态',
      name: 'status',
      fieldProps: { options: [{ label: '启用', value: 'active' }, { label: '禁用', value: 'inactive' }] },
      required: true,
    },
  ];

  return (
    <Modal
      title={isEdit ? '编辑用户' : '新增用户'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <SForm form={form} items={formItems} columns={1} />
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <SButton.Group
          items={[
            { children: '取消', onClick: onCancel },
            { children: '保存', type: 'primary', onClick: handleSubmit },
          ]}
        />
      </div>
    </Modal>
  );
};

export default UserForm;
```

## 字段类型映射

| 后端类型      | TypeScript类型 | SForm组件类型        | 备注     |
| ------------- | -------------- | -------------------- | -------- |
| string        | string         | input                | 默认     |
| string (long) | string         | textarea             | 多行文本 |
| number        | number         | inputNumber          | 数字     |
| boolean       | boolean        | switch               | 开关     |
| date          | string         | datePicker           | 日期     |
| datetime      | string         | datePicker           | 日期时间 |
| enum          | string/number  | select               | 枚举     |
| array         | T[]            | checkbox             | 数组     |
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
