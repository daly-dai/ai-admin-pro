import { FullscreenOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { Modal, Tag } from 'antd';
import React, { useState } from 'react';
import Mermaid from 'src/components/common/Mermaid';
import { useUserStore } from 'src/stores';
import { getGreeting, sections, stats } from './data';
import styles from './index.module.css';

const HomePage: React.FC = () => {
  const userInfo = useUserStore((state) => state.userInfo);
  const [expanded, setExpanded] = useState<{
    code: string;
    label: string;
  } | null>(null);

  return (
    <div className={styles.wrapper}>
      {/* ---- Page header ---- */}
      <div className={styles.pageHeader} style={{ animationDelay: '0s' }}>
        <div>
          <h1 className={styles.greeting}>
            {getGreeting()}
            {userInfo?.nickname ? `，${userInfo.nickname}` : ''}
          </h1>
          <p className={styles.greetingSub}>AI 工程化管线 — 架构蓝图</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tag
            icon={<NodeIndexOutlined />}
            color="blue"
            style={{ borderRadius: 6, fontSize: 12, margin: 0 }}
          >
            强/弱模型双路径
          </Tag>
        </div>
      </div>

      {/* ---- Stat gauge strip ---- */}
      <div className={styles.statStrip} style={{ animationDelay: '0.08s' }}>
        {stats.map((stat, index) => (
          <div key={stat.label} className={styles.statItem}>
            <div
              className={styles.statBadge}
              style={{ background: stat.bg, color: stat.color }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>
            <div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statSub}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Architecture diagram sections ---- */}
      {sections.map((section, idx) => (
        <div
          key={section.id}
          className={styles.section}
          style={{ animationDelay: `${0.14 + idx * 0.07}s` }}
        >
          <div className={styles.sectionInner}>
            {/* accent bar */}
            <div
              className={styles.accentBar}
              style={{
                background: section.accentColor,
                animationDelay: `${0.8 + idx * 0.12}s`,
              }}
            />

            {/* head */}
            <div className={styles.sectionHead}>
              <div
                className={styles.iconBox}
                style={{
                  background: section.accentBg,
                  color: section.accentColor,
                }}
              >
                {section.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className={styles.sectionTitle}>{section.label}</div>
                <div className={styles.sectionSubtitle}>{section.sub}</div>
              </div>
              <button
                className={styles.expandBtn}
                title="放大查看"
                onClick={() =>
                  setExpanded({
                    code: section.diagram,
                    label: section.label,
                  })
                }
              >
                <FullscreenOutlined />
              </button>
              <span
                className={styles.sectionNumber}
                style={{ color: section.accentColor }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
            </div>

            {/* body */}
            <div className={styles.sectionBody}>
              <Mermaid
                code={section.diagram}
                fontSize={section.fontSize}
                style={{ minHeight: section.minHeight }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* ---- Expand modal ---- */}
      <Modal
        open={!!expanded}
        onCancel={() => setExpanded(null)}
        footer={null}
        width="92vw"
        title={
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {expanded?.label}
          </span>
        }
        styles={{
          body: { padding: '16px 8px', overflow: 'auto', maxHeight: '80vh' },
        }}
        centered
      >
        {expanded && (
          <Mermaid code={expanded.code} style={{ minHeight: 350 }} />
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
