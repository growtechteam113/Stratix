'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import apiClient from '@/lib/api-client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setWorkspaces, setActiveWorkspace, setAccessToken, setIsLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('accessToken');

        if (token) {
          setAccessToken(token);

          try {
            // Verify token is still valid
            const response = await apiClient.get('/auth/me');
            const { user, workspaces } = response.data.data;

            setUser(user);
            setWorkspaces(workspaces);
            if (workspaces.length > 0) {
              setActiveWorkspace(workspaces[0]);
            }
          } catch (error) {
            // Token is invalid, clear it
            localStorage.removeItem('accessToken');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return <>{children}</>;
}
