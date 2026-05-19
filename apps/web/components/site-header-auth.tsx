'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AUTH_CHANGE_EVENT, hasAuthToken, logoutUser } from '../lib/auth-client';
import { Locale, intlLocale } from '../lib/i18n';

export function SiteHeaderAuth({ locale }: { locale: Locale }) {
  const fa = locale === 'fa';
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  const refreshAuthState = useCallback(() => {
    setLoggedIn(hasAuthToken());
  }, []);

  useEffect(() => {
    refreshAuthState();
    const onAuthChange = () => refreshAuthState();
    window.addEventListener('storage', onAuthChange);
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    return () => {
      window.removeEventListener('storage', onAuthChange);
      window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    };
  }, [refreshAuthState, pathname]);

  async function logout() {
    await logoutUser(locale, router);
    setLoggedIn(false);
  }

  if (loggedIn) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/${locale}/dashboard`}
          className={`rounded-md px-3 py-2 text-sm transition ${
            pathname?.includes('/dashboard')
              ? 'bg-white/15 text-white'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          {fa ? 'حساب من' : 'My account'}
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-md border border-white/20 px-3 py-2 text-sm text-white/90 transition hover:border-white/40 hover:bg-white/10"
        >
          {fa ? 'خروج از حساب' : 'Sign out'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/${locale}/login`}
        className="rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        {fa ? 'ورود' : 'Sign in'}
      </Link>
      <Link
        href={`/${locale}/register`}
        className="rounded-md border border-white/20 px-3 py-2 text-sm text-white/90 transition hover:border-white/40 hover:bg-white/10"
      >
        {fa ? 'ثبت نام' : 'Register'}
      </Link>
    </div>
  );
}
