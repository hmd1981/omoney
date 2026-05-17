import { proxyAuth } from '../../../../../lib/auth-proxy';

export async function GET(request: Request) {
  return proxyAuth('/auth/admin/me', { method: 'GET' }, request.headers.get('cookie'));
}
