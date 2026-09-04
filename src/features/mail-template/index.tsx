/**
 * 邮件模板列表页（v2 主入口，替代 v1 单页工作台）。
 * 数据流：service facade（mock localStorage、接口化，接后端只换实现）→ 页面 state；
 * 报表数 = 该模板「可见」报表数（T1 过滤语义：无查看权限的文件不进列表）。
 * 页面零 antd Table/Form/Button/Descriptions（用 STable/SForm/SButton）；弹层走 P001 createModal。
 */
import { SearchOutlined } from '@ant-design/icons';
import type { DrawerContainerRef, SColumnsType } from '@dalydb/sdesign';
import { SButton, STable, STitle } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { Input, Modal, Space, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TemplateFormModal from './TemplateFormModal';
import styles from './index.module.css';
import { getReportListByPost } from './service/reportService';
import {
  deleteTemplateByPost,
  getTemplateListByPost,
} from './service/templateService';
import type { MailTemplate } from './service/types';

/** 列表行 = 模板 + 该模板可见报表数 */
interface TemplateListRow extends MailTemplate {
  reportCount: number;
}

type FormDrawerParams = {
  mode: 'create' | 'edit';
  record?: MailTemplate;
  onSaved?: () => void;
};

const MailTemplateListPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const formRef = useRef<DrawerContainerRef<FormDrawerParams>>(null);

  const {
    data: rows = [],
    loading,
    refresh,
  } = useRequest(
    async () => {
      const templates = getTemplateListByPost({
        keyword: keyword.trim() || undefined,
      });
      // WHY 同步服务包 async：ahooks 契约要 Promise；service 门面保持真实后端同步形状
      return templates.map((template) => ({
        ...template,
        reportCount: getReportListByPost(template.id).length,
      }));
    },
    {
      refreshDeps: [keyword],
    },
  );

  const { run: handleDelete } = useRequest(
    async (id: string) => {
      deleteTemplateByPost(id);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功');
        refresh();
      },
    },
  );

  const confirmDelete = (record: TemplateListRow) => {
    Modal.confirm({
      title: '确认删除模板',
      content: `将删除模板「${record.name}」，并连同其文件夹下全部 ${record.reportCount} 个报表，且不可恢复。确认删除？`,
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => handleDelete(record.id),
    });
  };

  const openCreate = () =>
    formRef.current?.open({ mode: 'create', onSaved: refresh });
  const openEdit = (record: TemplateListRow) =>
    formRef.current?.open({ mode: 'edit', record, onSaved: refresh });
  const enterWorkspace = (record: TemplateListRow) => {
    // 工作台页与其路由注册在 Task 4/7（路由改动为需确认操作），本 Task 只埋跳转
    navigate(`/mail/template/${record.id}`);
  };

  const columns: SColumnsType<TemplateListRow> = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: '模板名称（主题）',
      dataIndex: 'name',
      width: 240,
      ellipsis: true,
    },
    {
      title: '收件人',
      dataIndex: 'recipients',
      width: 260,
      ellipsis: true,
      render: (_text, record) => record.recipients.join(','),
    },
    {
      title: '抄送',
      dataIndex: 'cc',
      width: 200,
      ellipsis: true,
      render: (_text, record) =>
        record.cc.length > 0 ? record.cc.join(',') : '-',
    },
    { title: '报表数', dataIndex: 'reportCount', width: 80 },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (_text, record) =>
        dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 240,
      render: (_text, record) => (
        <Space>
          <SButton actionType="edit" compact onClick={() => openEdit(record)} />
          <SButton compact onClick={() => enterWorkspace(record)}>
            进入工作台
          </SButton>
          <SButton
            actionType="delete"
            compact
            onClick={() => confirmDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <STitle
        type="page"
        desc="模板 CRUD · 名称即邮件主题 · 收件人/抄送为通讯录多选（userInfo）· 保存时正文须恰好包含 1 个占位符（Demo 数据存于浏览器 localStorage）"
        actionNode={<SButton actionType="create" onClick={openCreate} />}
      >
        邮件模板
      </STitle>
      <div className={styles.toolbar}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="按模板名称搜索"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 280 }}
        />
      </div>
      <STable
        columns={columns}
        dataSource={rows}
        rowKey="id"
        pagination={false}
      />
      <TemplateFormModal ref={formRef} />
    </Spin>
  );
};

export default MailTemplateListPage;
