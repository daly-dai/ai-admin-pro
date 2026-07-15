import { lazyPage } from '../utils/lazyPage';

export const authRoutes = [
  {
    path: '/login',
    element: lazyPage(() => import('src/pages/login')),
  },
];

export default authRoutes;
