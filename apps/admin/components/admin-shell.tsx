'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authFetch } from '../lib/api';

const nav = [
  { href: '/', label: 'داشبورد', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER', 'KYC_REVIEWER', 'SUPPORT_AGENT', 'AUDITOR'] },
  { href: '/users', label: 'حساب مشتریان', roles: ['SUPER_ADMIN', 'KYC_REVIEWER', 'SUPPORT_AGENT', 'AUDITOR'] },
  { href: '/kyc', label: 'احراز هویت', roles: ['SUPER_ADMIN', 'KYC_REVIEWER', 'AUDITOR'] },
  { href: '/ledger', label: 'دفتر روزنامه', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER', 'AUDITOR'] },
  { href: '/reports', label: 'گزارشات', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER', 'AUDITOR'] },
  { href: '/orders', label: 'سفارش‌ها', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER', 'AUDITOR'] },
  { href: '/rates', label: 'نرخ ارز', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER', 'AUDITOR'] },
  { href: '/support', label: 'پشتیبانی', roles: ['SUPER_ADMIN', 'SUPPORT_AGENT', 'AUDITOR'] },
  { href: '/sessions', label: 'نشست‌ها', roles: ['SUPER_ADMIN', 'AUDITOR'] },
  { href: '/audit-logs', label: 'لاگ‌ها', roles: ['SUPER_ADMIN', 'AUDITOR'] },
  { href: '/media', label: 'رسانه', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER'] }
];

export function AdminShell({ children, email, role }: { children: React.ReactNode; email: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await authFetch('/admin/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-black/60">پنل مدیریت OMoney</p>
            <p className="font-semibold">{email}</p>
            <p className="text-xs text-black/50">{role}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {nav.filter((item) => item.roles.includes(role)).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm ${
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'bg-[#11221f] text-white'
                    : 'bg-black/5 hover:bg-black/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-md border border-black/15 px-3 py-2 text-sm hover:bg-black/5"
            >
              خروج
            </button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
