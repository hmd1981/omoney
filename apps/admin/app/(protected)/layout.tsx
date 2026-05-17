import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminShell } from '../../components/admin-shell';
import { ApiError, serverApiFetch } from '../../lib/api';

type AdminMe = { email: string; role: string };

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie');
  let admin: AdminMe;
  try {
    admin = await serverApiFetch<AdminMe>('/auth/admin/me', cookieHeader || null);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      redirect('/login');
    }
    throw error;
  }
  return <AdminShell email={admin.email} role={admin.role}>{children}</AdminShell>;
}
