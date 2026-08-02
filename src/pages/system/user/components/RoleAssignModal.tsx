import type { ModalChildProps } from '@dalydb/sdesign';
import { createModal } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { Checkbox, message, Modal, Space, Spin } from 'antd';
import { useEffect, useState } from 'react';

import { getRoleListByPost as getRolesByPost } from 'src/api/role';
import { assignUserRolesByPost, getUserRolesByGet } from 'src/api/user';

type Params = { userId: number; username: string };

const RoleAssignContent = ({ params, onClose }: ModalChildProps<Params>) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: allRoles = [], loading: rolesLoading } = useRequest(
    async () => {
      const res = await getRolesByPost();
      return res.list;
    },
  );

  const { loading: userRolesLoading } = useRequest(
    () => getUserRolesByGet(params.userId),
    {
      ready: !!params.userId,
      onSuccess: (data) => {
        setSelectedIds(data ?? []);
      },
    },
  );

  // 同步外部 roleIds 变化（首次加载后不再响应）
  useEffect(() => {
    // handled by onSuccess above
  }, []);

  const loading = rolesLoading || userRolesLoading;

  const handleOk = async () => {
    await assignUserRolesByPost(params.userId, selectedIds);
    message.success('角色分配成功');
    onClose();
  };

  return (
    <Modal
      open
      title={`分配角色 — ${params.username}`}
      onCancel={onClose}
      onOk={handleOk}
      width={400}
    >
      <Spin spinning={loading}>
        <div style={{ padding: '16px 0' }}>
          <Checkbox.Group
            value={selectedIds}
            onChange={(values) => setSelectedIds(values as number[])}
          >
            <Space direction="vertical">
              {allRoles.map((role) => (
                <Checkbox key={role.id} value={role.id}>
                  {role.name} ({role.code})
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>
      </Spin>
    </Modal>
  );
};

export default createModal<Params>(RoleAssignContent);
