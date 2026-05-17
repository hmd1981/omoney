import { headers } from 'next/headers';
import { serverApiFetch } from '../../../lib/api';
import { SupportStatusForm } from './support-status-form';

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; priority?: string; assignedTo?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.status) query.set('status', params.status);
  if (params.priority) query.set('priority', params.priority);
  if (params.assignedTo) query.set('assignedTo', params.assignedTo);
  const data = await serverApiFetch<any>(`/admin/support-tickets?${query}`, (await headers()).get('cookie'));
  return <main className="mx-auto max-w-7xl p-5">
    <header className="admin-page-header">
      <div><p>Customer care</p><h1>Support tickets</h1><span>{data.total} tickets</span></div>
      <form className="flex flex-wrap gap-2" action="/support">
        <input name="q" defaultValue={params.q} placeholder="Search tickets" className="admin-input" />
        <select name="status" defaultValue={params.status ?? ''} className="admin-input"><option value="">All statuses</option>{['OPEN','IN_PROGRESS','RESOLVED','CLOSED'].map((status) => <option key={status}>{status}</option>)}</select>
        <select name="priority" defaultValue={params.priority ?? ''} className="admin-input"><option value="">All priorities</option>{['LOW','NORMAL','HIGH','URGENT'].map((priority) => <option key={priority}>{priority}</option>)}</select>
        <select name="assignedTo" defaultValue={params.assignedTo ?? ''} className="admin-input"><option value="">Any assignment</option><option value="unassigned">Unassigned</option><option value="me">Assigned</option></select>
        <button className="admin-button">Filter</button>
      </form>
    </header>
    <div className="mt-5 grid gap-3">{data.items.map((ticket: any) => <article key={ticket.id} className="admin-panel grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex flex-wrap items-center gap-2"><h2>{ticket.subject}</h2><span className="admin-badge">{ticket.priority}</span><span className="admin-badge">{ticket.status}</span></div>
        <p className="mt-1 text-sm text-black/60">{ticket.user.profile ? `${ticket.user.profile.firstName} ${ticket.user.profile.lastName}` : ticket.user.email}</p>
        <p className="mt-3 text-sm">{ticket.message}</p>
        <p className="mt-3 text-xs text-black/50">Assigned: {ticket.assignedTo?.email ?? 'Unassigned'}</p>
      </div>
      <SupportStatusForm id={ticket.id} status={ticket.status} priority={ticket.priority} assignedToId={ticket.assignedToId} />
    </article>)}</div>
  </main>;
}
