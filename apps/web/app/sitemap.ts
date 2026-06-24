import type { MetadataRoute } from 'next';
import { guideSlugs } from '../lib/corridor-guides';
import { absoluteUrl, localizedPath, publicPages } from '../lib/seo';
import { locales } from '../lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return locales.flatMap((locale) => [
    {
      url: absoluteUrl(localizedPath(locale)),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: locale === 'fa' ? 1 : 0.9
    },
    ...publicPages.map((page) => ({
      url: absoluteUrl(localizedPath(locale, page)),
      lastModified: now,
      changeFrequency: page === 'rates' ? ('hourly' as const) : ('weekly' as const),
      priority: page === 'rates' ? 0.9 : 0.75
    })),
    ...guideSlugs.map((page) => ({
      url: absoluteUrl(localizedPath(locale, page)),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    }))
  ]);
}
