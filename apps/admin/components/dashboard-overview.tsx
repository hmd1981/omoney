import Link from 'next/link';
import type { DashboardStats } from '../lib/dashboard-types';
import { PlatformAccountingStrip } from './account-summary-grid';

const fmt = new Intl.NumberFormat('fa-IR');
const fmtDate = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' });

const orderStatusFa: Record<string, string> = {
  DRAFT: 'پیش‌نویس',
  SUBMITTED: 'ثبت‌شده',
  WAITING_FOR_PAYMENT: 'منتظر پرداخت',
  PAYMENT_UPLOADED: 'رسید آپلود',
  UNDER_REVIEW: 'در بررسی',
  PROCESSING: 'در حال پردازش',
  COMPLETED: 'تکمیل',
  REJECTED: 'رد شده',
  CANCELLED: 'لغو شده'
};

const userStatusFa: Record<string, string> = {
  ACTIVE: 'فعال',
  SUSPENDED: 'مسدود',
  PENDING_VERIFICATION: 'در انتظار تأیید'
};

const quickLinks = [
  { href: '/users', label: 'کاربران', desc: 'مدیریت حساب‌ها' },
  { href: '/kyc', label: 'احراز هویت', desc: 'بررسی مدارک' },
  { href: '/ledger', label: 'دفتر روزنامه', desc: 'فیلتر و خروجی Excel/PDF' },
  { href: '/reports', label: 'گزارشات', desc: 'گزارش دوره‌ای' },
  { href: '/orders', label: 'سفارش‌ها', desc: 'حواله و پرداخت' },
  { href: '/rates', label: 'نرخ ارز', desc: 'تنظیم و به‌روزرسانی' },
  { href: '/support', label: 'پشتیبانی', desc: 'تیکت‌ها' },
  { href: '/media', label: 'رسانه', desc: 'تصاویر و فایل‌ها' },
  { href: '/sessions', label: 'نشست‌ها', desc: 'ورودهای فعال' },
  { href: '/audit-logs', label: 'لاگ‌ها', desc: 'تاریخچه عملیات' }
];

export function DashboardOverview({ stats }: { stats: DashboardStats }) {
  const heroCards = [
    { label: 'کاربران فعال', value: stats.activeUsers, hint: `از ${fmt.format(stats.totalUsers)} کل`, href: '/users?status=ACTIVE' },
    { label: 'سفارش باز', value: stats.openOrders, hint: `${fmt.format(stats.processingOrders)} در پردازش`, href: '/orders' },
    { label: 'KYC معلق', value: stats.pendingKyc, hint: `${fmt.format(stats.kycApproved)} تأیید شده`, href: '/kyc' },
    { label: 'تیکت باز', value: stats.openTickets, hint: `${fmt.format(stats.urgentTickets)} فوری`, href: '/support' }
  ];

  const userMetrics = [
    { label: 'کل کاربران', value: stats.totalUsers, href: '/users' },
    { label: 'فعال', value: stats.activeUsers, href: '/users?status=ACTIVE' },
    { label: 'در انتظار تأیید', value: stats.pendingVerification, href: '/users?status=PENDING_VERIFICATION' },
    { label: 'مسدود', value: stats.suspendedUsers, href: '/users?status=SUSPENDED' },
    { label: 'عضویت امروز', value: stats.newUsersToday, href: '/users' },
    { label: 'عضویت ۷ روز', value: stats.newUsers7d, href: '/users' },
    { label: 'نشست فعال', value: stats.activeSessions, href: '/sessions' }
  ];

  const orderMetrics = [
    { label: 'کل سفارش‌ها', value: stats.totalOrders, href: '/orders' },
    { label: 'امروز', value: stats.ordersToday, href: '/orders' },
    { label: 'منتظر پرداخت', value: stats.waitingPayment, href: '/orders?status=WAITING_FOR_PAYMENT' },
    { label: 'رسید آپلود', value: stats.paymentUploaded, href: '/orders?status=PAYMENT_UPLOADED' },
    { label: 'در بررسی', value: stats.underReview, href: '/orders?status=UNDER_REVIEW' },
    { label: 'تکمیل‌شده', value: stats.completedOrders, href: '/orders?status=COMPLETED' },
    { label: 'رد / لغو', value: stats.rejectedOrders + stats.cancelledOrders, href: '/orders?status=REJECTED' }
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-5 pb-10">
      <header className="dashboard-hero">
        <div>
          <p className="dashboard-kicker">پنل مدیریت OMoney</p>
          <h1>داشبورد عملیات</h1>
          <p className="dashboard-sub">
            نمای کلی سایت — کاربران، سفارش‌ها، پشتیبانی و احراز هویت در یک نگاه
          </p>
        </div>
        <div className="dashboard-hero-metrics">
          <div className="dashboard-pill">
            <span>حجم تکمیل ۷ روز</span>
            <strong>{fmt.format(stats.completedVolume7d)}</strong>
          </div>
          <div className="dashboard-pill">
            <span>کارمزد ۷ روز</span>
            <strong>{fmt.format(stats.feeVolume7d)}</strong>
          </div>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">حسابداری کل سیستم</h2>
        <PlatformAccountingStrip
          completedVolume={stats.platformCompletedVolume}
          completedFees={stats.platformCompletedFees}
          openExposure={stats.platformOpenExposure}
          totalSource={stats.platformTotalSourceVolume}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {heroCards.map((item) => (
          <Link key={item.label} href={item.href} className="dashboard-hero-card">
            <p>{item.label}</p>
            <strong>{fmt.format(item.value)}</strong>
            <span>{item.hint}</span>
          </Link>
        ))}
      </section>

      <MetricSection title="کاربران و دسترسی" subtitle="وضعیت حساب‌ها و ورود به سیستم">
        {userMetrics.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </MetricSection>

      <MetricSection title="سفارش‌ها و حواله" subtitle="صف عملیات و وضعیت پرداخت">
        {orderMetrics.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </MetricSection>

      {stats.ordersByStatus.length > 0 ? (
        <section className="admin-panel">
          <h2 className="text-lg font-semibold">توزیع وضعیت سفارش‌ها</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {stats.ordersByStatus.map((row) => (
              <Link
                key={row.status}
                href={`/orders?status=${row.status}`}
                className="dashboard-status-chip"
              >
                <span>{orderStatusFa[row.status] ?? row.status}</span>
                <strong>{fmt.format(row.count)}</strong>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryTile label="KYC تأیید شده" value={stats.kycApproved} href="/kyc" />
        <SummaryTile label="KYC رد شده" value={stats.kycRejected} href="/kyc" />
        <SummaryTile label="سفارش رد شده" value={stats.rejectedOrders} href="/orders?status=REJECTED" />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">دسترسی سریع</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="dashboard-quick-link">
              <strong>{item.label}</strong>
              <span>{item.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ActivityPanel title="آخرین کاربران" href="/users" empty="هنوز کاربری ثبت نشده" count={stats.recentUsers.length}>
          {stats.recentUsers.map((user) => (
            <li key={user.id}>
              <Link href={`/users/${user.id}`}>
                {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
              </Link>
              <span>
                {userStatusFa[user.status] ?? user.status} · {user.email} · {fmt.format(user._count.orders)} سفارش
              </span>
              <time>{fmtDate.format(new Date(user.createdAt))}</time>
            </li>
          ))}
        </ActivityPanel>

        <ActivityPanel title="آخرین سفارش‌ها" href="/orders" empty="سفارشی ثبت نشده" count={stats.recentOrders.length}>
          {stats.recentOrders.map((order) => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`}>{order.beneficiaryName}</Link>
              <span>
                {orderStatusFa[order.status] ?? order.status} · {order.user.email}
              </span>
              <span>
                {fmt.format(Number(order.targetAmount))} {order.corridor.targetCurrency.code} ({order.corridor.sourceCurrency.code})
              </span>
            </li>
          ))}
        </ActivityPanel>

        <ActivityPanel title="تیکت‌های پشتیبانی" href="/support" empty="تیکت بازی نیست" count={stats.recentTickets.length}>
          {stats.recentTickets.map((ticket) => (
            <li key={ticket.id}>
              <Link href="/support">{ticket.subject}</Link>
              <span>
                {ticket.status} · {ticket.priority} · {ticket.user.email}
              </span>
              <time>{fmtDate.format(new Date(ticket.updatedAt))}</time>
            </li>
          ))}
        </ActivityPanel>

        <ActivityPanel title="قدیمی‌ترین KYC معلق" href="/kyc" empty="مدرکی در صف نیست" count={stats.recentKyc.length}>
          {stats.recentKyc.map((doc) => (
            <li key={doc.id}>
              <Link href="/kyc">{doc.documentType}</Link>
              <span>{doc.user.email}</span>
              <time>{fmtDate.format(new Date(doc.createdAt))}</time>
            </li>
          ))}
        </ActivityPanel>
      </section>
    </main>
  );
}

function MetricSection({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-black/55">{subtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="admin-stat dashboard-metric">
      <p>{label}</p>
      <strong>{fmt.format(value)}</strong>
    </Link>
  );
}

function SummaryTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="admin-panel dashboard-summary-tile">
      <p className="text-sm text-black/60">{label}</p>
      <strong className="mt-2 block text-2xl">{fmt.format(value)}</strong>
    </Link>
  );
}

function ActivityPanel({
  title,
  href,
  empty,
  count,
  children
}: {
  title: string;
  href: string;
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <article className="admin-panel dashboard-activity">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="text-sm text-[#11221f]/70 hover:text-[#11221f]">
          مشاهده همه
        </Link>
      </div>
      {count > 0 ? (
        <ul className="dashboard-activity-list">{children}</ul>
      ) : (
        <p className="text-sm text-black/50">{empty}</p>
      )}
    </article>
  );
}
