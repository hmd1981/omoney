import Link from 'next/link';
import type { UserAccountSummary } from '../lib/account-types';
import { formatMoney } from '../lib/admin-format';

type Item = { label: string; value: string; hint?: string; href?: string };

export function AccountSummaryGrid({
  summary,
  userId
}: {
  summary: UserAccountSummary;
  userId?: string;
}) {
  const items: Item[] = [
    { label: 'کل سفارش‌ها', value: String(summary.totalOrders), href: userId ? `/orders?q=${encodeURIComponent('')}` : '/orders' },
    { label: 'تکمیل‌شده', value: String(summary.completedOrders) },
    { label: 'باز / در جریان', value: String(summary.openOrders) },
    { label: 'حجم مبدأ (کل)', value: formatMoney(summary.totalSourceVolume) },
    { label: 'حجم مقصد (تکمیل)', value: formatMoney(summary.completedTargetVolume) },
    { label: 'تعهد باز (مقصد)', value: formatMoney(summary.openTargetExposure) },
    { label: 'کارمزد (کل)', value: formatMoney(summary.totalFees) },
    { label: 'کارمزد (تکمیل)', value: formatMoney(summary.completedFees) },
    { label: 'تیکت باز', value: String(summary.openTickets), href: '/support' },
    { label: 'KYC معلق', value: String(summary.kycPending), href: '/kyc' },
    { label: 'حساب بانکی', value: String(summary.bankAccounts) },
    { label: 'نشست فعال', value: String(summary.activeSessions), href: '/sessions' }
  ];

  return (
    <section className="account-summary-grid">
      {items.map((item) => {
        const body = (
          <>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
            {item.hint ? <span>{item.hint}</span> : null}
          </>
        );
        return item.href ? (
          <Link key={item.label} href={item.href} className="account-summary-card">
            {body}
          </Link>
        ) : (
          <article key={item.label} className="account-summary-card">
            {body}
          </article>
        );
      })}
    </section>
  );
}

export function PlatformAccountingStrip({
  completedVolume,
  completedFees,
  openExposure,
  totalSource
}: {
  completedVolume: number;
  completedFees: number;
  openExposure: number;
  totalSource: number;
}) {
  const items = [
    { label: 'حجم تکمیل‌شده (کل سیستم)', value: formatMoney(completedVolume) },
    { label: 'کارمزد دریافتی (کل)', value: formatMoney(completedFees) },
    { label: 'تعهد باز مشتریان', value: formatMoney(openExposure) },
    { label: 'حجم مبدأ ثبت‌شده (کل)', value: formatMoney(totalSource) }
  ];
  return (
    <section className="platform-accounting-strip">
      {items.map((item) => (
        <article key={item.label} className="platform-accounting-card">
          <p>{item.label}</p>
          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  );
}
