// ============================================================================
// ModuleCard — 单个模块卡片
// ============================================================================

import { SButton } from '@dalydb/sdesign';
import { Flex, Modal, Spin } from 'antd';
import { ChevronLeft, Maximize2 } from 'lucide-react';
import React, { useState } from 'react';

import {
  CARD_CHART_HEIGHT,
  MODAL_CHART_HEIGHT,
  MODULE_LABEL_MAP,
} from '../constants';
import { useChartData } from '../hooks/useChartData';
import styles from '../index.module.css';
import { useDashboardStore } from '../store';
import DualLineChart from './DualLineChart';
import ModuleIcon from './ModuleIcon';

import type { ModuleType } from '../types';

interface ModuleCardProps {
  moduleType: ModuleType;
  animationDelay?: number;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  moduleType,
  animationDelay = 0,
}) => {
  const label = MODULE_LABEL_MAP[moduleType];

  const { loadPrevious, hasMore, loading } = useChartData(moduleType);
  const moduleState = useDashboardStore((s) => s.modules[moduleType]);
  const yieldData = useDashboardStore((s) => s.yieldData);

  const [modalOpen, setModalOpen] = useState(false);

  const commonChartData = {
    scaleData: moduleState.scaleData,
    yieldData,
  };

  return (
    <div
      className={styles.card}
      style={{ animation: `fadeUp 0.5s ease-out ${animationDelay}s both` }}
    >
      <Flex align="center" gap={10} className={styles.cardHeader}>
        <div className={styles.cardIconBox}>
          <ModuleIcon moduleType={moduleType} size={15} />
        </div>

        <span className={styles.cardTitle}>{label}</span>

        <Flex flex={1} align="center" justify="flex-end" gap={8}>
          <SButton
            size="small"
            icon={<ChevronLeft size={14} />}
            disabled={!hasMore || loading}
            onClick={loadPrevious}
          >
            更早数据
          </SButton>

          <button
            className={styles.cardExpandBtn}
            onClick={() => setModalOpen(true)}
            title="放大查看"
          >
            <Maximize2 size={13} />
          </button>
        </Flex>
      </Flex>

      <Spin spinning={loading}>
        <DualLineChart
          {...commonChartData}
          height={CARD_CHART_HEIGHT}
          compact
        />
      </Spin>

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width="90vw"
        footer={null}
        centered
        destroyOnClose={false}
        title={
          <Flex align="center" gap={8} className={styles.modalHeader}>
            <div className={styles.cardIconBox}>
              <ModuleIcon moduleType={moduleType} size={15} />
            </div>
            <span className={styles.modalTitle}>{label}</span>
            <SButton
              size="small"
              icon={<ChevronLeft size={14} />}
              disabled={!hasMore || loading}
              onClick={loadPrevious}
            >
              更早数据
            </SButton>
          </Flex>
        }
        styles={{ body: { padding: '12px 16px 8px' } }}
      >
        <DualLineChart {...commonChartData} height={MODAL_CHART_HEIGHT} />
      </Modal>
    </div>
  );
};

export default ModuleCard;
