import type { PageQuery } from 'src/types';

export interface User {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  status: number;
  roleIds: string[];
  remark: string;
  createTime: string;
  updateTime: string;
}

export interface UserQuery extends PageQuery {
  keyword?: string;
  status?: number;
  dateRange?: [string, string];
}

export interface UserFormData {
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar?: string;
  status: number;
  roleIds?: string[];
  remark?: string;
}
