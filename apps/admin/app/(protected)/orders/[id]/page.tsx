import Link from 'next/link';
import { headers } from 'next/headers';
import { serverApiFetch } from '../../../../lib/api';
import { formatMoney, fmtDate, orderStatusFa } from '../../../../lib/admin-format';
import { StatusBadge } from '../../../../components/status-badge';
import { OrderStatusForm } from './order-status-form';
import { OrderNoteForm } from './order-note-form';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await serverApiFetch<any>(`/admin/orders/${id}`, (await headers()).get('cookie'));

  return (
    <main className="mx-auto grid max-w-7xl gap-5 p-5 pb-12 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <section className="admin-panel">
          <Link href="/orders" className="text-sm text-black/60 hover:underline">
            ← بازگشت به دفتر تراکنش‌ها
          </Link>
          <p className="mt-2 text-xs text-black/45 font-mono">{order.id}</p>
          <h1 className="mt-2 text-2xl font-semibold">{order.beneficiaryName}</h1>
          <p className="text-black/60">
            مشتری:{' '}
            <Link href={`/users/${order.user.id}`} className="font-medium text-[#11221f] hover:underline">
              {order.user.profile
                ? `${order.user.profile.firstName} ${order.user.profile.lastName}`
                : order.user.email}
            </Link>
          </p>
          <div className="mt-3">
            <StatusBadge value={order.status} kind="order" />
          </div>
        </section>

        <section className="admin-panel">
          <h2 className="section-title">صورت‌حساب این حواله</h2>
          <div className="account-kv mt-4">
            <div>
              <dt>کریدور</dt>
              <dd>
                {order.corridor.sourceCurrency.code} → {order.corridor.targetCurrency.code}
              </dd>
            </div>
            <div>
              <dt>مبلغ مبدأ</dt>
              <dd>{formatMoney(order.sourceAmount, order.corridor.sourceCurrency.code)}</dd>
            </div>
            <div>
              <dt>مبلغ مقصد</dt>
              <dd>{formatMoney(order.targetAmount, order.corridor.targetCurrency.code)}</dd>
            </div>
            <div>
              <dt>کارمزد</dt>
              <dd>{formatMoney(order.feeAmount)}</dd>
            </div>
            <div>
              <dt>وضعیت</dt>
              <dd>{orderStatusFa[order.status] ?? order.status}</dd>
            </div>
            <div>
              <dt>ثبت</dt>
              <dd>{fmtDate.format(new Date(order.createdAt))}</dd>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <h2 className="section-title">رسید پرداخت</h2>
          {order.paymentProofs.length === 0 ? (
            <p className="mt-3 text-sm text-black/60">رسیدی آپلود نشده.</p>
          ) : (
            <ul className="account-list mt-3">
              {order.paymentProofs.map((proof: any) => (
                <li key={proof.id}>
                  <strong>{proof.mimeType}</strong>
                  <span>{proof.sizeBytes?.toLocaleString('fa-IR')} بایت</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel">
          <h2 className="section-title">تاریخچه وضعیت</h2>
          {order.statusHistory.map((item: any) => (
            <p key={item.id} className="border-b border-black/5 py-2 text-sm">
              {item.fromStatus ?? '—'} → {item.toStatus} · {fmtDate.format(new Date(item.createdAt))}
              {item.note ? ` · ${item.note}` : ''}
            </p>
          ))}
        </section>

        <section className="admin-panel">
          <h2 className="section-title">یادداشت داخلی</h2>
          <div className="mt-3 space-y-3">
            {order.internalNotes.length === 0 ? (
              <p className="text-sm text-black/60">یادداشتی ثبت نشده.</p>
            ) : null}
            {order.internalNotes.map((note: any) => (
              <article key={note.id} className="rounded-md bg-black/[0.03] p-3 text-sm">
                <p>{note.body}</p>
                <p className="mt-2 text-xs text-black/50">
                  {note.adminUser.email} · {fmtDate.format(new Date(note.createdAt))}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <aside className="space-y-5">
        <OrderStatusForm orderId={order.id} status={order.status} />
        <OrderNoteForm orderId={order.id} />
      </aside>
    </main>
  );
}
