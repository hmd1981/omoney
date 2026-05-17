import Link from 'next/link';
import { headers } from 'next/headers';
import { serverApiFetch } from '../../../../lib/api';
import { OrderStatusForm } from './order-status-form';
import { OrderNoteForm } from './order-note-form';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await serverApiFetch<any>(`/admin/orders/${id}`, (await headers()).get('cookie'));
  return (
    <main className="mx-auto grid max-w-7xl gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <section className="admin-panel">
          <Link href="/orders" className="text-sm text-black/60">← Orders</Link>
          <h1 className="mt-2 text-2xl font-semibold">{order.beneficiaryName}</h1>
          <p className="text-black/60">{order.user.email}</p>
        </section>
        <section className="admin-panel">
          <h2>Transfer</h2>
          <div className="admin-kv-grid">
            <span>Corridor</span><strong>{order.corridor.sourceCurrency.code} → {order.corridor.targetCurrency.code}</strong>
            <span>Source amount</span><strong>{order.sourceAmount}</strong>
            <span>Target amount</span><strong>{order.targetAmount}</strong>
            <span>Fee</span><strong>{order.feeAmount}</strong>
            <span>Status</span><strong>{order.status}</strong>
          </div>
        </section>
        <section className="admin-panel">
          <h2>Payment proofs</h2>
          {order.paymentProofs.length === 0 ? <p className="mt-3 text-sm text-black/60">No payment proof uploaded.</p> : (
            <div className="mt-3 space-y-2">
              {order.paymentProofs.map((proof: any) => <p key={proof.id} className="text-sm">{proof.mimeType} · {proof.sizeBytes.toLocaleString()} bytes</p>)}
            </div>
          )}
        </section>
        <section className="admin-panel">
          <h2>Status history</h2>
          {order.statusHistory.map((item: any) => <p key={item.id} className="border-b py-2 text-sm">{item.fromStatus ?? '—'} → {item.toStatus} · {new Date(item.createdAt).toLocaleString()} {item.note ? `· ${item.note}` : ''}</p>)}
        </section>
        <section className="admin-panel">
          <h2>Internal notes</h2>
          <div className="mt-3 space-y-3">
            {order.internalNotes.length === 0 ? <p className="text-sm text-black/60">No internal notes yet.</p> : null}
            {order.internalNotes.map((note: any) => (
              <article key={note.id} className="rounded-md bg-black/[0.03] p-3 text-sm">
                <p>{note.body}</p>
                <p className="mt-2 text-xs text-black/50">{note.adminUser.email} · {new Date(note.createdAt).toLocaleString()}</p>
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
