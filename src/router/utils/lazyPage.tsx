import { Spin } from 'antd';
import { lazy, Suspense, type ComponentType } from 'react';

/**
 * 一行搞定路由懒加载：lazy() + Suspense 合二为一。
 *
 * @example
 * { path: 'home', element: lazyPage(() => import('@/pages/home')) }
 */
export function lazyPage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importFn: () => Promise<{ default: ComponentType<any> }>,
) {
  const Page = lazy(importFn);
  return (
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
      <Page />
    </Suspense>
  );
}
