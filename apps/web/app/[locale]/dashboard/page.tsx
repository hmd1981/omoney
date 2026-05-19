import { SiteShell } from '../../../components/site-shell';
import { AccountDashboard } from '../../../components/account-dashboard';
import { Locale } from '../../../lib/i18n';

export default async function Dashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <SiteShell locale={locale}>
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <AccountDashboard locale={locale} />
      </section>
    </SiteShell>
  );
}
