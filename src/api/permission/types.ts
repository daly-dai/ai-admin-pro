import type { PageQuery } from 'src/types';

export interface Permission {
  id: number;
  code: string;
  name: string;
  type: string;
  parentId: number | null;
  sort: number;
  status: number;
  description: string;
  isDeleted: number;
  createTime: string;
  updateTime: string;
  children?: Permission[];
}

export interface PermissionQuery extends PageQuery {
  keyword?: string;
  type?: string;
  status?: number;
}

export interface PermissionFormData {
  code: string;
  name: string;
  type: string;
  parentId?: number | null;
  sort?: number;
  status?: number;
  description?: string;
}
