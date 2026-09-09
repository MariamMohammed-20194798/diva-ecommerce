import api from '@/lib/api';
import { clearAccessToken, persistAccessToken, ACCESS_TOKEN_KEY } from '@/lib/auth-storage';
import { hasValidAccessToken } from '@/lib/jwt';

let inFlightRestore: Promise<boolean> | null = null;

/**
 * Restores an authenticated session from a still-valid access token,
 * or by rotating the httpOnly refresh cookie when the access token is expired.
 *
 * By default this only attempts refresh when an access token is already stored,
 * so anonymous page loads do not hit /auth/refresh.
 *
 * Concurrent callers share one in-flight request so refresh-token rotation
 * cannot race against itself (Header + Account both bootstrap on load).
 */
export async function restoreSession(options?: {
  forceRefresh?: boolean;
}): Promise<boolean> {
  if (inFlightRestore) {
    const result = await inFlightRestore;
    if (result || !options?.forceRefresh) {
      return result;
    }
  }

  inFlightRestore = restoreSessionInternal(options).finally(() => {
    inFlightRestore = null;
  });

  return inFlightRestore;
}

async function restoreSessionInternal(options?: {
  forceRefresh?: boolean;
}): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  if (hasValidAccessToken()) {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    return true;
  }

  const existing = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!existing && !options?.forceRefresh) {
    return false;
  }

  try {
    const response = await api.post('/auth/refresh');
    const accessToken = response.data?.accessToken as string | undefined;
    if (!accessToken) {
      clearAccessToken();
      delete api.defaults.headers.common.Authorization;
      return false;
    }

    persistAccessToken(accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return true;
  } catch {
    clearAccessToken();
    delete api.defaults.headers.common.Authorization;
    return false;
  }
}
