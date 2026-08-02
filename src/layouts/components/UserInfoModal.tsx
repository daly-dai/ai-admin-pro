import type { ModalChildProps, SDetailItem } from '@dalydb/sdesign';
import { createModal, SDetail } from '@dalydb/sdesign';
import { Modal } from 'antd';

import MacaronTag from 'src/components/common/MacaronTag';
import { useUserStore } from 'src/stores';

const UserInfoContent = ({
  onClose,
}: ModalChildProps<Record<string, never>>) => {
  const userInfo = useUserStore((state) => state.userInfo);

  const items: SDetailItem[] = [
    { label: '用户名', name: 'username' },
    { label: '真实姓名', name: 'realName' },
    { label: '邮箱', name: 'email' },
    { label: '手机号', name: 'phone' },
    {
      label: '状态',
      name: 'status',
      render: (value: unknown) =>
        value === 1 ? (
          <MacaronTag type="success">启用</MacaronTag>
        ) : (
          <MacaronTag type="error">禁用</MacaronTag>
        ),
    },
    { label: '备注', name: 'remark' },
    { label: '创建时间', name: 'createTime' },
  ];

  return (
    <Modal
      open
      title="用户信息"
      onCancel={onClose}
      footer={null}
      width={480}
      destroyOnClose
    >
      <SDetail items={items} dataSource={userInfo ?? {}} columns={1} />
    </Modal>
  );
};

export default createModal<Record<string, never>>(UserInfoContent);
