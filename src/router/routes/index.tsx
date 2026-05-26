import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';

import { MainLayout } from '@/layouts';
import DashboardPage from '@/pages/dashboard';
import { RequireAuth } from '../guards';
import authRoutes from './auth';
import errorRoutes from './error';

const HomePage = lazy(() => import('@/pages/home'));
const UserPage = lazy(() => import('@/pages/user'));
const RolePage = lazy(() => import('@/pages/role'));
const RoleFormPage = lazy(() => import('@/pages/role/form'));

const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

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
        element: (
          <LazyLoad>
            <HomePage />
          </LazyLoad>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <LazyLoad>
            <DashboardPage />
          </LazyLoad>
        ),
      },
      {
        path: 'system/user',
        element: (
          <LazyLoad>
            <UserPage />
          </LazyLoad>
        ),
      },
      {
        path: 'system/role',
        element: (
          <LazyLoad>
            <RolePage />
          </LazyLoad>
        ),
      },
      {
        path: 'system/role/form',
        element: (
          <LazyLoad>
            <RoleFormPage />
          </LazyLoad>
        ),
      },
    ],
  },
  ...errorRoutes,
];

export default routes;
