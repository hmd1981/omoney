'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '../lib/auth-client';
import { Locale, intlLocale } from '../lib/i18n';

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Me = {
  email: string;
  phone: string | null;
  profile: {
    firstName: string;
    lastName: string;
    country: string;
    city?: string | null;
    address?: string | null;
  } | null;
  profileComplete?: boolean;
};

export function CompleteProfileForm({ locale }: { locale: Locale }) {
  const fa = locale === 'fa';
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('omoney_access_token');
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }
    void fetch(`${apiBase}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) {
          router.replace(`/${locale}/login`);
          return;
        }
        const data = (await response.json()) as Me;
        if (data.profileComplete) {
          router.replace(`/${locale}/dashboard`);
          return;
        }
        setMe(data);
        setLoading(false);
      });
  }, [locale, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const token = localStorage.getItem('omoney_access_token');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`${apiBase}/users/me/complete-profile`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setSaving(false);
    if (!response.ok) {
      setError(
        fa ? 'ثبت مشخصات انجام نشد. همه فیلدها را پر کنید.' : 'Could not save your details. Fill all required fields.'
      );
      return;
    }
    router.replace(`/${locale}/dashboard`);
    router.refresh();
  }

  if (loading) {
    return <p className="text-[#66707d]">{fa ? 'در حال بارگذاری...' : 'Loading...'}</p>;
  }

  const profile = me?.profile;
  const defaultFirst =
    profile?.firstName && profile.firstName !== 'OMoney' ? profile.firstName : '';
  const defaultLast = profile?.lastName && profile.lastName !== 'User' ? profile.lastName : '';

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <section className="surface flex flex-col gap-4 rounded-md p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
        <p className="eyebrow text-sm">{fa ? 'تکمیل عضویت' : 'Complete registration'}</p>
        <h1 className="mt-2 text-2xl font-semibold">
          {fa ? 'مشخصات خود را وارد کنید' : 'Enter your details'}
        </h1>
        <p className="mt-2 text-sm text-[#66707d]">
          {fa
            ? 'ورود با Google انجام شد. برای فعال‌سازی حساب، نام، نام خانوادگی، کشور و شماره تماس را ثبت کنید.'
            : 'You signed in with Google. Add your name, country, and phone to activate your account.'}
        </p>
        {me?.email ? (
          <p className="mt-2 text-sm" dir="ltr">
            {me.email}
          </p>
        ) : null}
        </div>
        <button
          type="button"
          onClick={() => void logoutUser(locale, router)}
          className="shrink-0 rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5"
        >
          {fa ? 'خروج از حساب' : 'Sign out'}
        </button>
      </section>

      <form onSubmit={submit} className="surface grid gap-4 rounded-md p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="firstName" label={fa ? 'نام' : 'First name'} defaultValue={defaultFirst} />
          <Field name="lastName" label={fa ? 'نام خانوادگی' : 'Last name'} defaultValue={defaultLast} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            name="phone"
            label={fa ? 'شماره تلفن' : 'Phone number'}
            defaultValue={me?.phone ?? ''}
            dir="ltr"
          />
          <Field
            name="country"
            label={fa ? 'کشور' : 'Country'}
            defaultValue={profile?.country && profile.country !== 'Unknown' ? profile.country : ''}
          />
        </div>
        <Field
          name="city"
          label={fa ? 'شهر (اختیاری)' : 'City (optional)'}
          defaultValue={profile?.city ?? ''}
          required={false}
        />
        <Field
          name="address"
          label={fa ? 'آدرس (اختیاری)' : 'Address (optional)'}
          defaultValue={profile?.address ?? ''}
          required={false}
        />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[#c7a15b] px-5 py-3 font-medium text-[#101e30] disabled:opacity-60"
        >
          {saving ? (fa ? 'در حال ثبت...' : 'Saving...') : fa ? 'تأیید و فعال‌سازی حساب' : 'Confirm and activate'}
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue = '',
  required = true,
  dir
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-[#66707d]">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        dir={dir}
        className="h-12 rounded-md border border-black/10 px-3 outline-none"
      />
    </label>
  );
}
