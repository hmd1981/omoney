import Link from 'next/link';
import { headers } from 'next/headers';
import { serverApiFetch } from '../../../lib/api';

type UserRow = {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  profile: { firstName: string; lastName: string; country: string } | null;
  _count: { orders: number; kycDocuments: number; sessions: number };
};

type UsersResponse = {
  items: UserRow[];
  total: number;
  page: number;
  limit: number;
};

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ?? '1';
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.status) query.set('status', params.status);
  query.set('page', page);
  const cookieHeader = (await headers()).get('cookie');
  const data = await serverApiFetch<UsersResponse>(`/admin/users?${query}`, cookieHeader);
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <main className="mx-auto max-w-7xl p-5">
      <header className="flex flex-col gap-4 border-b border-black/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-black/60">Customers</p>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-black/60">{data.total} total</p>
        </div>
        <form className="flex flex-wrap gap-2" action="/users" method="get">
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Search email, phone, name"
            className="rounded-md border bg-white px-3 py-2"
          />
          <select name="status" defaultValue={params.status ?? ''} className="rounded-md border bg-white px-3 py-2">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending account approval</option>
          </select>
          <button type="submit" className="rounded-md bg-[#11221f] px-4 py-2 text-white">
            Filter
          </button>
        </form>
      </header>
      <div className="mt-6 overflow-x-auto rounded-md border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-black/[0.03]">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">KYC docs</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/users/${user.id}`} className="font-medium hover:underline">
                    {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                  </Link>
                  <p className="text-black/60">{user.email}</p>
                  {user.phone ? <p className="text-black/60">{user.phone}</p> : null}
                </td>
                <td className="px-4 py-3">{user.status}</td>
                <td className="px-4 py-3">{user.profile?.country ?? '—'}</td>
                <td className="px-4 py-3">{user._count.orders}</td>
                <td className="px-4 py-3">{user._count.kycDocuments}</td>
                <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!data.items.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-black/60">
                  No users found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="mt-4 flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const hrefQuery = new URLSearchParams(query);
            hrefQuery.set('page', String(p));
            return (
              <Link
                key={p}
                href={`/users?${hrefQuery}`}
                className={`rounded px-3 py-1 ${p === data.page ? 'bg-[#11221f] text-white' : 'bg-white border'}`}
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
