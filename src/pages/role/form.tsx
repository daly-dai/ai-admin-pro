import type { SFormItems } from '@dalydb/sdesign';
import { SButton, SForm } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { Card, message, Spin, Tree } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  createRoleByPost,
  getRoleByIdByGet,
  updateRoleByPut,
} from 'src/api/role';
import type { RoleFormData } from 'src/api/role/types';

const permissionTreeData = [
  {
    title: '系统管理',
    key: 'sys',
    children: [
      {
        title: '用户管理',
        key: 'user-mgmt',
        children: [
          { title: '查看用户列表', key: 'p-001' },
          { title: '新增用户', key: 'p-002' },
          { title: '编辑用户', key: 'p-003' },
          { title: '删除用户', key: 'p-004' },
          { title: '查看用户详情', key: 'p-005' },
        ],
      },
      {
        title: '角色管理',
        key: 'role-mgmt',
        children: [
          { title: '查看角色列表', key: 'p-006' },
          { title: '新增角色', key: 'p-007' },
          { title: '编辑角色', key: 'p-008' },
          { title: '删除角色', key: 'p-009' },
          { title: '分配角色权限', key: 'p-010' },
        ],
      },
    ],
  },
];

export default () => {
  const [form] = SForm.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const isEdit = !!id;

  const checkedKeys: string[] = SForm.useWatch('permissionIds', form) ?? [];

  const { loading: detailLoading } = useRequest(() => getRoleByIdByGet(id!), {
    ready: isEdit,
    onSuccess: (data) => form.setFieldsValue(data),
  });

  const { run: handleSubmit, loading } = useRequest(
    (values: RoleFormData) =>
      isEdit ? updateRoleByPut(id!, values) : createRoleByPost(values),
    {
      manual: true,
      onSuccess: () => {
        message.success(isEdit ? '编辑成功' : '创建成功');
        navigate(-1);
      },
    },
  );

  const formItems: SFormItems[] = [
    {
      label: '角色编码',
      name: 'code',
      type: 'input',
      required: true,
      fieldProps: { placeholder: '大写字母下划线，如 SUPER_ADMIN' },
    },
    { label: '角色名', name: 'name', type: 'input', required: true },
    {
      label: '描述',
      name: 'description',
      type: 'textarea',
      fieldProps: { maxLength: 200 },
    },
    { label: '状态', name: 'status', type: 'switch' },
    {
      label: '权限分配',
      name: 'permissionIds',
      customCom: (
        <Tree
          checkable
          defaultExpandAll
          treeData={permissionTreeData}
          checkedKeys={checkedKeys}
          onCheck={(keys) => {
            const checked = Array.isArray(keys) ? keys : keys.checked;
            form.setFieldsValue({ permissionIds: checked as string[] });
          }}
        />
      ),
    },
  ];

  return (
    <Spin spinning={detailLoading || loading}>
      <Card title={isEdit ? '编辑角色' : '新增角色'}>
        <SForm
          form={form}
          items={formItems}
          columns={1}
          onFinish={handleSubmit}
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <SButton actionType="back" onClick={() => navigate(-1)} />
          <SButton
            actionType="save"
            style={{ marginLeft: 16 }}
            onClick={() => form.submit()}
            loading={loading}
          />
        </div>
      </Card>
    </Spin>
  );
};
