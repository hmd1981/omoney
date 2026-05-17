import Link from 'next/link';
import { headers } from 'next/headers';
import { ApiError, serverApiFetch } from '../../lib/api';

type Dashboard = {
  totalUsers: number;
  pendingVerification: number;
  pendingKyc: number;
  openOrders: number;
  processingOrders: number;
  openTickets: number;
  completedOrders: number;
  rejectedOrders: number;
  ordersToday: number;
  completedVolume7d: number;
  recentOrders: Array<{ id: string; status: string; beneficiaryName: string; targetAmount: string; createdAt: string; user: { email: string } }>;
  recentTickets: Array<{ id: string; subject: string; status: string; updatedAt: string; user: { email: string } }>;
  recentKyc: Array<{ id: string; documentType: string; createdAt: string; user: { email: string } }>;
};

export default async function DashboardPage() {
  let stats: Dashboard | null = null;
  try {
    stats = await serverApiFetch<Dashboard>('/admin/dashboard', (await headers()).get('cookie'));
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  if (!stats) return null;

  const cards = [
    { label: 'Total users', value: stats.totalUsers, href: '/users' },
    { label: 'Pending accounts', value: stats.pendingVerification, href: '/users?status=PENDING_VERIFICATION' },
    { label: 'Pending KYC', value: stats.pendingKyc, href: '/kyc' },
    { label: 'Open orders', value: stats.openOrders, href: '/orders' },
    { label: 'Orders today', value: stats.ordersToday, href: '/orders' },
    { label: 'Open tickets', value: stats.openTickets, href: '/support' },
    { label: 'Completed orders', value: stats.completedOrders, href: '/orders?status=COMPLETED' },
    { label: 'Rejected orders', value: stats.rejectedOrders, href: '/orders?status=REJECTED' }
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-5">
      <header className="admin-page-header">
        <div>
          <p>Operations</p>
          <h1>Dashboard</h1>
          <span>Completed 7-day volume: {stats.completedVolume7d.toLocaleString()}</span>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => (
          <Link key={item.label} href={item.href} className="admin-stat transition hover:ring-2 hover:ring-[#11221f]/15">
            <p>{item.label}</p>
            <strong>{item.value.toLocaleString()}</strong>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <QueuePanel title="Recent orders" href="/orders">
          {stats.recentOrders.map((item) => (
            <li key={item.id}>
              <Link href={`/orders/${item.id}`}>{item.beneficiaryName}</Link>
              <span>{item.status} · {item.user.email}</span>
            </li>
          ))}
        </QueuePanel>
        <QueuePanel title="Open support" href="/support">
          {stats.recentTickets.map((item) => (
            <li key={item.id}>
              <Link href="/support">{item.subject}</Link>
              <span>{item.status} · {item.user.email}</span>
            </li>
          ))}
        </QueuePanel>
        <QueuePanel title="Oldest pending KYC" href="/kyc">
          {stats.recentKyc.map((item) => (
            <li key={item.id}>
              <Link href="/kyc">{item.documentType}</Link>
              <span>{item.user.email}</span>
            </li>
          ))}
        </QueuePanel>
      </section>
    </main>
  );
}

function QueuePanel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <article className="admin-panel">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="text-sm text-black/60 hover:text-black">View all</Link>
      </div>
      <ul className="space-y-3 text-sm [&_li]:grid [&_li]:gap-1 [&_span]:text-black/55">
        {children}
      </ul>
    </article>
  );
}
