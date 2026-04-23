import type { RequestConfig } from 'src/plugins/request';

// ======================== 请求配置预设 ========================

/** 老项目信封：{ returnCode: 0, body: T, errorMsg: string } */
export const LEGACY_REQUEST: RequestConfig = {
  codeKey: 'returnCode',
  successCode: 0,
  dataKey: 'body',
  msgKey: 'errorMsg',
};

// ======================== 分页预设 ========================

/** 分页预设类型，可直接展开到 useSearchTable options */
export interface PaginationPreset {
  paginationFields: {
    list?: string;
    total?: string;
    current?: string;
    pageSize?: string;
  };
  transformRequestParams?: (
    params: Record<string, unknown>,
  ) => Record<string, unknown>;
}

/**
 * 分页预设 A：pageNumber + { result, total }
 * 请求参数: pageNum → pageNumber (值不变)
 * 响应字段: result → dataList, total → totalSize
 */
export const PAGE_NUMBER_RESULT: PaginationPreset = {
  paginationFields: { list: 'result', total: 'total' },
  transformRequestParams: (params) => {
    const { pageNum, ...rest } = params;
    return { ...rest, pageNumber: pageNum };
  },
};

/**
 * 分页预设 B：pageIndex + { list, total }
 * 请求参数: pageNum → pageIndex (值不变，pageIndex 从 1 开始)
 * 响应字段: list → dataList, total → totalSize
 */
export const PAGE_INDEX_LIST: PaginationPreset = {
  paginationFields: { list: 'list', total: 'total' },
  transformRequestParams: (params) => {
    const { pageNum, ...rest } = params;
    return { ...rest, pageIndex: pageNum };
  },
};
