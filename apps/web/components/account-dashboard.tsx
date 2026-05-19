'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
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

const copy = {
  loading: { fa: 'در حال بارگذاری...', en: 'Loading...', ar: 'جاري التحميل...' },
  myAccount: { fa: 'حساب من', en: 'My account', ar: 'حسابي' },
  signInPrompt: { fa: 'برای مشاهده حساب شخصی وارد شوید.', en: 'Sign in to view your account.', ar: 'سجل الدخول لعرض حسابك.' },
  signIn: { fa: 'ورود', en: 'Sign in', ar: 'تسجيل الدخول' },
  register: { fa: 'ثبت نام', en: 'Register', ar: 'إنشاء حساب' },
  activeTransfers: { fa: 'حواله فعال', en: 'Active transfers', ar: 'تحويلات نشطة' },
  completedTransfers: { fa: 'حواله تکمیل شده', en: 'Completed transfers', ar: 'تحويلات مكتملة' },
  kycStatus: { fa: 'وضعیت احراز هویت', en: 'KYC status', ar: 'حالة التحقق' },
  notSubmitted: { fa: 'ثبت نشده', en: 'Not submitted', ar: 'غير مقدم' },
  profile: { fa: 'پروفایل', en: 'Profile', ar: 'الملف الشخصي' },
  country: { fa: 'کشور', en: 'Country', ar: 'الدولة' },
  city: { fa: 'شهر', en: 'City', ar: 'المدينة' },
  address: { fa: 'آدرس', en: 'Address', ar: 'العنوان' },
  savedPhones: { fa: 'شماره‌های ثبت شده', en: 'Saved phone numbers', ar: 'أرقام الهاتف المحفوظة' },
  noPhones: { fa: 'شماره‌ای ثبت نشده است.', en: 'No phone numbers saved.', ar: 'لا توجد أرقام محفوظة.' },
  addPhone: { fa: 'افزودن شماره اختیاری', en: 'Add optional phone', ar: 'إضافة رقم اختياري' },
  omanNumber: { fa: 'شماره عمان', en: 'Oman number', ar: 'رقم عُمان' },
  uaeNumber: { fa: 'شماره امارات', en: 'UAE number', ar: 'رقم الإمارات' },
  turkeyNumber: { fa: 'شماره ترکیه', en: 'Turkey number', ar: 'رقم تركيا' },
  iranNumber: { fa: 'شماره ایران', en: 'Iran number', ar: 'رقم إيران' },
  other: { fa: 'سایر', en: 'Other', ar: 'أخرى' },
  optionalLabel: { fa: 'عنوان اختیاری', en: 'Optional label', ar: 'وصف اختياري' },
  saving: { fa: 'در حال ثبت...', en: 'Saving...', ar: 'جاري الحفظ...' },
  savePhone: { fa: 'ثبت شماره', en: 'Save phone', ar: 'حفظ الرقم' },
  addBank: { fa: 'افزودن حساب بانکی', en: 'Add bank account', ar: 'إضافة حساب بنكي' },
  currency: { fa: 'ارز', en: 'Currency', ar: 'العملة' },
  bankName: { fa: 'نام بانک', en: 'Bank name', ar: 'اسم البنك' },
  accountHolder: { fa: 'نام صاحب حساب', en: 'Account holder name', ar: 'اسم صاحب الحساب' },
  accountNumber: { fa: 'شماره حساب', en: 'Account number', ar: 'رقم الحساب' },
  saveAccount: { fa: 'ثبت حساب', en: 'Save account', ar: 'حفظ الحساب' },
  recentTransfers: { fa: 'آخرین حواله‌ها', en: 'Recent transfers', ar: 'آخر التحويلات' },
  noTransfers: { fa: 'هنوز حواله‌ای ثبت نشده است.', en: 'No transfers yet.', ar: 'لا توجد تحويلات حتى الآن.' },
  bankAccounts: { fa: 'حساب‌های بانکی', en: 'Bank accounts', ar: 'الحسابات البنكية' },
  noBankAccounts: { fa: 'هنوز حساب بانکی ثبت نشده است.', en: 'No bank accounts saved.', ar: 'لا توجد حسابات بنكية محفوظة.' },
  phoneSaved: { fa: 'شماره جدید ثبت شد.', en: 'Phone number saved.', ar: 'تم حفظ الرقم.' },
  phoneFailed: { fa: 'ثبت شماره انجام نشد.', en: 'Could not save phone number.', ar: 'تعذر حفظ الرقم.' },
  bankSaved: { fa: 'حساب بانکی ثبت شد.', en: 'Bank account saved.', ar: 'تم حفظ الحساب البنكي.' },
  bankFailed: { fa: 'ثبت حساب بانکی انجام نشد.', en: 'Could not save bank account.', ar: 'تعذر حفظ الحساب البنكي.' }
} satisfies Record<string, Record<Locale, string>>;

export function AccountDashboard({ locale }: { locale: Locale }) {
  const [me, setMe] = useState<Me | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
    setMe(userResponse.ok ? await userResponse.json() : null);
    setDashboard(dashboardResponse.ok ? await dashboardResponse.json() : null);
    setLoading(false);
  }

  useEffect(() => {
    void loadAccount();
  }, []);

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
    setMessage(response.ok ? copy.phoneSaved[locale] : copy.phoneFailed[locale]);
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
    setMessage(response.ok ? copy.bankSaved[locale] : copy.bankFailed[locale]);
    if (response.ok) {
      event.currentTarget.reset();
      await loadAccount();
    }
  }

  if (loading) return <p>{copy.loading[locale]}</p>;
  if (!me) {
    return (
      <div className="surface rounded-md p-6">
        <h1 className="text-2xl font-semibold">{copy.myAccount[locale]}</h1>
        <p className="mt-3 text-[#66707d]">{copy.signInPrompt[locale]}</p>
        <div className="mt-5 flex gap-3">
          <Link href={`/${locale}/login`} className="rounded-md bg-[#c7a15b] px-4 py-2 font-medium text-[#101e30]">
            {copy.signIn[locale]}
          </Link>
          <Link href={`/${locale}/register`} className="rounded-md border border-black/10 px-4 py-2">
            {copy.register[locale]}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-md p-6">
        <p className="eyebrow text-sm">{copy.myAccount[locale]}</p>
        <h1 className="mt-2 text-3xl font-semibold">
          {me.profile ? `${me.profile.firstName} ${me.profile.lastName}` : me.email}
        </h1>
        <p className="mt-2 text-[#66707d]" dir="ltr">
          {me.email} · {me.phone}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label={copy.activeTransfers[locale]} value={dashboard?.activeOrders ?? 0} />
        <Stat label={copy.completedTransfers[locale]} value={dashboard?.completedOrders ?? 0} />
        <article className="surface rounded-md p-5">
          <p className="text-sm text-[#66707d]">{copy.kycStatus[locale]}</p>
          <p className="mt-3 text-xl font-semibold">{dashboard?.latestKycStatus ?? copy.notSubmitted[locale]}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{copy.profile[locale]}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Info label={copy.country[locale]} value={me.profile?.country ?? '-'} />
            <Info label={copy.city[locale]} value={me.profile?.city ?? '-'} />
            <Info label={copy.address[locale]} value={me.profile?.address ?? '-'} />
          </dl>
        </article>

        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{copy.savedPhones[locale]}</h2>
          <div className="mt-4 space-y-3 text-sm">
            {me.phones.length === 0 && <p className="text-[#66707d]">{copy.noPhones[locale]}</p>}
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
          <h2 className="text-xl font-semibold">{copy.addPhone[locale]}</h2>
          <form onSubmit={submitPhone} className="mt-4 grid gap-3">
            <select name="type" required className="h-12 rounded-md border border-black/10 px-3">
              <option value="OMAN">{copy.omanNumber[locale]}</option>
              <option value="UAE">{copy.uaeNumber[locale]}</option>
              <option value="TURKEY">{copy.turkeyNumber[locale]}</option>
              <option value="IRAN">{copy.iranNumber[locale]}</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="OTHER">{copy.other[locale]}</option>
            </select>
            <input name="label" placeholder={copy.optionalLabel[locale]} className="h-12 rounded-md border border-black/10 px-3" />
            <input name="number" dir="ltr" required placeholder="+968..." className="h-12 rounded-md border border-black/10 px-3" />
            <button disabled={savingPhone} className="rounded-md bg-[#101e30] px-4 py-3 text-white disabled:opacity-60">
              {savingPhone ? copy.saving[locale] : copy.savePhone[locale]}
            </button>
          </form>
        </article>

        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{copy.addBank[locale]}</h2>
          <form onSubmit={submitBankAccount} className="mt-4 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input name="country" required placeholder={copy.country[locale]} className="h-12 rounded-md border border-black/10 px-3" />
              <input name="currency" required placeholder={copy.currency[locale]} className="h-12 rounded-md border border-black/10 px-3" />
            </div>
            <input name="bankName" required placeholder={copy.bankName[locale]} className="h-12 rounded-md border border-black/10 px-3" />
            <input name="accountHolderName" required placeholder={copy.accountHolder[locale]} className="h-12 rounded-md border border-black/10 px-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <input name="iban" dir="ltr" placeholder="IBAN" className="h-12 rounded-md border border-black/10 px-3" />
              <input name="accountNumber" dir="ltr" placeholder={copy.accountNumber[locale]} className="h-12 rounded-md border border-black/10 px-3" />
            </div>
            <button disabled={savingAccount} className="rounded-md bg-[#101e30] px-4 py-3 text-white disabled:opacity-60">
              {savingAccount ? copy.saving[locale] : copy.saveAccount[locale]}
            </button>
          </form>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{copy.recentTransfers[locale]}</h2>
          <div className="mt-4 space-y-3 text-sm">
            {dashboard?.recentOrders.length ? dashboard.recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between rounded-md border border-black/10 px-3 py-2">
                <span>{order.status}</span>
                <span dir="ltr">{new Date(order.createdAt).toLocaleDateString(intlLocale(locale))}</span>
              </div>
            )) : <p className="text-[#66707d]">{copy.noTransfers[locale]}</p>}
          </div>
        </article>

        <article className="surface rounded-md p-6">
          <h2 className="text-xl font-semibold">{copy.bankAccounts[locale]}</h2>
          <div className="mt-4 space-y-3 text-sm">
            {me.bankAccounts.length ? me.bankAccounts.map((account) => (
              <div key={account.id} className="rounded-md border border-black/10 px-3 py-2">
                <p>{account.bankName}</p>
                <p className="mt-1 text-[#66707d]">
                  {account.country} · {account.currency}
                </p>
              </div>
            )) : <p className="text-[#66707d]">{copy.noBankAccounts[locale]}</p>}
          </div>
        </article>
      </section>

      {message && <p className="text-sm text-[#66707d]">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <article className="surface rounded-md p-5">
      <p className="text-sm text-[#66707d]">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
