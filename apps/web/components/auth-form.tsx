'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notifyAuthChange } from '../lib/auth-client';
import { SocialAuthButtons } from './social-auth-buttons';
import { Locale } from '../lib/i18n';

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const authErrors: Record<string, Record<Locale, string>> = {
  social_not_configured: {
    fa: 'Google/Apple هنوز در پنل MojoAuth فعال نشده. Client ID و Secret را وارد کنید، toggle را روشن کنید، و redirectها را whitelist کنید.',
    en: 'Google/Apple is not enabled in MojoAuth yet. Add credentials, turn on the provider, and whitelist redirect URLs.',
    ar: 'لم يتم تفعيل Google/Apple في MojoAuth بعد. أضف بيانات الاعتماد وفعّل المزود واسمح بعناوين إعادة التوجيه.'
  },
  social_failed: {
    fa: 'ورود اجتماعی ناموفق بود. در MojoAuth این redirectها را whitelist کنید: https://api.omoney.online/auth/social/fa/google/callback و .../en/google/callback',
    en: 'Social sign-in failed. Whitelist https://api.omoney.online/auth/social/fa/google/callback in MojoAuth.',
    ar: 'فشل تسجيل الدخول الاجتماعي. أضف عنوان إعادة التوجيه في MojoAuth.'
  },
  social_missing_state: {
    fa: 'بازگشت از Google بدون state_id بود. redirect URL در MojoAuth را دقیقاً مطابق راهنما whitelist کنید.',
    en: 'Google returned without state_id. Whitelist the exact callback URL in MojoAuth.',
    ar: 'عاد Google بدون state_id. اسمح بعنوان callback الدقيق في MojoAuth.'
  },
  social_expired: {
    fa: 'زمان ورود اجتماعی تمام شد. دوباره تلاش کنید.',
    en: 'Social sign-in expired. Please try again.',
    ar: 'انتهت صلاحية تسجيل الدخول الاجتماعي. حاول مرة أخرى.'
  },
  google_failed: {
    fa: 'ورود با Google ناموفق بود. لطفاً دوباره تلاش کنید یا با ایمیل وارد شوید.',
    en: 'Google sign-in failed. Try again or use email.',
    ar: 'فشل تسجيل الدخول عبر Google. حاول مرة أخرى أو استخدم البريد الإلكتروني.'
  }
};

export function AuthForm({
  locale,
  mode,
  authError
}: {
  locale: Locale;
  mode: 'login' | 'register';
  authError?: string | null;
}) {
  const fa = locale === 'fa';
  const router = useRouter();
  const [error, setError] = useState<string | null>(
    authError ? (authErrors[authError]?.[locale] ?? (locale === 'fa' ? 'ورود ناموفق بود.' : locale === 'ar' ? 'فشل تسجيل الدخول.' : 'Sign-in failed.')) : null
  );

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
      setError(fa ? 'ثبت اطلاعات ناموفق بود.' : 'Request failed.');
      return;
    }
    const tokens = await response.json();
    localStorage.setItem('omoney_access_token', tokens.accessToken);
    localStorage.setItem('omoney_refresh_token', tokens.refreshToken);
    notifyAuthChange();
    router.push(`/${locale}/dashboard`);
  }

  return (
    <div className="grid gap-4">
      <SocialAuthButtons locale={locale} mode={mode} />
      <div className="flex items-center gap-3 text-xs text-[#66707d]">
        <span className="h-px flex-1 bg-black/10" />
        <span>{fa ? 'یا با ایمیل' : 'or with email'}</span>
        <span className="h-px flex-1 bg-black/10" />
      </div>
      <form onSubmit={submit} className="surface grid gap-4 rounded-md p-6">
        {mode === 'register' && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="firstName" label={fa ? 'نام' : 'First name'} />
              <Field name="lastName" label={fa ? 'نام خانوادگی' : 'Last name'} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="phone" label={fa ? 'شماره تلفن' : 'Phone number'} />
              <Field name="country" label={fa ? 'کشور' : 'Country'} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="city" label={fa ? 'شهر' : 'City'} required={false} />
              <Field name="address" label={fa ? 'آدرس' : 'Address'} />
            </div>
          </>
        )}
        <Field name="email" label={fa ? 'ایمیل' : 'Email'} type="email" />
        <Field name="password" label={fa ? 'رمز عبور' : 'Password'} type="password" />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="rounded-md bg-[#c7a15b] px-5 py-3 font-medium text-[#101e30]">
          {mode === 'login' ? (fa ? 'ورود' : 'Sign in') : fa ? 'ثبت نام' : 'Register'}
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required = true
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-[#66707d]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="h-12 rounded-md border border-black/10 px-3 outline-none"
      />
    </label>
  );
}
