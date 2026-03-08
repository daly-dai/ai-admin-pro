// 字典管理类型定义

/** 字典状态 */
export type DictStatus = 'active' | 'inactive';

/** 字典类型 */
export interface DictType {
  /** 字典类型ID */
  id: string;
  /** 字典类型编码 */
  code: string;
  /** 字典类型名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 状态 */
  status: DictStatus;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime?: string;
}

/** 字典项 */
export interface DictItem {
  /** 字典项ID */
  id: string;
  /** 所属字典类型ID */
  dictTypeId: string;
  /** 字典项编码 */
  code: string;
  /** 字典项名称 */
  name: string;
  /** 排序号 */
  sort: number;
  /** 状态 */
  status: DictStatus;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime?: string;
}

/** 字典类型查询参数 */
export interface DictTypeQuery {
  /** 页码 */
  page?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 搜索关键词 */
  keyword?: string;
  /** 状态 */
  status?: DictStatus;
}

/** 字典项查询参数 */
export interface DictItemQuery {
  /** 页码 */
  page?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 字典类型ID */
  dictTypeId: string;
  /** 搜索关键词 */
  keyword?: string;
  /** 状态 */
  status?: DictStatus;
}

/** 字典类型表单数据 */
export interface DictTypeFormData {
  /** 字典类型编码 */
  code: string;
  /** 字典类型名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 状态 */
  status: DictStatus;
}

/** 字典项表单数据 */
export interface DictItemFormData {
  /** 所属字典类型ID */
  dictTypeId: string;
  /** 字典项编码 */
  code: string;
  /** 字典项名称 */
  name: string;
  /** 排序号 */
  sort: number;
  /** 状态 */
  status: DictStatus;
}
