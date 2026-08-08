import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, BadgeCheck } from 'lucide-react';
import { SiteShell } from '../../components/site-shell';
import { PremiumHero } from '../../components/premium-hero';
import { LiveRatesSection } from '../../components/live-rates-section';
import { CorridorsShowcase } from '../../components/corridors-showcase';
import { ProcessSection } from '../../components/process-section';
import { TrustInstitutional } from '../../components/trust-institutional';
import { MediaBackground } from '../../components/media-background';
import { HomepageRatesProvider } from '../../components/homepage-rates';
import { JsonLd } from '../../components/json-ld';
import { content } from '../../lib/content';
import { faqPageJsonLd, organizationJsonLd } from '../../lib/json-ld';
import { getHomepageRates } from '../../lib/homepage-rates';
import { getMediaPlacements } from '../../lib/media';
import { visualAssets } from '../../lib/visual-assets';
import { isLocale, Locale } from '../../lib/i18n';
import { homeMetadata } from '../../lib/seo';
import { getWhatsAppHref } from '../../lib/whatsapp';
import { guidePageTitles } from '../../lib/corridor-guides';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return homeMetadata(raw);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const t = content[locale];
  const [media, initialRates] = await Promise.all([getMediaPlacements(), getHomepageRates()]);
  const whatsappHref = getWhatsAppHref(locale);
  const Arrow = locale === 'en' ? ArrowRight : ArrowLeft;

  const faqByLocale = {
    fa: [
      ['آیا پرداخت آنلاین لازم است؟', 'خیر. درخواست ثبت می‌شود و رسید پرداخت توسط کاربر بارگذاری می‌شود.'],
      ['آیا هر انتقال بررسی می‌شود؟', 'بله. بررسی هویت، مدارک و وضعیت پرداخت پیش از پردازش انجام می‌شود.'],
      ['چه کشورهایی پشتیبانی می‌شوند؟', 'عمان، امارات، ترکیه، ایران، اروپا، کانادا و آمریکا در مسیرهای منتخب.'],
      ['نرخ سایت نهایی است؟', 'نرخ‌های بازار مرجع هستند؛ نرخ نهایی حواله پس از تأیید تیم مالی اعلام می‌شود.']
    ],
    en: [
      ['Is an online gateway required?', 'No. Users submit requests and upload payment receipts manually.'],
      ['Is every transfer reviewed?', 'Yes. Identity, documents, and payment status are checked before processing.'],
      ['Which regions are supported?', 'Oman, UAE, Turkey, Iran, Europe, Canada, and the USA across selected corridors.'],
      ['Are website rates final?', 'Market rates are reference only; final remittance rates are confirmed by the finance team.']
    ],
    ar: [
      ['هل يلزم الدفع الإلكتروني؟', 'لا. يتم تسجيل الطلب ورفع إيصال الدفع من قبل العميل.'],
      ['هل تتم مراجعة كل عملية تحويل؟', 'نعم. تتم مراجعة الهوية والمستندات وحالة الدفع قبل المعالجة.'],
      ['ما المناطق المدعومة؟', 'عُمان، الإمارات، تركيا، إيران، أوروبا، كندا والولايات المتحدة ضمن مسارات محددة.'],
      ['هل أسعار الموقع نهائية؟', 'أسعار السوق مرجعية فقط؛ يُؤكد السعر النهائي للتحويل من فريق المالية.']
    ]
  } as const;
  const faq = faqByLocale[locale];

  const whyPoints = {
    fa: [
      ['مسقط', 'دفتر مرکزی و مسیر حواله عمان با پشتیبانی عملیاتی مستقیم.'],
      ['دبی', 'مسیر پرتقاضای امارات با هماهنگی و پیگیری شفاف.'],
      ['استانبول', 'پل ترکیه، اروپا و مقاصد منتخب بین‌المللی.']
    ],
    en: [
      ['Muscat', 'Headquarters and Oman remittance corridor with direct operations support.'],
      ['Dubai', 'High-demand UAE corridor with transparent coordination and follow-up.'],
      ['Istanbul', 'Bridge to Turkey, Europe, and selected international destinations.']
    ],
    ar: [
      ['مسقط', 'المقر الرئيسي ومسار تحويلات عُمان بدعم تشغيلي مباشر.'],
      ['دبي', 'مسار إماراتي عالي الطلب بتنسيق ومتابعة واضحة.'],
      ['إسطنبول', 'جسر تركيا وأوروبا والمقاصد الدولية المختارة.']
    ]
  } as const;

  return (
    <SiteShell locale={locale}>
      <JsonLd data={organizationJsonLd(locale)} />
      <JsonLd data={faqPageJsonLd(faq)} />

      <HomepageRatesProvider initialRates={initialRates}>
        <PremiumHero locale={locale} media={media} />
        <LiveRatesSection locale={locale} />
      </HomepageRatesProvider>

      <CorridorsShowcase locale={locale} media={media} />

      <ProcessSection locale={locale} media={media} />

      <TrustInstitutional locale={locale} />

      <section className="section-band">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-2 md:px-6">
          <article className="surface-glass overflow-hidden rounded-xl p-6">
            <div className="media-card-slot">
              <MediaBackground
                media={media.HOME_SECURITY}
                fallback={{
                  jpg: visualAssets.offices.gulfOffice,
                  webp: visualAssets.offices.gulfOfficeWebp
                }}
              />
            </div>
            <p className="eyebrow mt-2">{locale === 'fa' ? 'امنیت' : locale === 'ar' ? 'الأمان' : 'Security'}</p>
            <h2 className="mt-3 text-2xl font-semibold">{t.securityTitle}</h2>
            <p className="mt-4 leading-8 text-[#5f6b78]">
              {locale === 'fa'
                ? 'هشدارهای ضد تقلب، بررسی رسید، محدودیت فایل و ثبت سوابق عملیاتی برای کاهش ریسک انتقال پول بین‌المللی. هر درخواست پیش از اجرا از نظر مدارک و وضعیت پرداخت بررسی می‌شود.'
                : locale === 'ar'
                  ? 'تنبيهات مكافحة الاحتيال ومراجعة الإيصالات وقيود رفع الملفات وسجل تشغيلي واضح لتقليل مخاطر التحويل الدولي. تتم مراجعة كل طلب قبل التنفيذ.'
                  : 'Fraud warnings, receipt review, upload restrictions, and operational traceability reduce international transfer risk. Every request is checked for documents and payment status before execution.'}
            </p>
          </article>
          <article className="surface-glass overflow-hidden rounded-xl p-6">
            <div className="media-card-slot">
              <MediaBackground
                media={media.HOME_KYC}
                fallback={{
                  jpg: visualAssets.offices.consultation,
                  webp: visualAssets.offices.consultationWebp
                }}
              />
            </div>
            <p className="eyebrow mt-2">KYC / AML</p>
            <h2 className="mt-3 text-2xl font-semibold">{t.kycTitle}</h2>
            <p className="mt-4 leading-8 text-[#5f6b78]">
              {locale === 'fa'
                ? 'احراز هویت و کنترل‌های انطباق اومانی برای حفاظت از مشتریان و مسیرهای مالی طراحی شده‌اند. مدارک فقط در مسیرهای رسمی و امن دریافت می‌شوند.'
                : locale === 'ar'
                  ? 'التحقق من الهوية وضوابط الامتثال في أوماني لحماية العملاء ومسارات الأموال. تُستلم المستندات عبر القنوات الرسمية الآمنة فقط.'
                  : 'OMoney identity verification and compliance controls protect clients and financial corridors. Documents are collected only through official secure channels.'}
            </p>
          </article>
        </div>
      </section>

      <section className="section-dark section-band">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <p className="eyebrow text-[#dec58d]">{locale === 'fa' ? 'چرا اومانی' : locale === 'ar' ? 'لماذا أوماني' : 'Why OMoney'}</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{t.whyTitle}</h2>
          <p className="mt-4 max-w-3xl leading-8 text-white/70">
            {locale === 'fa'
              ? 'صرافی در مسقط، صرافی در دبی و صرافی در استانبول — با یک برند واحد، پشتیبانی انسانی و استاندارد نهادی. مسیر مناسب را انتخاب کنید یا راهنمای کامل آن را بخوانید.'
              : locale === 'ar'
                ? 'صرافة في مسقط ودبي وإسطنبول — علامة واحدة، دعم بشري ومعايير مؤسسية. اختر المسار المناسب أو اقرأ دليله الكامل.'
                : 'Exchange in Muscat, Dubai, and Istanbul — one brand, human support, and institutional standards. Choose the right corridor or read the full guide.'}
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {whyPoints[locale].map(([city, copy], index) => {
              const slug = (['oman-remittance', 'dubai-remittance', 'turkey-remittance'] as const)[index];
              return (
                <Link
                  key={city}
                  href={`/${locale}/${slug}`}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-[#dec58d]/40 hover:bg-white/8"
                >
                  <p className="text-sm font-semibold text-[#dec58d]">{city}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{guidePageTitles[locale][slug]}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/65">{copy}</p>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/services`} className="btn-ghost text-sm">
              {locale === 'fa' ? 'خدمات ما' : locale === 'ar' ? 'خدماتنا' : 'Our services'}
            </Link>
            <Link href={`/${locale}/about`} className="btn-primary text-sm">
              {locale === 'fa' ? 'درباره اومانی' : locale === 'ar' ? 'من نحن' : 'About OMoney'}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-band relative isolate overflow-hidden bg-[#fcfbf8]">
        <MediaBackground media={media.HOME_FAQ} />
        <div className="relative mx-auto max-w-5xl px-4 py-16 md:px-6">
          <p className="eyebrow">{locale === 'fa' ? 'پاسخ کوتاه' : locale === 'ar' ? 'إجابات مختصرة' : 'Quick answers'}</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{t.faqTitle}</h2>
          <div className="mt-8 grid gap-4">
            {faq.map(([question, answer]) => (
              <article key={question} className="surface rounded-xl p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                <h3 className="font-semibold">{question}</h3>
                <p className="mt-3 leading-8 text-[#5f6b78]">{answer}</p>
              </article>
            ))}
          </div>
          <Link
            href={`/${locale}/faq`}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8a6421] transition hover:text-[#101e30]"
          >
            {locale === 'fa' ? 'مشاهده همه سوالات متداول' : locale === 'ar' ? 'عرض كل الأسئلة الشائعة' : 'See all FAQs'}
            <Arrow size={16} />
          </Link>
        </div>
      </section>

      <section className="section-band">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#0b1624] to-[#060d18] px-6 py-10 text-white shadow-[var(--shadow-lg)] md:px-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="eyebrow text-[#dec58d]">{locale === 'fa' ? 'پشتیبانی مستقیم' : locale === 'ar' ? 'دعم مباشر' : 'Direct support'}</p>
                <h2 className="mt-3 text-3xl font-semibold">{t.whatsappTitle}</h2>
                <p className="mt-4 max-w-2xl leading-8 text-white/72">{t.whatsappCopy}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a className="btn-primary" href={whatsappHref}>
                  <BadgeCheck size={18} />
                  WhatsApp
                </a>
                <Link href={`/${locale}/contact`} className="btn-ghost text-center">
                  {locale === 'fa' ? 'تماس با ما' : locale === 'ar' ? 'تواصل معنا' : 'Contact us'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
