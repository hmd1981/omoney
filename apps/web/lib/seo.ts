import type { Metadata } from 'next';
import { content } from './content';
import { Locale, locales } from './i18n';

export const siteUrl = 'https://omoney.online';

export const publicPages = ['about', 'services', 'rates', 'faq', 'contact', 'terms', 'privacy'] as const;

export type PublicPage = (typeof publicPages)[number];

const pageMeta: Record<Locale, Record<PublicPage, { title: string; description: string }>> = {
  fa: {
    about: {
      title: 'درباره اومانی | تجربه، اعتماد و حواله بین‌المللی',
      description: 'درباره اومانی، صرافی و خدمات حواله بین‌المللی با تجربه منطقه‌ای در عمان، امارات، ایران و ترکیه.'
    },
    services: {
      title: 'خدمات اومانی | حواله، تبدیل ارز و مشاوره مسیر انتقال',
      description: 'خدمات حواله بین‌المللی، تبدیل ارز، بررسی مدارک، مشاوره مسیر انتقال و خدمات بیزینس در اومانی.'
    },
    rates: {
      title: 'نرخ ارز و طلا | اومانی',
      description: 'مشاهده نرخ‌های به‌روز ارزهای اصلی، دارایی‌های دیجیتال منتخب، طلا و سکه در اومانی.'
    },
    faq: {
      title: 'سوالات متداول | اومانی',
      description: 'پاسخ به سوالات رایج درباره حواله، نرخ ارز، مدارک، زمان پردازش و خدمات اومانی.'
    },
    contact: {
      title: 'تماس با اومانی | عمان، ترکیه و ایران',
      description: 'راه‌های تماس با اومانی، شماره‌های عمان، ترکیه، ایران، ایمیل، تلگرام، اینستاگرام و موقعیت دفاتر.'
    },
    terms: {
      title: 'قوانین استفاده | اومانی',
      description: 'قوانین و شرایط استفاده از خدمات حواله، تبدیل ارز و پشتیبانی اومانی.'
    },
    privacy: {
      title: 'حریم خصوصی | اومانی',
      description: 'نحوه نگهداری، استفاده و حفاظت از اطلاعات کاربران در پلتفرم اومانی.'
    }
  },
  en: {
    about: {
      title: 'About OMoney | Experience, Trust, International Transfers',
      description: 'Learn about OMoney, a regional exchange and international remittance service across Oman, UAE, Iran, and Turkey.'
    },
    services: {
      title: 'OMoney Services | Remittance, FX, Transfer Advisory',
      description: 'International remittance, currency exchange, route advisory, document review, and business support services.'
    },
    rates: {
      title: 'Exchange, Gold, and Market Rates | OMoney',
      description: 'View live major currency, selected digital asset, gold, and coin rates from OMoney.'
    },
    faq: {
      title: 'FAQ | OMoney',
      description: 'Answers to common questions about remittance, exchange rates, documents, processing time, and OMoney services.'
    },
    contact: {
      title: 'Contact OMoney | Oman, Turkey, Iran',
      description: 'Contact OMoney by phone, email, Telegram, Instagram, and office map locations.'
    },
    terms: {
      title: 'Terms of Use | OMoney',
      description: 'Terms and conditions for using OMoney remittance, exchange, and support services.'
    },
    privacy: {
      title: 'Privacy Policy | OMoney',
      description: 'How OMoney stores, uses, and protects customer information.'
    }
  },
  ar: {
    about: {
      title: 'من نحن | أو ماني للصرافة والتحويلات الدولية',
      description: 'تعرف على أو ماني، خدمات الصرافة والتحويلات المالية الدولية في عُمان، الإمارات، إيران وتركيا.'
    },
    services: {
      title: 'خدمات أو ماني | تحويلات، صرف عملات واستشارات',
      description: 'خدمات التحويلات الدولية، صرف العملات، استشارة مسار التحويل، مراجعة المستندات ودعم الأعمال.'
    },
    rates: {
      title: 'أسعار الصرف والذهب | أو ماني',
      description: 'عرض أسعار العملات الرئيسية، بعض الأصول الرقمية، الذهب والعملات الذهبية عبر أو ماني.'
    },
    faq: {
      title: 'الأسئلة الشائعة | أو ماني',
      description: 'إجابات على الأسئلة المتكررة حول التحويلات، أسعار الصرف، المستندات ومدة المعالجة.'
    },
    contact: {
      title: 'تواصل مع أو ماني | عُمان، تركيا وإيران',
      description: 'طرق التواصل مع أو ماني عبر الهاتف، البريد الإلكتروني، تيليغرام، إنستغرام وخرائط المكاتب.'
    },
    terms: {
      title: 'الشروط | أو ماني',
      description: 'شروط استخدام خدمات أو ماني للتحويلات، صرف العملات والدعم.'
    },
    privacy: {
      title: 'الخصوصية | أو ماني',
      description: 'كيفية حفظ واستخدام وحماية بيانات العملاء في منصة أو ماني.'
    }
  }
};

export function localizedPath(locale: Locale, page?: string) {
  return page ? `/${locale}/${page}` : `/${locale}`;
}

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function languageAlternates(page?: string) {
  return Object.fromEntries(locales.map((locale) => [locale, absoluteUrl(localizedPath(locale, page))]));
}

export function homeMetadata(locale: Locale): Metadata {
  const t = content[locale];
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: absoluteUrl(localizedPath(locale)),
      languages: {
        ...languageAlternates(),
        'x-default': absoluteUrl('/fa')
      }
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      url: absoluteUrl(localizedPath(locale)),
      siteName: 'OMoney',
      locale,
      type: 'website'
    }
  };
}

export function pageMetadata(locale: Locale, page: PublicPage): Metadata {
  const meta = pageMeta[locale][page];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: absoluteUrl(localizedPath(locale, page)),
      languages: {
        ...languageAlternates(page),
        'x-default': absoluteUrl(localizedPath('fa', page))
      }
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: absoluteUrl(localizedPath(locale, page)),
      siteName: 'OMoney',
      locale,
      type: 'website'
    }
  };
}
