import { createRequest } from 'src/plugins/request';
import type { User, UserQuery } from './types';

const userApi = createRequest();

/** 登录 */
export const loginByPost = (data: { username: string; password: string }) =>
  userApi.post<User>('/api/users/login', data);

/** 查询全部 */
export const getListByGet = () => userApi.get<User[]>('/api/users');

/** 按 ID 查 */
export const getByIdByGet = (id: number) =>
  userApi.get<User>(`/api/users/${id}`);

/** 模糊搜索 */
export const searchByGet = (query: UserQuery) =>
  userApi.post<User[]>('/api/users/search', query);

/** 新增 */
export const createByPost = (data: Partial<User>) =>
  userApi.post<null>('/api/users', data);

/** 更新 */
export const updateByPost = (data: Partial<User> & { id: number }) =>
  userApi.post<null>('/api/users/update', data);

/** 删除 */
export const deleteByPost = (id: number) =>
  userApi.post<null>('/api/users/delete', { id });

/** 修改密码 */
export const changePasswordByPost = (data: {
  id: number;
  oldPassword: string;
  newPassword: string;
}) => userApi.post<null>('/api/users/password', data);
