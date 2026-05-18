import Link from 'next/link';
import { headers } from 'next/headers';
import { serverApiFetch } from '../../../lib/api';
import type { UserAccountSummary } from '../../../lib/account-types';
import { formatMoney, fmtDateShort } from '../../../lib/admin-format';
import { StatusBadge } from '../../../components/status-badge';

type UserRow = {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  profile: { firstName: string; lastName: string; country: string } | null;
  _count: { orders: number; kycDocuments: number; sessions: number };
  accountSummary: UserAccountSummary;
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

  const totals = data.items.reduce(
    (acc, user) => {
      acc.orders += user.accountSummary.totalOrders;
      acc.completed += user.accountSummary.completedTargetVolume;
      acc.fees += user.accountSummary.completedFees;
      acc.open += user.accountSummary.openTargetExposure;
      return acc;
    },
    { orders: 0, completed: 0, fees: 0, open: 0 }
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-5 pb-10">
      <header className="admin-page-header">
        <div>
          <p>حسابداری مشتریان</p>
          <h1>حساب‌های مشتری</h1>
          <span>{data.total.toLocaleString('fa-IR')} حساب ثبت‌شده — هر ردیف یک پرونده مالی کامل است</span>
        </div>
        <form className="flex flex-wrap gap-2" action="/users" method="get">
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="جستجو: ایمیل، موبایل، نام"
            className="admin-input min-w-[220px]"
          />
          <select name="status" defaultValue={params.status ?? ''} className="admin-input">
            <option value="">همه وضعیت‌ها</option>
            <option value="ACTIVE">فعال</option>
            <option value="SUSPENDED">مسدود</option>
            <option value="PENDING_VERIFICATION">در انتظار تأیید</option>
          </select>
          <button type="submit" className="admin-button">
            فیلتر
          </button>
        </form>
      </header>

      <section className="platform-accounting-strip">
        <article className="platform-accounting-card">
          <p>جمع سفارش (صفحه جاری)</p>
          <strong>{totals.orders.toLocaleString('fa-IR')}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>حجم تکمیل (صفحه)</p>
          <strong>{formatMoney(totals.completed)}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>کارمزد تکمیل (صفحه)</p>
          <strong>{formatMoney(totals.fees)}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>تعهد باز (صفحه)</p>
          <strong>{formatMoney(totals.open)}</strong>
        </article>
      </section>

      <div className="admin-table-wrap ledger-table-wrap">
        <table className="admin-table ledger-table">
          <thead>
            <tr>
              <th>مشتری / حساب</th>
              <th>وضعیت</th>
              <th>سفارش</th>
              <th>تکمیل / باز</th>
              <th>حجم تکمیل</th>
              <th>کارمزد</th>
              <th>تعهد باز</th>
              <th>KYC</th>
              <th>عضویت</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((user) => (
              <tr key={user.id}>
                <td>
                  <Link href={`/users/${user.id}`} className="font-semibold hover:underline">
                    {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                  </Link>
                  <p className="text-xs text-black/55">{user.email}</p>
                  {user.phone ? <p className="text-xs text-black/55">{user.phone}</p> : null}
                  <p className="text-xs text-black/45">{user.profile?.country ?? '—'}</p>
                </td>
                <td>
                  <StatusBadge value={user.status} kind="user" />
                </td>
                <td>{user.accountSummary.totalOrders.toLocaleString('fa-IR')}</td>
                <td>
                  <span className="block">{user.accountSummary.completedOrders} تکمیل</span>
                  <span className="text-xs text-black/50">{user.accountSummary.openOrders} باز</span>
                </td>
                <td>{formatMoney(user.accountSummary.completedTargetVolume)}</td>
                <td>{formatMoney(user.accountSummary.completedFees)}</td>
                <td>{formatMoney(user.accountSummary.openTargetExposure)}</td>
                <td>
                  {user.accountSummary.kycPending > 0 ? (
                    <span className="text-amber-800">{user.accountSummary.kycPending} معلق</span>
                  ) : (
                    <span className="text-black/50">{user.accountSummary.kycApproved} تأیید</span>
                  )}
                </td>
                <td>{fmtDateShort.format(new Date(user.createdAt))}</td>
              </tr>
            ))}
            {!data.items.length ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-black/55">
                  مشتری‌ای یافت نشد.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const hrefQuery = new URLSearchParams(query);
            hrefQuery.set('page', String(p));
            return (
              <Link
                key={p}
                href={`/users?${hrefQuery}`}
                className={`rounded px-3 py-1 text-sm ${p === data.page ? 'bg-[#11221f] text-white' : 'border bg-white'}`}
              >
                {p.toLocaleString('fa-IR')}
              </Link>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
