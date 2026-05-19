'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutUser } from '../lib/auth-client';
import { KycUploadPanel } from './kyc-upload-panel';
import { Locale, intlLocale } from '../lib/i18n';

type Profile = {
  firstName: string;
  lastName: string;
  country: string;
  city?: string | null;
  address?: string | null;
};

type Phone = {
  id: string;
  type: string;
  label?: string | null;
  number: string;
  isPrimary: boolean;
  isVerified: boolean;
};

type BankAccount = {
  id: string;
  country: string;
  bankName: string;
  accountHolderName: string;
  iban?: string | null;
  accountNumber?: string | null;
  currency: string;
  isDefault: boolean;
};

type Me = {
  email: string;
  phone: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  profileComplete?: boolean;
  profile: Profile | null;
  phones: Phone[];
  bankAccounts: BankAccount[];
};

type Dashboard = {
  activeOrders: number;
  completedOrders: number;
  latestKycStatus: string | null;
  recentOrders: Array<{ id: string; status: string; createdAt: string }>;
  recentNotifications: Array<{ id: string; title: string; body: string }>;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function AccountDashboard({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fa = locale === 'fa';

  async function logout() {
    await logoutUser(locale, router);
  }

  async function loadAccount() {
    const token = localStorage.getItem('omoney_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const [userResponse, dashboardResponse] = await Promise.all([
      fetch(`${apiBase}/users/me`, { headers }),
      fetch(`${apiBase}/users/me/dashboard`, { headers })
    ]);
    const userData = userResponse.ok ? ((await userResponse.json()) as Me) : null;
    if (userData && userData.profileComplete === false) {
      router.replace(`/${locale}/complete-profile`);
      return;
    }
    setMe(userData);
    setDashboard(dashboardResponse.ok ? await dashboardResponse.json() : null);
    setLoading(false);
  }

  useEffect(() => {
    void loadAccount();
    const onKycUpdated = () => {
      void (async () => {
        const token = localStorage.getItem('omoney_access_token');
        if (!token) return;
        const response = await fetch(`${apiBase}/users/me/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) setDashboard(await response.json());
      })();
    };
    window.addEventListener('omoney-kyc-updated', onKycUpdated);
    return () => window.removeEventListener('omoney-kyc-updated', onKycUpdated);
  }, [locale, router]);

  async function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPhone(true);
    setMessage(null);
    const token = localStorage.getItem('omoney_access_token');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`${apiBase}/users/me/phones`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, isPrimary: false })
    });
    setSavingPhone(false);
    setMessage(
      response.ok
        ? fa
          ? 'شماره جدید ثبت شد.'
          : 'Phone number saved.'
        : fa
          ? 'ثبت شماره انجام نشد.'
          : 'Could not save phone number.'
    );
    if (response.ok) {
      event.currentTarget.reset();
      await loadAccount();
    }
  }

  async function submitBankAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAccount(true);
    setMessage(null);
    const token = localStorage.getItem('omoney_access_token');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`${apiBase}/users/me/bank-accounts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, isDefault: false })
    });
    setSavingAccount(false);
    setMessage(
      response.ok
        ? fa
          ? 'حساب بانکی ثبت شد.'
          : 'Bank account saved.'
        : fa
          ? 'ثبت حساب بانکی انجام نشد.'
          : 'Could not save bank account.'
    );
    if (response.ok) {
      event.currentTarget.reset();
      await loadAccount();
    }
  }

  if (loading) return <p>{fa ? 'در حال بارگذاری...' : 'Loading...'}</p>;
  if (!me) {
    return (
      <div className="surface rounded-md p-6">
        <h1 className="text-2xl font-semibold">{fa ? 'حساب من' : 'My account'}</h1>
        <p className="mt-3 text-[#66707d]">{fa ? 'برای مشاهده حساب شخصی وارد شوید.' : 'Sign in to view your account.'}</p>
        <div className="mt-5 flex gap-3">
          <Link href={`/${locale}/login`} className="rounded-md bg-[#c7a15b] px-4 py-2 font-medium text-[#101e30]">
            {fa ? 'ورود' : 'Sign in'}
          </Link>
          <Link href={`/${locale}/register`} className="rounded-md border border-black/10 px-4 py-2">
            {fa ? 'ثبت نام' : 'Register'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface flex flex-col gap-4 rounded-md p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-sm">{fa ? 'حساب من' : 'My account'}</p>
          <h1 className="mt-2 text-3xl font-semibold">
            {me.profile ? `${me.profile.firstName} ${me.profile.lastName}` : me.email}
          </h1>
          <p className="mt-2 text-[#66707d]" dir="ltr">
            {me.email} · {me.phone}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="shrink-0 rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5"
        >
          {fa ? 'خروج از حساب' : 'Sign out'}
        </button>
      </section>

      {me.status === 'PENDING_VERIFICATION' ? (
        <section className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {fa
            ? 'حساب شما هنوز کامل نشده است. مشخصات خود را تکمیل کنید یا منتظر تأیید ادمین بمانید.'
            : 'Your account is not fully set up yet. Complete your profile or wait for admin approval.'}
          <div className="mt-3">
            <Link href={`/${locale}/complete-profile`} className="font-medium underline">
              {fa ? 'تکمیل مشخصات' : 'Complete profile'}
            </Link>
          </div>
        </section>
      ) : null}

      {me.status === 'SUSPENDED' ? (
        <section className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {fa ? 'حساب شما معلق شده است. با پشتیبانی تماس بگیرید.' : 'Your account is suspended. Please contact support.'}
        </section>
      ) : null}

      <KycUploadPanel locale={locale} />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface rounded-md p-5">
          <p className="text-sm text-[#66707d]">{fa ? 'حواله فعال' : 'Active transfers'}</p>
          <p className="mt-3 text-3xl font-semibold">{dashboard?.activeOrders ?? 0}</p>
        </article>
        <article className="surface rounded-md p-5">
          <p className="text-sm text-[#66707d]">{fa ? 'حواله تکمیل شده' : 'Completed transfers'}</p>
          <p className="mt-3 text-3xl font-semibold">{dashboard?.completedOrders ?? 0}</p>
        </article>
        <article className="surface rounded-md p-5">
          <p className="text-sm text-[#66707d]">{fa ? 'وضعیت احراز هویت' : 'KYC status'}</p>
          <p className="mt-3 text-xl font-semibold">{dashboard?.latestKycStatus ?? (fa ? 'ثبت نشده' : 'Not submitted')}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{fa ? 'پروفایل' : 'Profile'}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt>{fa ? 'کشور' : 'Country'}</dt><dd>{me.profile?.country ?? '-'}</dd></div>
            <div className="flex justify-between gap-4"><dt>{fa ? 'شهر' : 'City'}</dt><dd>{me.profile?.city ?? '-'}</dd></div>
            <div className="flex justify-between gap-4"><dt>{fa ? 'آدرس' : 'Address'}</dt><dd>{me.profile?.address ?? '-'}</dd></div>
          </dl>
        </article>

        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{fa ? 'شماره های ثبت شده' : 'Saved phone numbers'}</h2>
          <div className="mt-4 space-y-3 text-sm">
            {me.phones.length === 0 && <p className="text-[#66707d]">{fa ? 'شماره ای ثبت نشده است.' : 'No phone numbers saved.'}</p>}
            {me.phones.map((phone) => (
              <div key={phone.id} className="flex items-center justify-between gap-3 rounded-md border border-black/10 px-3 py-2">
                <span dir="ltr">{phone.number}</span>
                <span className="text-[#66707d]">{phone.type}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{fa ? 'افزودن شماره اختیاری' : 'Add optional phone'}</h2>
          <form onSubmit={submitPhone} className="mt-4 grid gap-3">
            <select name="type" required className="h-12 rounded-md border border-black/10 px-3">
              <option value="OMAN">{fa ? 'شماره عمان' : 'Oman number'}</option>
              <option value="UAE">{fa ? 'شماره امارات' : 'UAE number'}</option>
              <option value="TURKEY">{fa ? 'شماره ترکیه' : 'Turkey number'}</option>
              <option value="IRAN">{fa ? 'شماره ایران' : 'Iran number'}</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="OTHER">{fa ? 'سایر' : 'Other'}</option>
            </select>
            <input name="label" placeholder={fa ? 'عنوان اختیاری' : 'Optional label'} className="h-12 rounded-md border border-black/10 px-3" />
            <input name="number" dir="ltr" required placeholder="+968..." className="h-12 rounded-md border border-black/10 px-3" />
            <button disabled={savingPhone} className="rounded-md bg-[#101e30] px-4 py-3 text-white disabled:opacity-60">
              {savingPhone ? (fa ? 'در حال ثبت...' : 'Saving...') : fa ? 'ثبت شماره' : 'Save phone'}
            </button>
          </form>
        </article>

        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{fa ? 'افزودن حساب بانکی' : 'Add bank account'}</h2>
          <form onSubmit={submitBankAccount} className="mt-4 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input name="country" required placeholder={fa ? 'کشور' : 'Country'} className="h-12 rounded-md border border-black/10 px-3" />
              <input name="currency" required placeholder={fa ? 'ارز' : 'Currency'} className="h-12 rounded-md border border-black/10 px-3" />
            </div>
            <input name="bankName" required placeholder={fa ? 'نام بانک' : 'Bank name'} className="h-12 rounded-md border border-black/10 px-3" />
            <input name="accountHolderName" required placeholder={fa ? 'نام صاحب حساب' : 'Account holder name'} className="h-12 rounded-md border border-black/10 px-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <input name="iban" dir="ltr" placeholder="IBAN" className="h-12 rounded-md border border-black/10 px-3" />
              <input name="accountNumber" dir="ltr" placeholder={fa ? 'شماره حساب' : 'Account number'} className="h-12 rounded-md border border-black/10 px-3" />
            </div>
            <button disabled={savingAccount} className="rounded-md bg-[#101e30] px-4 py-3 text-white disabled:opacity-60">
              {savingAccount ? (fa ? 'در حال ثبت...' : 'Saving...') : fa ? 'ثبت حساب' : 'Save account'}
            </button>
          </form>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{fa ? 'آخرین حواله ها' : 'Recent transfers'}</h2>
          <div className="mt-4 space-y-3 text-sm">
            {dashboard?.recentOrders.length ? dashboard.recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between rounded-md border border-black/10 px-3 py-2">
                <span>{order.status}</span>
                <span dir="ltr">{new Date(order.createdAt).toLocaleDateString(intlLocale(locale))}</span>
              </div>
            )) : <p className="text-[#66707d]">{fa ? 'هنوز حواله ای ثبت نشده است.' : 'No transfers yet.'}</p>}
          </div>
        </article>

        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{fa ? 'حساب های بانکی' : 'Bank accounts'}</h2>
          <div className="mt-4 space-y-3 text-sm">
            {me.bankAccounts.length ? me.bankAccounts.map((account) => (
              <div key={account.id} className="rounded-md border border-black/10 px-3 py-2">
                <p>{account.bankName}</p>
                <p className="mt-1 text-[#66707d]">
                  {account.country} · {account.currency}
                </p>
              </div>
            )) : <p className="text-[#66707d]">{fa ? 'هنوز حساب بانکی ثبت نشده است.' : 'No bank accounts saved.'}</p>}
          </div>
        </article>
      </section>

      {message && <p className="text-sm text-[#66707d]">{message}</p>}
    </div>
  );
}
