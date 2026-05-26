import type { ModuleMeta } from './types';

// ============================================================================
// 模块元数据
// ============================================================================

/** 4个模块的配置列表（驱动 2×2 网格渲染） */
export const MODULE_LIST: ModuleMeta[] = [
  { key: 'spotSize', label: '时点规模' },
  { key: 'dv01', label: 'DV01风险' },
  { key: 'modifiedDuration', label: '修正久期' },
  { key: 'ytm', label: 'YTM收益率' },
];

/** moduleType → 中文名称映射 */
export const MODULE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  MODULE_LIST.map((m) => [m.key, m.label]),
);

// ============================================================================
// 图表尺寸常量
// ============================================================================

/** 卡片内图表高度（px） */
export const CARD_CHART_HEIGHT = 260;

/** 弹框内图表高度（px） */
export const MODAL_CHART_HEIGHT = 500;

// ============================================================================
// Y轴动态范围配置
// ============================================================================

/** Y轴动态范围：下浮比例（低于最小值 10% 留白） */
export const Y_AXIS_MIN_RATIO = 0.9;

/** Y轴动态范围：上浮比例（高于最大值 10% 留白） */
export const Y_AXIS_MAX_RATIO = 1.1;

/** 国债收益率 Y轴小数精度 */
export const YIELD_AXIS_DECIMALS = 2;

/** 时点规模 Y轴小数精度 */
export const SCALE_AXIS_DECIMALS = 0;
