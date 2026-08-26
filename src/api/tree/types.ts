import type { PageQuery } from 'src/types';

/** 古树档案实体 */
export interface Tree {
  id: number;
  /** 古树名称 */
  name: string;
  /** 树种 */
  species: string;
  /** 树龄（年） */
  ageEstimate: number;
  /** 详细地址 */
  address: string;
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
  /** 最佳观赏期 */
  bestSeason: string;
  /** 故事简介 */
  story: string;
  createTime: string;
  updateTime: string;
}

/** 古树档案分页查询参数 */
export interface TreeQuery extends PageQuery {
  keyword?: string;
}

/** 古树档案表单数据 */
export interface TreeFormData {
  name: string;
  species: string;
  ageEstimate?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  bestSeason?: string;
  story?: string;
}
