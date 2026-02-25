import React from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Card, Checkbox, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from 'src/stores';

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

// Mock登录API
const loginApi = (data: { username: string; password: string }) => {
  return new Promise<{ user: any; token: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          id: '1',
          username: data.username,
          nickname: '管理员',
          email: 'admin@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        },
        token: 'mock-token-12345',
      });
    }, 500);
  });
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);

  const { loading, run: handleLogin } = useRequest(loginApi, {
    manual: true,
    onSuccess: (data) => {
      message.success('登录成功');
      login(data.user, data.token);
      navigate('/');
    },
  });

  const onFinish = (values: LoginForm) => {
    handleLogin({
      username: values.username,
      password: values.password,
    });
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card style={{ width: 400, borderRadius: 8 }} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, color: '#1677ff', marginBottom: 8 }}>
            AI Frontend
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            AI驱动的现代化前端开发体系
          </p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a href="#">忘记密码</a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16, color: '#666' }}>
          <p>
            还没有账号？ <a href="#">立即注册</a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
