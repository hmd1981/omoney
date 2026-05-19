import { SiteShell } from '../../../components/site-shell';
import { AuthForm } from '../../../components/auth-form';
import { Locale } from '../../../lib/i18n';

export default async function RegisterPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const { locale } = await params;
  const { auth_error: authError } = await searchParams;
  const fa = locale === 'fa';
  return (
    <SiteShell locale={locale}>
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <h1 className="mb-6 text-3xl font-semibold">{fa ? 'ثبت نام' : 'Create account'}</h1>
        <AuthForm locale={locale} mode="register" authError={authError} />
      </section>
    </SiteShell>
  );
}
