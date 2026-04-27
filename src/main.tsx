import { SConfigProvider } from '@dalydb/sdesign';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import 'dayjs/locale/zh-cn';

import { router } from '@/router';
import { useDictStore } from '@/stores';

import '@/styles/global.css';

/**
 * 文件上传地址配置
 * 可通过环境变量 VITE_UPLOAD_URL 配置不同环境的上传地址
 */
// const uploadUrl = import.meta.env.VITE_UPLOAD_URL || '/api/upload';

// 设置dayjs语言
dayjs.locale('zh-cn');

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dictMapData = useDictStore((s) => s.dictMapData);
  return <SConfigProvider globalDict={dictMapData}>{children}</SConfigProvider>;
};

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
