import { createRequest } from 'src/plugins/request';
import type { PageData } from 'src/types';
import type { User, UserFormData, UserQuery } from './types';

const userApi = createRequest({ prefix: '/api/user' });

export const getUserListByGet = (params?: UserQuery) =>
  userApi.get<PageData<User>>('', { params });

export const getUserByIdByGet = (id: string) => userApi.get<User>(`/${id}`);

export const createUserByPost = (data: UserFormData) =>
  userApi.post<User>('', data);

export const updateUserByPut = (id: string, data: Partial<UserFormData>) =>
  userApi.put<User>(`/${id}`, data);

export const deleteUserByDelete = (id: string) => userApi.delete(`/${id}`);
