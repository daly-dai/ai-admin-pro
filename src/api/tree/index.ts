import { createRequest } from 'src/plugins/request';
import type { PageResult } from 'src/types';
import type { Tree, TreeFormData, TreeQuery } from './types';

const treeApi = createRequest();

/** 分页查询古树档案 */
export const getTreeListByPost = (query: TreeQuery = {}) =>
  treeApi.post<PageResult<Tree>>('/api/trees/list', query);

/** 按 ID 查询古树档案 */
export const getTreeByIdByGet = (id: number) =>
  treeApi.get<Tree>(`/api/trees/${id}`);

/** 新增古树档案 */
export const createTreeByPost = (data: TreeFormData) =>
  treeApi.post<null>('/api/trees', data);

/** 更新古树档案 */
export const updateTreeByPost = (data: TreeFormData & { id: number }) =>
  treeApi.post<null>('/api/trees/update', data);

/** 删除古树档案（逻辑删除） */
export const deleteTreeByPost = (id: number) =>
  treeApi.post<null>('/api/trees/delete', { id });
