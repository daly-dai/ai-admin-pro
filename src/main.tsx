import { SConfigProvider } from '@dalydb/sdesign';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import 'dayjs/locale/zh-cn';

import { initSeedData } from '@/plugins/storage/seed';
import { router } from '@/router';
import { useDictStore } from '@/stores';

import '@/styles/global.css';

// 设置dayjs语言
dayjs.locale('zh-cn');

// eslint-disable-next-line react-refresh/only-export-components
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dictMapData = useDictStore((s) => s.dictMapData);

  return <SConfigProvider globalDict={dictMapData}>{children}</SConfigProvider>;
};

// 初始化种子数据（幂等：首次加载写入，后续跳过）
initSeedData();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
