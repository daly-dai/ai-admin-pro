import { createRequest } from 'src/plugins/request';
import type { PageQuery, PageResult } from 'src/types';
import type { Role, RoleFormData, RoleQuery } from './types';

const api = createRequest();

/** 分页查询role列表 */
export const getRoleListByPost = (query: PageQuery = {}) =>
  api.post<PageResult<Role>>('/api/roles/list', query);

/** 模糊搜索role */
export const searchRoleByPost = (query: RoleQuery) =>
  api.post<PageResult<Role>>('/api/roles/search', query);

/** 按 ID 查role */
export const getRoleByIdByGet = (id: number) =>
  api.get<Role>(`/api/roles/${id}`);

/** 新增role */
export const createRoleByPost = (data: RoleFormData) =>
  api.post<null>('/api/roles', data);

/** 更新role */
export const updateRoleByPost = (data: RoleFormData & { id: number }) =>
  api.post<null>('/api/roles/update', data);

/** 删除role */
export const deleteRoleByPost = (id: number) =>
  api.post<null>('/api/roles/delete', { id });

/** 获取角色的权限 ID 列表 */
export const getRolePermissionsByGet = (roleId: number) =>
  api.get<number[]>(`/api/roles/${roleId}/permissions`);

/** 分配角色权限 */
export const assignRolePermissionsByPost = (
  roleId: number,
  permIds: number[],
) => api.post<null>(`/api/roles/${roleId}/permissions`, permIds);
