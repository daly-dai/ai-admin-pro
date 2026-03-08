import React, { useState } from 'react';
import { Modal, Form, message } from 'antd';
import type { SFormItems, SColumn } from '@dalydb/sdesign';
import {
  SForm,
  STable,
  SDetail,
  STitle,
  SButton,
  useSearchTable,
} from '@dalydb/sdesign';
import { dictTypeApi } from '@/api/dict';
import type { DictType, DictTypeQuery, DictTypeFormData } from '@/api/dict';

const DictTypePage: React.FC = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<DictType | null>(null);
  const [editForm] = Form.useForm();

  // 使用 useSearchTable 管理搜索和表格
  const { tableProps, formConfig, form } = useSearchTable(dictTypeApi.getList, {
    paginationFields: {
      current: 'page',
      pageSize: 'pageSize',
      total: 'total',
      list: 'list',
    },
  });

  // 搜索表单配置
  const searchItems: SFormItems[] = [
    { type: 'input', label: '关键词', name: 'keyword', placeholder: '编码/名称' },
    {
      type: 'select',
      label: '状态',
      name: 'status',
      fieldProps: {
        options: [
          { label: '启用', value: 'active' },
          { label: '禁用', value: 'inactive' },
        ],
        allowClear: true,
      },
    },
  ] as const;

  // 表格列配置
  const tableColumns: SColumn<DictType>[] = [
    { title: '字典编码', dataIndex: 'code', width: 180 },
    { title: '字典名称', dataIndex: 'name', width: 180 },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      width: 250,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: string) => (
        <span style={{ color: value === 'active' ? '#52c41a' : '#ff4d4f' }}>
          {value === 'active' ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 180,
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'id',
      width: 200,
      fixed: 'right',
      render: (_value: unknown, record: DictType) => (
        <SButton.Group
          size="small"
          items={[
            {
              actionType: 'view',
              onClick: async () => {
                const detail = await dictTypeApi.getById(record.id);
                setCurrentRecord(detail);
                setDetailVisible(true);
              },
            },
            {
              actionType: 'edit',
              onClick: async () => {
                const detail = await dictTypeApi.getById(record.id);
                setCurrentRecord(detail);
                editForm.setFieldsValue(detail);
                setEditVisible(true);
              },
            },
            {
              actionType: 'delete',
              danger: true,
              onClick: () => {
                Modal.confirm({
                  title: '确认删除',
                  content: `确定要删除字典类型 "${record.name}" 吗？`,
                  onOk: async () => {
                    await dictTypeApi.delete(record.id);
                    message.success('删除成功');
                    formConfig.onFinish();
                  },
                });
              },
            },
          ]}
        />
      ),
    },
  ];

  // 详情配置
  const detailItems = [
    { label: '字典编码', name: 'code' },
    { label: '字典名称', name: 'name' },
    { label: '描述', name: 'description' },
    {
      label: '状态',
      name: 'status',
      render: (value: string) => (value === 'active' ? '启用' : '禁用'),
    },
    { label: '创建时间', name: 'createTime' },
    { label: '更新时间', name: 'updateTime' },
  ];

  // 编辑表单配置
  const editItems: SFormItems[] = [
    {
      type: 'input',
      label: '字典编码',
      name: 'code',
      required: true,
      fieldProps: { placeholder: '请输入字典编码' },
    },
    {
      type: 'input',
      label: '字典名称',
      name: 'name',
      required: true,
      fieldProps: { placeholder: '请输入字典名称' },
    },
    {
      type: 'textarea',
      label: '描述',
      name: 'description',
      fieldProps: { placeholder: '请输入描述', rows: 3 },
    },
    {
      type: 'select',
      label: '状态',
      name: 'status',
      required: true,
      fieldProps: {
        options: [
          { label: '启用', value: 'active' },
          { label: '禁用', value: 'inactive' },
        ],
      },
    },
  ] as const;

  const handleEditSubmit = async () => {
    await editForm.validateFields();
    const values = editForm.getFieldsValue();
    if (currentRecord?.id) {
      await dictTypeApi.update(currentRecord.id, values);
      message.success('更新成功');
    } else {
      await dictTypeApi.create(values);
      message.success('创建成功');
    }
    setEditVisible(false);
    formConfig.onFinish();
  };

  return (
    <>
      <STitle
        actionNode={
          <SButton
            actionType="create"
            type="primary"
            onClick={() => {
              setCurrentRecord(null);
              editForm.resetFields();
              setEditVisible(true);
            }}
          >
            新增
          </SButton>
        }
      >
        字典类型管理
      </STitle>

      <SForm.Search form={form} items={searchItems} {...formConfig} />

      <STable isSeq columns={tableColumns} {...tableProps} />

      <Modal
        title="字典类型详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <SButton key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </SButton>,
        ]}
        width={600}
      >
        <SDetail dataSource={currentRecord as Record<string, any>} items={detailItems} column={1} />
      </Modal>

      <Modal
        title={currentRecord?.id ? '编辑字典类型' : '新增字典类型'}
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        width={600}
      >
        <SForm form={editForm} items={editItems} columns={1} />
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <SButton.Group
            items={[
              { children: '取消', onClick: () => setEditVisible(false) },
              { children: '保存', type: 'primary', onClick: handleEditSubmit },
            ]}
          />
        </div>
      </Modal>
    </>
  );
};

export default DictTypePage;
