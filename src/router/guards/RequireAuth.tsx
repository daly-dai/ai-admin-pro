import { Button, Result } from 'antd';
import React from 'react';
import { Navigate, type To, useNavigate } from 'react-router-dom';

import { useUserStore } from '@/stores';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: To;
  requiredPermission?: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  redirectTo = '/login',
  requiredPermission,
}) => {
  const token = useUserStore((state) => state.token);
  const hasPermission = useUserStore((state) => state.hasPermission);
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
