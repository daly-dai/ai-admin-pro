import { lazy } from 'react';

import { lazyLoad } from '../utils';

const Dashboard = lazy(() => import('@/pages/dashboard'));

export const dashboardRoutes = [
  {
    index: true,
    element: lazyLoad(Dashboard),
    handle: { meta: { title: '首页', icon: 'HomeOutlined' } },
  },
  // 可以在这里添加更多仪表盘相关路由
];

export default dashboardRoutes;
