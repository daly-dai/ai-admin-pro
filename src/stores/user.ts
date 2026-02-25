import type { User } from 'src/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

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
    })),
    {
      name: 'user-store',
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
      }),
    },
  ),
);
