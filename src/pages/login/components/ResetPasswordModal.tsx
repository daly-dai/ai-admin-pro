import { useRequest } from 'ahooks';
import { Form, Input, message, Modal } from 'antd';
import { initPasswordByPost } from 'src/api/user';

interface Props {
  open: boolean;
  userId: number;
  onSuccess: () => void;
}

const ResetPasswordModal = ({ open, userId, onSuccess }: Props) => {
  const [form] = Form.useForm();

  const { run, loading } = useRequest(initPasswordByPost, {
    manual: true,
    onSuccess: () => {
      message.success('密码已修改，请使用新密码重新登录');
      form.resetFields();
      onSuccess();
    },
  });

  return (
    <Modal
      open={open}
      title="首次登录 — 修改密码"
      closable={false}
      maskClosable={false}
      keyboard={false}
      onOk={() => form.submit()}
      confirmLoading={loading}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <p style={{ marginBottom: 16, color: '#666' }}>
        首次登录需修改密码，请输入手机号验证身份
      </p>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) =>
          run({
            id: userId,
            phone: values.phone,
            newPassword: values.newPassword,
          })
        }
      >
        <Form.Item
          label="手机号"
          name="phone"
          rules={[{ required: true, message: '请输入手机号' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码至少6位' },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请再次输入新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResetPasswordModal;
