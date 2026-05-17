import { NextResponse } from 'next/server';
import { serverApiBase } from './api';

export async function proxyAuth(
  path: string,
  init: RequestInit,
  requestCookies?: string | null
) {
  const headers = new Headers(init.headers);
  if (requestCookies) headers.set('cookie', requestCookies);

  const upstream = await fetch(`${serverApiBase}${path}`, {
    ...init,
    headers,
    cache: 'no-store'
  });

  const body = await upstream.text();
  const response = new NextResponse(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json'
    }
  });

  const setCookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : upstream.headers.get('set-cookie')
        ? [upstream.headers.get('set-cookie')!]
        : [];

  for (const cookie of setCookies) {
    response.headers.append('Set-Cookie', cookie);
  }

  return response;
}
