import type {
  SColumnsType,
  SFormItems,
  SSearchTableRef,
} from '@dalydb/sdesign';
import { SButton, SSearchTable } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Switch } from 'antd';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteRoleByDelete,
  getRoleListByGet,
  updateRoleByPut,
} from 'src/api/role';
import type { Role } from 'src/api/role/types';

export default () => {
  const tableRef = useRef<SSearchTableRef>(null);
  const navigate = useNavigate();

  const { run: handleDelete } = useRequest(deleteRoleByDelete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      tableRef.current?.refresh();
    },
  });

  const { run: handleToggleStatus } = useRequest(
    (id: string, status: number) => updateRoleByPut(id, { status }),
    {
      manual: true,
      onSuccess: () => {
        message.success('状态更新成功');
        tableRef.current?.refresh();
      },
    },
  );

  const columns: SColumnsType<Role> = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      render: (_: unknown, _record: Role, index: number) => index + 1,
    },
    { title: '角色编码', dataIndex: 'code', width: 140 },
    { title: '角色名', dataIndex: 'name', width: 140 },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
      render: 'ellipsis' as const,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      dictKey: 'userStatus',
      render: (status: number, record: Role) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleToggleStatus(record.id, checked ? 1 : 0)}
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
      width: 260,
      render: (_: unknown, record: Role) => (
        <>
          <SButton
            actionType="edit"
            compact
            onClick={() => navigate(`/system/role/form?id=${record.id}`)}
          />
          <SButton
            actionType="delete"
            compact
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: `确认删除角色「${record.name}」？如有用户关联此角色，将自动解除关联。`,
                onOk: () => handleDelete(record.id),
              });
            }}
          />
          <SButton
            actionType="view"
            compact
            onClick={() => navigate(`/system/role/form?id=${record.id}`)}
          />
        </>
      ),
    },
  ];

  const searchItems: SFormItems[] = [
    { label: '角色名/编码', name: 'keyword', type: 'input' },
    {
      label: '状态',
      name: 'status',
      type: 'select',
      fieldProps: { dictKey: 'userStatus', allowClear: true },
    },
  ];

  return (
    <SSearchTable
      ref={tableRef}
      headTitle={{ children: '角色管理' }}
      requestFn={getRoleListByGet}
      tableTitle={{
        actionNode: (
          <SButton
            actionType="create"
            onClick={() => navigate('/system/role/form')}
          />
        ),
      }}
      formProps={{ items: searchItems, columns: 3 }}
      tableProps={{ columns, rowKey: 'id' }}
    />
  );
};
