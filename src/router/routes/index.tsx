import { Navigate } from 'react-router-dom';

import { MainLayout } from 'src/layouts';
import { RequireAuth } from '../guards';
import { lazyPage } from '../utils/lazyPage';
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
      {
        path: 'home',
        element: lazyPage(() => import('src/pages/home')),
      },
      {
        path: 'system/user',
        element: lazyPage(() => import('src/pages/system/user')),
      },
      {
        path: 'system/role',
        element: lazyPage(() => import('src/pages/system/role')),
      },
      {
        path: 'system/permission',
        element: lazyPage(() => import('src/pages/system/permission')),
      },
      {
        path: 'system/dict',
        element: lazyPage(() => import('src/pages/system/dict')),
      },
      {
        path: 'tree/archive',
        element: lazyPage(() => import('src/pages/tree/archive')),
      },
      {
        path: 'mail/template',
        element: lazyPage(() => import('src/features/mail-template')),
      },
      {
        path: 'mail/template/:id',
        element: lazyPage(() => import('src/features/mail-template/workspace')),
      },
    ],
  },
  ...errorRoutes,
];

export default routes;
