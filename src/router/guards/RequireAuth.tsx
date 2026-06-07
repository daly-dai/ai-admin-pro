import React from 'react';
import { Navigate, type To } from 'react-router-dom';

import { useUserStore } from '@/stores';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: To;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const token = useUserStore((state) => state.token);

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
