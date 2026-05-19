import { notFound } from 'next/navigation';
import Image from 'next/image';
import { SiteShell } from '../../../components/site-shell';
import { MediaBackground } from '../../../components/media-background';
import { RatesCatalog } from '../../../components/rates-catalog';
import { content } from '../../../lib/content';
import { getMediaPlacements } from '../../../lib/media';
import { isLocale, Locale } from '../../../lib/i18n';
import { pageMetadata, publicPages, type PublicPage } from '../../../lib/seo';

type StaticPageKey = PublicPage;

const pageTitles: Record<Locale, Record<StaticPageKey, string>> = {
  fa: {
    about: 'درباره او مانی',
    services: 'خدمات ما',
    rates: 'نرخ ارز',
    faq: 'سوالات متداول',
    contact: 'تماس',
    terms: 'قوانین',
    privacy: 'حریم خصوصی'
  },
  en: {
    about: 'About OMoney',
    services: 'Our services',
    rates: 'Exchange rates',
    faq: 'FAQ',
    contact: 'Contact',
    terms: 'Terms',
    privacy: 'Privacy'
  },
  ar: {
    about: 'من نحن',
    services: 'خدماتنا',
    rates: 'أسعار الصرف',
    faq: 'الأسئلة الشائعة',
    contact: 'تواصل معنا',
    terms: 'الشروط',
    privacy: 'الخصوصية'
  }
};

const services: Record<Locale, Array<[string, string]>> = {
  fa: [
    ['حواله بین‌المللی', 'انتقال پول در مسیرهای منتخب با بررسی انسانی، پیگیری شفاف و هماهنگی عملیاتی.'],
    ['تبدیل ارز', 'ارائه نرخ‌های به‌روز و تبدیل ارز با تایید تیم مالی پیش از اجرای نهایی.'],
    ['مشاوره مسیر انتقال', 'بررسی مبدا، مقصد، ارز و مبلغ برای انتخاب مسیر مناسب هر درخواست.'],
    ['بررسی مدارک و پشتیبانی', 'راهنمایی در مورد مدارک هویتی، رسیدها و الزامات بررسی درخواست.'],
    ['ثبت شرکت و مشاوره بیزینس', 'راهنمایی اولیه برای ثبت شرکت، ساختار تجاری و نیازهای ارزی کسب‌وکارها.']
  ],
  en: [
    ['International remittance', 'Human-reviewed transfers across selected corridors with transparent operational follow-up.'],
    ['Currency exchange', 'Live market references with finance-team confirmation before final execution.'],
    ['Transfer route advisory', 'Guidance based on source, destination, currency, and amount.'],
    ['Document review and support', 'Help with identity documents, receipts, and request preparation.'],
    ['Company setup and business advisory', 'Initial guidance for company formation, business structure, and FX needs.']
  ],
  ar: [
    ['التحويلات المالية الدولية', 'تحويلات تتم مراجعتها بشرياً عبر مسارات محددة مع متابعة تشغيلية واضحة.'],
    ['صرف العملات', 'أسعار محدثة ومراجعة من فريق المالية قبل التنفيذ النهائي.'],
    ['استشارة مسار التحويل', 'توجيه حسب بلد الإرسال، بلد الاستلام، العملة والمبلغ.'],
    ['مراجعة المستندات والدعم', 'مساعدة في مستندات الهوية والإيصالات ومتطلبات تجهيز الطلب.'],
    ['تأسيس الشركات والاستشارات التجارية', 'إرشاد أولي لتأسيس الشركات، الهيكل التجاري واحتياجات العملات للأعمال.']
  ]
};

const contactItems: Record<Locale, Array<[string, string]>> = {
  fa: [
    ['عمان', '+968 9612 9711'],
    ['ترکیه', '+90 531 733 4478'],
    ['ایران', '+98 912 113 3817']
  ],
  en: [
    ['Oman', '+968 9612 9711'],
    ['Turkey', '+90 531 733 4478'],
    ['Iran', '+98 912 113 3817']
  ],
  ar: [
    ['عُمان', '+968 9612 9711'],
    ['تركيا', '+90 531 733 4478'],
    ['إيران', '+98 912 113 3817']
  ]
};

const aboutParagraphs: Record<Locale, string[]> = {
  fa: [
    'اومانی با پشتوانه بیش از نیم قرن تجربه در حوزه پول، ارز و مبادلات بین‌المللی، آماده ارائه خدمات تخصصی به مشتریان در عمان، امارات، ایران و ترکیه است.',
    'ما با اتکا به تجربه عملی، شناخت دقیق بازارهای منطقه و حضور در مسیرهای اصلی تبادل مالی، خدمات حواله، تبدیل ارز و مشاوره مالی را با رویکردی حرفه‌ای، شفاف و مسئولانه ارائه می‌کنیم. امکان انجام مبادلات به صورت حضوری، تحویل ارز نقدی، واریز به حساب و هماهنگی تحویل وجه در مقاصد مختلف، متناسب با نیاز هر مشتری بررسی و اجرا می‌شود.',
    'هدف ما این است که هر درخواست، از مرحله مشاوره اولیه تا اجرای نهایی، با دقت، امنیت و همراهی انسانی مدیریت شود؛ به گونه‌ای که مشتریان بتوانند با اطمینان، مسیر مناسب انتقال یا تبدیل ارز خود را انتخاب کنند.'
  ],
  en: [
    'OMoney is backed by more than half a century of experience in money services, foreign exchange, and international financial transactions, serving clients across Oman, the UAE, Iran, and Turkey.',
    'With deep regional market knowledge and practical experience across key financial corridors, we provide remittance, currency exchange, and financial advisory services with a professional, transparent, and responsible approach. Depending on each client’s needs, we support in-person transactions, cash currency delivery, account transfers, and coordinated fund delivery across selected destinations.',
    'Our goal is to manage every request with precision, security, and human support from the first consultation through final execution, so clients can choose the most suitable transfer or exchange route with confidence.'
  ],
  ar: [
    'أو ماني تستند إلى خبرة تتجاوز نصف قرن في خدمات الأموال والصرافة والمعاملات المالية الدولية، وتخدم العملاء في عُمان، الإمارات، إيران وتركيا.',
    'بفضل المعرفة العملية بأسواق المنطقة والمسارات المالية الرئيسية، نقدم خدمات التحويلات وصرف العملات والاستشارات المالية بأسلوب مهني وواضح ومسؤول. وبحسب احتياج كل عميل، يمكن تنسيق المعاملات الحضورية، تسليم النقد، التحويل إلى الحسابات، وتسليم الأموال في وجهات مختارة.',
    'هدفنا إدارة كل طلب بدقة وأمان ودعم بشري من أول استشارة حتى التنفيذ النهائي، ليتمكن العميل من اختيار المسار الأنسب للتحويل أو صرف العملات بثقة.'
  ]
};

const labels = {
  contactKicker: { fa: 'ارتباط با ما', en: 'Contact', ar: 'تواصل معنا' },
  contactDetails: { fa: 'اطلاعات تماس', en: 'Contact details', ar: 'بيانات التواصل' },
  email: { fa: 'ایمیل', en: 'Email', ar: 'البريد الإلكتروني' },
  telegram: { fa: 'تلگرام', en: 'Telegram', ar: 'تيليغرام' },
  instagram: { fa: 'اینستاگرام', en: 'Instagram', ar: 'إنستغرام' },
  officeLocation: { fa: 'موقعیت دفتر', en: 'Office location', ar: 'موقع المكتب' },
  omanOffice: { fa: 'دفتر عمان', en: 'Oman office', ar: 'مكتب عُمان' },
  turkeyOffice: { fa: 'دفتر ترکیه', en: 'Turkey office', ar: 'مكتب تركيا' },
  omanMap: { fa: 'نقشه دفتر عمان', en: 'Oman office map', ar: 'خريطة مكتب عُمان' },
  turkeyMap: { fa: 'نقشه دفتر ترکیه', en: 'Turkey office map', ar: 'خريطة مكتب تركيا' },
  brandAlt: { fa: 'نشان او مانی اکسچنج', en: 'OMani Exchange brand artwork', ar: 'شعار أو ماني للصرافة' },
  ratesCopy: {
    fa: 'در این صفحه نرخ‌های زنده ارزهای اصلی، ارزهای دیجیتال منتخب و قیمت طلا و سکه نمایش داده می‌شود. نرخ نهایی خدمات حواله و تبدیل ارز پس از بررسی تیم مالی قطعی می‌شود.',
    en: 'This page shows live major currencies, selected digital assets, and gold and coin prices. Final remittance and exchange execution rates are confirmed by the finance team.',
    ar: 'تعرض هذه الصفحة أسعار العملات الرئيسية، بعض الأصول الرقمية، وأسعار الذهب والعملات الذهبية. يتم تأكيد السعر النهائي للتحويل أو الصرف بعد مراجعة فريق المالية.'
  },
  fallback: {
    fa: 'محتوای این صفحه در مرحله تکمیل است.',
    en: 'This page content is being finalized.',
    ar: 'يتم استكمال محتوى هذه الصفحة.'
  }
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; page: string }>;
}) {
  const { locale, page } = await params;
  if (!isLocale(locale) || !publicPages.includes(page as PublicPage)) return {};
  return pageMetadata(locale, page as PublicPage);
}

export default async function StaticPage({
  params
}: {
  params: Promise<{ locale: string; page: string }>;
}) {
  const { locale: rawLocale, page: rawPage } = await params;
  if (!isLocale(rawLocale) || !(rawPage in pageTitles.fa)) notFound();
  const locale: Locale = rawLocale;
  const page = rawPage as StaticPageKey;
  const title = pageTitles[locale][page];
  const media = await getMediaPlacements();
  const heroMedia = page === 'about' ? media.ABOUT_HERO : page === 'contact' ? media.CONTACT_HERO : undefined;

  return (
    <SiteShell locale={locale}>
      <section className="relative isolate overflow-hidden bg-[#0b1624] px-4 py-14 text-white md:px-6">
        <MediaBackground media={heroMedia} eager />
        <div className="relative mx-auto max-w-5xl">
          <p className="eyebrow text-sm">OMoney</p>
          <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
        </div>
      </section>

      {page === 'services' && (
        <section className="mx-auto max-w-5xl px-4 py-12 md:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {services[locale].map(([serviceTitle, serviceCopy]) => (
              <article key={serviceTitle} className="surface rounded-md p-6">
                <h2 className="text-xl font-semibold text-[#101e30]">{serviceTitle}</h2>
                <p className="mt-3 leading-8 text-[#66707d]">{serviceCopy}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {page === 'rates' && (
        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <div className="mb-8 max-w-3xl">
            <p className="leading-8 text-[#66707d]">{labels.ratesCopy[locale]}</p>
          </div>
          <RatesCatalog locale={locale} />
        </section>
      )}

      {page !== 'services' && page !== 'rates' && (
        <section className="mx-auto max-w-5xl px-4 py-12 md:px-6">
          {page === 'about' ? (
            <div className="space-y-6">
              <article className="surface rounded-md p-6 leading-8 text-[#66707d] md:p-8">
                <div className="space-y-5">
                  {aboutParagraphs[locale].map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>

              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <article className="surface rounded-md p-6">
                  <p className="eyebrow text-sm">{labels.contactKicker[locale]}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#101e30]">{labels.contactDetails[locale]}</h2>
                  <div className="mt-6 space-y-4">
                    {contactItems[locale].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-4 border-b border-black/8 pb-4 last:border-b-0 last:pb-0">
                        <span className="text-[#66707d]">{label}</span>
                        <a href={`tel:${value.replaceAll(' ', '')}`} dir="ltr" className="font-sans text-base font-semibold tracking-normal text-[#101e30]">
                          {value}
                        </a>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-4 border-b border-black/8 pb-4 last:border-b-0 last:pb-0">
                      <span className="text-[#66707d]">{labels.email[locale]}</span>
                      <a href="mailto:info@omoney.com" dir="ltr" className="font-sans font-semibold text-[#101e30]">
                        info@omoney.com
                      </a>
                    </div>
                    <SocialLink label={labels.telegram[locale]} href="https://t.me/OmoneyEx" value="@OmoneyEx" type="telegram" />
                    <SocialLink
                      label={labels.instagram[locale]}
                      href="https://www.instagram.com/omoney_ex?igsh=MWNxYnY4OTc5OG1oNA%3D%3D&utm_source=qr"
                      value="@omoney_ex"
                      type="instagram"
                    />
                    <figure className="overflow-hidden rounded-md border border-black/8 bg-[#111]">
                      <Image
                        src="/images/omani-exchange-brand.png"
                        alt={labels.brandAlt[locale]}
                        width={1024}
                        height={1024}
                        className="h-auto w-full"
                        sizes="(min-width: 1024px) 360px, 100vw"
                      />
                    </figure>
                  </div>
                </article>

                <div className="grid gap-4">
                  <OfficeMap kicker={labels.officeLocation[locale]} title={labels.omanOffice[locale]} mapTitle={labels.omanMap[locale]} src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.3697913581327!2d58.48208117506901!3d23.626924393506066!2m3!1f0!2f0!3f0!2m3!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e91f9a2c012b881%3A0x3c7e13c641358cf!2sEstio%20technology%20development!5e0!3m2!1sen!2som!4v1779019120796!5m2!1sen!2som" />
                  <OfficeMap kicker={labels.officeLocation[locale]} title={labels.turkeyOffice[locale]} mapTitle={labels.turkeyMap[locale]} src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1505.1290785374433!2d28.649634697547093!3d41.01960767853349!2m3!1f0!2f0!3f0!2m3!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b55f602ad1050b%3A0xa853d019647567c4!2zbWFuaWdydXDZhdin2YbbjCDar9ix2YjZvg!5e0!3m2!1sen!2som!4v1779019675440!5m2!1sen!2som" />
                </div>
              </div>
            </div>
          ) : (
            <article className="surface rounded-md p-6 leading-8 text-[#66707d]">{labels.fallback[locale]}</article>
          )}
        </section>
      )}
    </SiteShell>
  );
}

function SocialLink({ label, href, value, type }: { label: string; href: string; value: string; type: 'telegram' | 'instagram' }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/8 pb-4 last:border-b-0 last:pb-0">
      <span className="text-[#66707d]">{label}</span>
      <a href={href} target="_blank" rel="noreferrer" dir="ltr" className="inline-flex items-center gap-2 font-sans font-semibold text-[#101e30] transition-colors hover:text-[#b88a43]">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          {type === 'telegram' ? (
            <path d="M21.9 4.6c.3-1.4-1-2.5-2.3-2L3.3 8.8c-1.5.6-1.5 2.7.1 3.2l4.2 1.3 1.6 5.1c.4 1.3 2 1.7 3 .8l2.4-2.3 4.2 3.1c1.1.8 2.7.2 3-1.2l2.1-14.2ZM9.4 12.5l8.8-5.4-6.9 6.7-.3 3.2-1.1-3.6-.5-.9Z" />
          ) : (
            <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
          )}
        </svg>
        <span>{value}</span>
      </a>
    </div>
  );
}

function OfficeMap({ kicker, title, mapTitle, src }: { kicker: string; title: string; mapTitle: string; src: string }) {
  return (
    <article className="surface overflow-hidden rounded-md">
      <div className="p-6 pb-4">
        <p className="eyebrow text-sm">{kicker}</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#101e30]">{title}</h2>
      </div>
      <iframe
        title={mapTitle}
        src={src}
        className="h-[320px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </article>
  );
}
