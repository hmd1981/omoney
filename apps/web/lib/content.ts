import { Locale } from './i18n';

type SiteContent = {
  dir: 'rtl' | 'ltr';
  brand: string;
  meta: {
    title: string;
    description: string;
  };
  nav: Array<{ label: string; href: string }>;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCities: string[];
  heroCopy: string;
  primaryCta: string;
  secondaryCta: string;
  trustItems: string[];
  corridorsTitle: string;
  corridorsCopy: string;
  howTitle: string;
  securityTitle: string;
  kycTitle: string;
  whyTitle: string;
  trustSectionTitle: string;
  trustSectionCopy: string;
  faqTitle: string;
  whatsappTitle: string;
  whatsappCopy: string;
  footerCopy: string;
  legal: string[];
  updated: string;
};

export const content: Record<Locale, SiteContent> = {
  fa: {
    dir: 'rtl',
    brand: 'اومانی',
    meta: {
      title: 'اومانی | صرافی و حواله بین‌المللی',
      description: 'اومانی، مسیر مطمئن تبادل ارز و انتقال بین‌المللی پول میان عمان، امارات، ترکیه و بازارهای جهانی.'
    },
    nav: [
      { label: 'درباره ما', href: '/fa/about' },
      { label: 'خدمات ما', href: '/fa/services' },
      { label: 'نرخ ارز', href: '/fa/rates' },
      { label: 'سوالات', href: '/fa/faq' },
      { label: 'حساب من', href: '/fa/dashboard' }
    ],
    heroKicker: 'صرافی در مسقط و مسیرهای جهانی حواله با استاندارد نهادی',
    heroTitle: 'اومانی، مسیر مطمئن تبادل ارز و انتقال بین‌المللی پول میان عمان، امارات، ترکیه و بازارهای جهانی.',
    heroSubtitle: 'صرافی در مسقط و مسیرهای جهانی حواله با استاندارد نهادی',
    heroCities: ['مسقط', 'دبی', 'استانبول', 'بازارهای جهانی'],
    heroCopy:
      'او مانی برای حواله‌های واقعی طراحی شده است: بررسی انسانی، احراز هویت، رسید پرداخت و پیگیری شفاف از ثبت درخواست تا تکمیل انتقال.',
    primaryCta: 'ثبت درخواست حواله',
    secondaryCta: 'مشاوره در واتساپ',
    trustItems: ['بررسی انسانی هر درخواست', 'فرآیند KYC و کنترل AML', 'پشتیبانی فارسی، عربی و انگلیسی'],
    corridorsTitle: 'مسیرهای اصلی انتقال',
    corridorsCopy: 'مسیرهای پرتقاﺿا با پردازش شفاف و هماهنگی عملیاتی از عمان و امارات.',
    howTitle: 'نحوه انجام حواله',
    securityTitle: 'امنیت و پیشگیری از تقلب',
    kycTitle: 'کنترل هویت و انطباق',
    whyTitle: 'چرا او مانی',
    trustSectionTitle: 'اعتماد، انطباق و پیگیری در هر مرحله',
    trustSectionCopy: 'ساختار عملیاتی اومانی بر بررسی انسانی، کنترل هویت، شفافیت مسیر و پاسخگویی مستقیم استوار است.',
    faqTitle: 'پرسش‌های متداول',
    whatsappTitle: 'برای حواله بعدی، با یک کارشناس واقعی صحبت کنید',
    whatsappCopy: 'برای بررسی مسیر، مدارک مورد نیاز و زمان پردازش، تیم پشتیبانی در واتساپ پاسخگو است.',
    footerCopy: 'خدمات حواله و تبدیل ارز با تمرکز بر اعتماد، شفافیت و پشتیبانی انسانی.',
    legal: ['قوانین', 'حریم خصوصی'],
    updated: 'به‌روزرسانی نرخ با تایید تیم مالی'
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
    trustItems: ['Human review on every request', 'KYC and AML controls', 'Persian, Arabic, and English support'],
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
  },
  ar: {
    dir: 'rtl',
    brand: 'أو ماني',
    meta: {
      title: 'أو ماني | صرافة وتحويلات مالية دولية',
      description: 'أو ماني لخدمات الصرافة والتحويلات المالية الدولية بين عُمان، الإمارات، تركيا والأسواق العالمية.'
    },
    nav: [
      { label: 'من نحن', href: '/ar/about' },
      { label: 'خدماتنا', href: '/ar/services' },
      { label: 'أسعار الصرف', href: '/ar/rates' },
      { label: 'الأسئلة الشائعة', href: '/ar/faq' },
      { label: 'حسابي', href: '/ar/dashboard' }
    ],
    heroKicker: 'صرافة في مسقط ومسارات تحويل عالمية بمعايير مؤسسية',
    heroTitle: 'أو ماني، مسارك الموثوق لتبادل العملات والتحويلات المالية الدولية بين عُمان، الإمارات، تركيا والأسواق العالمية.',
    heroSubtitle: 'خدمات صرافة وتحويلات دولية من مسقط بمعايير واضحة ودعم بشري',
    heroCities: ['مسقط', 'دبي', 'إسطنبول', 'الأسواق العالمية'],
    heroCopy:
      'تم تصميم أو ماني للتحويلات المالية الفعلية: مراجعة بشرية، تحقق من الهوية، إيصالات الدفع، ومتابعة واضحة من تسجيل الطلب حتى اكتمال التحويل.',
    primaryCta: 'تسجيل طلب تحويل',
    secondaryCta: 'استشارة عبر واتساب',
    trustItems: ['مراجعة بشرية لكل طلب', 'إجراءات KYC ورقابة AML', 'دعم بالفارسية والعربية والإنجليزية'],
    corridorsTitle: 'مسارات التحويل الرئيسية',
    corridorsCopy: 'مسارات مطلوبة بإدارة تشغيلية واضحة من عُمان والإمارات.',
    howTitle: 'كيف تتم عملية التحويل',
    securityTitle: 'الأمان والوقاية من الاحتيال',
    kycTitle: 'التحقق من الهوية والامتثال',
    whyTitle: 'لماذا أو ماني',
    trustSectionTitle: 'ثقة، امتثال ومتابعة في كل مرحلة',
    trustSectionCopy: 'يعتمد نموذج أو ماني على المراجعة البشرية، التحقق من الهوية، وضوح مسار التحويل، والمسؤولية المباشرة.',
    faqTitle: 'الأسئلة الشائعة',
    whatsappTitle: 'تحدث مع مختص قبل تحويلك القادم',
    whatsappCopy: 'اسأل عن أهلية المسار، المستندات المطلوبة، والمدة المتوقعة للمعالجة عبر واتساب.',
    footerCopy: 'خدمات تحويل وصرافة تركز على الثقة والوضوح والدعم البشري.',
    legal: ['الشروط', 'الخصوصية'],
    updated: 'تتم مراجعة الأسعار من قبل فريق المالية'
  }
};

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
  ],
  ar: [
    { city: 'muscat', tag: 'عُمان', title: 'من مسقط إلى إيران', copy: 'تحويلات وصرافة بتنسيق مباشر من عُمان.' },
    { city: 'dubai', tag: 'الإمارات', title: 'من دبي إلى إيران', copy: 'مسارات نشطة بمتابعة تشغيلية واضحة.' },
    { city: 'istanbul', tag: 'تركيا', title: 'تركيا والأسواق العالمية', copy: 'دعم للتحويلات الشخصية والتجارية.' }
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
  ],
  ar: [
    { icon: 'shield', title: 'مراجعة بشرية', copy: 'تتم مراجعة كل طلب من قبل فريق العمليات قبل التنفيذ.' },
    { icon: 'lock', title: 'التحقق من الهوية', copy: 'إجراءات KYC وAML لتقليل المخاطر وتعزيز الشفافية.' },
    { icon: 'headset', title: 'دعم حقيقي', copy: 'مساعدة مباشرة بخصوص المستندات والأسعار وحالة التحويل.' },
    { icon: 'globe', title: 'مسارات دولية', copy: 'تغطية عُمان، الإمارات، تركيا والأسواق العالمية.' },
    { icon: 'banknote', title: 'تركيز على التحويل الفعلي', copy: 'خدمات مالية فعلية بعيدة عن مظهر العملات الرقمية.' },
    { icon: 'check', title: 'متابعة واضحة', copy: 'يمكن متابعة حالة الطلب من التسجيل حتى الاكتمال.' }
  ]
} as const;
