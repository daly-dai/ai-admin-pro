// 字典管理 API
import type { PageData } from '@/types';
import { request } from '@/plugins/request';

import type {
  DictType,
  DictItem,
  DictTypeQuery,
  DictItemQuery,
  DictTypeFormData,
  DictItemFormData,
  DictStatus,
} from './types';

export type {
  DictType,
  DictItem,
  DictTypeQuery,
  DictItemQuery,
  DictTypeFormData,
  DictItemFormData,
  DictStatus,
};

/** 字典类型 API */
export const dictTypeApi = {
  /**
   * 获取字典类型列表
   * @param params 查询参数
   */
  getList: (params?: DictTypeQuery) =>
    request.get<PageData<DictType>>('/api/dict-types', { params }),

  /**
   * 获取字典类型详情
   * @param id 字典类型ID
   */
  getById: (id: string) => request.get<DictType>(`/api/dict-types/${id}`),

  /**
   * 创建字典类型
   * @param data 字典类型数据
   */
  create: (data: DictTypeFormData) =>
    request.post<DictType>('/api/dict-types', data),

  /**
   * 更新字典类型
   * @param id 字典类型ID
   * @param data 字典类型数据
   */
  update: (id: string, data: Partial<DictTypeFormData>) =>
    request.put<DictType>(`/api/dict-types/${id}`, data),

  /**
   * 删除字典类型
   * @param id 字典类型ID
   */
  delete: (id: string) => request.delete(`/api/dict-types/${id}`),

  /**
   * 获取所有启用的字典类型（用于下拉选择）
   */
  getAllActive: () => request.get<DictType[]>('/api/dict-types/all-active'),
};

/** 字典项 API */
export const dictItemApi = {
  /**
   * 获取字典项列表
   * @param params 查询参数
   */
  getList: (params: DictItemQuery) =>
    request.get<PageData<DictItem>>('/api/dict-items', { params }),

  /**
   * 获取字典项详情
   * @param id 字典项ID
   */
  getById: (id: string) => request.get<DictItem>(`/api/dict-items/${id}`),

  /**
   * 创建字典项
   * @param data 字典项数据
   */
  create: (data: DictItemFormData) =>
    request.post<DictItem>('/api/dict-items', data),

  /**
   * 更新字典项
   * @param id 字典项ID
   * @param data 字典项数据
   */
  update: (id: string, data: Partial<DictItemFormData>) =>
    request.put<DictItem>(`/api/dict-items/${id}`, data),

  /**
   * 删除字典项
   * @param id 字典项ID
   */
  delete: (id: string) => request.delete(`/api/dict-items/${id}`),

  /**
   * 根据字典类型编码获取字典项列表
   * @param dictTypeCode 字典类型编码
   */
  getByDictTypeCode: (dictTypeCode: string) =>
    request.get<DictItem[]>(`/api/dict-items/by-type-code/${dictTypeCode}`),
};

/** 字典管理 API 统一导出 */
export const dictApi = {
  type: dictTypeApi,
  item: dictItemApi,
};
