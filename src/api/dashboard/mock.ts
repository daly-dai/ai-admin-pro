import type {
  ChartQuery,
  ChartVO,
  DonutQuery,
  DonutVO,
  OverviewQuery,
  OverviewVO,
  TableQuery,
  TableVO,
  YieldQuery,
  YieldVO,
} from './types';

// ==================== 工具函数 ====================

/** 随机整数 [min, max] */
const rand = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** 模拟延迟 200-500ms */
const delay = <T>(data: T): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), rand(200, 500));
  });

// ==================== 总览 mock ====================

const ALL_INDICATORS = [
  'eva',
  'selfEva',
  'clientEva',
  'netIncome',
  'keyBusinessIncome',
  'ociValuation',
  'bookNonInterest',
];

const BASE_VALUES: Record<string, number> = {
  eva: 860000,
  selfEva: 520000,
  clientEva: 340000,
  netIncome: 1360000,
  keyBusinessIncome: 980000,
  ociValuation: 620000,
  bookNonInterest: 780000,
};

const mockOverview = (): OverviewVO => {
  const overviewData = ALL_INDICATORS.map((key) => {
    const base = BASE_VALUES[key];
    const noise = rand(-5000, 5000);
    return {
      indicatorType: key,
      actualValue: base + noise,
      dayOverDay: rand(1000, 8000),
      monthOverMonth: rand(8000, 45000),
      monthGrowthRate: rand(30, 60) / 1000, // 0.03~0.06
      yearOverYear: rand(15000, 70000),
      yearGrowthRate: rand(45, 90) / 1000, // 0.045~0.09
      completionRate: rand(850, 960) / 1000, // 0.85~0.96
    };
  });

  return { overviewData };
};

// ==================== 图表 mock ====================

const mockChart = (query: ChartQuery): ChartVO => {
  const isMonth = query.dateDimension === '月';
  const monthCount = isMonth ? 6 : 15; // 本月/本年6期 + 上月/去年6期

  const chartData = ALL_INDICATORS.flatMap((key) => {
    const base = BASE_VALUES[key] / 30;
    const items: ChartVO['chartData'] = [];

    for (let i = 0; i < monthCount; i++) {
      const month = i + 1;
      // 本期（本月/本年）
      items.push({
        indicatorType: key,
        dataDate: isMonth
          ? `2026-${String(month).padStart(2, '0')}-30`
          : `2026-06-${String(month).padStart(2, '0')}`,
        actualValue: base * month + rand(-2000, 2000),
      });
    }

    // 对比期（上月/去年，同样数量）
    for (let i = 0; i < monthCount; i++) {
      const month = i + 1;
      items.push({
        indicatorType: key,
        dataDate: isMonth
          ? `2025-${String(month).padStart(2, '0')}-30`
          : `2025-06-${String(month).padStart(2, '0')}`,
        actualValue: base * month * 0.82 + rand(-2000, 2000),
      });
    }

    return items;
  });

  return { chartData };
};

// ==================== 收益率 mock ====================

const mockYield = (): YieldVO => [
  {
    type: '本币投资',
    yield: 0.0386,
    baseline: 0.0342,
    bpsOverBaseline: 44.0,
    yearOverYear: 0.28,
    baselineDifference: 0.44,
  },
  {
    type: '本币交易',
    yield: 0.0412,
    baseline: 0.0378,
    bpsOverBaseline: 34.0,
    yearOverYear: 0.31,
    baselineDifference: 0.34,
  },
];

// ==================== 环形图 mock ====================

const DONUT_DATA: Record<string, DonutVO> = {
  eva: [
    {
      category1: 'EVA<分类1>',
      category2: 'EVA<分类2>-A',
      indicatorValue: 420000,
    },
    {
      category1: 'EVA<分类1>',
      category2: 'EVA<分类2>-B',
      indicatorValue: 280000,
    },
    {
      category1: 'EVA<分类1>',
      category2: 'EVA<分类2>-C',
      indicatorValue: 160000,
    },
    {
      category1: 'EVA<分类1>-2',
      category2: 'EVA<分类2>-D',
      indicatorValue: 300000,
    },
    {
      category1: 'EVA<分类1>-2',
      category2: 'EVA<分类2>-E',
      indicatorValue: 240000,
    },
  ],
  selfEva: [
    {
      category1: 'EVA<分类1>',
      category2: 'EVA<分类2>-A',
      indicatorValue: 260000,
    },
    {
      category1: 'EVA<分类1>',
      category2: 'EVA<分类2>-B',
      indicatorValue: 180000,
    },
    {
      category1: 'EVA<分类1>',
      category2: 'EVA<分类2>-C',
      indicatorValue: 80000,
    },
    {
      category1: 'EVA<分类1>-2',
      category2: 'EVA<分类2>-D',
      indicatorValue: 180000,
    },
    {
      category1: 'EVA<分类1>-2',
      category2: 'EVA<分类2>-E',
      indicatorValue: 140000,
    },
  ],
  clientEva: [
    { category1: '管理子团队-甲', category2: '', indicatorValue: 360000 },
    { category1: '管理子团队-乙', category2: '', indicatorValue: 280000 },
    { category1: '管理子团队-丙', category2: '', indicatorValue: 190000 },
    { category1: '管理子团队-丁', category2: '', indicatorValue: 120000 },
  ],
  netIncome: [
    { category1: '管理团队<内部>-1', category2: '', indicatorValue: 680000 },
    { category1: '管理团队<内部>-2', category2: '', indicatorValue: 420000 },
    { category1: '管理团队<内部>-3', category2: '', indicatorValue: 260000 },
  ],
  bookNonInterest: [
    {
      category1: '账面非息<业务类型1>',
      category2: '账面非息<业务类型2>-A',
      indicatorValue: 260000,
    },
    {
      category1: '账面非息<业务类型1>',
      category2: '账面非息<业务类型2>-B',
      indicatorValue: 200000,
    },
    {
      category1: '账面非息<业务类型1>-2',
      category2: '账面非息<业务类型2>-C',
      indicatorValue: 180000,
    },
    {
      category1: '账面非息<业务类型1>-2',
      category2: '账面非息<业务类型2>-D',
      indicatorValue: 140000,
    },
  ],
  ociValuation: [
    {
      category1: 'OCI指标<业务品种>',
      category2: 'OCI指标<剩余期限>-短期',
      indicatorValue: 220000,
    },
    {
      category1: 'OCI指标<业务品种>',
      category2: 'OCI指标<剩余期限>-中期',
      indicatorValue: 160000,
    },
    {
      category1: 'OCI指标<业务品种>-2',
      category2: 'OCI指标<剩余期限>-长期',
      indicatorValue: 140000,
    },
    {
      category1: 'OCI指标<业务品种>-2',
      category2: 'OCI指标<剩余期限>-超长期',
      indicatorValue: 100000,
    },
  ],
};

const mockDonut = (query: DonutQuery): DonutVO =>
  DONUT_DATA[query.indicatorType] ?? [
    { category1: '暂无数据', category2: '', indicatorValue: 1 },
  ];

// ==================== 表格 mock ====================

const TABLE_DATA: Record<string, TableVO> = {
  eva: {
    tableData: [
      {
        category1: 'EVA<分类1>',
        category2: '自营EVA',
        netInterest: 120000,
        nonInterest: 80000,
        actualValue: 200000,
        budgetTarget: 220000,
        completionRate: 0.9091,
        dayOverDay: 3200,
        monthOverMonth: 18000,
        yearOverYear: 26000,
        monthGrowthRate: 0.099,
        yearGrowthRate: 0.15,
      },
      {
        category1: 'EVA<分类1>',
        category2: '代客EVA',
        netInterest: 96000,
        nonInterest: 64000,
        actualValue: 160000,
        budgetTarget: 170000,
        completionRate: 0.9412,
        dayOverDay: 2400,
        monthOverMonth: 12000,
        yearOverYear: 18000,
        monthGrowthRate: 0.081,
        yearGrowthRate: 0.127,
      },
      {
        category1: 'EVA<分类1>',
        category2: 'EVA<分类2>-A',
        netInterest: 76000,
        nonInterest: 52000,
        actualValue: 128000,
        budgetTarget: 140000,
        completionRate: 0.9143,
        dayOverDay: 2100,
        monthOverMonth: 9600,
        yearOverYear: 14000,
        monthGrowthRate: 0.081,
        yearGrowthRate: 0.123,
      },
      {
        category1: 'EVA<分类1>-2',
        category2: 'EVA<分类2>-D',
        netInterest: 64000,
        nonInterest: 44000,
        actualValue: 108000,
        budgetTarget: 120000,
        completionRate: 0.9,
        dayOverDay: 1800,
        monthOverMonth: 8400,
        yearOverYear: 11000,
        monthGrowthRate: 0.084,
        yearGrowthRate: 0.113,
      },
    ],
  },
  selfEva: {
    tableData: [
      {
        category1: 'EVA<分类1>',
        category2: 'EVA<分类2>-A',
        netInterest: 76000,
        nonInterest: 52000,
        actualValue: 128000,
        budgetTarget: 140000,
        completionRate: 0.9143,
        dayOverDay: 2100,
        monthOverMonth: 9600,
        yearOverYear: 14000,
        monthGrowthRate: 0.081,
        yearGrowthRate: 0.123,
      },
      {
        category1: 'EVA<分类1>-2',
        category2: 'EVA<分类2>-D',
        netInterest: 64000,
        nonInterest: 44000,
        actualValue: 108000,
        budgetTarget: 120000,
        completionRate: 0.9,
        dayOverDay: 1800,
        monthOverMonth: 8400,
        yearOverYear: 11000,
        monthGrowthRate: 0.084,
        yearGrowthRate: 0.113,
      },
    ],
  },
  clientEva: {
    tableData: [
      {
        category1: '管理团队<内部>',
        category2: '管理子团队-甲',
        netInterest: 86000,
        nonInterest: 58000,
        actualValue: 144000,
        budgetTarget: 150000,
        completionRate: 0.96,
        dayOverDay: 2600,
        monthOverMonth: 11000,
        yearOverYear: 16000,
        monthGrowthRate: 0.083,
        yearGrowthRate: 0.125,
      },
      {
        category1: '管理团队<内部>',
        category2: '管理子团队-乙',
        netInterest: 72000,
        nonInterest: 46000,
        actualValue: 118000,
        budgetTarget: 130000,
        completionRate: 0.9077,
        dayOverDay: 1900,
        monthOverMonth: 8200,
        yearOverYear: 12000,
        monthGrowthRate: 0.075,
        yearGrowthRate: 0.113,
      },
    ],
  },
  netIncome: {
    tableData: [
      {
        category1: '管理团队<内部>',
        category2: '管理子团队-甲',
        netInterest: 96000,
        nonInterest: 64000,
        actualValue: 160000,
        budgetTarget: 170000,
        completionRate: 0.9412,
        dayOverDay: 2800,
        monthOverMonth: 12000,
        yearOverYear: 18000,
        monthGrowthRate: 0.081,
        yearGrowthRate: 0.127,
      },
      {
        category1: '管理团队<内部>',
        category2: '管理子团队-乙',
        netInterest: 82000,
        nonInterest: 52000,
        actualValue: 134000,
        budgetTarget: 145000,
        completionRate: 0.9241,
        dayOverDay: 2200,
        monthOverMonth: 9600,
        yearOverYear: 14000,
        monthGrowthRate: 0.077,
        yearGrowthRate: 0.117,
      },
    ],
  },
  bookNonInterest: {
    tableData: [
      {
        category1: '账面非息<业务类型1>',
        category2: '账面非息<业务类型2>-A',
        category3: '账面非息<业务类型3>-1',
        actualValue: 96000,
        dayOverDay: 1600,
        monthOverMonth: 7200,
        yearOverYear: 10000,
        monthGrowthRate: 0.081,
        yearGrowthRate: 0.116,
      },
      {
        category1: '账面非息<业务类型1>',
        category2: '账面非息<业务类型2>-B',
        category3: '账面非息<业务类型3>-2',
        actualValue: 74000,
        dayOverDay: 1200,
        monthOverMonth: 5600,
        yearOverYear: 8000,
        monthGrowthRate: 0.082,
        yearGrowthRate: 0.121,
      },
    ],
  },
  ociValuation: {
    tableData: [
      {
        category1: 'OCI指标<业务品种>',
        category2: 'OCI指标<剩余期限>-短期',
        actualValue: 86000,
        dayOverDay: 1400,
        monthOverMonth: 6200,
        yearOverYear: 9000,
        monthGrowthRate: 0.078,
        yearGrowthRate: 0.117,
      },
      {
        category1: 'OCI指标<业务品种>',
        category2: 'OCI指标<剩余期限>-中期',
        actualValue: 64000,
        dayOverDay: 1000,
        monthOverMonth: 4800,
        yearOverYear: 7000,
        monthGrowthRate: 0.081,
        yearGrowthRate: 0.123,
      },
    ],
  },
};

const mockTable = (query: TableQuery): TableVO =>
  TABLE_DATA[query.indicatorType] ?? {
    tableData: [
      {
        category1: '暂无数据',
        category2: '',
        actualValue: 0,
        dayOverDay: 0,
        monthOverMonth: 0,
        yearOverYear: 0,
        monthGrowthRate: 0,
        yearGrowthRate: 0,
      },
    ],
  };

// ==================== Mock 导出函数 ====================

export const mockGetOverview = (_query: OverviewQuery): Promise<OverviewVO> =>
  delay(mockOverview());

export const mockGetChart = (query: ChartQuery): Promise<ChartVO> =>
  delay(mockChart(query));

export const mockGetYield = (_query: YieldQuery): Promise<YieldVO> =>
  delay(mockYield());

export const mockGetDonut = (query: DonutQuery): Promise<DonutVO> =>
  delay(mockDonut(query));

export const mockGetTable = (query: TableQuery): Promise<TableVO> =>
  delay(mockTable(query));
