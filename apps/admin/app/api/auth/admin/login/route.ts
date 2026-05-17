import { proxyAuth } from '../../../../../lib/auth-proxy';

export async function POST(request: Request) {
  const body = await request.text();
  return proxyAuth('/auth/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
}
