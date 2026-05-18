import { serverApiBase } from '../../../../../lib/api';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const upstream = await fetch(`${serverApiBase}/admin/ledger/export?${url.searchParams.toString()}`, {
    headers: { cookie: request.headers.get('cookie') ?? '' },
    cache: 'no-store'
  });
  if (!upstream.ok) {
    return new Response(await upstream.text(), { status: upstream.status });
  }
  const buffer = await upstream.arrayBuffer();
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition': upstream.headers.get('content-disposition') ?? 'attachment'
    }
  });
}
