import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface User {
  id: string;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  status: string;
  createTime: string;
}

interface UserState {
  // State
  userInfo: User | null;
  token: string | null;
  permissions: string[];

  // Actions
  setUserInfo: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setPermissions: (permissions: string[]) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  setPermissionsByRoles: (roles: { permissionIds: string[] }[]) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    immer((set, get) => ({
      userInfo: null,
      token: null,
      permissions: [],

      setUserInfo: (user) => {
        set((state) => {
          state.userInfo = user;
        });
      },

      setToken: (token) => {
        set((state) => {
          state.token = token;
        });
      },

      setPermissions: (permissions) => {
        set((state) => {
          state.permissions = permissions;
        });
      },

      login: (user, token) => {
        set((state) => {
          state.userInfo = user;
          state.token = token;
        });
      },

      logout: () => {
        set((state) => {
          state.userInfo = null;
          state.token = null;
          state.permissions = [];
        });
        localStorage.removeItem('token');
      },

      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission) || permissions.includes('*');
      },

      setPermissionsByRoles: (roles) => {
        // 从 localStorage 读取权限表，将 role 的 permissionIds (ID) 解析为 code
        let permMap: Record<string, string> = {};
        try {
          const raw = localStorage.getItem('rbac-permissions');
          if (raw) {
            const perms = JSON.parse(raw) as { id: string; code: string }[];
            permMap = Object.fromEntries(perms.map((p) => [p.id, p.code]));
          }
        } catch {
          // ignore
        }
        const codes = Array.from(
          new Set(
            roles.flatMap((role) =>
              role.permissionIds.map((pid) => permMap[pid] || pid),
            ),
          ),
        );
        set((state) => {
          state.permissions = codes;
        });
      },
    })),
    {
      name: 'user-store',
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
        permissions: state.permissions,
      }),
    },
  ),
);
