import { createRequest } from 'src/plugins/request';

import type { DictMapData, Dictionary } from './types';

const dictApi = createRequest();

export const getAllDictByGet = () => dictApi.get<Dictionary[]>('/api/dict/all');

export const getDictByCodeByGet = (code: string) =>
  dictApi.get<Dictionary[]>(`/api/dict/${code}`);

export const dictApiRef = dictApi;

export const transformDictList = (list: Dictionary[]): DictMapData => {
  const result: DictMapData = {};
  for (const { dictItem, dictKey, dictValue } of list) {
    if (!result[dictItem]) {
      result[dictItem] = {};
    }
    result[dictItem][dictKey] = dictValue;
  }
  return result;
};
