import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ApiError, serverApiFetch } from '../../../../lib/api';
import type { UserAccountSummary } from '../../../../lib/account-types';
import { AccountSummaryGrid } from '../../../../components/account-summary-grid';
import { StatusBadge } from '../../../../components/status-badge';
import { UserLedgerTable, type LedgerOrder } from '../../../../components/user-ledger-table';
import { fmtDate, ticketStatusFa } from '../../../../lib/admin-format';
import { KycDocumentActions } from './kyc-document-actions';
import { UserStatusActions } from './user-status-actions';

type UserDetail = {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  externalAuthProvider: string | null;
  createdAt: string;
  updatedAt: string;
  accountSummary: UserAccountSummary;
  profile: {
    firstName: string;
    lastName: string;
    country: string;
    city: string | null;
    address: string | null;
  } | null;
  phones: { id: string; type: string; number: string; isPrimary: boolean; isVerified: boolean }[];
  bankAccounts: {
    id: string;
    country: string;
    bankName: string;
    accountHolderName: string;
    iban: string | null;
    currency: string;
    isDefault: boolean;
  }[];
  kycDocuments: {
    id: string;
    documentType: string;
    status: string;
    rejectionReason: string | null;
    createdAt: string;
  }[];
  orders: LedgerOrder[];
  tickets: {
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
  }[];
  sessions: {
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: string;
    revokedAt: string | null;
    createdAt: string;
  }[];
  _count: { orders: number; tickets: number; notifications: number };
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieHeader = (await headers()).get('cookie');
  let user: UserDetail;
  try {
    user = await serverApiFetch<UserDetail>(`/admin/users/${id}`, cookieHeader);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const displayName = user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-5 pb-12">
      <header className="account-dossier-header">
        <div>
          <Link href="/users" className="text-sm text-[#11221f]/70 hover:underline">
            ← بازگشت به حساب‌های مشتری
          </Link>
          <p className="account-dossier-kicker">پرونده حساب #{user.id.slice(0, 8)}</p>
          <h1>{displayName}</h1>
          <p className="account-dossier-meta">{user.email}</p>
          {user.phone ? <p className="account-dossier-meta">{user.phone}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge value={user.status} kind="user" />
            {user.externalAuthProvider ? (
              <span className="admin-badge">ورود: {user.externalAuthProvider}</span>
            ) : null}
            <span className="text-sm text-black/55">
              عضویت: {fmtDate.format(new Date(user.createdAt))}
            </span>
          </div>
        </div>
        <UserStatusActions userId={user.id} status={user.status} />
      </header>

      {user.status === 'PENDING_VERIFICATION' ? (
        <p className="account-alert">
          این کاربر با ایمیل/رمز ثبت‌نام کرده و منتظر تأیید ادمین است. با «فعال‌سازی» وضعیت را ACTIVE کنید.
        </p>
      ) : null}

      <section>
        <h2 className="section-title">خلاصه مالی حساب</h2>
        <p className="section-sub">تمام ارقام از سفارش‌های ثبت‌شده این مشتری — شفاف و قابل ردیابی</p>
        <AccountSummaryGrid summary={user.accountSummary} userId={user.id} />
      </section>

      <section className="admin-panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="section-title mb-0">دفتر تراکنش‌ها (حواله)</h2>
            <p className="section-sub">{user.orders.length} ردیف · کل ثبت‌شده در سیستم</p>
          </div>
        </div>
        <UserLedgerTable orders={user.orders} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="اطلاعات هویتی">
          {user.profile ? (
            <dl className="account-kv">
              <div>
                <dt>کشور</dt>
                <dd>{user.profile.country}</dd>
              </div>
              <div>
                <dt>شهر</dt>
                <dd>{user.profile.city ?? '—'}</dd>
              </div>
              <div>
                <dt>آدرس</dt>
                <dd>{user.profile.address ?? '—'}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-black/55">پروفایل تکمیل نشده</p>
          )}
        </Panel>

        <Panel title="شماره تماس">
          {user.phones.length ? (
            <ul className="account-list">
              {user.phones.map((phone) => (
                <li key={phone.id}>
                  <strong>{phone.number}</strong>
                  <span>
                    {phone.type}
                    {phone.isPrimary ? ' · اصلی' : ''}
                    {phone.isVerified ? ' · تأییدشده' : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </Panel>

        <Panel title="حساب‌های بانکی">
          {user.bankAccounts.length ? (
            <ul className="account-list">
              {user.bankAccounts.map((account) => (
                <li key={account.id} className="account-bank-card">
                  <strong>{account.bankName}</strong>
                  <span>{account.accountHolderName}</span>
                  <span>
                    {account.country} · {account.currency}
                    {account.iban ? ` · ${account.iban}` : ''}
                    {account.isDefault ? ' · پیش‌فرض' : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </Panel>

        <Panel title={`احراز هویت (${user.kycDocuments.length})`}>
          {user.kycDocuments.length ? (
            <ul className="account-list">
              {user.kycDocuments.map((doc) => (
                <li key={doc.id} className="account-bank-card">
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong>{doc.documentType}</strong>
                    <StatusBadge value={doc.status} kind="kyc" />
                  </div>
                  <span>{fmtDate.format(new Date(doc.createdAt))}</span>
                  {doc.rejectionReason ? (
                    <span className="text-red-700">دلیل رد: {doc.rejectionReason}</span>
                  ) : null}
                  <KycDocumentActions documentId={doc.id} status={doc.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </Panel>

        <Panel title={`پشتیبانی (${user.tickets.length})`}>
          {user.tickets.length ? (
            <ul className="account-list">
              {user.tickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link href="/support" className="font-medium hover:underline">
                    {ticket.subject}
                  </Link>
                  <span>
                    {ticketStatusFa[ticket.status] ?? ticket.status} · {ticket.priority}
                  </span>
                  <span>{fmtDate.format(new Date(ticket.updatedAt))}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </Panel>

        <Panel title="نشست‌های ورود">
          {user.sessions.length ? (
            <ul className="account-list">
              {user.sessions.map((session) => (
                <li key={session.id} className="account-bank-card">
                  <span className="font-mono text-xs">{session.id}</span>
                  <span>{session.ipAddress ?? 'IP نامشخص'}</span>
                  <span className="truncate">{session.userAgent ?? '—'}</span>
                  <span>
                    {session.revokedAt ? 'لغو شده' : 'فعال'} · انقضا{' '}
                    {fmtDate.format(new Date(session.expiresAt))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
          <Link href="/sessions" className="mt-3 inline-block text-sm text-[#11221f] hover:underline">
            مدیریت همه نشست‌ها
          </Link>
        </Panel>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-panel">
      <h2 className="section-title mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="text-sm text-black/55">رکوردی ثبت نشده.</p>;
}
