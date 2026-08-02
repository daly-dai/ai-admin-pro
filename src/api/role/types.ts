import type { PageQuery } from 'src/types';

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  status: number;
  isDeleted: number;
  createTime: string;
  updateTime: string;
}

export interface RoleQuery extends PageQuery {
  keyword?: string;
  status?: number;
}

export interface RoleFormData {
  code: string;
  name: string;
  description?: string;
  status?: number;
}
