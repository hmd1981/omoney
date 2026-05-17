import { SiteShell } from '../../../components/site-shell';
import { AuthForm } from '../../../components/auth-form';

export default async function LoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: 'fa' | 'en' }>;
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const { locale } = await params;
  const { auth_error: authError } = await searchParams;
  const fa = locale === 'fa';
  return (
    <SiteShell locale={locale}>
      <section className="mx-auto max-w-xl px-4 py-12 md:px-6">
        <h1 className="mb-6 text-3xl font-semibold">{fa ? 'ورود به حساب' : 'Sign in'}</h1>
        <AuthForm locale={locale} mode="login" authError={authError} />
      </section>
    </SiteShell>
  );
}
