import type { Metadata } from 'next';
import { content } from '../../lib/content';
import { isLocale, localeHtmlLang } from '../../lib/i18n';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw;
  const t = content[locale];
  return {
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      locale: localeHtmlLang[locale].replace('-', '_')
    }
  };
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
