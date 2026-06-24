import Image from 'next/image';
import Link from 'next/link';
import { Clock, LockKeyhole, MapPin, MessageCircle } from 'lucide-react';
import { content } from '../lib/content';
import { guidePageTitles } from '../lib/corridor-guides';
import { type Locale } from '../lib/i18n';
import { getWhatsAppHref } from '../lib/whatsapp';
import { FooterCinematicLayer } from './footer-cinematic-layer';
import type { MediaPlacementMap } from '../lib/media';

const offices = {
  fa: [
    { city: 'مسقط', role: 'دفتر مرکزی · صرافی در مسقط', note: 'حواله عمان · OMR' },
    { city: 'دبی', role: 'مسیر عملیاتی امارات', note: 'حواله دبی · AED' },
    { city: 'استانبول', role: 'پل ترکیه و اروپا', note: 'حواله ترکیه · TRY' }
  ],
  en: [
    { city: 'Muscat', role: 'Headquarters · Exchange in Muscat', note: 'Money transfer Oman · OMR' },
    { city: 'Dubai', role: 'UAE operational corridor', note: 'UAE remittance · AED' },
    { city: 'Istanbul', role: 'Turkey & Europe bridge', note: 'Turkey remittance · TRY' }
  ],
  ar: [
    { city: 'مسقط', role: 'المقر الرئيسي · صرافة في مسقط', note: 'تحويلات عُمان · OMR' },
    { city: 'دبي', role: 'مسار تشغيلي في الامارات', note: 'تحويلات الامارات · AED' },
    { city: 'Istanbul', role: 'Turkey and Europe', note: 'TRY' },
  ]
} as const;

export function InstitutionalFooter({
  locale,
  media
}: {
  locale: Locale;
  media: MediaPlacementMap;
}) {
  const t = content[locale];
  const rtl = locale !== 'en';
  const fa = locale === 'fa';
  const officeList = offices[locale];
  const whatsappHref = getWhatsAppHref(locale);

  return (
    <footer className="footer-institutional relative isolate overflow-hidden border-t border-white/10">
      <FooterCinematicLayer media={media.FOOTER_BACKGROUND} />
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link href={`/${locale}`} className="inline-flex items-center gap-3">
              <Image
                src="/images/omoney-logo.png"
                alt={locale === 'fa' ? 'لوگوی اومانی' : locale === 'ar' ? 'شعار أوماني' : 'OMoney logo'}
                width={48}
                height={48}
                className="brand-logo h-12 w-12 object-contain"
              />
              <span className="text-xl font-semibold text-white">{locale === 'fa' ? 'اومانی' : locale === 'ar' ? 'أوماني' : 'OMoney'}</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">{t.footerCopy}</p>
            <a
              href={whatsappHref}
              className="btn-primary mt-6 inline-flex text-sm"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#dec58d]">
              {locale === 'fa' ? 'دفاتر و مسیرها' : locale === 'ar' ? 'المكاتب والمسارات' : 'Offices & corridors'}
            </h3>
            <ul className="mt-4 space-y-4">
              {officeList.map((office) => (
                <li key={office.city} className="flex gap-3 text-sm">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#dec58d]" />
                  <div>
                    <p className="font-medium text-white">{office.city}</p>
                    <p className="text-white/65">{office.role}</p>
                    <p className="text-xs text-white/50">{office.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#dec58d]">
              {locale === 'fa' ? 'پشتیبانی و انطباق' : locale === 'ar' ? 'الدعم والامتثال' : 'Support & compliance'}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Clock size={15} className="text-[#dec58d]" />
                {locale === 'fa' ? 'شنبه تا پنج‌شنبه · ۹:۰۰ – ۱۸:۰۰ (GST)' : locale === 'ar' ? 'السبت–الخميس · 9:00 – 18:00 GST' : 'Sat–Thu · 9:00 – 18:00 GST'}
              </li>
              <li className="flex items-center gap-2">
                <LockKeyhole size={15} className="text-[#dec58d]" />
                KYC / AML
              </li>
              {t.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/${locale}/terms`} className="transition hover:text-white">
                  {t.legal[0]}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="transition hover:text-white">
                  {t.legal[1]}
                </Link>
              </li>
              <li className="pt-2 text-xs uppercase tracking-wider text-[#dec58d]">
                {locale === 'fa' ? 'راهنمای مسیرها' : locale === 'ar' ? 'أدلة المسارات' : 'Corridor guides'}
              </li>
              {(['oman-remittance', 'dubai-remittance', 'turkey-remittance'] as const).map((slug) => (
                <li key={slug}>
                  <Link href={`/${locale}/${slug}`} className="transition hover:text-white">
                    {guidePageTitles[locale][slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-xs leading-6 text-white/50">
          <p>
            {fa
              ? 'اومانی خدمات صرافی و حواله بین‌المللی ارائه می‌دهد. تمامی تراکنش‌ها مشمول بررسی هویت (KYC) و ضوابط مبارزه با پولشویی (AML) هستند. این وب‌سایت مشاوره مالی یا حقوقی ارائه نمی‌دهد.'
              : 'OMoney provides exchange and international remittance services. All transactions are subject to KYC and AML review. This website does not provide financial or legal advice.'}
          </p>
          <p className="mt-3">
            © {new Date().getFullYear()} {locale === 'fa' ? 'اومانی' : locale === 'ar' ? 'أوماني' : 'OMoney'}. {fa ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
