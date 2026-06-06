import type { User } from '@/stores/user';
import {
  BugOutlined,
  CodeOutlined,
  LockOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Form, Input, message } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from 'src/stores';

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

const loginApi = (data: { username: string; password: string }) => {
  return new Promise<{ user: User; token: string; permissions: string[] }>(
    (resolve, reject) => {
      setTimeout(() => {
        try {
          const rawUsers = localStorage.getItem('rbac-users');
          const rawRoles = localStorage.getItem('rbac-roles');
          if (!rawUsers || !rawRoles) {
            reject(new Error('系统未初始化，请联系管理员'));
            return;
          }

          const users = JSON.parse(rawUsers) as {
            id: string;
            username: string;
            password: string;
            nickname: string;
            avatar: string;
            status: number;
            roleIds: string[];
            email: string;
            createTime: string;
          }[];

          const roles = JSON.parse(rawRoles) as {
            id: string;
            permissionIds: string[];
          }[];

          const found = users.find(
            (u) => u.username === data.username && u.password === data.password,
          );

          if (!found) {
            reject(new Error('用户名或密码错误'));
            return;
          }

          if (found.status !== 1) {
            reject(new Error('账户已被停用'));
            return;
          }

          const userRoles = roles.filter((r) => found.roleIds.includes(r.id));

          // 将 permissionIds 解析为 code
          const rawPerms = localStorage.getItem('rbac-permissions');
          let permMap: Record<string, string> = {};
          if (rawPerms) {
            const perms = JSON.parse(rawPerms) as {
              id: string;
              code: string;
            }[];
            permMap = Object.fromEntries(perms.map((p) => [p.id, p.code]));
          }

          const permissions = Array.from(
            new Set(
              userRoles.flatMap((r) =>
                r.permissionIds.map((pid) => permMap[pid] || pid),
              ),
            ),
          );

          resolve({
            user: {
              id: found.id,
              username: found.username,
              nickname: found.nickname,
              email: found.email || '',
              avatar: found.avatar || '',
              status: String(found.status),
              createTime: found.createTime,
            },
            token: `token-${found.id}-${Date.now()}`,
            permissions,
          });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('登录失败'));
        }
      }, 500);
    },
  );
};

const featureHighlights = [
  {
    icon: <SafetyOutlined />,
    title: 'L1-L4 防御层级',
    desc: '四层递进式质量防线',
  },
  {
    icon: <BugOutlined />,
    title: 'P0-P15 错题规则',
    desc: '沉淀常见错误自动拦截',
  },
  {
    icon: <CodeOutlined />,
    title: '6 阶段开发流',
    desc: 'PRD → 生成 → 验证 → 审查',
  },
  {
    icon: <ThunderboltOutlined />,
    title: '强模型驱动',
    desc: 'Claude 原生代码生成管线',
  },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);

  const { loading, run: handleLogin } = useRequest(loginApi, {
    manual: true,
    onSuccess: (data) => {
      message.success('登录成功');
      login(data.user, data.token);
      useUserStore.getState().setPermissions(data.permissions);
      navigate('/');
    },
  });

  const onFinish = (values: LoginForm) => {
    handleLogin({ username: values.username, password: values.password });
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(-1deg); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .login-card {
          animation: slide-up 0.7s ease-out both;
        }
        .login-title {
          animation: slide-up 0.7s 0.1s ease-out both;
        }
        .login-form {
          animation: slide-up 0.7s 0.2s ease-out both;
        }
        .feature-item {
          animation: fade-in 0.5s ease-out both;
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(150deg, #f0f4ff 0%, #f8fafc 40%, #f1f5f9 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily:
            "'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Background decorative shapes */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
            top: -120,
            right: -80,
            animation: 'float 18s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
            bottom: -100,
            left: -60,
            animation: 'float2 22s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)',
            top: '50%',
            left: '55%',
            animation: 'pulse-soft 6s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Subtle grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            pointerEvents: 'none',
          }}
        />

        {/* Main card */}
        <div
          className="login-card"
          style={{
            position: 'relative',
            display: 'flex',
            width: 920,
            minHeight: 540,
            borderRadius: 20,
            overflow: 'hidden',
            background: '#ffffff',
            boxShadow:
              '0 4px 6px rgba(0,0,0,0.03), 0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          }}
        >
          {/* Left brand panel */}
          <div
            style={{
              flex: '0 0 400px',
              background:
                'linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #e0f2fe 100%)',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              borderRight: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            {/* Decorative elements */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '2px solid rgba(6,182,212,0.12)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 70,
                right: 10,
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'rgba(6,182,212,0.08)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 150,
                left: 30,
                width: 50,
                height: 3,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #06b6d4, #6366f1)',
                pointerEvents: 'none',
              }}
            />

            {/* Top: Logo + Brand */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background:
                      'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(6,182,212,0.25)',
                    flexShrink: 0,
                  }}
                >
                  <ThunderboltOutlined style={{ fontSize: 20 }} />
                </div>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#1e293b',
                    letterSpacing: '-0.02em',
                  }}
                >
                  AI Frontend
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: 'rgba(71,85,105,0.7)',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                AI 驱动的现代化前端开发体系
                <br />
                规范驱动 · 错题沉淀 · 持续进化
              </p>
            </div>

            {/* Middle: Feature highlights with icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {featureHighlights.map((item, i) => (
                <div
                  key={item.title}
                  className="feature-item"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    animationDelay: `${0.3 + i * 0.12}s`,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background:
                        i === 0
                          ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
                          : i === 1
                            ? 'linear-gradient(135deg, #fce7f3, #fbcfe8)'
                            : i === 2
                              ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                              : 'linear-gradient(135deg, #fef3c7, #fde68a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      color:
                        i === 0
                          ? '#2563eb'
                          : i === 1
                            ? '#db2777'
                            : i === 2
                              ? '#059669'
                              : '#d97706',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#334155',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(100,116,139,0.7)',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom: version */}
            <div
              style={{
                fontSize: 11,
                color: 'rgba(100,116,139,0.4)',
              }}
            >
              AI Frontend v1.0
            </div>
          </div>

          {/* Right form panel */}
          <div
            style={{
              flex: 1,
              padding: '48px 48px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: '#ffffff',
            }}
          >
            <div className="login-title" style={{ marginBottom: 36 }}>
              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                欢迎回来
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: 'rgba(100,116,139,0.7)',
                  marginTop: 8,
                  marginBottom: 0,
                }}
              >
                登录您的账户以继续
              </p>
            </div>

            <div className="login-form">
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
                    prefix={
                      <UserOutlined
                        style={{ color: 'rgba(148,163,184,0.5)' }}
                      />
                    }
                    placeholder="用户名"
                    autoComplete="username"
                    style={{
                      height: 48,
                      borderRadius: 10,
                      background: '#f8fafc',
                      border: '1px solid rgba(0,0,0,0.08)',
                      color: '#1e293b',
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    prefix={
                      <LockOutlined
                        style={{ color: 'rgba(148,163,184,0.5)' }}
                      />
                    }
                    placeholder="密码"
                    autoComplete="current-password"
                    style={{
                      height: 48,
                      borderRadius: 10,
                      background: '#f8fafc',
                      border: '1px solid rgba(0,0,0,0.08)',
                      color: '#1e293b',
                    }}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 24 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: 48,
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 600,
                      background:
                        'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(6,182,212,0.2)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    登 录
                  </Button>
                </Form.Item>
              </Form>

              <div
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  color: 'rgba(148,163,184,0.6)',
                }}
              >
                测试账号：admin / admin123
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
