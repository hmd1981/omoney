import { BadgeCheck } from 'lucide-react';
import { SiteShell } from '../../components/site-shell';
import { PremiumHero } from '../../components/premium-hero';
import { LiveRatesSection } from '../../components/live-rates-section';
import { CorridorsShowcase } from '../../components/corridors-showcase';
import { ProcessSection } from '../../components/process-section';
import { TrustInstitutional } from '../../components/trust-institutional';
import { InstitutionalFooter } from '../../components/institutional-footer';
import { MediaBackground } from '../../components/media-background';
import { content } from '../../lib/content';
import { getMediaPlacements } from '../../lib/media';

const whatsappHref = 'https://wa.me/message/NBV22R27A46TB1';

export default async function Page({ params }: { params: Promise<{ locale: keyof typeof content }> }) {
  const { locale } = await params;
  const t = content[locale] ?? content.fa;
  const media = await getMediaPlacements();
  const fa = locale === 'fa';

  const faq = fa
    ? [
        ['آیا پرداخت آنلاین لازم است؟', 'خیر. درخواست ثبت می‌شود و رسید پرداخت توسط کاربر بارگذاری می‌شود.'],
        ['آیا هر انتقال بررسی می‌شود؟', 'بله. بررسی هویت، مدارک و وضعیت پرداخت پیش از پردازش انجام می‌شود.'],
        ['چه کشورهایی پشتیبانی می‌شوند؟', 'عمان، امارات، ترکیه، ایران، اروپا، کانادا و آمریکا در مسیرهای منتخب.']
      ]
    : [
        ['Is an online gateway required?', 'No. Users submit requests and upload payment receipts manually.'],
        ['Is every transfer reviewed?', 'Yes. Identity, documents, and payment status are checked before processing.'],
        ['Which regions are supported?', 'Oman, UAE, Turkey, Iran, Europe, Canada, and the USA across selected corridors.']
      ];

  return (
    <SiteShell locale={locale}>
      <PremiumHero locale={locale} media={media} />

      <LiveRatesSection locale={locale} />

      <CorridorsShowcase locale={locale} media={media} />

      <ProcessSection locale={locale} media={media} />

      <TrustInstitutional locale={locale} />

      <section className="section-band">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-2 md:px-6">
          <article className="surface-glass overflow-hidden rounded-xl p-6">
            <div className="media-card-slot">
              <MediaBackground media={media.HOME_SECURITY} />
            </div>
            <p className="eyebrow mt-2">{fa ? 'امنیت' : 'Security'}</p>
            <h2 className="mt-3 text-2xl font-semibold">{t.securityTitle}</h2>
            <p className="mt-4 leading-8 text-[#5f6b78]">
              {fa
                ? 'هشدارهای ضد تقلب، بررسی رسید، محدودیت فایل و ثبت سوابق عملیاتی برای کاهش ریسک انتقال پول بین‌المللی.'
                : 'Fraud warnings, receipt review, upload restrictions, and operational traceability reduce international transfer risk.'}
            </p>
          </article>
          <article className="surface-glass overflow-hidden rounded-xl p-6">
            <div className="media-card-slot">
              <MediaBackground media={media.HOME_KYC} />
            </div>
            <p className="eyebrow mt-2">KYC / AML</p>
            <h2 className="mt-3 text-2xl font-semibold">{t.kycTitle}</h2>
            <p className="mt-4 leading-8 text-[#5f6b78]">
              {fa
                ? 'احراز هویت و کنترل‌های انطباق اومانی برای حفاظت از مشتریان و مسیرهای مالی.'
                : 'OMoney identity verification and compliance controls protect clients and financial corridors.'}
            </p>
          </article>
        </div>
      </section>

      <section className="section-dark section-band">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <p className="eyebrow text-[#dec58d]">{fa ? 'چرا اومانی' : 'Why OMoney'}</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{t.whyTitle}</h2>
          <p className="mt-4 max-w-2xl text-white/70">
            {fa
              ? 'صرافی در مسقط، صرافی در دبی و صرافی در استانبول — با یک برند واحد و استاندارد نهادی.'
              : 'Exchange in Muscat, Dubai, and Istanbul — one brand with institutional standards.'}
          </p>
        </div>
      </section>

      <section className="section-band relative isolate overflow-hidden bg-[#fcfbf8]">
        <MediaBackground media={media.HOME_FAQ} />
        <div className="relative mx-auto max-w-5xl px-4 py-16 md:px-6">
          <p className="eyebrow">{fa ? 'پاسخ کوتاه' : 'Quick answers'}</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{t.faqTitle}</h2>
          <div className="mt-8 grid gap-4">
            {faq.map(([question, answer]) => (
              <article key={question} className="surface rounded-xl p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                <h3 className="font-semibold">{question}</h3>
                <p className="mt-3 leading-8 text-[#5f6b78]">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#0b1624] to-[#060d18] px-6 py-10 text-white shadow-[var(--shadow-lg)] md:px-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="eyebrow text-[#dec58d]">{fa ? 'پشتیبانی مستقیم' : 'Direct support'}</p>
                <h2 className="mt-3 text-3xl font-semibold">{t.whatsappTitle}</h2>
                <p className="mt-4 max-w-2xl leading-8 text-white/72">{t.whatsappCopy}</p>
              </div>
              <a className="btn-primary" href={whatsappHref}>
                <BadgeCheck size={18} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <InstitutionalFooter locale={locale} media={media} />
    </SiteShell>
  );
}
