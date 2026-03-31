'use client';

import { useAuthStore } from '@/lib/auth-store';

export function useAuth() {
  return useAuthStore();
}
