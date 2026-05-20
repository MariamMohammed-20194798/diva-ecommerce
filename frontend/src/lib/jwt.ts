/**
 * JWT Token utilities for the frontend
 * Handles token validation, decoding, and expiry checks
 */

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Safely decode and validate a JWT token without verifying the signature
 * (signature is verified by the backend)
 */
export function decodeJWT(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired
 * Returns true if token is expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // Add 60 second buffer to refresh before actual expiry
  const expiryTime = (payload.exp - 60) * 1000;
  return Date.now() >= expiryTime;
}

/**
 * Get time until token expires in seconds
 */
export function getTokenExpiryTime(token: string): number {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  return payload.exp - Math.floor(Date.now() / 1000);
}

/**
 * Check if user has a valid, non-expired access token
 */
export function hasValidAccessToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = window.localStorage.getItem('accessToken');
  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}
