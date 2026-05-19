'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Locale } from '../lib/i18n';

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const copy = {
  requestFailed: { fa: 'ثبت اطلاعات ناموفق بود.', en: 'Request failed.', ar: 'تعذر إرسال الطلب.' },
  continue: { fa: 'ورود با حساب اومانی', en: 'Continue with OMoney', ar: 'المتابعة بحساب أو ماني' },
  or: { fa: 'یا', en: 'or', ar: 'أو' },
  firstName: { fa: 'نام', en: 'First name', ar: 'الاسم الأول' },
  lastName: { fa: 'نام خانوادگی', en: 'Last name', ar: 'اسم العائلة' },
  phone: { fa: 'شماره تلفن', en: 'Phone number', ar: 'رقم الهاتف' },
  country: { fa: 'کشور', en: 'Country', ar: 'الدولة' },
  city: { fa: 'شهر', en: 'City', ar: 'المدينة' },
  address: { fa: 'آدرس', en: 'Address', ar: 'العنوان' },
  email: { fa: 'ایمیل', en: 'Email', ar: 'البريد الإلكتروني' },
  password: { fa: 'رمز عبور', en: 'Password', ar: 'كلمة المرور' },
  signIn: { fa: 'ورود', en: 'Sign in', ar: 'تسجيل الدخول' },
  register: { fa: 'ثبت نام', en: 'Register', ar: 'إنشاء حساب' }
} satisfies Record<string, Record<Locale, string>>;

export function AuthForm({ locale, mode }: { locale: Locale; mode: 'login' | 'register' }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`${apiBase}/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      setError(copy.requestFailed[locale]);
      return;
    }
    const tokens = await response.json();
    localStorage.setItem('omoney_access_token', tokens.accessToken);
    localStorage.setItem('omoney_refresh_token', tokens.refreshToken);
    router.push(`/${locale}/dashboard`);
  }

  return (
    <div className="grid gap-4">
      <a
        href={`${apiBase}/auth/mojoauth/start?locale=${locale}`}
        className="rounded-md border border-[#c7a15b]/50 bg-[#101e30] px-5 py-3 text-center font-medium text-white transition hover:border-[#dec58d]"
      >
        {copy.continue[locale]}
      </a>
      <div className="flex items-center gap-3 text-xs text-[#66707d]">
        <span className="h-px flex-1 bg-black/10" />
        <span>{copy.or[locale]}</span>
        <span className="h-px flex-1 bg-black/10" />
      </div>
      <form onSubmit={submit} className="surface grid gap-4 rounded-md p-6">
        {mode === 'register' && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="firstName" label={copy.firstName[locale]} />
              <Field name="lastName" label={copy.lastName[locale]} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="phone" label={copy.phone[locale]} />
              <Field name="country" label={copy.country[locale]} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="city" label={copy.city[locale]} required={false} />
              <Field name="address" label={copy.address[locale]} />
            </div>
          </>
        )}
        <Field name="email" label={copy.email[locale]} type="email" />
        <Field name="password" label={copy.password[locale]} type="password" />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="rounded-md bg-[#c7a15b] px-5 py-3 font-medium text-[#101e30]">
          {mode === 'login' ? copy.signIn[locale] : copy.register[locale]}
        </button>
      </form>
    </div>
  );
}

function Field({ name, label, type = 'text', required = true }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-[#66707d]">{label}</span>
      <input name={name} type={type} required={required} className="h-12 rounded-md border border-black/10 px-3 outline-none" />
    </label>
  );
}
