import type { Locale } from './i18n';

export const guideSlugs = ['oman-remittance', 'dubai-remittance', 'turkey-remittance'] as const;

export type GuideSlug = (typeof guideSlugs)[number];

export type CorridorGuide = {
  kicker: string;
  title: string;
  copy: string;
  intro: string[];
  sections: Array<{ title: string; paragraphs: string[] }>;
  documentsTitle: string;
  documents: string[];
  timingTitle: string;
  timingItems: string[];
  timingNote: string;
  ctaTitle: string;
  ctaCopy: string;
};

export const guideScenes: Record<GuideSlug, 'muscat' | 'dubai' | 'istanbul'> = {
  'oman-remittance': 'muscat',
  'dubai-remittance': 'dubai',
  'turkey-remittance': 'istanbul'
};

export const cityToGuideSlug: Record<string, GuideSlug> = {
  muscat: 'oman-remittance',
  dubai: 'dubai-remittance',
  istanbul: 'turkey-remittance'
};

export function isGuideSlug(page: string): page is GuideSlug {
  return (guideSlugs as readonly string[]).includes(page);
}

export const guidePageTitles: Record<Locale, Record<GuideSlug, string>> = {
  fa: {
    'oman-remittance': 'راهنمای حواله عمان',
    'dubai-remittance': 'راهنمای حواله دبی و امارات',
    'turkey-remittance': 'راهنمای حواله ترکیه'
  },
  en: {
    'oman-remittance': 'Oman remittance guide',
    'dubai-remittance': 'Dubai and UAE remittance guide',
    'turkey-remittance': 'Turkey remittance guide'
  },
  ar: {
    'oman-remittance': 'دليل تحويلات عُمان',
    'dubai-remittance': 'دليل تحويلات دبي والإمارات',
    'turkey-remittance': 'دليل تحويلات تركيا'
  }
};

export const guideMeta: Record<Locale, Record<GuideSlug, { title: string; description: string }>> = {
  fa: {
    'oman-remittance': {
      title: 'راهنمای حواله عمان | مدارک، زمان و نرخ | اومانی',
      description:
        'راهنمای کامل حواله از عمان و مسقط: مدارک مورد نیاز، مراحل پردازش، زمان تقریبی، نرخ ارز و نکات KYC/AML در اومانی.'
    },
    'dubai-remittance': {
      title: 'راهنمای حواله دبی و امارات | مدارک و مسیر انتقال | اومانی',
      description:
        'راهنمای حواله از دبی و امارات: بررسی مسیر، مدارک هویتی، رسید پرداخت، زمان پردازش و پشتیبانی انسانی اومانی.'
    },
    'turkey-remittance': {
      title: 'راهنمای حواله ترکیه و استانبول | اومانی',
      description:
        'راهنمای حواله از ترکیه و استانبول به مقاصد منتخب: فرآیند عملیاتی، مدارک، نرخ نهایی و مسیرهای اروپا.'
    }
  },
  en: {
    'oman-remittance': {
      title: 'Oman Remittance Guide | Documents, Timing, Rates | OMoney',
      description:
        'Complete guide to remittance from Oman and Muscat: required documents, processing steps, indicative timing, rates, and KYC/AML at OMoney.'
    },
    'dubai-remittance': {
      title: 'Dubai & UAE Remittance Guide | Documents & Routes | OMoney',
      description:
        'Guide to remittance from Dubai and the UAE: corridor review, identity documents, payment receipts, processing time, and human support.'
    },
    'turkey-remittance': {
      title: 'Turkey & Istanbul Remittance Guide | OMoney',
      description:
        'Guide to remittance from Turkey and Istanbul: operational flow, documents, final rates, and selected Europe corridors.'
    }
  },
  ar: {
    'oman-remittance': {
      title: 'دليل تحويلات عُمان | المستندات والمدة | أوماني',
      description:
        'دليل شامل للتحويل من عُمان ومسقط: المستندات المطلوبة، خطوات المعالجة، المدة التقريبية، الأسعار وKYC/AML في أوماني.'
    },
    'dubai-remittance': {
      title: 'دليل تحويلات دبي والإمارات | أوماني',
      description:
        'دليل التحويل من دبي والإمارات: مراجعة المسار، مستندات الهوية، إيصالات الدفع، مدة المعالجة والدعم البشري.'
    },
    'turkey-remittance': {
      title: 'دليل تحويلات تركيا وإسطنبول | أوماني',
      description:
        'دليل التحويل من تركيا وإسطنبول: سير العمل، المستندات، السعر النهائي ومسارات أوروبا المختارة.'
    }
  }
};

export const corridorGuides: Record<GuideSlug, Record<Locale, CorridorGuide>> = {
  'oman-remittance': {
    fa: {
      kicker: 'راهنمای مسیر عمان',
      title: 'حواله از عمان و مسقط: مدارک، مراحل و زمان پردازش',
      copy:
        'اومانی با دفتر مرکزی در مسقط، مسیر حواله عمان را با بررسی انسانی، کنترل هویت و پیگیری شفاف مدیریت می‌کند.',
      intro: [
        'حواله عمان یکی از پرتقاضاترین مسیرهای مالی در منطقه خلیج فارس است. بسیاری از مشتریان در عمان به دنبال انتقال وجه به ایران، ترکیه، اروپا و دیگر مقاصد با نرخ شفاف و پشتیبانی قابل اعتماد هستند. اومانی این مسیر را با تمرکز بر فرآیند روشن و پاسخگویی واقعی ارائه می‌کند.',
        'برخلاف سامانه‌های کاملاً خودکار، هر درخواست حواله از عمان پیش از پردازش از نظر مسیر، مبلغ، مدارک، هویت فرستنده و گیرنده و وضعیت پرداخت بررسی می‌شود. این رویکرد برای کاهش ریسک، رعایت الزامات KYC/AML و حفاظت از مشتری ضروری است.',
        'این راهنما مراحل کلی، مدارک معمول و زمان‌های تقریبی را توضیح می‌دهد. جزئیات نهایی هر درخواست پس از مشاوره با کارشناس اومانی و بررسی شرایط عملیاتی اعلام می‌شود.'
      ],
      sections: [
        {
          title: 'چه کسانی از مسیر عمان استفاده می‌کنند؟',
          paragraphs: [
            'مشتریان شخصی که در عمان زندگی یا کار می‌کنند و نیاز به انتقال وجه به خانواده یا شرکای تجاری دارند.',
            'کسب‌وکارهایی که پرداخت‌های تجاری، تبدیل ارز یا هماهنگی تحویل در مقاصد مختلف را از مسقط مدیریت می‌کنند.',
            'افرادی که به صرافی در مسقط با استاندارد حرفه‌ای، شفافیت نرخ و پشتیبانی فارسی یا انگلیسی نیاز دارند.'
          ]
        },
        {
          title: 'مراحل انجام حواله از عمان',
          paragraphs: [
            'مشاوره اولیه: بررسی کشور مبدأ و مقصد، ارز، مبلغ تقریبی و زمان مورد نظر.',
            'تأیید مسیر و نرخ: تیم مالی نرخ مرجع را بررسی می‌کند و نرخ نهایی پس از تأیید اعلام می‌شود.',
            'ارسال مدارک و رسید: مدارک هویتی و رسید پرداخت طبق راهنمایی پشتیبانی بارگذاری می‌شود.',
            'پردازش و پیگیری: تیم عملیاتی درخواست را مرحله‌به‌مرحله پردازش و وضعیت را اطلاع می‌دهد.'
          ]
        },
        {
          title: 'نرخ ارز و شفافیت مالی',
          paragraphs: [
            'نرخ‌های بازار در صفحه نرخ ارز اومانی به‌روز هستند، اما نرخ نهایی حواله به مبلغ، مسیر، زمان اجرا و شرایط بازار بستگی دارد.',
            'برای مبالغ بالا، امکان دریافت نرخ اختصاصی وجود دارد. پیش از هر تراکنش، نرخ قطعی و شرایط پردازش توسط پشتیبانی تأیید می‌شود.',
            'اومانی تلاش می‌کند اختلاف نرخ خرید و فروش و هزینه‌های عملیاتی به‌صورت شفاف برای مشتری توضیح داده شود.'
          ]
        }
      ],
      documentsTitle: 'مدارک معمول مورد نیاز',
      documents: [
        'مدرک هویتی معتبر (گذرنامه یا کارت شناسایی)',
        'اطلاعات کامل فرستنده و گیرنده',
        'رسید پرداخت یا تأیید واریز',
        'جزئیات حساب گیرنده در صورت واریز بانکی',
        'مدارک تکمیلی در صورت درخواست تیم انطباق'
      ],
      timingTitle: 'زمان تقریبی پردازش',
      timingItems: [
        'مشاوره اولیه: معمولاً در همان روز کاری',
        'بررسی مدارک: ۱ تا ۲ روز کاری پس از تکمیل اطلاعات',
        'اجرای حواله: بسته به مقصد و مبلغ، از چند ساعت تا چند روز کاری',
        'مقاصد پیچیده یا مبالغ بالا: ممکن است زمان بیشتری نیاز باشد'
      ],
      timingNote:
        'زمان‌های فوق تقریبی هستند و پس از بررسی مسیر و مدارک، زمان دقیق‌تر توسط پشتیبانی اعلام می‌شود.',
      ctaTitle: 'قبل از ثبت حواله از عمان، با کارشناس صحبت کنید',
      ctaCopy: 'تیم اومانی در مسقط مسیر، مدارک و نرخ مناسب درخواست شما را بررسی می‌کند.'
    },
    en: {
      kicker: 'Oman corridor guide',
      title: 'Remittance from Oman and Muscat: documents, steps, and timing',
      copy:
        'Headquartered in Muscat, OMoney manages the Oman remittance corridor with human review, identity controls, and transparent follow-up.',
      intro: [
        'Oman remittance is one of the highest-demand financial corridors in the Gulf region. Many clients in Oman need to send money to Iran, Turkey, Europe, and other destinations with clear rates and accountable support. OMoney focuses on a transparent process and real human accountability.',
        'Unlike fully automated systems, every request from Oman is reviewed for corridor, amount, documents, sender and beneficiary identity, and payment status before processing. This approach reduces risk, supports KYC/AML requirements, and protects clients.',
        'This guide explains general steps, typical documents, and indicative timing. Final details for each request are confirmed after consultation with an OMoney specialist.'
      ],
      sections: [
        {
          title: 'Who uses the Oman corridor?',
          paragraphs: [
            'Individuals living or working in Oman who need to send money to family or business partners abroad.',
            'Businesses managing commercial payments, currency exchange, or coordinated delivery from Muscat.',
            'Clients who need exchange services in Muscat with professional standards, rate clarity, and Persian or English support.'
          ]
        },
        {
          title: 'Steps for remittance from Oman',
          paragraphs: [
            'Initial consultation: review origin, destination, currency, approximate amount, and preferred timing.',
            'Corridor and rate confirmation: the finance team reviews the reference rate and confirms the final rate.',
            'Documents and receipt: identity documents and payment receipt are submitted per support guidance.',
            'Processing and follow-up: the operations team processes the request in stages and shares status updates.'
          ]
        },
        {
          title: 'Exchange rates and financial clarity',
          paragraphs: [
            'Market rates on the OMoney rates page are updated regularly, but final remittance rates depend on amount, corridor, timing, and market conditions.',
            'For higher amounts, a dedicated rate may be offered. Final rates and processing conditions are confirmed by support before each transaction.',
            'OMoney aims to explain buy/sell spreads and operational factors transparently to each client.'
          ]
        }
      ],
      documentsTitle: 'Typical required documents',
      documents: [
        'Valid identity document (passport or ID card)',
        'Complete sender and beneficiary details',
        'Payment receipt or transfer confirmation',
        'Beneficiary account details for bank transfers',
        'Additional compliance documents if requested'
      ],
      timingTitle: 'Indicative processing time',
      timingItems: [
        'Initial consultation: usually same business day',
        'Document review: 1–2 business days after complete submission',
        'Transfer execution: from a few hours to several business days depending on destination',
        'Complex destinations or high amounts: may require additional time'
      ],
      timingNote: 'Timings are indicative. Support confirms a more precise estimate after corridor and document review.',
      ctaTitle: 'Speak with a specialist before sending from Oman',
      ctaCopy: 'The OMoney team in Muscat can review your corridor, documents, and appropriate rate.'
    },
    ar: {
      kicker: 'دليل مسار عُمان',
      title: 'التحويل من عُمان ومسقط: المستندات والخطوات والمدة',
      copy:
        'من مقرها في مسقط، تدير أوماني مسار تحويلات عُمان بمراجعة بشرية وضوابط هوية ومتابعة واضحة.',
      intro: [
        'تحويلات عُمان واحدة من أكثر المسارات المالية مطلوبة في الخليج. يحتاج كثير من العملاء في عُمان لإرسال الأموال إلى إيران وتركيا وأوروبا ووجهات أخرى بأسعار واضحة ودعم موثوق.',
        'بخلاف الأنظمة الآلية بالكامل، تتم مراجعة كل طلب من عُمان من حيث المسار والمبلغ والمستندات وهوية المرسل والمستفيد وحالة الدفع قبل المعالجة.',
        'يشرح هذا الدليل الخطوات العامة والمستندات المعتادة والمدة التقريبية. تُؤكد التفاصيل النهائية بعد استشارة مختص أوماني.'
      ],
      sections: [
        {
          title: 'من يستخدم مسار عُمان؟',
          paragraphs: [
            'الأفراد الذين يعيشون أو يعملون في عُمان ويحتاجون لإرسال الأموال لعائلاتهم أو شركاء تجاريين.',
            'الشركات التي تدير مدفوعات تجارية أو صرف عملات من مسقط.',
            'العملاء الذين يحتاجون صرافة في مسقط بمعايير مهنية ووضوح في الأسعار.'
          ]
        },
        {
          title: 'خطوات التحويل من عُمان',
          paragraphs: [
            'استشارة أولية: مراجعة بلد الإرسال والاستلام والعملة والمبلغ والتوقيت.',
            'تأكيد المسار والسعر: يراجع فريق المالية السعر المرجعي ويؤكد السعر النهائي.',
            'المستندات والإيصال: تُرفع مستندات الهوية وإيصال الدفع وفق توجيه الدعم.',
            'المعالجة والمتابعة: يعالج فريق العمليات الطلب مرحلياً ويبلغ عن الحالة.'
          ]
        },
        {
          title: 'أسعار الصرف والوضوح المالي',
          paragraphs: [
            'أسعار السوق في صفحة الأسعار محدثة، لكن السعر النهائي يعتمد على المبلغ والمسار والتوقيت وظروف السوق.',
            'للمبالغ الكبيرة قد يُعرض سعر مخصص. يُؤكد السعر النهائي قبل كل عملية.',
            'تسعى أوماني لشرح فروق الشراء والبيع بشكل شفاف للعميل.'
          ]
        }
      ],
      documentsTitle: 'المستندات المعتادة المطلوبة',
      documents: [
        'مستند هوية ساري (جواز سفر أو بطاقة)',
        'بيانات كاملة للمرسل والمستفيد',
        'إيصال دفع أو تأكيد تحويل',
        'تفاصيل حساب المستفيد للتحويل البنكي',
        'مستندات امتثال إضافية عند الطلب'
      ],
      timingTitle: 'مدة المعالجة التقريبية',
      timingItems: [
        'استشارة أولية: عادة في نفس يوم العمل',
        'مراجعة المستندات: 1–2 يوم عمل بعد اكتمال المعلومات',
        'تنفيذ التحويل: من ساعات إلى عدة أيام عمل حسب الوجهة',
        'وجهات معقدة أو مبالغ كبيرة: قد تحتاج وقتاً إضافياً'
      ],
      timingNote: 'المدد تقريبية. يؤكد الدعم تقديراً أدق بعد مراجعة المسار والمستندات.',
      ctaTitle: 'تحدث مع مختص قبل التحويل من عُمان',
      ctaCopy: 'يراجع فريق أوماني في مسقط مسارك ومستنداتك والسعر المناسب.'
    }
  },
  'dubai-remittance': {
    fa: {
      kicker: 'راهنمای مسیر امارات',
      title: 'حواله از دبی و امارات: مسیر، مدارک و نکات عملیاتی',
      copy:
        'مسیر حواله دبی و امارات یکی از پرترافیک‌ترین مسیرهای منطقه است و اومانی آن را با هماهنگی عملیاتی شفاف پشتیبانی می‌کند.',
      intro: [
        'دبی و امارات متحده عربی به‌عنوان مرکز مالی منطقه، نقش مهمی در انتقال‌های بین‌المللی دارند. بسیاری از مشتریان به دنبال صرافی در دبی با نرخ روشن، بررسی مدارک و پشتیبانی قابل پیگیری هستند.',
        'اومانی مسیر امارات را در کنار دفتر مرکزی مسقط مدیریت می‌کند. هر درخواست پیش از اجرا از نظر مبدأ، مقصد، مبلغ، مدارک و انطباق بررسی می‌شود.',
        'این صفحه راهنمای عملی برای مشتریانی است که قصد دارند از مسیر دبی یا امارات حواله ثبت کنند یا درباره تبدیل ارز مشاوره بگیرند.'
      ],
      sections: [
        {
          title: 'ویژگی‌های مسیر دبی و امارات',
          paragraphs: [
            'ترافیک بالای انتقال به مقاصد منطقه‌ای و بین‌المللی از جمله ایران و ترکیه.',
            'نیاز به بررسی دقیق رسید پرداخت و منبع وجه طبق الزامات انطباق.',
            'امکان هماهنگی تحویل نقدی، واریز به حساب یا روش‌های دیگر بسته به مقصد.'
          ]
        },
        {
          title: 'فرآیند ثبت درخواست از امارات',
          paragraphs: [
            'تماس با پشتیبانی یا ثبت درخواست در پلتفرم اومانی.',
            'ارائه اطلاعات مسیر: مبدأ امارات، مقصد، ارز مبدأ و مقصد، مبلغ تقریبی.',
            'دریافت نرخ مرجع و نرخ نهایی پس از بررسی تیم مالی.',
            'بارگذاری مدارک و رسید پرداخت و پیگیری تا تکمیل حواله.'
          ]
        },
        {
          title: 'نکات مهم برای مشتریان امارات',
          paragraphs: [
            'اطلاعات گیرنده باید کامل و مطابق مدارک باشد؛ خطاهای جزئی می‌تواند پردازش را تأخیر اندازد.',
            'برای مبالغ بالا، ممکن است مدارک تکمیلی یا تأیید منبع وجه درخواست شود.',
            'پشتیبانی واتساپ برای هماهنگی روزانه و پاسخ سریع در ساعات اداری در دسترس است.'
          ]
        }
      ],
      documentsTitle: 'مدارک معمول',
      documents: [
        'مدرک هویتی معتبر فرستنده',
        'اطلاعات هویتی و تماس گیرنده',
        'رسید انتقال بانکی یا پرداخت',
        'جزئیات حساب مقصد در صورت نیاز',
        'مدارک تجاری برای پرداخت‌های کسب‌وکار'
      ],
      timingTitle: 'زمان تقریبی',
      timingItems: [
        'پاسخ مشاوره اولیه: همان روز در ساعات اداری',
        'بررسی مدارک: ۱ تا ۳ روز کاری',
        'اجرای حواله: متغیر بر اساس مقصد و مبلغ',
        'مسیرهای پرتقاضا: ممکن است سریع‌تر پردازش شوند'
      ],
      timingNote: 'زمان دقیق پس از تأیید مسیر و کامل بودن مدارک اعلام می‌شود.',
      ctaTitle: 'مشاوره مسیر دبی قبل از ثبت درخواست',
      ctaCopy: 'کارشناسان اومانی مسیر امارات، مدارک و نرخ را برای شما بررسی می‌کنند.'
    },
    en: {
      kicker: 'UAE corridor guide',
      title: 'Remittance from Dubai and the UAE: routes, documents, and operations',
      copy:
        'The Dubai and UAE remittance corridor is one of the busiest in the region. OMoney supports it with transparent operational coordination.',
      intro: [
        'Dubai and the UAE play a central role in regional international transfers. Many clients need exchange in Dubai with clear rates, document review, and traceable support.',
        'OMoney manages the UAE corridor alongside its Muscat headquarters. Every request is reviewed for origin, destination, amount, documents, and compliance before execution.',
        'This page is a practical guide for clients planning remittance or exchange from Dubai or the wider UAE.'
      ],
      sections: [
        {
          title: 'Characteristics of the Dubai and UAE route',
          paragraphs: [
            'High traffic to regional and international destinations including Iran and Turkey.',
            'Strict review of payment receipts and source-of-funds under compliance requirements.',
            'Coordination of cash delivery, account transfer, or other methods depending on destination.'
          ]
        },
        {
          title: 'Request flow from the UAE',
          paragraphs: [
            'Contact support or submit a request on the OMoney platform.',
            'Provide corridor details: UAE origin, destination, currencies, and approximate amount.',
            'Receive reference and final rates after finance team review.',
            'Upload documents and payment receipt and follow status until completion.'
          ]
        },
        {
          title: 'Important notes for UAE clients',
          paragraphs: [
            'Beneficiary details must be complete and accurate; small errors can delay processing.',
            'Higher amounts may require supplementary documents or source-of-funds confirmation.',
            'WhatsApp support is available during business hours for daily coordination.'
          ]
        }
      ],
      documentsTitle: 'Typical documents',
      documents: [
        'Valid sender identity document',
        'Beneficiary identity and contact details',
        'Bank transfer or payment receipt',
        'Destination account details if required',
        'Business documents for commercial payments'
      ],
      timingTitle: 'Indicative timing',
      timingItems: [
        'Initial consultation response: same business day',
        'Document review: 1–3 business days',
        'Transfer execution: varies by destination and amount',
        'High-demand corridors: may process faster'
      ],
      timingNote: 'Precise timing is confirmed after corridor approval and complete documents.',
      ctaTitle: 'Consult on the Dubai route before submitting',
      ctaCopy: 'OMoney specialists can review UAE corridor, documents, and rates for your request.'
    },
    ar: {
      kicker: 'دليل مسار الإمارات',
      title: 'التحويل من دبي والإمارات: المسار والمستندات',
      copy:
        'مسار تحويلات دبي والإمارات من أكثر المسارات نشاطاً في المنطقة. تدعمه أوماني بتنسيق تشغيلي واضح.',
      intro: [
        'دبي والإمارات مركز مالي رئيسي للتحويلات الدولية. يحتاج كثير من العملاء صرافة في دبي بأسعار واضحة ومراجعة مستندات.',
        'تدير أوماني مسار الإمارات إلى جانب مقرها في مسقط. تُراجع كل طلب قبل التنفيذ.',
        'هذه الصفحة دليل عملي للعملاء الذين يخططون للتحويل أو الصرف من دبي أو الإمارات.'
      ],
      sections: [
        {
          title: 'خصائص مسار دبي والإمارات',
          paragraphs: [
            'حركة عالية نحو وجهات إقليمية ودولية بما فيها إيران وتركيا.',
            'مراجعة صارمة لإيصالات الدفع ومصدر الأموال وفق الامتثال.',
            'تنسيق تسليم نقدي أو تحويل لحساب حسب الوجهة.'
          ]
        },
        {
          title: 'خطوات الطلب من الإمارات',
          paragraphs: [
            'التواصل مع الدعم أو تسجيل طلب على منصة أوماني.',
            'تقديم تفاصيل المسار: الإمارات كمبدأ، الوجهة، العملات والمبلغ.',
            'استلام السعر المرجعي والنهائي بعد مراجعة المالية.',
            'رفع المستندات وإيصال الدفع ومتابعة الحالة حتى الاكتمال.'
          ]
        },
        {
          title: 'ملاحظات مهمة لعملاء الإمارات',
          paragraphs: [
            'يجب أن تكون بيانات المستفيد كاملة ودقيقة.',
            'المبالغ الكبيرة قد تتطلب مستندات إضافية.',
            'دعم واتساب متاح في ساعات العمل للتنسيق اليومي.'
          ]
        }
      ],
      documentsTitle: 'المستندات المعتادة',
      documents: [
        'مستند هوية المرسل',
        'بيانات المستفيد والتواصل',
        'إيصال تحويل بنكي أو دفع',
        'تفاصيل حساب الوجهة عند الحاجة',
        'مستندات تجارية للمدفوعات التجارية'
      ],
      timingTitle: 'المدة التقريبية',
      timingItems: [
        'رد الاستشارة الأولية: نفس يوم العمل',
        'مراجعة المستندات: 1–3 أيام عمل',
        'تنفيذ التحويل: يختلف حسب الوجهة والمبلغ',
        'مسارات عالية الطلب: قد تُعالج أسرع'
      ],
      timingNote: 'تُؤكد المدة الدقيقة بعد الموافقة على المسار واكتمال المستندات.',
      ctaTitle: 'استشر مسار دبي قبل التسجيل',
      ctaCopy: 'يراجع مختصو أوماني مسار الإمارات والمستندات والسعر.'
    }
  },
  'turkey-remittance': {
    fa: {
      kicker: 'راهنمای مسیر ترکیه',
      title: 'حواله از ترکیه و استانبول: مسیر اروپا و مقاصد منتخب',
      copy:
        'دفتر اومانی در استانبول مسیر ترکیه و ارتباط با اروپا را با پشتیبانی عملیاتی و بررسی انسانی پوشش می‌دهد.',
      intro: [
        'ترکیه به‌ویژه استانبول، پل مالی مهم میان خاورمیانه و اروپا است. مشتریان زیادی به دنبال حواله ترکیه با نرخ شفاف، مدارک روشن و پشتیبانی فارسی یا انگلیسی هستند.',
        'اومانی خدمات صرافی در استانبول و مسیرهای منتخب به اروپا و مقاصد بین‌المللی را با همان استاندارد دفتر مرکزی مسقط ارائه می‌کند.',
        'این راهنما مراحل، مدارک و انتظارات زمانی برای حواله از ترکیه را توضیح می‌دهد. جزئیات هر درخواست پس از بررسی عملیاتی تعیین می‌شود.'
      ],
      sections: [
        {
          title: 'خدمات قابل ارائه از مسیر ترکیه',
          paragraphs: [
            'حواله بین‌المللی به مقاصد منتخب از جمله ایران و برخی کشورهای اروپایی.',
            'تبدیل ارز TRY، EUR، USD و ارزهای اصلی پس از تأیید نرخ نهایی.',
            'مشاوره برای پرداخت‌های تجاری و نیازهای ارزی کسب‌وکارها در ترکیه.'
          ]
        },
        {
          title: 'مراحل عملیاتی حواله از استانبول',
          paragraphs: [
            'مشاوره مسیر و بررسی امکان انجام مقصد مورد نظر.',
            'تأیید نرخ و زمان اجرا توسط تیم مالی.',
            'جمع‌آوری مدارک هویتی، اطلاعات گیرنده و رسید پرداخت.',
            'پردازش، پیگیری و اعلام نتیجه نهایی به مشتری.'
          ]
        },
        {
          title: 'ارتباط با اروپا و بازارهای جهانی',
          paragraphs: [
            'از استانبول، برخی مسیرها به اروپا و مقاصد جهانی قابل هماهنگی است.',
            'هر مقصد تابع قوانین محلی، مدارک و شرایط عملیاتی است؛ همه مسیرها بدون بررسی قبلی قطعی نیستند.',
            'برای مسیرهای خاص، مشاوره پیش از ثبت درخواست توصیه می‌شود.'
          ]
        }
      ],
      documentsTitle: 'مدارک معمول',
      documents: [
        'مدرک هویتی معتبر',
        'اطلاعات کامل گیرنده در کشور مقصد',
        'رسید پرداخت یا تأیید واریز',
        'جزئیات حساب بانکی در صورت واریز',
        'مدارک تجاری برای تراکنش‌های کسب‌وکار'
      ],
      timingTitle: 'زمان تقریبی پردازش',
      timingItems: [
        'مشاوره اولیه: در ساعات اداری همان روز',
        'بررسی مدارک: ۱ تا ۲ روز کاری',
        'اجرای حواله داخلی ترکیه: ممکن است سریع‌تر باشد',
        'مقاصد بین‌المللی: چند روز کاری یا بیشتر'
      ],
      timingNote: 'مدت زمان به مقصد، مبلغ و کامل بودن مدارک بستگی دارد.',
      ctaTitle: 'قبل از حواله از ترکیه با اومانی مشورت کنید',
      ctaCopy: 'دفتر استانبول مسیر، مدارک و زمان تقریبی را برای شما بررسی می‌کند.'
    },
    en: {
      kicker: 'Turkey corridor guide',
      title: 'Remittance from Turkey and Istanbul: Europe and selected destinations',
      copy:
        'OMoney’s Istanbul office covers the Turkey corridor and links to Europe with human-reviewed operational support.',
      intro: [
        'Turkey, especially Istanbul, is a key financial bridge between the Middle East and Europe. Many clients need Turkey remittance with clear rates, documented processes, and Persian or English support.',
        'OMoney provides exchange in Istanbul and selected routes to Europe and international destinations under the same standards as the Muscat headquarters.',
        'This guide explains steps, documents, and timing expectations for transfers from Turkey. Each request is finalized after operational review.'
      ],
      sections: [
        {
          title: 'Services available from Turkey',
          paragraphs: [
            'International remittance to selected destinations including Iran and some European countries.',
            'Currency exchange for TRY, EUR, USD, and major currencies after final rate confirmation.',
            'Advisory for commercial payments and business FX needs in Turkey.'
          ]
        },
        {
          title: 'Operational steps from Istanbul',
          paragraphs: [
            'Corridor consultation and feasibility check for your destination.',
            'Rate and execution timing confirmed by the finance team.',
            'Collection of identity documents, beneficiary details, and payment receipt.',
            'Processing, follow-up, and final confirmation to the client.'
          ]
        },
        {
          title: 'Links to Europe and global markets',
          paragraphs: [
            'From Istanbul, some routes to Europe and global destinations can be coordinated.',
            'Each destination depends on local rules, documents, and operational conditions; not all routes are guaranteed without prior review.',
            'Pre-request consultation is recommended for special corridors.'
          ]
        }
      ],
      documentsTitle: 'Typical documents',
      documents: [
        'Valid identity document',
        'Complete beneficiary details in the destination country',
        'Payment receipt or transfer confirmation',
        'Bank account details for account transfers',
        'Business documents for commercial transactions'
      ],
      timingTitle: 'Indicative processing time',
      timingItems: [
        'Initial consultation: same business day during office hours',
        'Document review: 1–2 business days',
        'Domestic Turkey transfers: may be faster',
        'International destinations: several business days or more'
      ],
      timingNote: 'Timing depends on destination, amount, and complete documentation.',
      ctaTitle: 'Consult OMoney before sending from Turkey',
      ctaCopy: 'The Istanbul office can review your corridor, documents, and indicative timing.'
    },
    ar: {
      kicker: 'دليل مسار تركيا',
      title: 'التحويل من تركيا وإسطنبول: أوروبا ووجهات مختارة',
      copy:
        'مكتب أوماني في إسطنبول يغطي مسار تركيا والربط مع أوروبا بدعم تشغيلي بمراجعة بشرية.',
      intro: [
        'تركيا وإسطنبول جسر مالي مهم بين الشرق الأوسط وأوروبا. يحتاج كثير من العملاء تحويلات تركيا بأسعار واضحة ودعم بالفارسية أو الإنجليزية.',
        'تقدم أوماني صرافة في إسطنبول ومسارات مختارة إلى أوروبا والوجهات الدولية بمعايير مقر مسقط.',
        'يشرح هذا الدليل الخطوات والمستندات والمدة المتوقعة للتحويل من تركيا.'
      ],
      sections: [
        {
          title: 'الخدمات المتاحة من تركيا',
          paragraphs: [
            'تحويلات دولية إلى وجهات مختارة بما فيها إيران وبعض دول أوروبا.',
            'صرف TRY وEUR وUSD والعملات الرئيسية بعد تأكيد السعر النهائي.',
            'استشارات للمدفوعات التجارية واحتياجات العملات للأعمال.'
          ]
        },
        {
          title: 'خطوات التشغيل من إسطنبول',
          paragraphs: [
            'استشارة المسار والتحقق من إمكانية الوجهة.',
            'تأكيد السعر وتوقيت التنفيذ من فريق المالية.',
            'جمع مستندات الهوية وبيانات المستفيد وإيصال الدفع.',
            'المعالجة والمتابعة والتأكيد النهائي للعميل.'
          ]
        },
        {
          title: 'الربط مع أوروبا والأسواق العالمية',
          paragraphs: [
            'من إسطنبول يمكن تنسيق بعض المسارات إلى أوروبا والوجهات العالمية.',
            'كل وجهة تخضع للقوانين المحلية والمستندات؛ لا تُضمن كل المسارات دون مراجعة مسبقة.',
            'يُنصح بالاستشارة قبل الطلب للمسارات الخاصة.'
          ]
        }
      ],
      documentsTitle: 'المستندات المعتادة',
      documents: [
        'مستند هوية ساري',
        'بيانات كاملة للمستفيد في بلد الوجهة',
        'إيصال دفع أو تأكيد تحويل',
        'تفاصيل حساب بنكي عند الحاجة',
        'مستندات تجارية للمعاملات التجارية'
      ],
      timingTitle: 'مدة المعالجة التقريبية',
      timingItems: [
        'استشارة أولية: نفس يوم العمل',
        'مراجعة المستندات: 1–2 يوم عمل',
        'تحويلات داخل تركيا: قد تكون أسرع',
        'وجهات دولية: عدة أيام عمل أو أكثر'
      ],
      timingNote: 'تعتمد المدة على الوجهة والمبلغ واكتمال المستندات.',
      ctaTitle: 'استشر أوماني قبل التحويل من تركيا',
      ctaCopy: 'يراجع مكتب إسطنبول مسارك ومستنداتك والمدة التقريبية.'
    }
  }
};
