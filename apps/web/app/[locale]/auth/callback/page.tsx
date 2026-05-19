'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notifyAuthChange } from '../../../../lib/auth-client';
import { Locale } from '../../../../lib/i18n';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useParams<{ locale: Locale }>();

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    const refreshToken = fragment.get('refresh_token');
    if (accessToken && refreshToken) {
      localStorage.setItem('omoney_access_token', accessToken);
      localStorage.setItem('omoney_refresh_token', refreshToken);
      notifyAuthChange();
      const profileIncomplete = fragment.get('profile_incomplete') === '1';
      router.replace(
        profileIncomplete ? `/${params.locale}/complete-profile` : `/${params.locale}/dashboard`
      );
      return;
    }
    router.replace(`/${params.locale}/login`);
  }, [params.locale, router]);

  return null;
}
