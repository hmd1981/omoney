import { headers } from 'next/headers';
import { DashboardOverview } from '../../components/dashboard-overview';
import { ApiError, serverApiFetch } from '../../lib/api';
import type { DashboardStats } from '../../lib/dashboard-types';

export default async function DashboardPage() {
  let stats: DashboardStats | null = null;
  try {
    stats = await serverApiFetch<DashboardStats>('/admin/dashboard', (await headers()).get('cookie'));
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  if (!stats) {
    return (
      <main className="mx-auto max-w-7xl p-5">
        <p className="text-sm text-red-700">بارگذاری داشبورد ناموفق بود. دوباره وارد شوید.</p>
      </main>
    );
  }

  return <DashboardOverview stats={stats} />;
}
