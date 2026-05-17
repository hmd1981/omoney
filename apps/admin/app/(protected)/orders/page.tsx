import Link from 'next/link';
import { headers } from 'next/headers';
import { serverApiFetch } from '../../../lib/api';

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

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; createdFrom?: string; createdTo?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.status) query.set('status', params.status);
  if (params.createdFrom) query.set('createdFrom', params.createdFrom);
  if (params.createdTo) query.set('createdTo', params.createdTo);
  const data = await serverApiFetch<Response>(`/admin/orders?${query}`, (await headers()).get('cookie'));
  return (
    <main className="mx-auto max-w-7xl p-5">
      <Header eyebrow="Transfers" title="Orders" total={data.total}>
        <form className="flex flex-wrap gap-2" action="/orders">
          <input name="q" defaultValue={params.q} placeholder="Beneficiary or customer" className="admin-input" />
          <select name="status" defaultValue={params.status ?? ''} className="admin-input">
            <option value="">All statuses</option>
            {['SUBMITTED','WAITING_FOR_PAYMENT','PAYMENT_UPLOADED','UNDER_REVIEW','PROCESSING','COMPLETED','REJECTED','CANCELLED'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <input type="date" name="createdFrom" defaultValue={params.createdFrom} className="admin-input" />
          <input type="date" name="createdTo" defaultValue={params.createdTo} className="admin-input" />
          <button className="admin-button">Filter</button>
        </form>
      </Header>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Corridor</th><th>Status</th><th>Proofs</th><th>Created</th></tr></thead>
          <tbody>{data.items.map((order) => (
            <tr key={order.id}>
              <td><Link href={`/orders/${order.id}`} className="font-medium hover:underline">{order.beneficiaryName}</Link></td>
              <td><Link href={`/users/${order.user.id}`} className="hover:underline">{order.user.profile ? `${order.user.profile.firstName} ${order.user.profile.lastName}` : order.user.email}</Link></td>
              <td>{order.corridor.sourceCurrency.code} → {order.corridor.targetCurrency.code}</td>
              <td><Badge value={order.status} /></td>
              <td>{order.paymentProofs.length}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </main>
  );
}

function Header({ eyebrow, title, total, children }: { eyebrow: string; title: string; total: number; children: React.ReactNode }) {
  return <header className="admin-page-header"><div><p>{eyebrow}</p><h1>{title}</h1><span>{total} total</span></div>{children}</header>;
}
function Badge({ value }: { value: string }) { return <span className="admin-badge">{value}</span>; }
