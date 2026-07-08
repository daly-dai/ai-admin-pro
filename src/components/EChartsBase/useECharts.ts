import type * as EChartsModule from 'echarts';
import type { ECharts } from 'echarts';
import { useEffect, useRef } from 'react';

import type { ChartEventHandler, UseEChartsOptions } from './types';

/** 将 Error | string | unknown 统一转为 Error 实例 */
function normalizeError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
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

/** 在实例上绑定事件 */
function bindEvents(
  instance: ECharts,
  events: Record<string, ChartEventHandler>,
): void {
  for (const [name, handler] of Object.entries(events)) {
    instance.on(name, handler);
  }
}

/**
 * ECharts 实例管理 Hook
 *
 * 负责图表实例的完整生命周期：初始化 → 设置配置 → 响应式 resize → 事件绑定 → 销毁
 * - echarts 库按需动态加载，不打入首屏 bundle
 * - 所有错误通过 onError 回调统一抛出，不会被静默吞掉
 *
 * 架构说明：
 * - effect 1（初始化）：加载 echarts → 创建实例 → 立即做首次 option/events/loading 同步
 * - effect 2/3/4（更新）：各自监听依赖变化，在实例就绪后增量更新
 * - effect 5（兜底清理）：确保 StrictMode 下实例不泄漏
 * - 首次同步直接写在 .then() 回调里，不需要额外的 "就绪" state 来桥接
 */
export function useECharts(options: UseEChartsOptions) {
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

  // ---- 渲染阶段同步最新值到 ref，供异步回调读取 ----
  const optionRef = useRef(option);
  optionRef.current = option;
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const loadingConfigRef = useRef(loadingConfig);
  loadingConfigRef.current = loadingConfig;
  const onChartReadyRef = useRef(onChartReady);
  onChartReadyRef.current = onChartReady;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const notMergeRef = useRef(notMerge);
  notMergeRef.current = notMerge;
  const lazyUpdateRef = useRef(lazyUpdate);
  lazyUpdateRef.current = lazyUpdate;
  const autoResizeRef = useRef(autoResize);
  autoResizeRef.current = autoResize;

  // ---- 事件 diff 所需：记录上一次绑定的 handler 引用 ----
  const prevEventsRef = useRef<Record<string, ChartEventHandler>>({});

  // ===================== 1. 初始化 & 销毁（动态加载 echarts） =====================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    let instance: ECharts | null = null;
    let observer: ResizeObserver | null = null;
    let rafId: number | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    void loadECharts()
      // eslint-disable-next-line complexity
      .then((echarts) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        // 创建实例
        instance = echarts.init(containerRef.current, theme, {
          ...initOpts,
          renderer,
        });
        instanceRef.current = instance;

        // ---- 首次同步：在实例创建后立即完成，不依赖 state 桥接 ----
        const currentOption = optionRef.current;
        if (currentOption) {
          try {
            instance.setOption(currentOption, {
              notMerge: notMergeRef.current,
              lazyUpdate: lazyUpdateRef.current,
            });
          } catch (err) {
            onErrorRef.current?.(normalizeError(err));
          }
        }

        const currentEvents = eventsRef.current;
        if (currentEvents) {
          bindEvents(instance, currentEvents);
          prevEventsRef.current = currentEvents;
        }

        if (loadingRef.current) {
          const cfg = loadingConfigRef.current;
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
        }

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
              if (debounceTimer !== null) {
                clearTimeout(debounceTimer);
              }
              debounceTimer = setTimeout(handleResize, delay);
            } else {
              if (rafId !== null) {
                cancelAnimationFrame(rafId);
              }
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

    // consistent-return 假阳性：表达式语句后必然到达此 return
    // eslint-disable-next-line consistent-return
    return () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
      }
      observer?.disconnect();
      if (instance && !instance.isDisposed()) {
        instance.dispose();
      }
      instanceRef.current = null;
    };
    // 仅在挂载/卸载时执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================== 2. 设置配置项（后续更新） =====================
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || instance.isDisposed()) {
      return;
    }
    if (!option) {
      return;
    }

    try {
      instance.setOption(option, {
        notMerge: notMergeRef.current,
        lazyUpdate: lazyUpdateRef.current,
      });
    } catch (err) {
      onErrorRef.current?.(normalizeError(err));
    }
  }, [option]);

  // ===================== 3. 加载状态（后续更新） =====================
  // eslint-disable-next-line complexity
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || instance.isDisposed()) {
      return;
    }

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

  // ===================== 4. 事件绑定（后续更新，基于 handler 引用 diff） =====================
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || instance.isDisposed()) {
      return undefined;
    }

    const prevEvents = prevEventsRef.current;
    const nextEvents = events ?? {};

    // 解绑旧事件（仅解绑 handler 引用不同的）
    for (const [name, handler] of Object.entries(prevEvents)) {
      if (nextEvents[name] !== handler) {
        instance.off(name, handler);
      }
    }

    // 绑定新事件（仅绑定 handler 引用不同的）
    for (const [name, handler] of Object.entries(nextEvents)) {
      if (prevEvents[name] !== handler) {
        instance.on(name, handler);
      }
    }

    prevEventsRef.current = nextEvents;

    return () => {
      if (!instance.isDisposed()) {
        for (const [name, handler] of Object.entries(nextEvents)) {
          instance.off(name, handler);
        }
      }
    };
  }, [events]);

  // ===================== 5. 兜底清理（StrictMode 兼容） =====================
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
