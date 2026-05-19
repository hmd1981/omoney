import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { content } from '../lib/content';
import { Locale } from '../lib/i18n';
import { AssistantWidgetEntry } from './assistant-widget-entry';
import { LanguageSwitcher } from './language-switcher';

export function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = content[locale];
  const whatsappHref = 'https://wa.me/message/NBV22R27A46TB1';
  const brandText = locale === 'en' ? 'Money' : locale === 'ar' ? 'ماني' : 'مانی';
  return (
    <main dir={t.dir} className="min-h-screen">
      <header className="border-b border-white/10 bg-[#0b1624] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <span className="brand-mark grid h-12 w-12 place-items-center rounded-md border border-[#c7a15b]/45 bg-white/5 text-2xl font-semibold text-[#dec58d]">
              O
            </span>
            <span>
              <span className={`brand-wordmark flex items-center text-xl font-semibold ${locale === 'en' ? 'gap-1' : 'flex-row-reverse justify-end gap-2'}`}>
                {locale === 'en' ? (
                  <>
                    <span className="brand-letter text-3xl text-[#dec58d]">O</span>
                    <span>{brandText}</span>
                  </>
                ) : (
                  <>
                    <span>{brandText}</span>
                    <span className="brand-letter text-3xl text-[#dec58d]">O</span>
                  </>
                )}
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
          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
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
      <AssistantWidgetEntry locale={locale} />
      <a
        className="fixed bottom-5 end-5 z-20 inline-flex items-center gap-2 rounded-md bg-[#0b1624] px-4 py-3 text-sm font-medium text-white shadow-2xl transition hover:bg-[#16263b]"
        href={whatsappHref}
      >
        <MessageCircle size={18} /> WhatsApp
      </a>
    </main>
  );
}
