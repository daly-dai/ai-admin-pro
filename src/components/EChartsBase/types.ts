import type { ECharts, EChartsInitOpts, EChartsOption } from 'echarts';

/**
 * ECharts 事件处理器类型
 * ECharts 内部使用 Function 类型，此处用宽松签名兼容各事件类型
 */
export type ChartEventHandler = (...args: unknown[]) => void;

/** ECharts showLoading 配置项 */
export interface LoadingConfig {
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

/** useECharts hook 配置项 */
export interface UseEChartsOptions {
  /** ECharts 配置项，传入 null/undefined 时不渲染 */
  option: EChartsOption | null | undefined;
  /** ECharts 主题名称或自定义主题对象 */
  theme?: string | object;
  /** ECharts 初始化参数 */
  initOpts?: EChartsInitOpts;
  /** 是否不合并配置项，默认 true（完全替换） */
  notMerge?: boolean;
  /** 是否延迟更新（不立即渲染） */
  lazyUpdate?: boolean;
  /** 是否自动监听容器尺寸变化并 resize，默认 true */
  autoResize?: boolean;
  /** resize 防抖延迟（毫秒），默认 0（使用 rAF） */
  resizeDebounce?: number;
  /** 渲染器类型，默认 'canvas' */
  renderer?: 'canvas' | 'svg';
  /** 是否处于加载状态 */
  loading?: boolean;
  /** 加载状态配置（透传给 echartsInstance.showLoading） */
  loadingConfig?: LoadingConfig;
  /** ECharts 事件监听 */
  events?: Record<string, ChartEventHandler>;
  /** 图表实例初始化完成回调 */
  onChartReady?: (instance: ECharts) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}
