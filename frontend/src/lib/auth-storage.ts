export const ACCESS_TOKEN_KEY = 'accessToken';
export const AUTH_CHANGED_EVENT = 'diva:auth-changed';

function notifyAuthChanged() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function persistAccessToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  notifyAuthChanged();
}

export function clearAccessToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  notifyAuthChanged();
}
