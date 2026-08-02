import type {
  ModalContainerRef,
  SColumnsType,
  SProTableRef,
} from '@dalydb/sdesign';
import { SButton, SProTable } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { message, Modal, Space } from 'antd';
import { useRef } from 'react';

import { deleteDictByPost, searchDictByPost } from 'src/api/dict';
import type { Dict } from 'src/api/dict/types';
import MacaronTag from 'src/components/common/MacaronTag';
import { useDictStore } from 'src/stores';
import DictFormModal from './components/DictFormModal';

const DictListPage = () => {
  const dictMapData = useDictStore((state) => state.dictMapData);
  const tableRef = useRef<SProTableRef>(null);
  const formRef =
    useRef<ModalContainerRef<{ mode: 'create' | 'edit'; id?: number }>>(null);

  const { run: handleDelete } = useRequest(deleteDictByPost, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      tableRef.current?.refresh();
    },
  });

  const columns: SColumnsType<Dict> = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    { title: '字典类型', dataIndex: 'dictType', width: 150 },
    { title: '字典标签', dataIndex: 'dictLabel', width: 150 },
    { title: '字典值', dataIndex: 'dictValue', width: 120 },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      render: (_text, record) => record.sort ?? 0,
    },
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
      title: '备注',
      dataIndex: 'remark',
      width: 200,
      ellipsis: true,
      render: (_text, record) => record.remark || '-',
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
      width: 160,
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
                content: `确认删除字典「${record.dictLabel}(${record.dictValue})」吗？`,
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
    {
      label: '字典类型',
      name: 'dictType',
      type: 'input' as const,
      fieldProps: { placeholder: '模糊匹配，如 gender' },
    },
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
        title="字典管理"
        request={{ service: searchDictByPost }}
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
      <DictFormModal
        ref={formRef}
        onSuccess={() => tableRef.current?.refresh()}
      />
    </>
  );
};

export default DictListPage;
