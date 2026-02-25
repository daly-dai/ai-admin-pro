// 全局类型定义

/** 分页数据 */
export interface PageData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 分页查询参数 */
export interface PageQuery {
  page?: number;
  pageSize?: number;
}

/** 用户 */
export interface User {
  id: string;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createTime: string;
  updateTime?: string;
}

/** 路由元信息 */
export interface RouteMeta {
  title: string;
  icon?: string;
  hidden?: boolean;
  keepAlive?: boolean;
  permission?: string | string[];
}

/** 菜单项 */
export interface MenuItem {
  key: string;
  path: string;
  name: string;
  icon?: string;
  children?: MenuItem[];
  meta?: RouteMeta;
}

/** 表格列配置 */
export interface TableColumn<T = unknown> {
  title: string;
  dataIndex: keyof T | string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  filters?: { text: string; value: string | number }[];
}

/** 表单字段配置 */
export interface FormField<T = unknown> {
  name: keyof T | string;
  label: string;
  type:
    | 'input'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'switch'
    | 'date'
    | 'dateRange'
    | 'number'
    | 'password'
    | 'upload'
    | 'treeSelect';
  required?: boolean;
  rules?: unknown[];
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  span?: number;
  disabled?: boolean;
  hidden?: boolean;
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
