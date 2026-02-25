import { lazy } from 'react';

import { lazyLoad } from '../utils';

const Login = lazy(() => import('@/pages/login'));

export const authRoutes = [
  {
    path: '/login',
    element: lazyLoad(Login),
  },
];

export default authRoutes;
