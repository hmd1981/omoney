import { SiteShell } from '../../../components/site-shell';
import { CompleteProfileForm } from '../../../components/complete-profile-form';

export default async function CompleteProfilePage({ params }: { params: Promise<{ locale: 'fa' | 'en' }> }) {
  const { locale } = await params;
  return (
    <SiteShell locale={locale}>
      <section className="mx-auto max-w-xl px-4 py-12 md:px-6">
        <CompleteProfileForm locale={locale} />
      </section>
    </SiteShell>
  );
}
