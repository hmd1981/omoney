import { headers } from 'next/headers';
import { serverApiFetch } from '../../../lib/api';
type Audit = { id: string; action: string; entityType: string; entityId: string; ipAddress: string | null; createdAt: string; adminUser: { email: string; role: string } };
export default async function AuditLogsPage() {
  const data = await serverApiFetch<{ items: Audit[]; total: number }>('/admin/audit-logs', (await headers()).get('cookie'));
  return <main className="mx-auto max-w-7xl p-5"><header className="admin-page-header"><div><p>Governance</p><h1>Audit logs</h1><span>{data.total} events</span></div></header><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Action</th><th>Actor</th><th>Entity</th><th>IP</th><th>Time</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id}><td>{item.action}</td><td>{item.adminUser.email}</td><td>{item.entityType} · {item.entityId}</td><td>{item.ipAddress ?? '—'}</td><td>{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div></main>;
}
