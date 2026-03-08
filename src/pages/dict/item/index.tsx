import React, { useState, useEffect } from 'react';
import { Modal, Form, message } from 'antd';
import type { SFormItems } from '@dalydb/sdesign';
import {
  SForm,
  STable,
  SDetail,
  STitle,
  SButton,
  useSearchTable,
} from '@dalydb/sdesign';
import { dictTypeApi, dictItemApi } from '@/api/dict';
import type { DictType, DictItem, DictItemQuery, DictItemFormData } from '@/api/dict';

const DictItemPage: React.FC = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<DictItem | null>(null);
  const [dictTypes, setDictTypes] = useState<DictType[]>([]);
  const [selectedDictType, setSelectedDictType] = useState<string>('');
  const [editForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 获取字典类型列表
  useEffect(() => {
    dictTypeApi.getAllActive().then((data) => {
      setDictTypes(data);
      if (data.length > 0 && !selectedDictType) {
        setSelectedDictType(data[0].id);
      }
    });
  }, []);

  // 使用 useSearchTable 管理搜索和表格
  const { tableProps, formConfig, form } = useSearchTable(
    (params) =>
      dictItemApi.getList({
        ...params,
        dictTypeId: selectedDictType,
      }),
    {
      paginationFields: {
        current: 'page',
        pageSize: 'pageSize',
        total: 'total',
        list: 'list',
      },
    }
  );

  // 搜索表单配置
  const searchItems: SFormItems[] = [
    { type: 'input', label: '关键词', name: 'keyword', fieldProps: { placeholder: '编码/名称' } },
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
  const tableColumns = [
    { title: '字典项编码', dataIndex: 'code', width: 180 },
    { title: '字典项名称', dataIndex: 'name', width: 180 },
    {
      title: '排序号',
      dataIndex: 'sort',
      width: 100,
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
      fixed: 'right' as const,
      render: (_value: unknown, record: DictItem) => (
        <SButton.Group
          size="small"
          items={[
            {
              actionType: 'view',
              onClick: async () => {
                const detail = await dictItemApi.getById(record.id);
                setCurrentRecord(detail);
                setDetailVisible(true);
              },
            },
            {
              actionType: 'edit',
              onClick: async () => {
                const detail = await dictItemApi.getById(record.id);
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
                  content: `确定要删除字典项 "${record.name}" 吗？`,
                  onOk: async () => {
                    await dictItemApi.delete(record.id);
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
    { label: '字典项编码', name: 'code' },
    { label: '字典项名称', name: 'name' },
    { label: '排序号', name: 'sort' },
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
      type: 'select',
      label: '所属字典',
      name: 'dictTypeId',
      required: true,
      fieldProps: {
        options: dictTypes.map((item) => ({ label: item.name, value: item.id })),
        disabled: !!currentRecord?.id,
      },
    },
    {
      type: 'input',
      label: '字典项编码',
      name: 'code',
      required: true,
      fieldProps: { placeholder: '请输入字典项编码' },
    },
    {
      type: 'input',
      label: '字典项名称',
      name: 'name',
      required: true,
      fieldProps: { placeholder: '请输入字典项名称' },
    },
    {
      type: 'inputNumber',
      label: '排序号',
      name: 'sort',
      required: true,
      fieldProps: { placeholder: '请输入排序号', min: 0 },
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
      await dictItemApi.update(currentRecord.id, values);
      message.success('更新成功');
    } else {
      await dictItemApi.create(values);
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
              editForm.setFieldsValue({
                dictTypeId: selectedDictType,
                status: 'active',
                sort: 0,
              });
              setEditVisible(true);
            }}
          >
            新增
          </SButton>
        }
      >
        字典项管理
      </STitle>

      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>选择字典类型:</span>
        <SForm
          form={Form.useForm()[0]}
          items={[
            {
              type: 'select',
              name: 'dictType',
              fieldProps: {
                options: dictTypes.map((item) => ({ label: item.name, value: item.id })),
                value: selectedDictType,
                onSelect: (value: unknown) => setSelectedDictType(value as string),
                style: { width: 200 },
              },
            },
          ]}
          layout="inline"
        />
      </div>

      <SForm.Search form={form} items={searchItems} {...formConfig} />

      <STable isSeq columns={tableColumns} {...tableProps} />

      <Modal
        title="字典项详情"
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
        title={currentRecord?.id ? '编辑字典项' : '新增字典项'}
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

export default DictItemPage;
