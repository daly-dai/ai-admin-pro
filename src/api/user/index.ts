import { createRequest } from 'src/plugins/request';
import type { PageQuery, PageResult } from 'src/types';
import type { LoginResponse, User, UserQuery } from './types';

const userApi = createRequest();

/** 登录 */
export const loginByPost = (data: { username: string; password: string }) =>
  userApi.post<LoginResponse>('/api/users/login', data);

/** 分页查询用户列表 */
export const getUserListByPost = (query: PageQuery = {}) =>
  userApi.post<PageResult<User>>('/api/users/list', query);

/** 按 ID 查用户 */
export const getUserByIdByGet = (id: number) =>
  userApi.get<User>(`/api/users/${id}`);

/** 模糊搜索用户 */
export const searchUserByPost = (query: UserQuery) =>
  userApi.post<PageResult<User>>('/api/users/search', query);

/** 新增用户 */
export const createUserByPost = (data: Partial<User>) =>
  userApi.post<string>('/api/users', data);

/** 更新用户 */
export const updateUserByPost = (data: Partial<User> & { id: number }) =>
  userApi.post<null>('/api/users/update', data);

/** 删除用户（逻辑删除） */
export const deleteUserByPost = (id: number) =>
  userApi.post<null>('/api/users/delete', { id });

/** 修改密码 */
export const changeUserPasswordByPost = (data: {
  id: number;
  oldPassword: string;
  newPassword: string;
}) => userApi.post<null>('/api/users/password', data);

/** 首次登录改密 */
export const initPasswordByPost = (data: {
  id: number;
  phone: string;
  newPassword: string;
}) => userApi.post<null>('/api/users/password/init', data);

/** 获取用户的角色 ID 列表 */
export const getUserRolesByGet = (userId: number) =>
  userApi.get<number[]>(`/api/users/${userId}/roles`);

/** 分配用户角色 */
export const assignUserRolesByPost = (userId: number, roleIds: number[]) =>
  userApi.post<null>(`/api/users/${userId}/roles`, roleIds);
