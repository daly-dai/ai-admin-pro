import { lazy } from 'react';

import { lazyLoad } from '../utils';

const NotFound = lazy(() => import('@/pages/error/404'));

export const errorRoutes = [
  {
    path: '*',
    element: lazyLoad(NotFound),
  },
  // 可以在这里添加更多错误页面路由
];

export default errorRoutes;
