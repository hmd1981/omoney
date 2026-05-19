export const locales = ['fa', 'en', 'ar'] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  fa: 'فارسی',
  en: 'English',
  ar: 'العربية'
};

export const localeShortLabels: Record<Locale, string> = {
  fa: 'FA',
  en: 'EN',
  ar: 'AR'
};

export const localeHtmlLang: Record<Locale, string> = {
  fa: 'fa-IR',
  en: 'en',
  ar: 'ar-AE'
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isRtl(locale: Locale) {
  return locale !== 'en';
}

export function intlLocale(locale: Locale) {
  if (locale === 'fa') return 'fa-IR';
  if (locale === 'ar') return 'ar-AE';
  return 'en-US';
}
