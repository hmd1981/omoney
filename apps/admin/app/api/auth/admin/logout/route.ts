import { proxyAuth } from '../../../../../lib/auth-proxy';

export async function POST(request: Request) {
  return proxyAuth('/auth/admin/logout', { method: 'POST' }, request.headers.get('cookie'));
}
