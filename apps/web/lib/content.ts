export const content = {
  fa: {
    dir: 'rtl',
    brand: 'اومانی',
    meta: {
      title: 'اومانی | صرافی و حواله بین‌المللی',
      description: 'اومانی، مسیر مطمئن تبدیل ارز و انتقال بین‌المللی پول میان عمان، امارات، ترکیه و بازارهای جهانی.'
    },
    nav: [
      { label: 'درباره ما', href: '/fa/about' },
      { label: 'خدمات ما', href: '/fa/services' },
      { label: 'نرخ ارز', href: '/fa/rates' },
      { label: 'سوالات', href: '/fa/faq' },
      { label: 'حساب من', href: '/fa/dashboard' }
    ],
    heroKicker: 'صرافی در مسقط و مسیرهای جهانی حواله با استاندارد نهادی',
    heroTitle: 'اومانی، مسیر مطمئن تبدیل ارز و انتقال بین‌المللی پول میان عمان، امارات، ترکیه و بازارهای جهانی.',
    heroSubtitle: 'صرافی در مسقط و مسیرهای جهانی حواله با استاندارد نهادی',
    heroCities: ['مسقط', 'دبی', 'استانبول', 'بازارهای جهانی'],
    heroCopy:
      'اومانی برای حواله‌های واقعی طراحی شده است: بررسی انسانی، احراز هویت، رسید پرداخت و پیگیری شفاف از ثبت درخواست تا تکمیل انتقال.',
    primaryCta: 'ثبت درخواست حواله',
    secondaryCta: 'مشاوره در واتساپ',
    trustItems: ['بررسی انسانی هر درخواست', 'فرآیند KYC و کنترل AML', 'پشتیبانی فارسی و انگلیسی'],
    corridorsTitle: 'مسیرهای اصلی انتقال',
    corridorsCopy: 'مسیرهای پرتقاضا با پردازش شفاف و هماهنگی عملیاتی از عمان و امارات.',
    howTitle: 'نحوه انجام حواله',
    securityTitle: 'امنیت و پیشگیری از تقلب',
    kycTitle: 'کنترل هویت و انطباق',
    whyTitle: 'چرا اومانی',
    trustSectionTitle: 'اعتماد، انطباق و پیگیری در هر مرحله',
    trustSectionCopy: 'ساختار عملیاتی اومانی بر بررسی انسانی، کنترل هویت، شفافیت مسیر و پاسخگویی مستقیم استوار است.',
    faqTitle: 'پرسش های متداول',
    whatsappTitle: 'برای حواله بعدی، با یک کارشناس واقعی صحبت کنید',
    whatsappCopy: 'برای بررسی مسیر، مدارک مورد نیاز و زمان پردازش، تیم پشتیبانی در واتساپ پاسخگو است.',
    footerCopy: 'خدمات حواله و تبدیل ارز با تمرکز بر اعتماد، شفافیت و پشتیبانی انسانی.',
    legal: ['قوانین', 'حریم خصوصی'],
    updated: 'به روزرسانی نرخ با تایید تیم مالی'
  },
  en: {
    dir: 'ltr',
    brand: 'OMoney',
    meta: {
      title: 'OMoney | Exchange and International Remittance',
      description: 'Trusted exchange and international money transfer between Oman, UAE, Turkey, and global markets.'
    },
    nav: [
      { label: 'About', href: '/en/about' },
      { label: 'Services', href: '/en/services' },
      { label: 'Rates', href: '/en/rates' },
      { label: 'FAQ', href: '/en/faq' },
      { label: 'My account', href: '/en/dashboard' }
    ],
    heroKicker: 'International remittance with human support',
    heroTitle: 'Trusted money transfer between Oman, UAE, Turkey, and global corridors',
    heroSubtitle: 'Exchange in Muscat and global remittance corridors with institutional standards',
    heroCities: ['Muscat', 'Dubai', 'Istanbul', 'Global markets'],
    heroCopy:
      'OMoney is built for real remittance operations: human review, identity checks, payment receipts, and transparent tracking from request to completion.',
    primaryCta: 'Start transfer request',
    secondaryCta: 'Talk on WhatsApp',
    trustItems: ['Human review on every request', 'KYC and AML controls', 'Persian and English support'],
    corridorsTitle: 'Primary transfer corridors',
    corridorsCopy: 'High-demand corridors coordinated from Oman and the UAE with transparent processing.',
    howTitle: 'How transfers work',
    securityTitle: 'Security and fraud prevention',
    kycTitle: 'Identity and compliance',
    whyTitle: 'Why OMoney',
    trustSectionTitle: 'Trust, compliance, and follow-through at every step',
    trustSectionCopy: 'OMoney is built around human review, identity controls, transparent routing, and direct accountability.',
    faqTitle: 'Frequently asked questions',
    whatsappTitle: 'Speak with a real specialist before your next transfer',
    whatsappCopy: 'Ask about corridor eligibility, required documents, and expected processing time on WhatsApp.',
    footerCopy: 'Remittance and exchange services focused on trust, clarity, and human support.',
    legal: ['Terms', 'Privacy'],
    updated: 'Rates reviewed by the finance team'
  }
} as const;

export const corridorShowcase = {
  fa: [
    { city: 'muscat', tag: 'عمان', title: 'مسقط به ایران', copy: 'حواله و تبدیل ارز با هماهنگی مستقیم از عمان.' },
    { city: 'dubai', tag: 'امارات', title: 'دبی به ایران', copy: 'مسیرهای پرتردد با پیگیری عملیاتی شفاف.' },
    { city: 'istanbul', tag: 'ترکیه', title: 'ترکیه و بازارهای جهانی', copy: 'پشتیبانی برای انتقال‌های تجاری و شخصی.' }
  ],
  en: [
    { city: 'muscat', tag: 'Oman', title: 'Muscat to Iran', copy: 'Remittance and exchange coordinated directly from Oman.' },
    { city: 'dubai', tag: 'UAE', title: 'Dubai to Iran', copy: 'High-demand routes with transparent operations follow-up.' },
    { city: 'istanbul', tag: 'Turkey', title: 'Turkey and global markets', copy: 'Support for personal and business transfers.' }
  ]
} as const;

export const trustCards = {
  fa: [
    { icon: 'shield', title: 'بررسی انسانی', copy: 'هر درخواست پیش از اجرا توسط تیم عملیاتی بررسی می‌شود.' },
    { icon: 'lock', title: 'کنترل هویت', copy: 'فرآیندهای KYC و AML برای کاهش ریسک و افزایش شفافیت.' },
    { icon: 'headset', title: 'پشتیبانی واقعی', copy: 'ارتباط مستقیم برای مدارک، نرخ و وضعیت حواله.' },
    { icon: 'globe', title: 'مسیرهای بین‌المللی', copy: 'پوشش عمان، امارات، ترکیه و بازارهای جهانی.' },
    { icon: 'banknote', title: 'تمرکز بر حواله واقعی', copy: 'بدون ظاهر رمزارزی؛ مناسب عملیات مالی واقعی.' },
    { icon: 'check', title: 'پیگیری شفاف', copy: 'وضعیت درخواست از ثبت تا تکمیل قابل پیگیری است.' }
  ],
  en: [
    { icon: 'shield', title: 'Human review', copy: 'Every request is reviewed by the operations team before execution.' },
    { icon: 'lock', title: 'Identity controls', copy: 'KYC and AML workflows reduce risk and improve transparency.' },
    { icon: 'headset', title: 'Real support', copy: 'Direct help for documents, rates, and transfer status.' },
    { icon: 'globe', title: 'International corridors', copy: 'Coverage across Oman, UAE, Turkey, and global markets.' },
    { icon: 'banknote', title: 'Real remittance focus', copy: 'Built for financial operations, not crypto-style speculation.' },
    { icon: 'check', title: 'Transparent follow-up', copy: 'Track the request from submission through completion.' }
  ]
} as const;
