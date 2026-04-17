/**
 * Scaffold CLI — API 方法名解析器
 *
 * 将可选的 apiNames 配置与默认值合并，供所有生成器统一使用。
 */

import type { ApiNamesDef } from './types.js';

/** 解析后的 API 方法名（所有字段必填） */
export interface ResolvedApiNames {
  getList: string;
  getById: string;
  create: string;
  update: string;
  delete: string;
}

/** 默认 CRUD 方法名 */
export const DEFAULT_API_NAMES: ResolvedApiNames = {
  getList: 'getListByGet',
  getById: 'getByIdByGet',
  create: 'createByPost',
  update: 'updateByPut',
  delete: 'deleteByDelete',
};

/** 合并自定义名称与默认值，未覆盖的保持默认 */
export function resolveApiNames(apiNames?: ApiNamesDef): ResolvedApiNames {
  if (!apiNames) return { ...DEFAULT_API_NAMES };
  const result = { ...DEFAULT_API_NAMES };
  for (const key of Object.keys(result) as (keyof ResolvedApiNames)[]) {
    if (apiNames[key]) result[key] = apiNames[key];
  }
  return result;
}
