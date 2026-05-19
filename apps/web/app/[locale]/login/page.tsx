import { SiteShell } from '../../../components/site-shell';
import { AuthForm } from '../../../components/auth-form';
import { Locale } from '../../../lib/i18n';

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

const title: Record<Locale, string> = {
  fa: 'ورود به حساب',
  en: 'Sign in',
  ar: 'تسجيل الدخول'
};

export default async function LoginPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <SiteShell locale={locale}>
      <section className="mx-auto max-w-xl px-4 py-12 md:px-6">
        <h1 className="mb-6 text-3xl font-semibold">{title[locale]}</h1>
        <AuthForm locale={locale} mode="login" />
      </section>
    </SiteShell>
  );
}
