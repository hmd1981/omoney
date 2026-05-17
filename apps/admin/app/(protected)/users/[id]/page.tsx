import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ApiError, serverApiFetch } from '../../../../lib/api';
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
  orders: {
    id: string;
    status: string;
    sourceAmount: string;
    targetAmount: string;
    beneficiaryName: string;
    createdAt: string;
    corridor: {
      sourceCountry: string;
      targetCountry: string;
      sourceCurrency: { code: string };
      targetCurrency: { code: string };
    };
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

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-5">
      <div className="flex flex-col gap-3 border-b border-black/10 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/users" className="text-sm text-black/60 hover:underline">
            ← Users
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
          </h1>
          <p className="text-black/60">{user.email}</p>
          {user.phone ? <p className="text-black/60">{user.phone}</p> : null}
        </div>
        <UserStatusActions userId={user.id} status={user.status} />
      </div>

      {user.status === 'PENDING_VERIFICATION' ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          This user registered with email/password and is waiting for admin approval. Click <strong>Activate</strong>{' '}
          to set status to ACTIVE. (Social logins are usually ACTIVE already.)
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-md border bg-white p-4">
          <p className="text-sm text-black/60">Orders</p>
          <strong className="text-xl">{user._count.orders}</strong>
        </article>
        <article className="rounded-md border bg-white p-4">
          <p className="text-sm text-black/60">Tickets</p>
          <strong className="text-xl">{user._count.tickets}</strong>
        </article>
        <article className="rounded-md border bg-white p-4">
          <p className="text-sm text-black/60">Joined</p>
          <strong className="text-xl">{new Date(user.createdAt).toLocaleDateString()}</strong>
        </article>
      </section>

      {user.profile ? (
        <section className="rounded-md border bg-white p-4">
          <h2 className="font-medium">Profile</h2>
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-black/60">Country</dt>
              <dd>{user.profile.country}</dd>
            </div>
            <div>
              <dt className="text-black/60">City</dt>
              <dd>{user.profile.city ?? '—'}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-black/60">Address</dt>
              <dd>{user.profile.address ?? '—'}</dd>
            </div>
            {user.externalAuthProvider ? (
              <div>
                <dt className="text-black/60">Auth provider</dt>
                <dd>{user.externalAuthProvider}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      <Section title="Phone numbers" empty={!user.phones.length}>
        <ul className="space-y-2 text-sm">
          {user.phones.map((phone) => (
            <li key={phone.id} className="flex flex-wrap gap-2">
              <span className="font-medium">{phone.number}</span>
              <span className="text-black/60">{phone.type}</span>
              {phone.isPrimary ? <span className="rounded bg-black/5 px-2">Primary</span> : null}
              {phone.isVerified ? <span className="rounded bg-green-50 px-2 text-green-800">Verified</span> : null}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Bank accounts" empty={!user.bankAccounts.length}>
        <ul className="space-y-3 text-sm">
          {user.bankAccounts.map((account) => (
            <li key={account.id} className="rounded border border-black/10 p-3">
              <p className="font-medium">{account.bankName}</p>
              <p>{account.accountHolderName}</p>
              <p className="text-black/60">
                {account.country} · {account.currency}
                {account.iban ? ` · ${account.iban}` : ''}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="KYC documents" empty={!user.kycDocuments.length}>
        <ul className="space-y-3 text-sm">
          {user.kycDocuments.map((doc) => (
            <li key={doc.id} className="rounded border border-black/10 p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">{doc.documentType}</span>
                <span className="text-black/60">{new Date(doc.createdAt).toLocaleString()}</span>
              </div>
              {doc.rejectionReason ? (
                <p className="mt-1 text-xs text-red-700">Rejected: {doc.rejectionReason}</p>
              ) : null}
              <div className="mt-2">
                <KycDocumentActions documentId={doc.id} status={doc.status} />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Recent orders" empty={!user.orders.length}>
        <ul className="space-y-2 text-sm">
          {user.orders.map((order) => (
            <li key={order.id} className="flex flex-wrap justify-between gap-2 border-b border-black/5 py-2">
              <span>
                {order.corridor.sourceCurrency.code} → {order.corridor.targetCurrency.code} · {order.beneficiaryName}
              </span>
              <span>{order.status}</span>
              <span className="text-black/60">{new Date(order.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Recent sessions" empty={!user.sessions.length}>
        <ul className="space-y-2 text-sm">
          {user.sessions.map((session) => (
            <li key={session.id} className="rounded border border-black/10 p-3">
              <p className="font-mono text-xs">{session.id}</p>
              <p className="text-black/60">{session.ipAddress ?? 'Unknown IP'}</p>
              <p className="truncate text-black/60">{session.userAgent ?? 'Unknown agent'}</p>
              <p>
                {session.revokedAt ? 'Revoked' : 'Active'} · expires {new Date(session.expiresAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
        <Link href="/sessions" className="mt-3 inline-block text-sm text-[#11221f] hover:underline">
          View all sessions →
        </Link>
      </Section>
    </main>
  );
}

function Section({
  title,
  empty,
  children
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border bg-white p-4">
      <h2 className="font-medium">{title}</h2>
      {empty ? <p className="mt-2 text-sm text-black/60">No records.</p> : <div className="mt-3">{children}</div>}
    </section>
  );
}
