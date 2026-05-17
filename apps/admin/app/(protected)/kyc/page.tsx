import Link from 'next/link';
import { headers } from 'next/headers';
import { serverApiFetch } from '../../../lib/api';
import { KycQueueActions } from './kyc-queue-actions';

type KycItem = {
  id: string;
  documentType: string;
  status: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: { id: string; email: string; phone: string | null; profile: { firstName: string; lastName: string; country: string } | null };
};
type KycList = { items: KycItem[]; total: number; page: number; limit: number };

export default async function KycQueuePage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.q) query.set('q', params.q);
  if (params.status) query.set('status', params.status);
  const data = await serverApiFetch<KycList>(`/admin/kyc/documents?${query}`, (await headers()).get('cookie'));
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
  return <main className="mx-auto max-w-7xl p-5">
    <header className="admin-page-header">
      <div><p>Compliance</p><h1>KYC review</h1><span>{data.total} documents</span></div>
      <form className="flex flex-wrap gap-2" action="/kyc">
        <input name="q" defaultValue={params.q} placeholder="Name, email, phone" className="admin-input" />
        <select name="status" defaultValue={params.status ?? 'PENDING'} className="admin-input">
          <option value="">All statuses</option>
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => <option key={status}>{status}</option>)}
        </select>
        <button className="admin-button">Filter</button>
      </form>
    </header>
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Document</th><th>User</th><th>Status</th><th>Submitted</th><th>Decision</th><th>Actions</th></tr></thead>
        <tbody>{data.items.map((doc) => <tr key={doc.id}>
          <td>{doc.documentType}</td>
          <td><Link href={`/users/${doc.user.id}`} className="font-medium hover:underline">{doc.user.profile ? `${doc.user.profile.firstName} ${doc.user.profile.lastName}` : doc.user.email}</Link><p className="text-xs text-black/50">{doc.user.email}</p></td>
          <td><span className="admin-badge">{doc.status}</span></td>
          <td>{new Date(doc.createdAt).toLocaleString()}</td>
          <td>{doc.rejectionReason ?? (doc.reviewedAt ? new Date(doc.reviewedAt).toLocaleString() : '—')}</td>
          <td>{doc.status === 'PENDING' ? <KycQueueActions documentId={doc.id} /> : 'Reviewed'}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {totalPages > 1 ? <div className="mt-6 flex gap-2">{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
      const href = new URLSearchParams();
      href.set('page', String(page));
      if (params.q) href.set('q', params.q);
      if (params.status) href.set('status', params.status);
      return <Link key={page} href={`/kyc?${href}`} className={`rounded border px-3 py-1 text-sm ${page === data.page ? 'bg-[#11221f] text-white' : ''}`}>{page}</Link>;
    })}</div> : null}
  </main>;
}
