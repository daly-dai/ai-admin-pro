import { createBrowserRouter } from 'react-router-dom';

import { routes } from './routes/index'; // 显式指定文件扩展名

// 路由配置
export const router = createBrowserRouter(routes);

export default router;
