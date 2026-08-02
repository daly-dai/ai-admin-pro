import type {
  DrawerContainerRef,
  ModalContainerRef,
  SColumnsType,
  SProTableRef,
} from '@dalydb/sdesign';
import { SButton, SProTable } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Space } from 'antd';
import { useRef } from 'react';

import { deleteRoleByPost, searchRoleByPost } from 'src/api/role';
import type { Role } from 'src/api/role/types';
import MacaronTag from 'src/components/common/MacaronTag';
import { useDictStore } from 'src/stores';
import PermAssignModal from './components/PermAssignModal';
import RoleFormModal from './components/RoleFormModal';

const RoleListPage = () => {
  const dictMapData = useDictStore((state) => state.dictMapData);
  const tableRef = useRef<SProTableRef>(null);
  const formRef =
    useRef<ModalContainerRef<{ mode: 'create' | 'edit'; id?: number }>>(null);
  const permRef =
    useRef<DrawerContainerRef<{ roleId: number; roleName: string }>>(null);

  const { run: handleDelete } = useRequest(deleteRoleByPost, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      tableRef.current?.refresh();
    },
  });

  const columns: SColumnsType<Role> = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    { title: '编码', dataIndex: 'code', width: 150 },
    { title: '名称', dataIndex: 'name', width: 150 },
    { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
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
        const isSuperAdmin = record.code === 'SUPER_ADMIN';
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
                      content: `确认删除角色「${record.name}」吗？`,
                      onOk: () => handleDelete(record.id),
                    });
                  }}
                />
              </>
            )}
            <SButton
              compact
              onClick={() =>
                permRef.current?.open({
                  roleId: record.id,
                  roleName: record.name,
                })
              }
            >
              权限
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
        title="角色管理"
        request={{ service: searchRoleByPost }}
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
      <RoleFormModal
        ref={formRef}
        onSuccess={() => tableRef.current?.refresh()}
      />
      <PermAssignModal ref={permRef} />
    </>
  );
};

export default RoleListPage;
