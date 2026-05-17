import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { content } from '../lib/content';
import { AssistantWidget } from './assistant-widget';
import { SiteHeaderAuth } from './site-header-auth';

export function SiteShell({ locale, children }: { locale: keyof typeof content; children: React.ReactNode }) {
  const t = content[locale];
  const alternateLocale = locale === 'fa' ? 'en' : 'fa';
  const whatsappHref = 'https://wa.me/message/NBV22R27A46TB1';
  return (
    <main dir={t.dir} className="min-h-screen">
      <header className="site-header text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image
              src="/images/omoney-logo.png"
              alt={locale === 'fa' ? 'لوگوی اومانی' : 'OMoney logo'}
              width={52}
              height={52}
              priority
              className="brand-logo h-[52px] w-[52px] shrink-0 object-contain"
            />
            <span>
              <span className="brand-wordmark block text-xl font-semibold text-[#f5ecd4]">
                {locale === 'fa' ? 'اومانی' : 'OMoney'}
              </span>
              <span className="block text-xs text-white/55">International Remittance</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/75 lg:flex">
            {t.nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <SiteHeaderAuth locale={locale} />
            <Link
              href={`/${alternateLocale}`}
              className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
            >
              {alternateLocale.toUpperCase()}
            </Link>
            <a
              href={whatsappHref}
              className="hidden rounded-md bg-[#c7a15b] px-4 py-2 text-sm font-medium text-[#0b1624] transition hover:bg-[#dec58d] sm:inline-flex"
            >
              WhatsApp
            </a>
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
