// 全局类型定义

/** 分页查询参数 */
export interface PageQuery {
  pageIndex?: number;
  pageSize?: number;
}

/** 分页响应结果（拦截器已解包，request.get<T> 直接返回 T） */
export interface PageResult<T> {
  list: T[];
  total: number;
}
