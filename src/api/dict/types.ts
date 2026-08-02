import type { PageQuery } from 'src/types';

/** 字典实体（匹配后端 Dict.java） */
export interface Dict {
  id: number;
  dictType: string;
  dictLabel: string;
  dictValue: string;
  sort: number;
  status: number;
  remark: string;
  isDeleted: number;
  createTime: string;
  updateTime: string;
}

/** 字典搜索查询参数 */
export interface DictSearchQuery extends PageQuery {
  keyword?: string;
  dictType?: string;
  status?: number;
}

/** 字典表单数据 */
export interface DictFormData {
  dictType: string;
  dictLabel: string;
  dictValue: string;
  sort?: number;
  status?: number;
  remark?: string;
}

/** 字典 Map 数据：{ [dictType]: { [dictValue]: dictLabel } } */
export type DictMapData = Record<string, Record<string, string>>;
