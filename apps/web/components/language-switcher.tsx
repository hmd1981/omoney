'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Locale, localeShortLabels, locales } from '../lib/i18n';

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const rest = segments.length > 1 ? `/${segments.slice(1).join('/')}` : '';

  return (
    <div className="flex overflow-hidden rounded-md border border-white/15">
      {locales.map((item) => (
        <Link
          key={item}
          href={`/${item}${rest}`}
          className={`px-2.5 py-2 text-sm transition sm:px-3 ${
            item === locale ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/8 hover:text-white'
          }`}
        >
          {localeShortLabels[item]}
        </Link>
      ))}
    </div>
  );
}
