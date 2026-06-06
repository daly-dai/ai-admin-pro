import { lazyPage } from '../utils/lazyPage';

export const errorRoutes = [
  {
    path: '*',
    element: lazyPage(() => import('@/pages/error/404')),
  },
  // 可以在这里添加更多错误页面路由
];

export default errorRoutes;
