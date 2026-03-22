import React from 'react';
import { SConfigProvider } from '@dalydb/sdesign';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import 'dayjs/locale/zh-cn';

import { router } from '@/router';

import '@/styles/global.css';

/**
 * 全局字典配置
 * 后续业务字典在此扩展，例如：
 * - status: 通用状态字典
 * - userType: 用户类型字典
 * - 其他业务字典...
 */
const globalDict: Record<string, Record<string, string>> = {
  // 示例：通用状态字典
  // status: { 1: '启用', 0: '禁用' },
};

/**
 * 文件上传地址配置
 * 可通过环境变量 VITE_UPLOAD_URL 配置不同环境的上传地址
 */
const uploadUrl = import.meta.env.VITE_UPLOAD_URL || '/api/upload';

// 设置dayjs语言
dayjs.locale('zh-cn');

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
      <SConfigProvider globalDict={globalDict} uploadUrl={uploadUrl}>
        <RouterProvider router={router} />
      </SConfigProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
