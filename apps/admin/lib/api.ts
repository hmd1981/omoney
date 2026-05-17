export const publicApiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Server-side only: Docker internal network */
export const serverApiBase =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Browser auth calls — same-origin BFF avoids cross-subdomain cookie issues */
export const authApiBase = '/api/auth';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

type FetchOptions = RequestInit & { token?: string };

export async function apiFetch<T>(path: string, init?: FetchOptions): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.token) headers.set('Authorization', `Bearer ${init.token}`);
  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${publicApiBase}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store'
  });
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${authApiBase}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store'
  });
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function serverApiFetch<T>(path: string, cookieHeader?: string | null): Promise<T> {
  const response = await fetch(`${serverApiBase}${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: 'no-store'
  });
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText, response.status);
  }
  return response.json() as Promise<T>;
}
