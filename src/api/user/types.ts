export interface User {
  id: number;
  username: string;
  password?: string;
  realName: string;
  email: string;
  phone: string;
  avatar: string;
  status: number;
  roleIds: string;
  remark: string;
  createTime: string;
  updateTime: string;
}

export interface UserQuery {
  keyword?: string;
  status?: number;
}
