import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const ACCESS_TOKEN_KEY = 'omoney_access_token';
export const REFRESH_TOKEN_KEY = 'omoney_refresh_token';
export const AUTH_CHANGE_EVENT = 'omoney-auth-change';

export function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function hasAuthToken() {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
}

export async function logoutUser(locale: 'fa' | 'en', router: AppRouterInstance) {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) {
    await fetch(`${apiBase}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(refreshToken ? { refreshToken } : {})
    });
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifyAuthChange();
  router.replace(`/${locale}/login`);
  router.refresh();
}
