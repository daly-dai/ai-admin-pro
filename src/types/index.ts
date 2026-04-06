// 全局类型定义

/** 分页数据 */
export interface PageData<T> {
  dataList: T[];
  totalSize: number;
  pageNum: number;
  pageSize: number;
}

/** 分页查询参数 */
export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
}

/** API响应 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

/** API错误 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
