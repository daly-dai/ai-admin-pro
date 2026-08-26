import {
  BellOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ModalContainerRef } from '@dalydb/sdesign';
import { SErrorBoundary } from '@dalydb/sdesign';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Layout,
  Menu,
  Result,
  theme,
} from 'antd';
import React, { useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useRequest } from 'ahooks';

import { useAppStore, useUserStore } from 'src/stores';
import UserInfoModal from './components/UserInfoModal';

import { getAllDictByGet } from 'src/api/dict';
import { useDictStore } from 'src/stores';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { userInfo, logout } = useUserStore();
  const dictMapData = useDictStore((state) => state.dictMapData);
  const setDictMapFromList = useDictStore((state) => state.setDictMapFromList);
  const resetDict = useDictStore((state) => state.reset);

  const userInfoModalRef =
    useRef<ModalContainerRef<Record<string, never>>>(null);

  useRequest(getAllDictByGet, {
    debounceWait: 100,
    ready: Object.keys(dictMapData).length === 0,
    onSuccess: (list) => setDictMapFromList(list),
  });

  // 用户菜单
  const userMenuItems = [
    {
      key: 'userInfo',
      icon: <IdcardOutlined />,
      label: '用户信息',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'userInfo':
        userInfoModalRef.current?.open({});
        break;
      case 'logout':
        logout();
        resetDict();
        navigate('/login');
        break;
    }
  };

  // 侧边栏菜单
  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/system/user',
          icon: <UserOutlined />,
          label: '用户管理',
        },
        {
          key: '/system/role',
          icon: <TeamOutlined />,
          label: '角色管理',
        },
        {
          key: '/system/permission',
          icon: <SafetyOutlined />,
          label: '权限管理',
        },
        {
          key: '/system/dict',
          icon: <DatabaseOutlined />,
          label: '字典管理',
        },
      ],
    },
    {
      key: 'tree',
      icon: <EnvironmentOutlined />,
      label: '古树管理',
      children: [
        {
          key: '/tree/archive',
          icon: <EnvironmentOutlined />,
          label: '古树档案',
        },
      ],
    },
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        style={{
          background: token.colorBgContainer,
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 'bold',
            color: token.colorPrimary,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {sidebarCollapsed ? 'AI' : 'AI Frontend'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {sidebarCollapsed ? (
              <MenuUnfoldOutlined
                style={{ fontSize: 18, cursor: 'pointer' }}
                onClick={toggleSidebar}
              />
            ) : (
              <MenuFoldOutlined
                style={{ fontSize: 18, cursor: 'pointer' }}
                onClick={toggleSidebar}
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <Avatar src={userInfo?.avatar} icon={<UserOutlined />} />
                {!sidebarCollapsed && (
                  <span>
                    {userInfo?.realName || userInfo?.username || '用户'}
                  </span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: 16,
            padding: 24,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <SErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <Result
                status="error"
                title="页面渲染出错"
                subTitle={error?.message || '未知错误'}
                extra={
                  <Button type="primary" onClick={resetErrorBoundary}>
                    重试
                  </Button>
                }
              />
            )}
          >
            <Outlet />
          </SErrorBoundary>
        </Content>
      </Layout>

      <UserInfoModal ref={userInfoModalRef} />
    </Layout>
  );
};

export default MainLayout;
