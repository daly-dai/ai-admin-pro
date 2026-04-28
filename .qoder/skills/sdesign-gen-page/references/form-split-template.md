# 拆分表单页模板（仅差异大时使用）

> ⚠️ **仅当新增和编辑差异大（字段、布局、区块明显不同）且用户已确认拆分后使用。** 差异小时优先用 `form-template.md` 统一模板。

## 填空模板 — create.tsx

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm, SButton } from '@dalydb/sdesign';
import type { SFormItems } from '@dalydb/sdesign';
import { message, Card, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
// @FILL: 导入 API 函数
// ✅ import { createByPost } from 'src/api/{module}';
// @FILL: 导入类型 — 必须用 import type
// ✅ import type { ProductFormData } from 'src/api/{module}/types';
// ❌ import { ProductFormData }（类型导入必须加 type 关键字）

export default () => {
  const [form] = SForm.useForm();
  const navigate = useNavigate();

  const { run: handleSubmit, loading } = useRequest(
    // @FILL: 替换为新增 API
    // ✅ (values: ProductFormData) => createByPost(values)
    (values: Record<string, unknown>) => Promise.resolve(values),
    {
      manual: true,
      onSuccess: () => {
        message.success('创建成功');
        navigate(-1);
      },
    },
  );

  // ⚠️ 必须用显式类型注解: const formItems: SFormItems[] = [...]
  const formItems: SFormItems[] = [
    // @FILL: 新增页表单项配置
    // ✅ { label: '名称', name: 'name', type: 'input', required: true }
    // ✅ { label: '状态', name: 'status', type: 'select', fieldProps: { dictKey: 'statusCode' } }
    // ❌ { label: '状态', name: 'status', type: 'select', fieldProps: { options: [...] } }  // 禁止硬编码 options
    // ❌ { type: 'dependency' }  // 已弃用
  ];

  return (
    // ⚠️ SForm 不支持 loading prop，用 Spin 包裹
    <Spin spinning={loading}>
      <Card title="@FILL:新增标题">
        <SForm
          form={form}
          items={formItems}
          columns={2}
          onFinish={handleSubmit}
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <SButton actionType="back" onClick={() => navigate(-1)} />
          <SButton
            actionType="submit"
            style={{ marginLeft: 16 }}
            onClick={() => form.submit()}
            loading={loading}
          />
        </div>
      </Card>
    </Spin>
  );
};
```

## 填空模板 — edit.tsx

```tsx
// ===== 固定部分：严禁修改已存在的代码结构，仅允许修改 @FILL 标记行 =====
import { SForm, SButton } from '@dalydb/sdesign';
import type { SFormItems } from '@dalydb/sdesign';
import { message, Card, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @FILL: 导入 API 函数
// ✅ import { getByIdByGet, updateByPut } from 'src/api/{module}';
// @FILL: 导入类型 — 必须用 import type
// ✅ import type { ProductFormData } from 'src/api/{module}/types';

export default () => {
  const [form] = SForm.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const { loading: detailLoading } = useRequest(
    // @FILL: 替换为详情 API
    // ✅ () => getByIdByGet(id!)
    () => Promise.resolve({} as Record<string, unknown>),
    {
      ready: !!id,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  const { run: handleSubmit, loading } = useRequest(
    // @FILL: 替换为更新 API
    // ✅ (values: ProductFormData) => updateByPut({ ...values, id: id! })
    (values: Record<string, unknown>) => Promise.resolve(values),
    {
      manual: true,
      onSuccess: () => {
        message.success('编辑成功');
        navigate(-1);
      },
    },
  );

  // ⚠️ 必须用显式类型注解: const formItems: SFormItems[] = [...]
  const formItems: SFormItems[] = [
    // @FILL: 编辑页表单项配置（可能与新增页不同）
    // ✅ { label: '名称', name: 'name', type: 'input', required: true }
    // ❌ { type: 'dependency' }  // 已弃用
  ];

  return (
    // ⚠️ SForm 不支持 loading prop，用 Spin 包裹
    <Spin spinning={detailLoading || loading}>
      <Card title="@FILL:编辑标题">
        <SForm
          form={form}
          items={formItems}
          columns={2}
          onFinish={handleSubmit}
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <SButton actionType="back" onClick={() => navigate(-1)} />
          <SButton
            actionType="submit"
            style={{ marginLeft: 16 }}
            onClick={() => form.submit()}
            loading={loading}
          />
        </div>
      </Card>
    </Spin>
  );
};
```
