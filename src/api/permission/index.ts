import { createRequest } from 'src/plugins/request';
import type { PageQuery, PageResult } from 'src/types';
import type { Permission, PermissionFormData, PermissionQuery } from './types';

const permApi = createRequest();

/** 分页查询权限列表 */
export const getPermListByPost = (query: PageQuery = {}) =>
  permApi.post<PageResult<Permission>>('/api/permissions/list', query);

/** 模糊搜索权限 */
export const searchPermByPost = (query: PermissionQuery) =>
  permApi.post<PageResult<Permission>>('/api/permissions/search', query);

/** 按 ID 查权限 */
export const getPermByIdByGet = (id: number) =>
  permApi.get<Permission>(`/api/permissions/${id}`);

/** 查子权限（树形） */
export const getPermChildrenByPost = (parentId: number) =>
  permApi.post<Permission[]>('/api/permissions/children', { parentId });

/** 新增权限 */
export const createPermByPost = (data: PermissionFormData) =>
  permApi.post<null>('/api/permissions', data);

/** 更新权限 */
export const updatePermByPost = (data: PermissionFormData & { id: number }) =>
  permApi.post<null>('/api/permissions/update', data);

/** 删除权限（级联删除子权限） */
export const deletePermByPost = (id: number) =>
  permApi.post<null>('/api/permissions/delete', { id });
