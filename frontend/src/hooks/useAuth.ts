'use client';

import { useEffect, useState } from 'react';
import { hasValidAccessToken } from '@/lib/jwt';

/**
 * Hook to check if user is authenticated
 * Reactive to localStorage changes and storage events
 * Validates that the access token exists and is not expired
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const isValid = hasValidAccessToken();
        setIsAuthenticated(isValid);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (e.g., from other tabs/windows or logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      // If accessToken was removed or changed, update auth state
      if (e.key === 'accessToken' || e.key === null) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isAuthenticated, isLoading };
}
