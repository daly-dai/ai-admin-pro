import { lazy } from 'react';

import { lazyLoad } from '../utils';

const DictTypePage = lazy(() => import('@/pages/dict/type'));
const DictItemPage = lazy(() => import('@/pages/dict/item'));

export const dictRoutes = [
  {
    path: '/dict',
    handle: { meta: { title: '字典管理', icon: 'BookOutlined' } },
    children: [
      {
        path: 'type',
        element: lazyLoad(DictTypePage),
        handle: { meta: { title: '字典类型', icon: 'ProfileOutlined' } },
      },
      {
        path: 'item',
        element: lazyLoad(DictItemPage),
        handle: { meta: { title: '字典项', icon: 'UnorderedListOutlined' } },
      },
    ],
  },
];

export default dictRoutes;
