import type { PageQuery } from 'src/types';

export interface User {
  id: number;
  username: string;
  password?: string;
  realName: string;
  email: string;
  phone: string;
  avatar: string;
  status: number;
  isFirstLogin: number;
  roleIds: number[];
  remark: string;
  createTime: string;
  updateTime: string;
}

export interface UserQuery extends PageQuery {
  keyword?: string;
  status?: number;
}

export interface UserFormData {
  username: string;
  realName: string;
  email?: string;
  phone?: string;
  status?: number;
  remark?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  isFirstLogin: boolean;
}
