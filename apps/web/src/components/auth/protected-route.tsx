'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import apiClient from '@/lib/api-client';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser, setWorkspaces, setActiveWorkspace, setAccessToken, setIsLoading, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have an access token in localStorage
      const token = localStorage.getItem('accessToken');

      if (!token && !isAuthenticated) {
        router.push('/signin');
        return;
      }

      if (token && !user) {
        setAccessToken(token);
        try {
          const response = await apiClient.get('/auth/me');
          const { user: userData, workspaces } = response.data.data;

          setUser(userData);
          setWorkspaces(workspaces);
          if (workspaces.length > 0) {
            setActiveWorkspace(workspaces[0]);
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          router.push('/signin');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
