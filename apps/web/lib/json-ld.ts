import type { Locale } from './i18n';
import { content } from './content';
import { siteUrl } from './seo';

export function organizationJsonLd(locale: Locale) {
  const brand = content[locale].brand;
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: brand,
    alternateName: ['OMoney', 'اومانی', 'أوماني'],
    url: siteUrl,
    logo: `${siteUrl}/images/omoney-logo.png`,
    image: `${siteUrl}/images/omoney-logo.png`,
    description: content[locale].meta.description,
    email: 'info@omoney.online',
    areaServed: ['OM', 'AE', 'TR', 'IR', 'EU', 'CA', 'US'],
    availableLanguage: ['fa', 'en', 'ar'],
    telephone: ['+96896129711', '+905317334478', '+989121133817'],
    sameAs: ['https://t.me/OmoneyEx', 'https://www.instagram.com/omoney_ex'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Muscat',
      addressCountry: 'OM'
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '09:00',
      closes: '18:00'
    }
  };
}

export function faqPageJsonLd(items: ReadonlyArray<readonly [string, string]>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };
}
