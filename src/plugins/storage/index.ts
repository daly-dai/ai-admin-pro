/**
 * 前端存储层 — localStorage 通用 CRUD
 *
 * STORAGE_MODE = 'local'  → 读写 localStorage
 * STORAGE_MODE = 'remote' → 放行，由 axios 发到真实后端
 */

/* eslint-disable no-restricted-imports -- 存储层基础设施，需要 axios 类型 */
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
/* eslint-enable no-restricted-imports */

// ==================== 配置 ====================

/** 数据源模式：local = localStorage | remote = 后端 API */
export const STORAGE_MODE: 'local' | 'remote' = 'local';

// ==================== 类型 ====================

/** 存储实体的基础字段 */
interface BaseEntity {
  id: string;
  createTime: string;
  updateTime: string;
}

/** 分页查询参数 */
export interface StorageQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  [key: string]: unknown;
}

/** 分页返回 */
export interface StoragePageData<T> {
  dataList: T[];
  totalSize: number;
  pageNum: number;
  pageSize: number;
}

// ==================== 存储 Key ====================

const STORAGE_KEYS: Record<string, string> = {
  user: 'rbac-users',
  role: 'rbac-roles',
  permission: 'rbac-permissions',
};

// ==================== 工具函数 ====================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function readStore<T extends BaseEntity>(resource: string): T[] {
  const key = STORAGE_KEYS[resource];
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeStore<T>(resource: string, data: T[]): void {
  const key = STORAGE_KEYS[resource];
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(data));
}

/** 通用关键词匹配：搜索实体中的字符串字段 */
function matchKeyword<T extends BaseEntity>(item: T, keyword: string): boolean {
  const lower = keyword.toLowerCase();
  return Object.values(item as unknown as Record<string, unknown>).some(
    (val) => {
      if (typeof val === 'string') {
        return val.toLowerCase().includes(lower);
      }
      return false;
    },
  );
}

// ==================== CRUD ====================

/** 分页列表查询 */
export function getList<T extends BaseEntity>(
  resource: string,
  query?: StorageQuery,
): StoragePageData<T> {
  const all = readStore<T>(resource);
  const pageNum = query?.pageNum ?? 1;
  const pageSize = query?.pageSize ?? 20;

  let filtered = applyKeywordFilter(all, query?.keyword);
  filtered = applyFieldFilters(filtered, query);

  const totalSize = filtered.length;
  const start = (pageNum - 1) * pageSize;
  const dataList = filtered.slice(start, start + pageSize);

  return { dataList, totalSize, pageNum, pageSize };
}

function applyKeywordFilter<T extends BaseEntity>(
  items: T[],
  keyword?: string,
): T[] {
  const kw = keyword?.trim();
  return kw ? items.filter((item) => matchKeyword(item, kw)) : items;
}

function applyFieldFilters<T extends BaseEntity>(
  items: T[],
  query?: StorageQuery,
): T[] {
  if (!query) return items;
  const filters = { ...query };
  delete filters.pageNum;
  delete filters.pageSize;
  delete filters.keyword;

  let result = items;
  for (const [field, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      result = result.filter((item) => {
        const itemVal = (item as unknown as Record<string, unknown>)[field];
        return itemVal === value;
      });
    }
  }
  return result;
}

/** 单条查询 */
export function getById<T extends BaseEntity>(
  resource: string,
  id: string,
): T | null {
  const all = readStore<T>(resource);
  return all.find((item) => item.id === id) ?? null;
}

/** 新增 */
export function create<T extends BaseEntity>(
  resource: string,
  data: Omit<T, 'id' | 'createTime' | 'updateTime'>,
): T {
  const all = readStore<T>(resource);
  const timestamp = now();
  const entity = {
    ...data,
    id: generateId(),
    createTime: timestamp,
    updateTime: timestamp,
  } as unknown as T;

  all.push(entity);
  writeStore(resource, all);
  return entity;
}

/** 部分更新 */
export function update<T extends BaseEntity>(
  resource: string,
  id: string,
  data: Partial<Omit<T, 'id' | 'createTime'>>,
): T | null {
  const all = readStore<T>(resource);
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) return null;

  all[index] = { ...all[index], ...data, id, updateTime: now() };
  writeStore(resource, all);
  return all[index];
}

/** 删除 */
export function remove(resource: string, id: string): boolean {
  const all = readStore(resource);
  const filtered = all.filter((item) => item.id !== id);
  if (filtered.length === all.length) return false;
  writeStore(resource, filtered);
  return true;
}

// ==================== 权限树 ====================

/** 带 children 的权限节点 */
interface TreeNode extends BaseEntity {
  children?: TreeNode[];
  parentId?: string | null;
}

/** 构建权限树 */
export function buildTree<T extends TreeNode>(resource: string): T[] {
  const all = readStore<T>(resource);
  const map = new Map<string, T>();
  const roots: T[] = [];

  for (const item of all) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of map.values()) {
    const parentId = (item as unknown as { parentId?: string | null }).parentId;
    if (parentId && map.has(parentId)) {
      const parent = map.get(parentId)!;
      parent.children = parent.children ?? [];
      parent.children.push(item);
    } else {
      roots.push(item);
    }
  }

  return roots;
}

// ==================== Axios 拦截器 ====================

/**
 * 给 axios 实例注册存储拦截器。
 * 从 config.baseURL 提取 resource（如 /api/user → user），
 * 从 config.url 提取操作（'' → list, '/tree' → tree, '/{id}' → getById）。
 * 通过 config.adapter 短路 HTTP 请求。
 */
// 内部工具函数，4 个参数均为必需
// eslint-disable-next-line max-params
function resolveStorageResult(
  resource: string,
  method: string,
  idOrAction: string | undefined,
  cfg: InternalAxiosRequestConfig,
): unknown {
  if (idOrAction === 'tree' && resource === 'permission') {
    return buildTree(resource);
  }
  if (idOrAction && idOrAction !== 'tree') {
    return resolveSingleResult(resource, method, idOrAction, cfg);
  }
  return resolveCollectionResult(resource, method, cfg);
}

// 内部工具函数，4 个参数均为必需
// eslint-disable-next-line max-params
function resolveSingleResult(
  resource: string,
  method: string,
  idOrAction: string,
  cfg: InternalAxiosRequestConfig,
): unknown {
  if (method === 'get') return getById(resource, idOrAction);
  if (method === 'put') {
    const body = cfg.data ? JSON.parse(cfg.data as string) : {};
    return update(resource, idOrAction, body);
  }
  if (method === 'delete') {
    remove(resource, idOrAction);
    return null;
  }
  return null;
}

function resolveCollectionResult(
  resource: string,
  method: string,
  cfg: InternalAxiosRequestConfig,
): unknown {
  if (method === 'get') {
    return getList(resource, cfg.params as StorageQuery | undefined);
  }
  if (method === 'post') {
    const body = cfg.data ? JSON.parse(cfg.data as string) : {};
    return create(resource, body);
  }
  return null;
}

export function applyStorageInterceptor(instance: AxiosInstance): void {
  if (STORAGE_MODE !== 'local') return;

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const method = (config.method || 'get').toLowerCase();

    const baseURL = (config.baseURL || '') as string;
    const baseMatch = baseURL.match(/^\/api\/(\w+)$/);
    if (!baseMatch) return config;

    const resource = baseMatch[1];
    if (!STORAGE_KEYS[resource]) return config;

    const url = (config.url || '').replace(/^\//, '');
    const idOrAction = url || undefined;

    config.adapter = (cfg: InternalAxiosRequestConfig) => {
      try {
        const result = resolveStorageResult(resource, method, idOrAction, cfg);
        const responseData = {
          code: 200,
          data: result ?? null,
          message: 'success',
          success: true,
        };

        return Promise.resolve({
          data: responseData,
          status: 200,
          statusText: 'OK',
          headers: {} as Record<string, string>,
          config: cfg,
          request: {},
        } as AxiosResponse);
      } catch (err) {
        return Promise.reject(err);
      }
    };

    return config;
  });
}
