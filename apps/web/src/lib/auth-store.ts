'use client';

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
  globalRole?: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role?: string;
}

interface AuthStore {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  workspaces: [],
  activeWorkspace: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setAccessToken: (token) => set({ accessToken: token }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  logout: () =>
    set({
      user: null,
      workspaces: [],
      activeWorkspace: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}));
