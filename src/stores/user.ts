import type { User } from 'src/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userInfo: User | null;
  token: string | null;
  permissions: string[];

  setUserInfo: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setPermissions: (permissions: string[]) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userInfo: null,
      token: null,
      permissions: [],

      setUserInfo: (user) => {
        set({ userInfo: user });
      },
      setToken: (token) => {
        set({ token });
      },
      setPermissions: (permissions) => {
        set({ permissions });
      },
      login: (user, token) => {
        set({ userInfo: user, token });
      },
      logout: () => {
        set({ userInfo: null, token: null, permissions: [] });
        localStorage.removeItem('token');
      },
      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission) || permissions.includes('*');
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
      }),
    },
  ),
);
