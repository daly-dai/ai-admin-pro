import { createRequest } from 'src/plugins/request';
import type { PageQuery, PageResult } from 'src/types';
import type { Dict, DictFormData, DictMapData, DictSearchQuery } from './types';

const dictApi = createRequest();

// ==================== 字典管理 CRUD ====================

/** 获取所有字典（前端初始化用） */
export const getAllDictByGet = () => dictApi.get<Dict[]>('/api/dict/all');

/** 按类型获取启用项（下拉框用） */
export const getDictByCodeByGet = (dictType: string) =>
  dictApi.get<Dict[]>(`/api/dict/type/${dictType}`);

/** 分页全查 */
export const getDictListByPost = (query: PageQuery = {}) =>
  dictApi.post<PageResult<Dict>>('/api/dict/list', query);

/** 模糊搜索 */
export const searchDictByPost = (query: DictSearchQuery) =>
  dictApi.post<PageResult<Dict>>('/api/dict/search', query);

/** 按 ID 查单条 */
export const getDictByIdByGet = (id: number) =>
  dictApi.get<Dict>(`/api/dict/${id}`);

/** 新增字典 */
export const createDictByPost = (data: DictFormData) =>
  dictApi.post<null>('/api/dict', data);

/** 更新字典 */
export const updateDictByPost = (data: DictFormData & { id: number }) =>
  dictApi.post<null>('/api/dict/update', data);

/** 删除字典 */
export const deleteDictByPost = (id: number) =>
  dictApi.post<null>('/api/dict/delete', { id });

// ==================== 字典数据转换 ====================

export const dictApiRef = dictApi;

/** 将 Dict 列表转为 { [dictType]: { [dictValue]: dictLabel } } */
export const transformDictList = (list: Dict[]): DictMapData => {
  const result: DictMapData = {};

  for (const { dictType, dictValue, dictLabel } of list) {
    if (!result[dictType]) {
      result[dictType] = {};
    }

    result[dictType][dictValue] = dictLabel;
  }

  return result;
};
