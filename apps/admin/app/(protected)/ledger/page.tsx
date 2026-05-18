import Link from 'next/link';
import { headers } from 'next/headers';
import { serverApiFetch } from '../../../lib/api';
import { formatMoney, fmtDate } from '../../../lib/admin-format';
import { StatusBadge } from '../../../components/status-badge';
import { LedgerExportButtons } from '../../../components/export-buttons';
import { CurrencyFilterSelects } from '../../../components/currency-filter-selects';

type LedgerOrder = {
  id: string;
  status: string;
  beneficiaryName: string;
  sourceAmount: string;
  targetAmount: string;
  feeAmount: string;
  createdAt: string;
  user: { id: string; email: string; profile: { firstName: string; lastName: string } | null };
  corridor: { sourceCurrency: { code: string }; targetCurrency: { code: string } };
  paymentProofs: unknown[];
};

type LedgerResponse = {
  items: LedgerOrder[];
  total: number;
  page: number;
  limit: number;
  summary: {
    orderCount: number;
    sourceVolume: number;
    targetVolume: number;
    feeVolume: number;
    completedCount: number;
    completedTargetVolume: number;
    completedFees: number;
  };
};

export default async function LedgerPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    userId?: string;
    status?: string;
    createdFrom?: string;
    createdTo?: string;
    targetCurrency?: string;
    sourceCurrency?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ?? '1';
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.userId) query.set('userId', params.userId);
  if (params.status) query.set('status', params.status);
  if (params.targetCurrency) query.set('targetCurrency', params.targetCurrency);
  if (params.sourceCurrency) query.set('sourceCurrency', params.sourceCurrency);
  if (params.createdFrom) query.set('createdFrom', params.createdFrom);
  if (params.createdTo) query.set('createdTo', params.createdTo);
  query.set('page', page);
  query.set('limit', '50');

  const cookieHeader = (await headers()).get('cookie');
  const [data, currencies] = await Promise.all([
    serverApiFetch<LedgerResponse>(`/admin/ledger?${query}`, cookieHeader),
    serverApiFetch<Array<{ code: string; name: string; symbol: string }>>('/admin/currencies', cookieHeader)
  ]);
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
  const exportQuery = query.toString();

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-5 pb-12">
      <header className="admin-page-header">
        <div>
          <p>حسابداری</p>
          <h1>دفتر روزنامه</h1>
          <span>فیلتر بر اساس ارز خرید، ارز پرداخت، تاریخ و وضعیت — خروجی Excel / PDF</span>
        </div>
        <div className="flex flex-col gap-3">
          <form className="flex flex-wrap gap-2" action="/ledger" method="get">
            <input
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="جستجو: مشتری، ذینفع، شناسه"
              className="admin-input min-w-[200px]"
            />
            <input
              name="userId"
              defaultValue={params.userId ?? ''}
              placeholder="شناسه کاربر (اختیاری)"
              className="admin-input min-w-[180px]"
            />
            <CurrencyFilterSelects
              currencies={currencies}
              targetCurrency={params.targetCurrency}
              sourceCurrency={params.sourceCurrency}
            />
            <select name="status" defaultValue={params.status ?? ''} className="admin-input">
              <option value="">همه وضعیت‌ها</option>
              {[
                'SUBMITTED',
                'WAITING_FOR_PAYMENT',
                'PAYMENT_UPLOADED',
                'UNDER_REVIEW',
                'PROCESSING',
                'COMPLETED',
                'REJECTED',
                'CANCELLED'
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input type="date" name="createdFrom" defaultValue={params.createdFrom} className="admin-input" />
            <input type="date" name="createdTo" defaultValue={params.createdTo} className="admin-input" />
            <button type="submit" className="admin-button">
              اعمال فیلتر
            </button>
          </form>
          <LedgerExportButtons searchParams={exportQuery.replace(/&?page=\d+/, '').replace(/^&/, '')} />
        </div>
      </header>

      <section className="platform-accounting-strip">
        <article className="platform-accounting-card">
          <p>تعداد ردیف (فیلتر)</p>
          <strong>{data.summary.orderCount.toLocaleString('fa-IR')}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>حجم مبدأ</p>
          <strong>{formatMoney(data.summary.sourceVolume)}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>حجم مقصد</p>
          <strong>{formatMoney(data.summary.targetVolume)}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>کارمزد</p>
          <strong>{formatMoney(data.summary.feeVolume)}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>تکمیل‌شده</p>
          <strong>
            {data.summary.completedCount.toLocaleString('fa-IR')} · {formatMoney(data.summary.completedTargetVolume)}
          </strong>
        </article>
      </section>

      <div className="admin-table-wrap ledger-table-wrap">
        <table className="admin-table ledger-table">
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>مشتری</th>
              <th>ذینفع</th>
              <th>کریدور</th>
              <th>مبدأ</th>
              <th>مقصد</th>
              <th>کارمزد</th>
              <th>وضعیت</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((order) => (
              <tr key={order.id}>
                <td>
                  <span className="ledger-date">{fmtDate.format(new Date(order.createdAt))}</span>
                  <span className="ledger-id">{order.id.slice(0, 12)}…</span>
                </td>
                <td>
                  <Link href={`/users/${order.user.id}`} className="font-medium hover:underline">
                    {order.user.profile
                      ? `${order.user.profile.firstName} ${order.user.profile.lastName}`
                      : order.user.email}
                  </Link>
                  <span className="block text-xs text-black/50">{order.user.email}</span>
                </td>
                <td>{order.beneficiaryName}</td>
                <td>
                  {order.corridor.sourceCurrency.code} → {order.corridor.targetCurrency.code}
                </td>
                <td>{formatMoney(order.sourceAmount, order.corridor.sourceCurrency.code)}</td>
                <td>{formatMoney(order.targetAmount, order.corridor.targetCurrency.code)}</td>
                <td>{formatMoney(order.feeAmount)}</td>
                <td>
                  <StatusBadge value={order.status} kind="order" />
                </td>
                <td>
                  <Link href={`/orders/${order.id}`} className="ledger-link">
                    جزئیات
                  </Link>
                </td>
              </tr>
            ))}
            {!data.items.length ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-black/55">
                  ردیفی با این فیلتر یافت نشد.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: Math.min(totalPages, 20) }, (_, i) => i + 1).map((p) => {
            const hrefQuery = new URLSearchParams(query);
            hrefQuery.set('page', String(p));
            return (
              <Link
                key={p}
                href={`/ledger?${hrefQuery}`}
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
