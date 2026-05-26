import type {
  ModalContainerRef,
  SColumnsType,
  SFormItems,
  SSearchTableRef,
} from '@dalydb/sdesign';
import { SButton, SSearchTable } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Switch } from 'antd';
import { useRef } from 'react';
import {
  deleteUserByDelete,
  getUserListByGet,
  updateUserByPut,
} from 'src/api/user';
import type { User } from 'src/api/user/types';
import UserDetailDrawer from './components/UserDetailDrawer';
import UserFormModal from './components/UserFormModal';

export default () => {
  const tableRef = useRef<SSearchTableRef>(null);
  const formRef =
    useRef<ModalContainerRef<{ mode: 'create' | 'edit'; id?: string }>>(null);
  const detailRef = useRef<ModalContainerRef<{ id: string }>>(null);

  const { run: handleDelete } = useRequest(deleteUserByDelete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      tableRef.current?.refresh();
    },
  });

  const { run: handleToggleStatus } = useRequest(
    (id: string, status: number) => updateUserByPut(id, { status }),
    {
      manual: true,
      onSuccess: () => {
        message.success('状态更新成功');
        tableRef.current?.refresh();
      },
    },
  );

  const columns: SColumnsType<User> = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      render: (_: unknown, _record: User, index: number) => index + 1,
    },
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '昵称', dataIndex: 'nickname', width: 120 },
    { title: '邮箱', dataIndex: 'email', width: 200 },
    {
      title: '角色',
      dataIndex: 'roleIds',
      width: 150,
      render: (_roleIds: string[], record: User) => {
        if (!record.roleIds?.length) return '-';
        return record.roleIds.join(', ');
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      dictKey: 'userStatus',
      render: (status: number, record: User) => (
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
      width: 220,
      render: (_: unknown, record: User) => (
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
                content: `确认删除用户「${record.username}」？删除后不可恢复。`,
                onOk: () => handleDelete(record.id),
              });
            }}
          />
          <SButton
            actionType="view"
            compact
            onClick={() => detailRef.current?.open({ id: record.id })}
          />
        </>
      ),
    },
  ];

  const searchItems: SFormItems[] = [
    { label: '用户名/昵称', name: 'keyword', type: 'input' },
    {
      label: '状态',
      name: 'status',
      type: 'select',
      fieldProps: { dictKey: 'userStatus', allowClear: true },
    },
    { label: '创建时间', name: 'dateRange', type: 'datePickerRange' },
  ];

  return (
    <>
      <SSearchTable
        ref={tableRef}
        headTitle={{ children: '用户管理' }}
        requestFn={getUserListByGet}
        tableTitle={{
          actionNode: (
            <SButton
              actionType="create"
              onClick={() => formRef.current?.open({ mode: 'create' })}
            />
          ),
        }}
        formProps={{ items: searchItems, columns: 3 }}
        tableProps={{ columns, rowKey: 'id' }}
      />
      <UserFormModal
        ref={formRef}
        onSuccess={() => tableRef.current?.refresh()}
      />
      <UserDetailDrawer ref={detailRef} />
    </>
  );
};
