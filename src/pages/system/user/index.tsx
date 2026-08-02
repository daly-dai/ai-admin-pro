import type {
  ModalContainerRef,
  SColumnsType,
  SProTableRef,
} from '@dalydb/sdesign';
import { SButton, SProTable } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Space } from 'antd';
import { useRef } from 'react';

import { getRoleListByPost } from 'src/api/role';
import { deleteUserByPost, searchUserByPost } from 'src/api/user';
import type { User } from 'src/api/user/types';
import MacaronTag from 'src/components/common/MacaronTag';
import { useDictStore } from 'src/stores';
import RoleAssignModal from './components/RoleAssignModal';
import UserFormModal from './components/UserFormModal';

const UserListPage = () => {
  const dictMapData = useDictStore((state) => state.dictMapData);
  const tableRef = useRef<SProTableRef>(null);
  const formRef =
    useRef<ModalContainerRef<{ mode: 'create' | 'edit'; id?: number }>>(null);
  const roleRef =
    useRef<ModalContainerRef<{ userId: number; username: string }>>(null);

  const { data: allRoles = [] } = useRequest(async () => {
    const res = await getRoleListByPost();
    return res.list;
  });

  const roleMap = new Map(allRoles.map((role) => [role.id, role.name]));

  const { run: handleDelete } = useRequest(deleteUserByPost, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      tableRef.current?.refresh();
    },
  });

  const columns: SColumnsType<User> = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '真实姓名', dataIndex: 'realName', width: 120 },
    {
      title: '角色',
      dataIndex: 'roleIds',
      width: 160,
      render: (_text, record) => {
        if (!record.roleIds || record.roleIds.length === 0) {
          return '-';
        }
        return record.roleIds.map((id) => roleMap.get(id) || id).join('、');
      },
    },
    { title: '邮箱', dataIndex: 'email', width: 180 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (_text, record) => (
        <MacaronTag
          dictMap={dictMapData['user_status']}
          value={String(record.status)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: 'datetime' as const,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 280,
      render: (_text, record) => {
        const isSuperAdmin = record.username === 'admin';
        return (
          <Space>
            {!isSuperAdmin && (
              <>
                <SButton
                  actionType="edit"
                  compact
                  onClick={() =>
                    formRef.current?.open({ mode: 'edit', id: record.id })
                  }
                />
                <SButton
                  actionType="delete"
                  compact
                  onClick={() => {
                    Modal.confirm({
                      title: '确认删除',
                      content: `确认删除用户「${record.username}」吗？`,
                      onOk: () => handleDelete(record.id),
                    });
                  }}
                />
              </>
            )}
            <SButton
              compact
              onClick={() =>
                roleRef.current?.open({
                  userId: record.id,
                  username: record.username,
                })
              }
            >
              角色
            </SButton>
          </Space>
        );
      },
    },
  ];

  const searchItems = [
    { label: '关键词', name: 'keyword', type: 'input' as const },
    {
      label: '状态',
      name: 'status',
      type: 'select' as const,
      fieldProps: { dictKey: 'user_status', allowClear: true },
    },
  ];

  return (
    <>
      <SProTable
        ref={tableRef}
        title="用户管理"
        request={{ service: searchUserByPost }}
        tableTitle={{
          actionNode: (
            <SButton
              actionType="create"
              onClick={() => formRef.current?.open({ mode: 'create' })}
            />
          ),
        }}
        searchProps={{ items: searchItems, columns: 3 }}
        tableProps={{ columns, rowKey: 'id' }}
      />
      <UserFormModal
        ref={formRef}
        onSuccess={() => tableRef.current?.refresh()}
      />
      <RoleAssignModal ref={roleRef} />
    </>
  );
};

export default UserListPage;
