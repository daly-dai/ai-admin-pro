import type { ModalChildProps } from '@dalydb/sdesign';
import { createModal, SForm } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Spin } from 'antd';

import {
  createTreeByPost,
  getTreeByIdByGet,
  updateTreeByPost,
} from 'src/api/tree';
import type { TreeFormData } from 'src/api/tree/types';

type Params = { mode: 'create' | 'edit'; id?: number };

const TreeFormContent = ({
  params,
  onClose,
  onSuccess,
}: ModalChildProps<Params>) => {
  const [form] = SForm.useForm();
  const isEdit = params.mode === 'edit';

  const { loading: detailLoading } = useRequest(
    () => getTreeByIdByGet(params.id!),
    {
      ready: isEdit && !!params.id,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  const { run, loading } = useRequest(
    (values: TreeFormData) => {
      if (isEdit) {
        return updateTreeByPost({ ...values, id: params.id! });
      }
      return createTreeByPost(values);
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
      label: '古树名称',
      name: 'name',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入古树名称' }],
    },
    {
      label: '树种',
      name: 'species',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入树种' }],
    },
    {
      label: '树龄（年）',
      name: 'ageEstimate',
      type: 'inputNumber' as const,
      fieldProps: { min: 0, precision: 0 },
    },
    {
      label: '详细地址',
      name: 'address',
      type: 'input' as const,
    },
    {
      label: '纬度',
      name: 'latitude',
      type: 'inputNumber' as const,
      fieldProps: { min: -90, max: 90 },
    },
    {
      label: '经度',
      name: 'longitude',
      type: 'inputNumber' as const,
      fieldProps: { min: -180, max: 180 },
    },
    {
      label: '最佳观赏期',
      name: 'bestSeason',
      type: 'input' as const,
      fieldProps: { placeholder: '如：秋季（11月银杏金黄）' },
    },
    {
      label: '故事简介',
      name: 'story',
      type: 'textarea' as const,
      colProps: { span: 24 },
    },
  ];

  return (
    <Modal
      open
      title={isEdit ? '编辑古树档案' : '新增古树档案'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={640}
    >
      <Spin spinning={detailLoading}>
        <SForm
          form={form}
          items={formItems}
          columns={2}
          onFinish={(values) => run(values)}
        />
      </Spin>
    </Modal>
  );
};

export default createModal<Params>(TreeFormContent);
