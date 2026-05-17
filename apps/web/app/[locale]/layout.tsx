import type { Metadata } from 'next';
import { content } from '../../lib/content';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: keyof typeof content }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = content[locale] ?? content.fa;
  return {
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US'
    }
  };
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
