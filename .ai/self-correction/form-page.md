# 表单页面自我修正规则

> AI 生成表单页面后，按以下规则自动修正，直接输出正确代码

## 修正步骤（按顺序执行）

### 步骤 1: 修正组件导入
- 检查：是否从 `@dalydb/sdesign` 导入 `SForm`, `SButton`, `STitle`
- 确保导入：`SForm` 而非 `Form`

### 步骤 2: 修正表单组件使用
- 检查：是否使用 `SForm` 组件
- 如果不是：将 `Form` 改为 `SForm`
- 检查：是否使用 `items` 配置式
- 如果不是：将 children 写法改为 `items` 配置

```typescript
// 修正前
<Form>
  <Form.Item label="名称" name="name">
    <Input />
  </Form.Item>
</Form>

// 修正后
<SForm 
  items={[
    { label: '名称', name: 'name', type: 'input' }
  ]}
/>
```

### 步骤 3: 修正表单提交
- 检查：是否使用 `onFinish` 处理提交
- 检查：创建页是否调用 `{module}Api.create`
- 检查：编辑页是否调用 `{module}Api.update`

### 步骤 4: 修正编辑页数据回填
- 检查：编辑页是否调用 `{module}Api.getById` 获取初始值
- 检查：是否使用 `form.setFieldsValue` 回填数据

```typescript
// 编辑页必须包含
const { id } = useParams();
const { data } = useRequest(() => {module}Api.getById(id!), {
  ready: !!id,
  onSuccess: (data) => {
    form.setFieldsValue(data);
  },
});
```

### 步骤 5: 修正表单验证
- 检查：必填项是否配置 `required: true` 或 `required: '提示信息'`
- 检查：是否有手机号、邮箱等特殊验证（使用 `regKey`）

### 步骤 6: 修正按钮组件
- 检查：提交按钮是否使用 `SButton`
- 检查：是否使用 `actionType="save"` 或 `actionType="cancel"`

### 步骤 7: 修正布局
- 检查：是否使用 `columns` 控制表单项布局
- 建议：表单使用 `columns={2}` 或 `columns={1}`

### 步骤 8: 修正导入路径
- 检查：API 导入路径是否为 `@/api/{module}`
- 检查：类型导入是否使用 `import type`

## 输出格式

### 创建页

```typescript
import React from 'react';
import { SForm, SButton, STitle } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import { {module}Api } from '@/api/{module}';
import type { {Entity}FormData } from '@/api/{module}/types';

const {Module}CreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  const { run: handleSubmit, loading } = useRequest({module}Api.create, {
    manual: true,
    onSuccess: () => {
      message.success('创建成功');
      navigate('/{module}');
    },
  });

  const items: SFormItems[] = [
    // 表单项配置
  ];

  return (
    <div>
      <STitle title="新增{实体}" />
      <SForm 
        items={items} 
        columns={2}
        onFinish={handleSubmit}
        footer={
          <>
            <SButton actionType="save" htmlType="submit" loading={loading} />
            <SButton actionType="cancel" onClick={() => navigate('/{module}')} />
          </>
        }
      />
    </div>
  );
};

export default {Module}CreatePage;
```

### 编辑页

```typescript
import React, { useEffect } from 'react';
import { SForm, SButton, STitle } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { useNavigate, useParams } from 'react-router-dom';
import { {module}Api } from '@/api/{module}';
import type { {Entity}FormData } from '@/api/{module}/types';

const {Module}EditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = SForm.useForm();
  
  // 获取详情
  const { loading: detailLoading } = useRequest(() => {module}Api.getById(id!), {
    ready: !!id,
    onSuccess: (data) => {
      form.setFieldsValue(data);
    },
  });
  
  // 提交更新
  const { run: handleSubmit, loading } = useRequest(
    (data) => {module}Api.update(id!, data),
    {
      manual: true,
      onSuccess: () => {
        message.success('更新成功');
        navigate('/{module}');
      },
    }
  );

  const items: SFormItems[] = [
    // 表单项配置
  ];

  return (
    <div>
      <STitle title="编辑{实体}" />
      <SForm 
        form={form}
        items={items} 
        columns={2}
        onFinish={handleSubmit}
        loading={detailLoading}
        footer={
          <>
            <SButton actionType="save" htmlType="submit" loading={loading} />
            <SButton actionType="cancel" onClick={() => navigate('/{module}')} />
          </>
        }
      />
    </div>
  );
};

export default {Module}EditPage;
```

## 禁止事项

- 不要输出修正过程说明
- 不要输出检查清单
- 只输出最终代码
