import { createRequest } from 'src/plugins/request';
import type { PageData } from 'src/types';
import type { Role, RoleFormData, RoleQuery } from './types';

const roleApi = createRequest({ prefix: '/api/role' });

export const getRoleListByGet = (params?: RoleQuery) =>
  roleApi.get<PageData<Role>>('', { params });

export const getRoleByIdByGet = (id: string) => roleApi.get<Role>(`/${id}`);

export const createRoleByPost = (data: RoleFormData) =>
  roleApi.post<Role>('', data);

export const updateRoleByPut = (id: string, data: Partial<RoleFormData>) =>
  roleApi.put<Role>(`/${id}`, data);

export const deleteRoleByDelete = (id: string) => roleApi.delete(`/${id}`);
