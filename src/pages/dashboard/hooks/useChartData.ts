// ============================================================================
// useChartData — 图表数据管理 Hook
//
// 筛选参数从 filterSource.useFilterParams() 获取（大屏接入全局 filterParams）
// ============================================================================

import dayjs from 'dayjs';
import { useCallback, useEffect, useRef } from 'react';

import { fetchScaleData, fetchTreasuryYieldData } from '../api';
import { useFilterParams } from '../filterSource';
import { scaleCacheKey, useDashboardStore, yieldCacheKey } from '../store';

import type { ModuleType, PageSize } from '../types';

export const useChartData = (moduleType: ModuleType) => {
  const filterParams = useFilterParams();

  const moduleState = useDashboardStore((s) => s.modules[moduleType]);
  const hasMore = moduleState.hasMore;
  const loading = moduleState.loading;

  const appendModuleData = useDashboardStore((s) => s.appendModuleData);
  const setScaleCache = useDashboardStore((s) => s.setScaleCache);
  const setYieldCache = useDashboardStore((s) => s.setYieldCache);
  const setModuleLoading = useDashboardStore((s) => s.setModuleLoading);
  const setModuleHasMore = useDashboardStore((s) => s.setModuleHasMore);
  const resetModule = useDashboardStore((s) => s.resetModule);

  const requestIdRef = useRef(0);

  const fetchBatch = useCallback(
    async (endDate: string, size: PageSize) => {
      const state = useDashboardStore.getState();
      const currentFilters = filterParams;

      const sKey = scaleCacheKey(endDate, size, currentFilters, moduleType);
      const yKey = yieldCacheKey(endDate, size);

      const cachedScale = state.scaleCache[sKey];
      const cachedYield = state.yieldCache[yKey];

      if (cachedScale && cachedYield) {
        return { scaleData: cachedScale, yieldData: cachedYield };
      }

      const [scale, yields] = await Promise.all([
        cachedScale
          ? cachedScale
          : fetchScaleData({
              endDate,
              pageSize: size,
              accountType: currentFilters.accountType,
              debtType: currentFilters.debtType,
              currency: currentFilters.currency,
              moduleType,
            }),
        cachedYield
          ? cachedYield
          : fetchTreasuryYieldData({ endDate, pageSize: size }),
      ]);

      if (!cachedScale) setScaleCache(sKey, scale);
      if (!cachedYield) setYieldCache(yKey, yields);

      return { scaleData: scale, yieldData: yields };
    },
    [moduleType, filterParams, setScaleCache, setYieldCache],
  );

  const loadInitial = useCallback(async () => {
    if (!filterParams) return;

    const id = ++requestIdRef.current;
    const state = useDashboardStore.getState();

    setModuleLoading(moduleType, true);
    resetModule(moduleType);

    try {
      const { scaleData, yieldData } = await fetchBatch(
        filterParams.endDate,
        state.pageSize,
      );

      if (id !== requestIdRef.current) return;

      appendModuleData(moduleType, scaleData, yieldData);
      setModuleHasMore(moduleType, scaleData.length >= state.pageSize);
    } finally {
      if (id === requestIdRef.current) {
        setModuleLoading(moduleType, false);
      }
    }
  }, [
    moduleType,
    filterParams,
    fetchBatch,
    appendModuleData,
    resetModule,
    setModuleHasMore,
    setModuleLoading,
  ]);

  const loadPrevious = useCallback(async () => {
    if (!filterParams) return;

    const id = ++requestIdRef.current;
    const state = useDashboardStore.getState();
    const mod = state.modules[moduleType];

    if (mod.scaleData.length === 0 || mod.loading) return;

    const earliestDate = dayjs(mod.scaleData[0].timePoint);
    const newEndDate = earliestDate.subtract(1, 'day').format('YYYY-MM-DD');

    setModuleLoading(moduleType, true);

    try {
      const { scaleData: newScale, yieldData: newYield } = await fetchBatch(
        newEndDate,
        state.pageSize,
      );

      if (id !== requestIdRef.current) return;

      if (newScale.length > 0) {
        appendModuleData(moduleType, newScale, newYield);
      }
      setModuleHasMore(moduleType, newScale.length >= state.pageSize);
    } finally {
      if (id === requestIdRef.current) {
        setModuleLoading(moduleType, false);
      }
    }
  }, [
    moduleType,
    filterParams,
    fetchBatch,
    appendModuleData,
    setModuleHasMore,
    setModuleLoading,
  ]);

  useEffect(() => {
    if (filterParams) loadInitial();
  }, [filterParams, loadInitial]);

  return { loadPrevious, loadInitial, hasMore, loading };
};
