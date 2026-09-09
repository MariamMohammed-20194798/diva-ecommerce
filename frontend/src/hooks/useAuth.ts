'use client';

import { useEffect, useState } from 'react';
import { AUTH_CHANGED_EVENT } from '@/lib/auth-storage';
import { restoreSession } from '@/lib/auth-session';
import { hasValidAccessToken } from '@/lib/jwt';

/**
 * Hook to check if user is authenticated.
 * Same-tab updates come from AUTH_CHANGED_EVENT (storage events only fire across tabs).
 * Expired access tokens are restored via the httpOnly refresh cookie when present.
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const syncAuth = () => {
      if (cancelled) {
        return;
      }
      setIsAuthenticated(hasValidAccessToken());
      setIsLoading(false);
    };

    const bootstrap = async () => {
      await restoreSession();
      syncAuth();
    };

    void bootstrap();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === null) {
        syncAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
    };
  }, []);

  return { isAuthenticated, isLoading };
}
