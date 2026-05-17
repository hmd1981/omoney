import { headers } from 'next/headers';
import Link from 'next/link';
import { serverApiFetch } from '../../../lib/api';
import { RevokeSessionButton } from './revoke-session-button';

type SessionRow = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    phone: string | null;
    profile: { firstName: string; lastName: string } | null;
  };
};

type SessionsResponse = {
  items: SessionRow[];
  total: number;
  page: number;
  limit: number;
};

export default async function SessionsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  query.set('page', params.page ?? '1');
  const cookieHeader = (await headers()).get('cookie');
  const data = await serverApiFetch<SessionsResponse>(`/admin/sessions?${query}`, cookieHeader);
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <main className="mx-auto max-w-7xl p-5">
      <header className="flex flex-col gap-4 border-b border-black/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-black/60">Security</p>
          <h1 className="text-2xl font-semibold">Login sessions</h1>
          <p className="text-sm text-black/60">{data.total} sessions · revoke forces re-login</p>
        </div>
        <form className="flex gap-2" action="/sessions" method="get">
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Search user email or phone"
            className="rounded-md border bg-white px-3 py-2"
          />
          <button type="submit" className="rounded-md bg-[#11221f] px-4 py-2 text-white">
            Search
          </button>
        </form>
      </header>
      <div className="mt-6 space-y-3">
        {data.items.map((session) => (
          <article key={session.id} className="rounded-md border bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <Link href={`/users/${session.user.id}`} className="font-medium hover:underline">
                  {session.user.profile
                    ? `${session.user.profile.firstName} ${session.user.profile.lastName}`
                    : session.user.email}
                </Link>
                <p className="text-sm text-black/60">{session.user.email}</p>
                <p className="mt-2 text-sm">
                  <span className="text-black/60">IP:</span> {session.ipAddress ?? '—'}
                </p>
                <p className="text-sm text-black/60 break-all">{session.userAgent ?? '—'}</p>
                <p className="mt-2 text-sm">
                  Started {new Date(session.createdAt).toLocaleString()} · expires{' '}
                  {new Date(session.expiresAt).toLocaleString()}
                </p>
                <p className="text-sm font-medium">
                  {session.revokedAt ? `Revoked ${new Date(session.revokedAt).toLocaleString()}` : 'Active'}
                </p>
              </div>
              {!session.revokedAt ? <RevokeSessionButton sessionId={session.id} /> : null}
            </div>
          </article>
        ))}
        {!data.items.length ? <p className="text-black/60">No sessions found.</p> : null}
      </div>
      {totalPages > 1 ? (
        <div className="mt-4 flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const hrefQuery = new URLSearchParams(query);
            hrefQuery.set('page', String(p));
            return (
              <Link
                key={p}
                href={`/sessions?${hrefQuery}`}
                className={`rounded px-3 py-1 ${p === data.page ? 'bg-[#11221f] text-white' : 'border bg-white'}`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
