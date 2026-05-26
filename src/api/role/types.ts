import type { PageQuery } from 'src/types';

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  status: number;
  permissionIds: string[];
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
  status: number;
  permissionIds?: string[];
}
