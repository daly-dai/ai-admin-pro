import type { ModalChildProps } from '@dalydb/sdesign';
import { createModal, SForm } from '@dalydb/sdesign';
import { useRequest } from 'ahooks';
import { Input, message, Modal, Spin } from 'antd';
import { useState } from 'react';

import {
  createUserByPost,
  getUserByIdByGet,
  updateUserByPost,
} from 'src/api/user';
import type { User, UserFormData } from 'src/api/user/types';

type Params = { mode: 'create' | 'edit'; id?: number };

const UserFormContent = ({
  params,
  onClose,
  onSuccess,
}: ModalChildProps<Params>) => {
  const [form] = SForm.useForm();
  const isEdit = params.mode === 'edit';
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [initialPassword, setInitialPassword] = useState('');

  const { loading: detailLoading } = useRequest(
    () => getUserByIdByGet(params.id!),
    {
      ready: isEdit && !!params.id,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  const { run, loading } = useRequest(
    (values: UserFormData) => {
      if (isEdit) {
        const updateData = { ...values, id: params.id! } as Partial<User> & {
          id: number;
        };
        return updateUserByPost(updateData);
      }
      return createUserByPost(values);
    },
    {
      manual: true,
      onSuccess: (data) => {
        if (!isEdit && typeof data === 'string') {
          setInitialPassword(data);
          setPwdModalOpen(true);
        } else {
          message.success(isEdit ? '更新成功' : '创建成功');
          onSuccess?.();
        }
      },
    },
  );

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(initialPassword);
      message.success('已复制到剪贴板');
    } catch {
      // fallback for non-HTTPS
      const input = document.createElement('input');
      input.value = initialPassword;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      message.success('已复制到剪贴板');
    }
  };

  const formItems = [
    {
      label: '用户名',
      name: 'username',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入用户名' }],
    },
    {
      label: '真实姓名',
      name: 'realName',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入真实姓名' }],
    },
    {
      label: '手机号',
      name: 'phone',
      type: 'input' as const,
      rules: [{ required: true, message: '请输入手机号' }],
    },
    {
      label: '邮箱',
      name: 'email',
      type: 'input' as const,
    },
    {
      label: '状态',
      name: 'status',
      type: 'select' as const,
      fieldProps: { dictKey: 'user_status' },
    },
  ];

  return (
    <>
      <Modal
        open
        title={isEdit ? '编辑用户' : '新增用户'}
        onCancel={onClose}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Spin spinning={detailLoading}>
          <SForm
            form={form}
            items={formItems}
            columns={1}
            onFinish={(values) => run(values)}
          />
        </Spin>
      </Modal>

      <Modal
        open={pwdModalOpen}
        title="用户创建成功"
        closable={false}
        maskClosable={false}
        onOk={() => {
          setPwdModalOpen(false);
          onSuccess?.();
        }}
        okText="已妥善保管"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ marginBottom: 8, color: '#e67e22', fontWeight: 600 }}>
            ⚠️ 初始密码仅在本次展示，关闭后无法再次查看
          </p>
          <p style={{ marginBottom: 12, color: '#666' }}>
            请将以下密码告知用户，首次登录时需修改密码
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f6f8fa',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <Input.Password
              value={initialPassword}
              readOnly
              style={{
                fontSize: 18,
                fontFamily: 'monospace',
                fontWeight: 600,
                letterSpacing: 2,
                border: 'none',
                background: 'transparent',
                boxShadow: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleCopyPassword}
              style={{
                padding: '4px 16px',
                borderRadius: 6,
                border: '1px solid #1677ff',
                background: '#fff',
                color: '#1677ff',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}
            >
              复制
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default createModal<Params>(UserFormContent);
