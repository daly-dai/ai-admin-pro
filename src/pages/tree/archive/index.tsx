import type {
  ModalContainerRef,
  SColumnsType,
  SProTableRef,
} from '@dalydb/sdesign';
import { SButton, SProTable } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Space } from 'antd';
import { useRef } from 'react';

import { deleteTreeByPost, getTreeListByPost } from 'src/api/tree';
import type { Tree } from 'src/api/tree/types';
import TreeFormModal from './components/TreeFormModal';

const TreeArchivePage = () => {
  const tableRef = useRef<SProTableRef>(null);
  const formRef =
    useRef<ModalContainerRef<{ mode: 'create' | 'edit'; id?: number }>>(null);

  const { run: handleDelete } = useRequest(deleteTreeByPost, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      tableRef.current?.refresh();
    },
  });

  const columns: SColumnsType<Tree> = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    { title: '古树名称', dataIndex: 'name', width: 160 },
    { title: '树种', dataIndex: 'species', width: 110 },
    { title: '树龄（年）', dataIndex: 'ageEstimate', width: 100 },
    {
      title: '地址',
      dataIndex: 'address',
      width: 260,
      render: 'ellipsis' as const,
    },
    { title: '最佳观赏期', dataIndex: 'bestSeason', width: 110 },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: 'datetime' as const,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 150,
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
                content: `确认删除古树「${record.name}」吗？`,
                onOk: () => handleDelete(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  const searchItems = [
    { label: '关键词', name: 'keyword', type: 'input' as const },
  ];

  return (
    <>
      <SProTable
        ref={tableRef}
        title="古树档案管理"
        request={{ service: getTreeListByPost }}
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
      <TreeFormModal
        ref={formRef}
        onSuccess={() => tableRef.current?.refresh()}
      />
    </>
  );
};

export default TreeArchivePage;
