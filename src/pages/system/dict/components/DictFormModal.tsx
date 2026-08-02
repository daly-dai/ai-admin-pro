import type { ModalChildProps } from '@dalydb/sdesign';
import { createModal, SForm } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Spin } from 'antd';

import {
  createDictByPost,
  getDictByIdByGet,
  updateDictByPost,
} from 'src/api/dict';
import type { DictFormData } from 'src/api/dict/types';

type Params = { mode: 'create' | 'edit'; id?: number };

const DictFormContent = ({
  params,
  onClose,
  onSuccess,
}: ModalChildProps<Params>) => {
  const [form] = SForm.useForm();
  const isEdit = params.mode === 'edit';

  const { loading: detailLoading } = useRequest(
    () => getDictByIdByGet(params.id!),
    {
      ready: isEdit && !!params.id,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  const { run, loading } = useRequest(
    (values: DictFormData) => {
      if (isEdit) {
        return updateDictByPost({ ...values, id: params.id! });
      }
      return createDictByPost(values);
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
      label: '字典类型',
      name: 'dictType',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入字典类型编码' }],
      fieldProps: {
        placeholder: '如: gender、user_status',
        disabled: isEdit,
      },
      tooltip: '创建后不可修改，请谨慎填写',
    },
    {
      label: '字典标签',
      name: 'dictLabel',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入字典标签' }],
      fieldProps: { placeholder: '如: 男' },
    },
    {
      label: '字典值',
      name: 'dictValue',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入字典值' }],
      fieldProps: { placeholder: '如: 1' },
    },
    {
      label: '排序号',
      name: 'sort',
      type: 'inputNumber' as const,
      initialValue: 0,
      fieldProps: {
        placeholder: '数字越小越靠前，默认 0',
        style: { width: '100%' },
      },
    },
    {
      label: '状态',
      name: 'status',
      type: 'select' as const,
      initialValue: 1,
      fieldProps: { dictKey: 'user_status' },
    },
    {
      label: '备注',
      name: 'remark',
      type: 'textarea' as const,
      fieldProps: { rows: 3 },
    },
  ];

  return (
    <Modal
      open
      title={isEdit ? '编辑字典' : '新增字典'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
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

export default createModal<Params>(DictFormContent);
