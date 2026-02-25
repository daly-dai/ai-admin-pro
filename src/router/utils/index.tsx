import React, { Suspense } from 'react';
import { Spin } from 'antd';

export const lazyLoad = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense
    fallback={
      <Spin
        size="large"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      />
    }
  >
    <Component />
  </Suspense>
);

export default lazyLoad;
