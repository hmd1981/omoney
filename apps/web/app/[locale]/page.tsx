import {
  BadgeCheck,
  Banknote,
  CircleCheckBig,
  FileCheck2,
  Headset,
  LockKeyhole,
  ShieldCheck,
  TimerReset
} from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SiteShell } from '../../components/site-shell';
import { MediaBackground } from '../../components/media-background';
import { HomepageLiveRatesWithSharedState, HomepageMarketPanelWithRates } from '../../components/homepage-rates-block';
import { content } from '../../lib/content';
import { getMediaPlacements } from '../../lib/media';
import { isLocale, Locale } from '../../lib/i18n';
import { homeMetadata } from '../../lib/seo';

const homeCopy = {
  steps: {
    fa: ['ثبت درخواست و اطلاعات گیرنده', 'بررسی مدارک و تایید نرخ', 'بارگذاری رسید پرداخت', 'پردازش و اعلام وضعیت نهایی'],
    en: ['Submit beneficiary details', 'Review documents and rate', 'Upload payment receipt', 'Processing and final confirmation'],
    ar: ['تسجيل الطلب وبيانات المستفيد', 'مراجعة المستندات وتأكيد السعر', 'رفع إيصال الدفع', 'المعالجة وإبلاغ الحالة النهائية']
  },
  reasons: {
    fa: ['تمرکز بر مسیرهای واقعی حواله', 'پشتیبانی انسانی به جای اتوماسیون مبهم', 'ثبت سوابق و پیگیری مرحله‌ای'],
    en: ['Focused on real remittance corridors', 'Human support instead of opaque automation', 'Recorded status history and tracking'],
    ar: ['تركيز على مسارات تحويل فعلية', 'دعم بشري بدلاً من أتمتة مبهمة', 'سجل واضح ومتابعة لكل مرحلة']
  },
  faq: {
    fa: [
      ['آیا پرداخت آنلاین لازم است؟', 'خیر. در نسخه فعلی، درخواست ثبت می‌شود و رسید پرداخت توسط کاربر بارگذاری می‌شود.'],
      ['آیا هر انتقال بررسی می‌شود؟', 'بله. بررسی هویت، مدارک و وضعیت پرداخت پیش از پردازش انجام می‌شود.'],
      ['چه کشورهایی پشتیبانی می‌شوند؟', 'عمان، امارات، ترکیه، ایران، اروپا، کانادا و آمریکا در مسیرهای منتخب.']
    ],
    en: [
      ['Is an online gateway required?', 'No. In the current version, users submit requests and upload payment receipts manually.'],
      ['Is every transfer reviewed?', 'Yes. Identity, documents, and payment status are checked before processing.'],
      ['Which regions are supported?', 'Oman, UAE, Turkey, Iran, Europe, Canada, and the USA across selected corridors.']
    ],
    ar: [
      ['هل يلزم الدفع الإلكتروني؟', 'لا. في النسخة الحالية يتم تسجيل الطلب ورفع إيصال الدفع من قبل العميل.'],
      ['هل تتم مراجعة كل عملية تحويل؟', 'نعم. تتم مراجعة الهوية والمستندات وحالة الدفع قبل المعالجة.'],
      ['ما المناطق المدعومة؟', 'عُمان، الإمارات، تركيا، إيران، أوروبا، كندا والولايات المتحدة ضمن مسارات محددة.']
    ]
  },
  clearProcess: { fa: 'فرآیند روشن', en: 'Clear process', ar: 'إجراءات واضحة' },
  securityCopy: {
    fa: 'هشدارهای ضد تقلب، بررسی رسید، محدودیت فایل و ثبت سوابق عملیاتی برای کاهش ریسک انتقال.',
    en: 'Fraud warnings, receipt review, upload restrictions, and operational traceability reduce transfer risk.',
    ar: 'تنبيهات مكافحة الاحتيال، مراجعة الإيصالات، قيود رفع الملفات وسجل تشغيلي واضح لتقليل مخاطر التحويل.'
  },
  kycCopy: {
    fa: 'احراز هویت و کنترل‌های انطباق برای حفاظت از مشتریان، مسیرهای مالی و کیفیت عملیات.',
    en: 'Identity verification and compliance controls protect clients, financial corridors, and operational quality.',
    ar: 'التحقق من الهوية وضوابط الامتثال لحماية العملاء ومسارات الأموال وجودة العمليات.'
  },
  operationalTrust: { fa: 'اعتماد عملیاتی', en: 'Operational trust', ar: 'ثقة تشغيلية' },
  quickAnswers: { fa: 'پاسخ کوتاه', en: 'Quick answers', ar: 'إجابات مختصرة' },
  directSupport: { fa: 'پشتیبانی مستقیم', en: 'Direct support', ar: 'دعم مباشر' },
  brandAlt: {
    fa: 'هویت بصری او مانی اکسچنج',
    en: 'OMoney Exchange brand banner',
    ar: 'الهوية البصرية لأو ماني للصرافة'
  },
  footerRegion: { fa: 'عمان و امارات', en: 'Oman and UAE', ar: 'عُمان والإمارات' },
  brandWord: { fa: 'مانی', en: 'Money', ar: 'ماني' }
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return homeMetadata(locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const t = content[locale];
  const media = await getMediaPlacements();
  const whatsappHref = 'https://wa.me/message/NBV22R27A46TB1';

  return (
    <SiteShell locale={locale}>
      <section className="relative isolate overflow-hidden bg-[#0b1624] text-white">
        <MediaBackground media={media.HOME_HERO} eager />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 md:px-6 lg:grid-cols-[1fr_1fr] lg:items-start lg:pb-20 lg:pt-16">
          <div className="fade-up">
            <p className="eyebrow text-sm">{t.heroKicker}</p>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">{t.heroTitle}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">{t.heroCopy}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-md bg-[#c7a15b] px-5 py-3 font-medium text-[#0b1624] transition hover:bg-[#dec58d]">
                {t.primaryCta}
              </button>
              <a
                href={whatsappHref}
                className="rounded-md border border-white/20 px-5 py-3 text-center font-medium text-white transition hover:border-white/40 hover:bg-white/5"
              >
                {t.secondaryCta}
              </a>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-white/75 md:grid-cols-3">
              {t.trustItems.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CircleCheckBig size={16} className="text-[#dec58d]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <figure className="mt-8 ms-auto w-full max-w-[620px] overflow-hidden rounded-md border border-white/12 bg-black/20 shadow-[0_18px_48px_rgba(0,0,0,0.34)]">
              <Image
                src="/images/homepage-trust-banner.jpg"
                alt={homeCopy.brandAlt[locale]}
                width={1280}
                height={682}
                className="h-auto w-full"
                sizes="(min-width: 1024px) 620px, 100vw"
              />
            </figure>
          </div>
          <HomepageMarketPanelWithRates locale={locale} />
        </div>
      </section>

      <HomepageLiveRatesWithSharedState locale={locale} />

      <section className="section-band relative isolate overflow-hidden bg-[#fcfbf8]">
        <MediaBackground media={media.HOME_CORRIDORS} />
        <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="max-w-2xl">
            <p className="eyebrow text-sm">{homeCopy.clearProcess[locale]}</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#101e30]">{t.howTitle}</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {homeCopy.steps[locale].map((step, index) => (
              <article key={step} className="surface rounded-md p-5 transition hover:-translate-y-1">
                <span className="text-sm font-semibold text-[#c7a15b]">0{index + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-2 md:px-6">
          <article className="surface rounded-md p-6">
            <div className="media-card-slot">
              <MediaBackground media={media.HOME_SECURITY} />
            </div>
            <ShieldCheck className="text-[#c7a15b]" />
            <h2 className="mt-5 text-2xl font-semibold text-[#101e30]">{t.securityTitle}</h2>
            <p className="mt-4 leading-8 text-[#66707d]">{homeCopy.securityCopy[locale]}</p>
          </article>
          <article className="surface rounded-md p-6">
            <div className="media-card-slot">
              <MediaBackground media={media.HOME_KYC} />
            </div>
            <FileCheck2 className="text-[#c7a15b]" />
            <h2 className="mt-5 text-2xl font-semibold text-[#101e30]">{t.kycTitle}</h2>
            <p className="mt-4 leading-8 text-[#66707d]">{homeCopy.kycCopy[locale]}</p>
          </article>
        </div>
      </section>

      <section className="section-band bg-[#101e30] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <p className="eyebrow text-sm">{homeCopy.operationalTrust[locale]}</p>
          <h2 className="mt-3 text-3xl font-semibold">{t.whyTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[Banknote, Headset, TimerReset].map((Icon, index) => (
              <article key={homeCopy.reasons[locale][index]} className="rounded-md border border-white/10 bg-white/5 p-5 transition hover:border-[#c7a15b]/60 hover:bg-white/8">
                <Icon className="text-[#dec58d]" />
                <h3 className="mt-4 text-lg font-semibold">{homeCopy.reasons[locale][index]}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band relative isolate overflow-hidden bg-[#fcfbf8]">
        <MediaBackground media={media.HOME_FAQ} />
        <div className="relative mx-auto max-w-5xl px-4 py-14 md:px-6">
          <p className="eyebrow text-sm">{homeCopy.quickAnswers[locale]}</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#101e30]">{t.faqTitle}</h2>
          <div className="mt-8 grid gap-4">
            {homeCopy.faq[locale].map(([question, answer]) => (
              <article key={question} className="surface rounded-md p-5">
                <h3 className="font-semibold">{question}</h3>
                <p className="mt-3 leading-8 text-[#66707d]">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="rounded-md bg-[#0b1624] px-5 py-8 text-white md:px-8">
            <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="eyebrow text-sm">{homeCopy.directSupport[locale]}</p>
                <h2 className="mt-3 text-3xl font-semibold">{t.whatsappTitle}</h2>
                <p className="mt-4 max-w-2xl leading-8 text-white/72">{t.whatsappCopy}</p>
              </div>
              <a className="inline-flex items-center justify-center gap-2 rounded-md bg-[#c7a15b] px-5 py-3 font-medium text-[#0b1624] transition hover:bg-[#dec58d]" href={whatsappHref}>
                <BadgeCheck size={18} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative isolate overflow-hidden border-t border-black/10 bg-[#fcfbf8]">
        <MediaBackground media={media.FOOTER_BACKGROUND} />
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-[#66707d] md:grid-cols-[1fr_auto] md:px-6">
          <div>
            <p className="brand-wordmark flex items-center gap-1 text-lg font-semibold text-[#101e30]" dir="ltr">
              <span>O</span>
              <span>{homeCopy.brandWord[locale]}</span>
            </p>
            <p className="mt-2">{t.footerCopy}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2"><LockKeyhole size={16} /> KYC / AML</span>
            <span>{homeCopy.footerRegion[locale]}</span>
            {t.legal.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </footer>
    </SiteShell>
  );
}
