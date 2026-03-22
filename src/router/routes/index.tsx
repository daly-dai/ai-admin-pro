import { Navigate } from 'react-router-dom';

import { MainLayout } from '@/layouts';
import { RequireAuth } from '../guards';
import authRoutes from './auth';
import errorRoutes from './error';

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
        element: <Navigate to="/home" replace />,
      },
    ],
  },
  ...errorRoutes,
];

export default routes;
