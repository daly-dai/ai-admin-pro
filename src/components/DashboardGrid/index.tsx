import type { CSSProperties, ReactNode } from 'react';

/**
 * 大屏网格布局组件。
 *
 * 核心价值：用 CSS Grid 替代 antd Row/Col，从机制上保证跨行列边界对齐。
 * 同一屏内所有 Row 共享同一套 column 定义，不存在"每行独立选 lg 值"的问题。
 *
 * 使用：
 * ```tsx
 * // 两列 9:15 布局 — 所有行自动对齐
 * <DashboardGrid cols={[9, 15]} gap={16}>
 *   <Chart1 />  <Chart2 />
 *   <Chart3 />  <Chart4 />
 * </DashboardGrid>
 *
 * // 需要跨整行时，子元素设置 gridColumn: '1 / -1'
 * <DashboardGrid cols={[8, 16]} gap={16}>
 *   <div style={{ gridColumn: '1 / -1' }}>全宽标题</div>
 *   <Chart1 />  <Chart2 />
 * </DashboardGrid>
 * ```
 */
export interface DashboardGridProps {
  /** 列宽比例数组，与 antd 24 栅格系统一致。例如 [9, 15] = 9:15 两列 */
  cols: number[];
  /** 单元格间距（px），默认 16。单值同时控制行列间距 */
  gap?: number;
  /** 仅行间距，设置后会覆盖 gap 的行方向 */
  rowGap?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export default function DashboardGrid({
  cols,
  gap = 16,
  rowGap,
  className,
  style,
  children,
}: DashboardGridProps) {
  const rowGapPx = rowGap ?? gap;

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: cols
          .map((columnSpan) => `${columnSpan}fr`)
          .join(' '),
        gap: `${rowGapPx}px ${gap}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
