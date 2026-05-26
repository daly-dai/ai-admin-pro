import type { ModalChildProps, SFormItems } from '@dalydb/sdesign';
import { SForm, createModal } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { Modal, message } from 'antd';
import { getRoleListByGet } from 'src/api/role';
import {
  createUserByPost,
  getUserByIdByGet,
  updateUserByPut,
} from 'src/api/user';
import type { UserFormData } from 'src/api/user/types';

type FormParams = { mode: 'create' | 'edit'; id?: string };

const FormContent = ({
  params,
  onClose,
  onSuccess,
}: ModalChildProps<FormParams>) => {
  const [form] = SForm.useForm();
  const isEdit = params.mode === 'edit';

  const { data: roleData } = useRequest(() =>
    getRoleListByGet({ pageSize: 999 }),
  );

  useRequest(() => getUserByIdByGet(params.id!), {
    ready: isEdit && !!params.id,
    onSuccess: (data) => form.setFieldsValue(data),
  });

  const { run: handleSubmit, loading } = useRequest(
    (values: UserFormData) =>
      isEdit ? updateUserByPut(params.id!, values) : createUserByPost(values),
    {
      manual: true,
      onSuccess: () => {
        message.success(isEdit ? '编辑成功' : '创建成功');
        onSuccess?.();
      },
    },
  );

  const roleOptions = (roleData?.dataList ?? []).map((r) => ({
    label: r.name,
    value: r.id,
  }));

  const formItems: SFormItems[] = [
    { label: '用户名', name: 'username', type: 'input', required: true },
    { label: '昵称', name: 'nickname', type: 'input', required: true },
    {
      label: '邮箱',
      name: 'email',
      type: 'input',
      required: true,
      regKey: 'email',
    },
    {
      label: '手机号',
      name: 'phone',
      type: 'input',
      required: true,
      regKey: 'phone',
    },
    {
      label: '角色分配',
      name: 'roleIds',
      type: 'select',
      fieldProps: {
        mode: 'multiple',
        options: roleOptions,
        placeholder: '请选择角色',
      },
    },
    { label: '状态', name: 'status', type: 'switch' },
    {
      label: '备注',
      name: 'remark',
      type: 'textarea',
      fieldProps: { maxLength: 200 },
    },
  ];

  return (
    <Modal
      open
      title={isEdit ? '编辑用户' : '新增用户'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <SForm
        form={form}
        items={formItems}
        columns={1}
        onFinish={handleSubmit}
      />
    </Modal>
  );
};

export default createModal<FormParams>(FormContent);
