import { Empty, Result, Spin } from 'antd';
import type {
  EChartsInitOpts,
  ECharts as EChartsInstance,
  EChartsOption,
} from 'echarts';
import React from 'react';

import { SButton, SErrorBoundary } from '@dalydb/sdesign';
import { useECharts } from 'src/hooks/useECharts';

import styles from './index.module.css';

/**
 * ECharts 事件处理器类型
 * ECharts 内部使用 Function 类型，此处用宽松签名兼容各事件类型
 */
type ChartEventHandler = (...args: unknown[]) => void;

/** showLoading 配置 */
interface LoadingConfig {
  text?: string;
  color?: string;
  textColor?: string;
  maskColor?: string;
  zlevel?: number;
  fontSize?: number;
  showSpinner?: boolean;
  spinnerRadius?: number;
  lineWidth?: number;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontFamily?: string;
}

/**
 * ECharts 基座组件 Props
 *
 * 封装了图表生命周期管理、loading / empty / error 状态展示、
 * 容器尺寸自适应、事件绑定等通用能力。
 */
interface EChartsProps {
  // ============ 核心配置 ============
  /** ECharts 配置项 */
  option: EChartsOption | null | undefined;
  /** ECharts 主题名称或自定义主题对象 */
  theme?: string | object;
  /** ECharts 初始化参数 */
  initOpts?: EChartsInitOpts;
  /** 是否合并配置项，默认 true（不合并，每次全量替换） */
  notMerge?: boolean;
  /** 是否延迟更新 */
  lazyUpdate?: boolean;
  /** 渲染器类型，默认 'canvas' */
  renderer?: 'canvas' | 'svg';

  // ============ 自适应 ============
  /** 是否自动监听容器尺寸变化并 resize，默认 true */
  autoResize?: boolean;
  /** resize 防抖延迟（毫秒），默认 0（使用 rAF 节流） */
  resizeDebounce?: number;

  // ============ 状态 ============
  /** 是否处于加载状态 */
  loading?: boolean;
  /** 加载状态配置（透传给 echartsInstance.showLoading） */
  loadingConfig?: LoadingConfig;
  /** 错误对象（有值时展示错误状态） */
  error?: Error | string | null;
  /** 是否为空数据状态 */
  empty?: boolean;

  // ============ 文案定制 ============
  /** 加载中提示文案，默认空（使用 ECharts 默认加载动画） */
  loadingText?: string;
  /** 错误标题，默认 "图表渲染出错" */
  errorTitle?: string;
  /** 空数据提示文案，默认 "暂无数据" */
  emptyText?: string;

  // ============ 回调 & 事件 ============
  /** 图表实例初始化完成回调 */
  onChartReady?: (instance: EChartsInstance) => void;
  /** 错误回调（setOption 失败、初始化失败等） */
  onError?: (error: Error) => void;
  /** 重试回调（错误状态下点击重试按钮） */
  onRetry?: () => void;
  /** ECharts 事件监听（click, legendselectchanged, ...） */
  events?: Record<string, ChartEventHandler>;

  // ============ 样式 ============
  /** 容器样式 */
  style?: React.CSSProperties;
  /** 容器类名 */
  className?: string;
  /** 容器高度（默认 100%） */
  height?: number | string;
}

/**
 * ECharts 基座组件
 *
 * 提供开箱即用的图表渲染能力：
 * - echarts 库按需动态加载，不占首屏 bundle
 * - 自动管理 ECharts 实例生命周期（初始化 / 更新 / 销毁）
 * - 容器尺寸自适应（ResizeObserver + rAF 节流）
 * - loading / empty / error 三态覆盖
 * - 事件绑定 / 解绑
 * - SErrorBoundary 组件级崩溃隔离
 *
 * @example
 * ```tsx
 * import EChartsBase from '@/components/common/EChartsBase';
 *
 * function MyChart() {
 *   const [loading, setLoading] = useState(false);
 *   const option = useMemo(() => ({ ... }), []);
 *
 *   return (
 *     <EChartsBase
 *       option={option}
 *       loading={loading}
 *       height={400}
 *       events={{
 *         click: (params) => console.log('clicked', params),
 *       }}
 *     />
 *   );
 * }
 * ```
 */
const EChartsBase = React.memo<EChartsProps>((props) => {
  const {
    option,
    theme,
    initOpts,
    notMerge = true,
    lazyUpdate = false,
    renderer = 'canvas',
    autoResize = true,
    resizeDebounce = 0,
    loading = false,
    loadingConfig,
    error,
    empty = false,
    loadingText,
    errorTitle = '图表渲染出错',
    emptyText = '暂无数据',
    onChartReady,
    onError,
    onRetry,
    events,
    style,
    className,
    height,
  } = props;

  // ---- 合并 loading 配置（hook 内部通过 ref 读取，无需 memo） ----
  const mergedLoadingConfig: LoadingConfig = {
    ...loadingConfig,
    text: loadingText ?? loadingConfig?.text ?? '',
  };

  // ---- 使用 Hook 管理实例 ----
  const { containerRef } = useECharts({
    option,
    theme,
    initOpts,
    notMerge,
    lazyUpdate,
    autoResize,
    resizeDebounce,
    renderer,
    loading,
    loadingConfig: mergedLoadingConfig,
    events,
    onChartReady,
    onError,
  });

  // ---- 容器样式 ----
  const wrapperStyle: React.CSSProperties = {
    ...style,
    height: height ?? style?.height ?? '100%',
    width: style?.width ?? '100%',
  };

  // ---- 错误状态（外部传入） ----
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return (
      <div
        className={`${styles.wrapper} ${className ?? ''}`}
        style={wrapperStyle}
      >
        <div className={styles.stateOverlay}>
          <Result
            status="error"
            title={errorTitle}
            subTitle={errorMessage}
            extra={
              onRetry ? (
                <SButton type="primary" onClick={onRetry}>
                  重试
                </SButton>
              ) : undefined
            }
          />
        </div>
      </div>
    );
  }

  const showEmpty = empty && !loading;

  // ---- 正常渲染（SErrorBoundary 防止组件级崩溃扩散到页面） ----
  return (
    <div
      className={`${styles.wrapper} ${className ?? ''}`}
      style={wrapperStyle}
    >
      <SErrorBoundary
        fallbackRender={({ error: boundaryError, resetErrorBoundary }) => (
          <div className={styles.stateOverlay}>
            <Result
              status="error"
              title={errorTitle}
              subTitle={boundaryError?.message ?? '未知错误'}
              extra={
                <SButton
                  type="primary"
                  onClick={() => {
                    resetErrorBoundary();
                    onRetry?.();
                  }}
                >
                  重试
                </SButton>
              }
            />
          </div>
        )}
      >
        {/* 图表容器 — 始终渲染以保持实例存活 */}
        <div ref={containerRef} className={styles.chart} />

        {/* 加载遮罩 */}
        {loading && loadingText != null && loadingText !== '' && (
          <div
            className={`${styles.stateOverlay} ${styles['stateOverlay--dimmed']}`}
          >
            <Spin tip={loadingText} />
          </div>
        )}

        {/* 空数据遮罩 */}
        {showEmpty && (
          <div
            className={`${styles.stateOverlay} ${styles['stateOverlay--dimmed']}`}
          >
            <div className={styles.emptyContent}>
              <Empty description={emptyText} />
            </div>
          </div>
        )}
      </SErrorBoundary>
    </div>
  );
});

export default EChartsBase;
