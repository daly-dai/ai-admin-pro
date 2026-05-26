// ============================================================================
// DashboardPage — 债券数据监控仪表盘
//
// 筛选参数由 filterSource.useFilterParams() 提供，
// 大屏项目替换 filterSource.ts 接入全局 filterParams 即可。
// ============================================================================

import { Flex } from 'antd';
import React from 'react';

import KpiBar from './components/KpiBar';
import ModuleCard from './components/ModuleCard';
import { MODULE_LIST } from './constants';
import { useDashboardStore } from './store';

import styles from './index.module.css';

const DashboardPage: React.FC = () => {
  const pageSize = useDashboardStore((s) => s.pageSize);

  return (
    <div className={styles.dashboard}>
      <Flex
        align="center"
        justify="space-between"
        className={styles.pageHeader}
      >
        <span className={styles.breadcrumb}>FIXED INCOME MONITORING</span>
        <span className={styles.pageSizeTag}>页大小: {pageSize}天</span>
      </Flex>

      <KpiBar />

      <div className={styles.grid}>
        {MODULE_LIST.map((mod, index) => (
          <ModuleCard
            key={mod.key}
            moduleType={mod.key}
            animationDelay={0.1 + index * 0.08}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
