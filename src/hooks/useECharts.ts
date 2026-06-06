import type * as EChartsModule from 'echarts';
import type { ECharts, EChartsInitOpts, EChartsOption } from 'echarts';
import { useEffect, useRef } from 'react';

/**
 * ECharts 事件处理器类型
 * ECharts 内部使用 Function 类型存储事件处理器，此处使用宽松签名以兼容
 */
type ChartEventHandler = (...args: unknown[]) => void;

/** ECharts showLoading 配置项 */
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

/** useECharts hook 返回值 */
export interface UseEChartsReturn {
  /** 图表容器 ref，需绑定到 DOM 元素 */
  containerRef: React.RefObject<HTMLDivElement>;
  /** 图表实例 ref */
  instanceRef: React.MutableRefObject<ECharts | null>;
}

/** 将 Error | string | unknown 统一转为 Error 实例 */
function normalizeError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(String(err));
}

// ---- 按需动态加载 echarts（避免 ~1MB 打入首屏 bundle） ----
let echartsModulePromise: Promise<typeof EChartsModule> | null = null;

function loadECharts(): Promise<typeof EChartsModule> {
  if (!echartsModulePromise) {
    echartsModulePromise = import('echarts');
  }
  return echartsModulePromise;
}

/**
 * ECharts 实例管理 Hook
 *
 * 负责图表实例的完整生命周期：初始化 → 设置配置 → 响应式 resize → 事件绑定 → 销毁
 * - echarts 库按需动态加载，不打入首屏 bundle
 * - 所有错误通过 onError 回调统一抛出，不会被静默吞掉
 */
export function useECharts(options: UseEChartsOptions): UseEChartsReturn {
  const {
    option,
    theme,
    initOpts,
    notMerge = true,
    lazyUpdate = false,
    autoResize = true,
    resizeDebounce = 0,
    renderer = 'canvas',
    loading = false,
    loadingConfig,
    events,
    onChartReady,
    onError,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ECharts | null>(null);

  // ---- 使用 ref 存储回调/配置，避免 effect 因引用变化而重复执行 ----
  const onChartReadyRef = useRef(onChartReady);
  onChartReadyRef.current = onChartReady;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const notMergeRef = useRef(notMerge);
  notMergeRef.current = notMerge;
  const lazyUpdateRef = useRef(lazyUpdate);
  lazyUpdateRef.current = lazyUpdate;
  const eventsRef = useRef(events);
  const autoResizeRef = useRef(autoResize);
  autoResizeRef.current = autoResize;
  const loadingConfigRef = useRef(loadingConfig);
  loadingConfigRef.current = loadingConfig;

  // ===================== 1. 初始化 & 销毁（动态加载 echarts） =====================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let instance: ECharts | null = null;
    let observer: ResizeObserver | null = null;
    let rafId: number | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    loadECharts()
      .then((echarts) => {
        if (cancelled || !containerRef.current) return;

        // 创建实例
        instance = echarts.init(containerRef.current, theme, {
          ...initOpts,
          renderer,
        });
        instanceRef.current = instance;

        // resize 观察者
        if (autoResizeRef.current) {
          const handleResize = () => {
            if (instance && !instance.isDisposed()) {
              instance.resize();
            }
          };

          observer = new ResizeObserver(() => {
            const delay = resizeDebounce;

            if (delay > 0) {
              if (debounceTimer !== null) clearTimeout(debounceTimer);
              debounceTimer = setTimeout(handleResize, delay);
            } else {
              if (rafId !== null) cancelAnimationFrame(rafId);
              rafId = requestAnimationFrame(() => {
                handleResize();
                rafId = null;
              });
            }
          });

          observer.observe(containerRef.current);
        }

        // 回调通知
        onChartReadyRef.current?.(instance);
      })
      .catch((err) => {
        if (!cancelled) {
          onErrorRef.current?.(normalizeError(err));
        }
      });

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      observer?.disconnect();
      if (instance && !instance.isDisposed()) {
        instance.dispose();
      }
      instanceRef.current = null;
    };
    // 仅在挂载/卸载时执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================== 2. 设置配置项 =====================
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || instance.isDisposed()) return;
    if (!option) return;

    try {
      instance.setOption(option, {
        notMerge: notMergeRef.current,
        lazyUpdate: lazyUpdateRef.current,
      });
    } catch (err) {
      onErrorRef.current?.(normalizeError(err));
    }
  }, [option]);

  // ===================== 3. 加载状态（通过 ref 读取最新配置，避免对象引用依赖） =====================
  // eslint-disable-next-line complexity
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || instance.isDisposed()) return;

    const cfg = loadingConfigRef.current;

    if (loading) {
      instance.showLoading({
        text: cfg?.text ?? '',
        color: cfg?.color,
        textColor: cfg?.textColor,
        maskColor: cfg?.maskColor,
        zlevel: cfg?.zlevel,
        fontSize: cfg?.fontSize,
        showSpinner: cfg?.showSpinner,
        spinnerRadius: cfg?.spinnerRadius,
        lineWidth: cfg?.lineWidth,
        fontWeight: cfg?.fontWeight,
        fontStyle: cfg?.fontStyle,
        fontFamily: cfg?.fontFamily,
      });
    } else {
      instance.hideLoading();
    }
  }, [loading]);

  // ===================== 4. 事件绑定 =====================
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || instance.isDisposed()) return;

    const prevEvents = eventsRef.current ?? {};
    const nextEvents = events ?? {};

    // 解绑旧事件
    for (const [name, handler] of Object.entries(prevEvents)) {
      instance.off(name, handler);
    }

    // 绑定新事件
    for (const [name, handler] of Object.entries(nextEvents)) {
      instance.on(name, handler);
    }

    eventsRef.current = nextEvents;

    return () => {
      if (!instance.isDisposed()) {
        for (const [name, handler] of Object.entries(nextEvents)) {
          instance.off(name, handler);
        }
      }
    };
  }, [events]);

  // ===================== 5. 清理（StrictMode 兼容） =====================
  useEffect(() => {
    return () => {
      const instance = instanceRef.current;
      if (instance && !instance.isDisposed()) {
        instance.dispose();
      }
      instanceRef.current = null;
    };
  }, []);

  return { containerRef, instanceRef };
}
