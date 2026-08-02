import type { ModalContainerRef, SColumnsType } from '@dalydb/sdesign';
import { SButton, STable, STitle } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Space, Spin } from 'antd';
import { useMemo, useRef } from 'react';

import { deletePermByPost, getPermListByPost } from 'src/api/permission';
import type { Permission } from 'src/api/permission/types';
import MacaronTag from 'src/components/common/MacaronTag';
import { useDictStore } from 'src/stores';
import PermFormModal from './components/PermFormModal';

/** 将扁平权限转为树形 */
const buildTree = (list: Permission[]): Permission[] => {
  const map = new Map<number, Permission>();
  const roots: Permission[] = [];

  for (const item of list) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of list) {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

const PermListPage = () => {
  const formRef =
    useRef<ModalContainerRef<{ mode: 'create' | 'edit'; id?: number }>>(null);

  const { data, loading, refresh } = useRequest(getPermListByPost);

  const treeData = useMemo(() => buildTree(data?.list ?? []), [data?.list]);

  const dictMapData = useDictStore((state) => state.dictMapData);

  const { run: handleDelete } = useRequest(deletePermByPost, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      refresh();
    },
  });

  const columns: SColumnsType<Permission> = [
    { title: '编码', dataIndex: 'code', width: 160 },
    { title: '名称', dataIndex: 'name', width: 160 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (_text, record) => (
        <MacaronTag dictMap={dictMapData['perm_type']} value={record.type} />
      ),
    },
    { title: '排序', dataIndex: 'sort', width: 80 },
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
      width: 200,
      render: (_text, record) => (
        <Space>
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
                content: `确认删除权限「${record.name}」吗？（将同时删除子权限）`,
                onOk: () => handleDelete(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <STitle
        type="page"
        actionNode={
          <SButton
            actionType="create"
            onClick={() => formRef.current?.open({ mode: 'create' })}
          />
        }
      >
        权限管理
      </STitle>
      <STable
        columns={columns}
        dataSource={treeData}
        rowKey="id"
        pagination={false}
      />
      <PermFormModal ref={formRef} onSuccess={() => refresh()} />
    </Spin>
  );
};

export default PermListPage;
