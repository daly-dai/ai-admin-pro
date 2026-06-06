/**
 * 种子数据 — 系统首次加载时自动写入 localStorage
 *
 * 通过 INIT_FLAG 标记判断是否已初始化，保证幂等。
 */

const INIT_FLAG = 'rbac-seed-initialized';

// ==================== 内联类型（API 模块未建立前临时使用） ====================

interface SeedPermission {
  id: string;
  code: string;
  name: string;
  type: 'menu' | 'button' | 'api';
  parentId: string | null;
  sort: number;
  status: number;
  description: string;
  createTime: string;
  updateTime: string;
}

interface SeedRole {
  id: string;
  code: string;
  name: string;
  description: string;
  status: number;
  permissionIds: string[];
  createTime: string;
  updateTime: string;
}

interface SeedUser {
  id: string;
  username: string;
  password: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  status: number;
  roleIds: string[];
  remark: string;
  createTime: string;
  updateTime: string;
}

// ==================== 预置权限点（14 个） ====================

const SEED_PERMISSIONS: SeedPermission[] = [
  {
    id: 'p-100',
    code: 'sys',
    name: '系统管理',
    type: 'menu',
    parentId: null,
    sort: 1,
    status: 1,
    description: '系统管理顶级菜单',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-101',
    code: 'user-mgmt',
    name: '用户管理',
    type: 'menu',
    parentId: 'p-100',
    sort: 1,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-001',
    code: 'user:list',
    name: '查看用户列表',
    type: 'menu',
    parentId: 'p-101',
    sort: 1,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-002',
    code: 'user:create',
    name: '新增用户',
    type: 'button',
    parentId: 'p-101',
    sort: 2,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-003',
    code: 'user:update',
    name: '编辑用户',
    type: 'button',
    parentId: 'p-101',
    sort: 3,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-004',
    code: 'user:delete',
    name: '删除用户',
    type: 'button',
    parentId: 'p-101',
    sort: 4,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-005',
    code: 'user:detail',
    name: '查看用户详情',
    type: 'button',
    parentId: 'p-101',
    sort: 5,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-102',
    code: 'role-mgmt',
    name: '角色管理',
    type: 'menu',
    parentId: 'p-100',
    sort: 2,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-006',
    code: 'role:list',
    name: '查看角色列表',
    type: 'menu',
    parentId: 'p-102',
    sort: 1,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-007',
    code: 'role:create',
    name: '新增角色',
    type: 'button',
    parentId: 'p-102',
    sort: 2,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-008',
    code: 'role:update',
    name: '编辑角色',
    type: 'button',
    parentId: 'p-102',
    sort: 3,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-009',
    code: 'role:delete',
    name: '删除角色',
    type: 'button',
    parentId: 'p-102',
    sort: 4,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-010',
    code: 'role:perm',
    name: '分配角色权限',
    type: 'button',
    parentId: 'p-102',
    sort: 5,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-103',
    code: 'perm-mgmt',
    name: '权限管理',
    type: 'menu',
    parentId: 'p-100',
    sort: 3,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-011',
    code: 'perm:list',
    name: '查看权限列表',
    type: 'menu',
    parentId: 'p-103',
    sort: 1,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-012',
    code: 'perm:create',
    name: '新增权限点',
    type: 'button',
    parentId: 'p-103',
    sort: 2,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-013',
    code: 'perm:update',
    name: '编辑权限点',
    type: 'button',
    parentId: 'p-103',
    sort: 3,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
  {
    id: 'p-014',
    code: 'perm:delete',
    name: '删除权限点',
    type: 'button',
    parentId: 'p-103',
    sort: 4,
    status: 1,
    description: '',
    createTime: '',
    updateTime: '',
  },
];

// ==================== 预置角色（3 个） ====================

const SEED_ROLES: SeedRole[] = [
  {
    id: 'r-001',
    code: 'SUPER_ADMIN',
    name: '超级管理员',
    description: '拥有系统全部权限',
    status: 1,
    permissionIds: SEED_PERMISSIONS.map((p) => p.id),
    createTime: '',
    updateTime: '',
  },
  {
    id: 'r-002',
    code: 'ADMIN',
    name: '管理员',
    description: '日常运维管理',
    status: 1,
    permissionIds: [
      'p-001',
      'p-002',
      'p-003',
      'p-004',
      'p-005',
      'p-006',
      'p-007',
      'p-008',
      'p-009',
      'p-010',
    ],
    createTime: '',
    updateTime: '',
  },
  {
    id: 'r-003',
    code: 'VIEWER',
    name: '只读用户',
    description: '仅查看权限',
    status: 1,
    permissionIds: ['p-001', 'p-005', 'p-006', 'p-011'],
    createTime: '',
    updateTime: '',
  },
];

// ==================== 预置用户（1 个） ====================

const SEED_USERS: SeedUser[] = [
  {
    id: 'u-001',
    username: 'admin',
    password: 'admin123',
    nickname: '超级管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: '',
    status: 1,
    roleIds: ['r-001'],
    remark: '系统内置',
    createTime: '',
    updateTime: '',
  },
];

// ==================== 初始化 ====================

export function initSeedData(): void {
  if (localStorage.getItem(INIT_FLAG)) return;

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const stamp = <T extends { createTime: string; updateTime: string }>(
    items: T[],
  ): T[] =>
    items.map((item) => ({ ...item, createTime: now, updateTime: now }));

  localStorage.setItem(
    'rbac-permissions',
    JSON.stringify(stamp(SEED_PERMISSIONS)),
  );
  localStorage.setItem('rbac-roles', JSON.stringify(stamp(SEED_ROLES)));
  localStorage.setItem('rbac-users', JSON.stringify(stamp(SEED_USERS)));

  localStorage.setItem(INIT_FLAG, '1');
}
