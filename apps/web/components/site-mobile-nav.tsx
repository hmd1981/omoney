'use client';

import Link from 'next/link';
import { Menu, MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Locale } from '../lib/i18n';
import { LanguageSwitcher } from './language-switcher';

type NavItem = { label: string; href: string };

const menuLabel: Record<Locale, string> = {
  fa: 'منو',
  en: 'Menu',
  ar: 'القائمة'
};

const closeLabel: Record<Locale, string> = {
  fa: 'بستن',
  en: 'Close',
  ar: 'إغلاق'
};

export function SiteMobileNav({
  locale,
  nav,
  whatsappHref,
  children
}: {
  locale: Locale;
  nav: readonly NavItem[];
  whatsappHref: string;
  children?: React.ReactNode;
}) {
  const rtl = locale !== 'en';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [locale]);

  function close() {
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white transition hover:border-white/30 hover:bg-white/10"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        aria-label={open ? closeLabel[locale] : menuLabel[locale]}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="mobile-nav-backdrop"
            aria-label={closeLabel[locale]}
            onClick={close}
          />
          <aside
            id="site-mobile-menu"
            className="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label={menuLabel[locale]}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <span className="text-sm font-semibold text-white">{menuLabel[locale]}</span>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
                onClick={close}
                aria-label={closeLabel[locale]}
              >
                <X size={20} />
              </button>
            </div>

            {children ? (
              <div className="mobile-nav-auth border-b border-white/10 px-4 py-3 sm:hidden">{children}</div>
            ) : null}

            <nav className="flex flex-col gap-1 px-3 py-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-3 text-base text-white/85 transition hover:bg-white/10 hover:text-white"
                  onClick={close}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 border-t border-white/10 px-4 py-4">
              <LanguageSwitcher locale={locale} />
              <a
                href={whatsappHref}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#c7a15b] px-4 py-3 text-sm font-medium text-[#0b1624] transition hover:bg-[#dec58d]"
                onClick={close}
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
