import type { Metadata } from 'next';
import { isLocale, localeHtmlLang } from '../../lib/i18n';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return {
    openGraph: {
      locale: localeHtmlLang[raw].replace('-', '_')
    }
  };
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
