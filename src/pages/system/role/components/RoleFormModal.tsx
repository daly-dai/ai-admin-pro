import type { ModalChildProps } from '@dalydb/sdesign';
import { createModal, SForm } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Spin } from 'antd';

import {
  createRoleByPost,
  getRoleByIdByGet,
  updateRoleByPost,
} from 'src/api/role';
import type { RoleFormData } from 'src/api/role/types';

type Params = { mode: 'create' | 'edit'; id?: number };

const RoleFormContent = ({
  params,
  onClose,
  onSuccess,
}: ModalChildProps<Params>) => {
  const [form] = SForm.useForm();
  const isEdit = params.mode === 'edit';

  const { loading: detailLoading } = useRequest(
    () => getRoleByIdByGet(params.id!),
    {
      ready: isEdit && !!params.id,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  const { run, loading } = useRequest(
    (values: RoleFormData) => {
      if (isEdit) {
        return updateRoleByPost({ ...values, id: params.id! });
      }
      return createRoleByPost(values);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(isEdit ? '更新成功' : '创建成功');
        onSuccess?.();
      },
    },
  );

  const formItems = [
    {
      label: '角色编码',
      name: 'code',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入角色编码' }],
    },
    {
      label: '角色名称',
      name: 'name',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入角色名称' }],
    },
    {
      label: '描述',
      name: 'description',
      type: 'textarea' as const,
    },
    {
      label: '状态',
      name: 'status',
      type: 'select' as const,
      fieldProps: { dictKey: 'user_status' },
    },
  ];

  return (
    <Modal
      open
      title={isEdit ? '编辑角色' : '新增角色'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Spin spinning={detailLoading}>
        <SForm
          form={form}
          items={formItems}
          columns={1}
          onFinish={(values) => run(values)}
        />
      </Spin>
    </Modal>
  );
};

export default createModal<Params>(RoleFormContent);
