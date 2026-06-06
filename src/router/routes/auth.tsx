import { lazyPage } from '../utils/lazyPage';

export const authRoutes = [
  {
    path: '/login',
    element: lazyPage(() => import('@/pages/login')),
  },
];

export default authRoutes;
