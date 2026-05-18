import Link from 'next/link';
import { headers } from 'next/headers';
import { serverApiFetch } from '../../../lib/api';
import { formatMoney, fmtDate } from '../../../lib/admin-format';
import { StatusBadge } from '../../../components/status-badge';
import { CurrencyFilterSelects } from '../../../components/currency-filter-selects';

type Order = {
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
type Response = { items: Order[]; total: number; page: number; limit: number };

export default async function OrdersPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    createdFrom?: string;
    createdTo?: string;
    targetCurrency?: string;
    sourceCurrency?: string;
  }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.status) query.set('status', params.status);
  if (params.targetCurrency) query.set('targetCurrency', params.targetCurrency);
  if (params.sourceCurrency) query.set('sourceCurrency', params.sourceCurrency);
  if (params.createdFrom) query.set('createdFrom', params.createdFrom);
  if (params.createdTo) query.set('createdTo', params.createdTo);
  const cookieHeader = (await headers()).get('cookie');
  const [data, currencies] = await Promise.all([
    serverApiFetch<Response>(`/admin/orders?${query}`, cookieHeader),
    serverApiFetch<Array<{ code: string; name: string; symbol: string }>>('/admin/currencies', cookieHeader)
  ]);

  const pageTotals = data.items.reduce(
    (acc, order) => {
      acc.source += Number(order.sourceAmount);
      acc.target += Number(order.targetAmount);
      acc.fees += Number(order.feeAmount);
      return acc;
    },
    { source: 0, target: 0, fees: 0 }
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-5 pb-10">
      <header className="admin-page-header">
        <div>
          <p>دفتر مرکزی حواله</p>
          <h1>تراکنش‌ها و سفارش‌ها</h1>
          <span>{data.total.toLocaleString('fa-IR')} سفارش — شفاف‌سازی مالی تمام مشتریان</span>
        </div>
        <form className="flex flex-wrap gap-2" action="/orders">
          <input name="q" defaultValue={params.q} placeholder="ذینفع یا ایمیل مشتری" className="admin-input" />
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
            فیلتر
          </button>
        </form>
      </header>

      <section className="platform-accounting-strip">
        <article className="platform-accounting-card">
          <p>جمع مبدأ (صفحه)</p>
          <strong>{formatMoney(pageTotals.source)}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>جمع مقصد (صفحه)</p>
          <strong>{formatMoney(pageTotals.target)}</strong>
        </article>
        <article className="platform-accounting-card">
          <p>جمع کارمزد (صفحه)</p>
          <strong>{formatMoney(pageTotals.fees)}</strong>
        </article>
      </section>

      <div className="admin-table-wrap ledger-table-wrap">
        <table className="admin-table ledger-table">
          <thead>
            <tr>
              <th>سفارش / ذینفع</th>
              <th>حساب مشتری</th>
              <th>کریدور</th>
              <th>مبدأ</th>
              <th>مقصد</th>
              <th>کارمزد</th>
              <th>وضعیت</th>
              <th>رسید</th>
              <th>تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/orders/${order.id}`} className="font-semibold hover:underline">
                    {order.beneficiaryName}
                  </Link>
                  <span className="ledger-id">{order.id.slice(0, 12)}…</span>
                </td>
                <td>
                  <Link href={`/users/${order.user.id}`} className="hover:underline">
                    {order.user.profile
                      ? `${order.user.profile.firstName} ${order.user.profile.lastName}`
                      : order.user.email}
                  </Link>
                  <span className="block text-xs text-black/50">{order.user.email}</span>
                </td>
                <td>
                  {order.corridor.sourceCurrency.code} → {order.corridor.targetCurrency.code}
                </td>
                <td>{formatMoney(order.sourceAmount, order.corridor.sourceCurrency.code)}</td>
                <td>{formatMoney(order.targetAmount, order.corridor.targetCurrency.code)}</td>
                <td>{formatMoney(order.feeAmount)}</td>
                <td>
                  <StatusBadge value={order.status} kind="order" />
                </td>
                <td>{order.paymentProofs.length ? `${order.paymentProofs.length}` : '—'}</td>
                <td>{fmtDate.format(new Date(order.createdAt))}</td>
              </tr>
            ))}
            {!data.items.length ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-black/55">
                  سفارشی یافت نشد.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
