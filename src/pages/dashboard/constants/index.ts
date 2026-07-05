// ==================== 图表主题颜色 ====================

/** 分组柱状图色板：本期 | 对比期 */
export const BAR_COLORS = {
  current: '#4B9CD3',
  previous: '#E8836E',
} as const;

/** 环形图 12 色色板 */
export const PIE_COLORS = [
  '#F5D580',
  '#4B9CD3',
  '#E8836E',
  '#6FBFA0',
  '#C4A6E8',
  '#F0B77D',
  '#7EC8E3',
  '#E8C46A',
  '#A8D8B9',
  '#F2A5A0',
  '#8CBED6',
  '#D4A76A',
] as const;

// ==================== 数据颜色 ====================

/** 统计数据主色 */
export const STAT_PRIMARY = '#333333';

/** 正数颜色（中国金融：红涨绿跌） */
export const POSITIVE_COLOR = '#F5222D';

/** 负数颜色 */
export const NEGATIVE_COLOR = '#52C41A';

// ==================== 指标定义 ====================

/** 左侧统计模块指标顺序 */
export const LEFT_STAT_KEYS = ['eva', 'selfEva', 'clientEva'];

/** 右侧统计模块指标顺序 */
export const RIGHT_STAT_KEYS = [
  'netIncome',
  'keyBusinessIncome',
  'ociValuation',
];

/** 左侧柱状图指标选项 */
export const LEFT_CHART_OPTIONS = [
  { value: 'selfEva', label: '自营EVA' },
  { value: 'clientEva', label: '代客EVA' },
  { value: 'netIncome', label: '营业净收入' },
] as const;

/** 右侧柱状图指标选项 */
export const RIGHT_CHART_OPTIONS = [
  { value: 'keyBusinessIncome', label: '重点业务收入' },
  { value: 'bookNonInterest', label: '账面非息（科目口径）' },
  { value: 'ociValuation', label: 'OCI估值' },
] as const;

/** 指标名称映射 */
export const METRIC_LABELS: Record<string, string> = {
  eva: 'EVA',
  selfEva: '自营EVA',
  clientEva: '代客EVA',
  netIncome: '营业净收入',
  keyBusinessIncome: '重点业务收入',
  ociValuation: 'OCI当年估值',
  bookNonInterest: '账面非息（科目口径）',
};

/** 支持环形图上下级联动的指标 */
export const LINKED_METRICS = ['eva', 'selfEva', 'bookNonInterest'];

/** 收益率类型映射 */
export const YIELD_TYPE_MAP: Record<string, 'investment' | 'trading'> = {
  本币投资: 'investment',
  本币交易: 'trading',
};
