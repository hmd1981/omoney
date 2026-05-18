import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { content } from '../lib/content';
import { getWhatsAppHref } from '../lib/whatsapp';
import { AssistantWidget } from './assistant-widget';
import { SiteHeaderAuth } from './site-header-auth';
import { SiteMobileNav } from './site-mobile-nav';

export function SiteShell({ locale, children }: { locale: keyof typeof content; children: React.ReactNode }) {
  const t = content[locale];
  const alternateLocale = locale === 'fa' ? 'en' : 'fa';
  const whatsappHref = getWhatsAppHref(locale);
  return (
    <main dir={t.dir} className="min-h-screen">
      <header className="site-header text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:py-4 md:px-6">
          <Link href={`/${locale}`} className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Image
              src="/images/omoney-logo.png"
              alt={locale === 'fa' ? 'لوگوی اومانی' : 'OMoney logo'}
              width={52}
              height={52}
              priority
              className="brand-logo h-10 w-10 shrink-0 object-contain sm:h-[52px] sm:w-[52px]"
            />
            <span className="min-w-0">
              <span className="brand-wordmark block truncate text-lg font-semibold text-[#f5ecd4] sm:text-xl">
                {locale === 'fa' ? 'اومانی' : 'OMoney'}
              </span>
              <span className="hidden text-xs text-white/55 sm:block">International Remittance</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/75 lg:flex">
            {t.nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <SiteHeaderAuth locale={locale} />
              <Link
                href={`/${alternateLocale}`}
                className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
              >
                {alternateLocale.toUpperCase()}
              </Link>
              <a
                href={whatsappHref}
                className="hidden rounded-md bg-[#c7a15b] px-4 py-2 text-sm font-medium text-[#0b1624] transition hover:bg-[#dec58d] md:inline-flex"
              >
                WhatsApp
              </a>
            </div>
            <SiteMobileNav
              locale={locale}
              nav={t.nav}
              alternateLocale={alternateLocale}
              whatsappHref={whatsappHref}
            >
              <SiteHeaderAuth locale={locale} />
            </SiteMobileNav>
          </div>
        </div>
      </header>
      {children}
      <AssistantWidget locale={locale} />
      <a
        className="fixed bottom-5 end-5 z-20 inline-flex items-center gap-2 rounded-md bg-[#0b1624] px-4 py-3 text-sm font-medium text-white shadow-2xl transition hover:bg-[#16263b]"
        href={whatsappHref}
      >
        <MessageCircle size={18} /> WhatsApp
      </a>
    </main>
  );
}
