import { Navigate } from 'react-router-dom';

import { RequireAuth } from '../guards';
import authRoutes from './auth';
import dashboardRoutes from './dashboard';
import errorRoutes from './error';
import { MainLayout } from '@/layouts';

export const routes = [
  ...authRoutes,
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      ...dashboardRoutes,
      // 可以在这里添加更多子路由模块
    ],
  },
  ...errorRoutes,
];

export default routes;
