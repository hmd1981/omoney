import Image from 'next/image';
import Link from 'next/link';
import { Clock, LockKeyhole, MapPin, MessageCircle } from 'lucide-react';
import { content } from '../lib/content';
import { FooterCinematicLayer } from './footer-cinematic-layer';
import type { MediaPlacementMap } from '../lib/media';

const whatsappHref = 'https://wa.me/message/NBV22R27A46TB1';

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
  ]
} as const;

export function InstitutionalFooter({
  locale,
  media
}: {
  locale: keyof typeof content;
  media: MediaPlacementMap;
}) {
  const t = content[locale];
  const fa = locale === 'fa';
  const officeList = offices[locale];

  return (
    <footer className="footer-institutional relative isolate overflow-hidden border-t border-white/10">
      <FooterCinematicLayer media={media.FOOTER_BACKGROUND} />
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link href={`/${locale}`} className="inline-flex items-center gap-3">
              <Image
                src="/images/omoney-logo.png"
                alt={fa ? 'لوگوی اومانی' : 'OMoney logo'}
                width={48}
                height={48}
                className="brand-logo h-12 w-12 object-contain"
              />
              <span className="text-xl font-semibold text-white">{fa ? 'اومانی' : 'OMoney'}</span>
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
              {fa ? 'دفاتر و مسیرها' : 'Offices & corridors'}
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
              {fa ? 'پشتیبانی و انطباق' : 'Support & compliance'}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Clock size={15} className="text-[#dec58d]" />
                {fa ? 'شنبه تا پنج‌شنبه · ۹:۰۰ – ۱۸:۰۰ (GST)' : 'Sat–Thu · 9:00 – 18:00 GST'}
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
            © {new Date().getFullYear()} {fa ? 'اومانی' : 'OMoney'}. {fa ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
