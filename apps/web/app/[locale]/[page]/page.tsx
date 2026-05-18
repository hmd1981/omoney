import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRightLeft,
  Banknote,
  Building2,
  ClipboardCheck,
  FileCheck2,
  Globe2,
  Headset,
  ShieldCheck
} from 'lucide-react';
import { SiteShell } from '../../../components/site-shell';
import { MediaBackground } from '../../../components/media-background';
import { RatesCatalog } from '../../../components/rates-catalog';
import { CinematicBackground } from '../../../components/cinematic-background';
import { content } from '../../../lib/content';
import { getMediaPlacements } from '../../../lib/media';
import { getWhatsAppHref } from '../../../lib/whatsapp';

const pages = {
  fa: {
    about: 'درباره اومانی',
    services: 'خدمات ما',
    rates: 'نرخ ارز',
    faq: 'سوالات متداول',
    contact: 'تماس',
    terms: 'قوانین',
    privacy: 'حریم خصوصی'
  },
  en: {
    about: 'About OMoney',
    services: 'Our services',
    rates: 'Exchange rates',
    faq: 'FAQ',
    contact: 'Contact',
    terms: 'Terms',
    privacy: 'Privacy'
  }
} as const;

const services = {
  fa: [
    ['حواله بین‌المللی', 'هماهنگی انتقال وجه در مسیرهای منتخب عمان، امارات، ترکیه و مقاصد بین‌المللی با بررسی انسانی، احراز هویت و پیگیری مرحله‌به‌مرحله.'],
    ['تبدیل ارز', 'ارائه نرخ‌های به‌روز برای ارزهای اصلی و اجرای تبدیل پس از تأیید تیم مالی، با تمرکز بر شفافیت، امنیت و دقت عملیاتی.'],
    ['مشاوره مسیر انتقال', 'بررسی مبدأ، مقصد، ارز، مبلغ و زمان‌بندی برای پیشنهاد مسیر مناسب حواله یا تبدیل ارز متناسب با نیاز هر مشتری.'],
    ['بررسی مدارک و پشتیبانی', 'راهنمایی درباره مدارک هویتی، رسید پرداخت، اطلاعات گیرنده و الزامات انطباق پیش از پردازش درخواست.'],
    ['خدمات کسب‌وکار و مشاوره ارزی', 'پشتیبانی اولیه برای نیازهای ارزی کسب‌وکارها، پرداخت‌های تجاری، ثبت شرکت و برنامه‌ریزی مسیرهای مالی منطقه‌ای.']
  ],
  en: [
    ['International remittance', 'Human-reviewed money transfers across selected Oman, UAE, Turkey, and international corridors with identity checks and clear operational tracking.'],
    ['Currency exchange', 'Up-to-date rates for major currencies, with final execution confirmed by the finance team for transparency, security, and operational accuracy.'],
    ['Transfer route advisory', 'Guidance based on origin, destination, currency, amount, and timing so each client can choose the right remittance or exchange route.'],
    ['Document review and support', 'Support with identity documents, payment receipts, beneficiary details, and compliance requirements before a request is processed.'],
    ['Business FX and advisory', 'Initial support for business currency needs, commercial payments, company setup, and regional financial corridor planning.']
  ]
} as const;

const servicePage = {
  fa: {
    kicker: 'خدمات نهادی صرافی و حواله',
    title: 'خدمات اومانی برای حواله، تبدیل ارز و مسیرهای مالی بین‌المللی',
    copy:
      'از صرافی در مسقط و صرافی در دبی تا حواله ترکیه و مسیرهای جهانی، خدمات اومانی برای مشتریانی طراحی شده که به شفافیت، پشتیبانی انسانی و اجرای حرفه‌ای نیاز دارند.',
    ctaPrimary: 'ثبت درخواست خدمات',
    ctaSecondary: 'مشاوره در واتساپ',
    proof: ['KYC / AML', 'پشتیبانی انسانی', 'نرخ‌های به‌روز', 'مسقط · دبی · استانبول'],
    processTitle: 'فرآیند خدمات چگونه پیش می‌رود؟',
    processCopy:
      'هر درخواست ابتدا از نظر مسیر، مدارک، نرخ و زمان‌بندی بررسی می‌شود؛ سپس تیم عملیاتی وضعیت را مرحله‌به‌مرحله با مشتری هماهنگ می‌کند.',
    steps: ['مشاوره مسیر', 'بررسی مدارک و نرخ', 'ثبت رسید و اطلاعات گیرنده', 'پردازش و اعلام نتیجه'],
    trustTitle: 'برای چه کسانی مناسب است؟',
    trustCopy:
      'مشتریان شخصی، خانواده‌ها، کسب‌وکارها و افرادی که به انتقال پول بین‌المللی با پاسخگویی واقعی و فرآیند شفاف نیاز دارند.',
    finalCtaTitle: 'قبل از انتخاب مسیر انتقال، با کارشناس اومانی صحبت کنید',
    finalCtaCopy:
      'تیم پشتیبانی مسیر مناسب، مدارک مورد نیاز و زمان تقریبی پردازش را پیش از ثبت درخواست بررسی می‌کند.'
  },
  en: {
    kicker: 'Institutional exchange and remittance services',
    title: 'OMoney services for remittance, currency exchange, and international financial corridors',
    copy:
      'From exchange in Muscat and Dubai to Turkey remittance and global transfer routes, OMoney is built for clients who need clarity, human support, and professional execution.',
    ctaPrimary: 'Start a service request',
    ctaSecondary: 'Talk on WhatsApp',
    proof: ['KYC / AML', 'Human support', 'Updated rates', 'Muscat · Dubai · Istanbul'],
    processTitle: 'How the service flow works',
    processCopy:
      'Each request is reviewed for corridor, documentation, rate, and timing before the operations team coordinates the next steps with the client.',
    steps: ['Route consultation', 'Document and rate review', 'Receipt and beneficiary details', 'Processing and confirmation'],
    trustTitle: 'Who it is designed for',
    trustCopy:
      'Individuals, families, businesses, and clients who need international money transfer with real accountability and a transparent process.',
    finalCtaTitle: 'Speak with an OMoney specialist before choosing a route',
    finalCtaCopy:
      'Our support team can review the right corridor, required documents, and expected processing time before you submit a request.'
  }
} as const;

const serviceIcons = [Globe2, ArrowRightLeft, Headset, FileCheck2, Building2] as const;

const aboutPage = {
  fa: {
    kicker: 'درباره اومانی',
    title: 'یک برند مالی منطقه‌ای برای صرافی، حواله و انتقال پول بین‌المللی',
    copy:
      'اومانی با تمرکز بر مسیرهای مالی عمان، امارات، ترکیه، ایران و بازارهای جهانی، خدمات صرافی و حواله را با استانداردی حرفه‌ای، شفاف و انسانی ارائه می‌کند.',
    trustTitle: 'اعتماد در اومانی یعنی فرآیند روشن، پاسخگویی واقعی و اجرای دقیق',
    trustCopy:
      'هر درخواست پیش از پردازش از نظر مسیر، نرخ، مدارک، هویت و وضعیت پرداخت بررسی می‌شود تا مشتری با اطمینان مسیر مناسب انتقال یا تبدیل ارز را انتخاب کند.',
    stats: [
      ['+۵۰ سال', 'پشتوانه تجربه در پول و مبادلات'],
      ['۳ مسیر اصلی', 'مسقط، دبی و استانبول'],
      ['KYC / AML', 'کنترل هویت و انطباق'],
      ['پشتیبانی انسانی', 'فارسی و انگلیسی']
    ],
    principles: [
      ['شفافیت عملیاتی', 'وضعیت درخواست، مدارک و رسیدها در فرآیندی قابل پیگیری مدیریت می‌شود.'],
      ['امنیت و انطباق', 'کنترل‌های هویتی و بررسی‌های ضدتقلب برای کاهش ریسک و حفاظت از مشتریان انجام می‌شود.'],
      ['حضور منطقه‌ای', 'مسیرهای عمان، امارات، ترکیه و مقاصد منتخب بین‌المللی با شناخت عملیاتی پشتیبانی می‌شوند.'],
      ['پشتیبانی واقعی', 'مشتری با کارشناس انسانی صحبت می‌کند؛ نه با یک فرآیند مبهم یا کاملاً خودکار.']
    ],
    body: [
      'اومانی با پشتوانه بیش از نیم قرن تجربه در حوزه پول، ارز و مبادلات بین‌المللی، ارائه‌دهنده خدمات تخصصی صرافی، حواله و تبادل ارز برای مشتریان در عمان، امارات، ترکیه و ایران است. دفتر مرکزی اومانی در مسقط قرار دارد و خدمات ما با پوشش فعال در مسیرهای مالی منطقه‌ای، از جمله صرافی در مسقط، صرافی در دبی و صرافی در استانبول، به‌صورت حرفه‌ای و هماهنگ ارائه می‌شود.',
      'ما با تکیه بر تجربه عملی، شناخت دقیق بازارهای مالی منطقه و حضور در مهم‌ترین مسیرهای تبادل ارزی، خدمات حواله بین‌المللی، تبدیل ارز، پرداخت‌های تجاری و مشاوره مالی را با رویکردی شفاف، امن و مسئولانه ارائه می‌کنیم. امکان انجام مبادلات حضوری، تحویل ارز نقدی، واریز به حساب، انتقال بین‌المللی وجه و هماهنگی تحویل در مقاصد مختلف، متناسب با نیاز هر مشتری بررسی و اجرا می‌شود.',
      'اومانی تلاش می‌کند فرآیند انتقال و تبدیل ارز را برای مشتریان ایرانی و بین‌المللی ساده، مطمئن و قابل اعتماد کند. از حواله عمان و حواله ترکیه تا تبادلات مالی میان امارات، اروپا، کانادا و سایر مقاصد جهانی، تمامی مراحل با دقت عملیاتی، امنیت اطلاعات و همراهی انسانی مدیریت می‌شود.',
      'هدف ما این است که هر درخواست، از مشاوره اولیه تا اجرای نهایی، با استانداردی حرفه‌ای و مبتنی بر اعتماد پیش برود؛ به‌گونه‌ای که مشتریان بتوانند با اطمینان، مناسب‌ترین مسیر انتقال یا تبدیل ارز خود را انتخاب کنند و از خدمات یک مجموعه معتبر صرافی در عمان و منطقه بهره‌مند شوند.'
    ],
    contactTitle: 'ارتباط مستقیم با اومانی',
    contactCopy: 'برای بررسی مسیر انتقال، مدارک مورد نیاز یا زمان تقریبی پردازش، با تیم پشتیبانی اومانی در تماس باشید.',
    officesTitle: 'دفاتر و مسیرهای عملیاتی',
    offices: [
      ['دفتر عمان', 'مسقط · دفتر مرکزی و مسیر حواله عمان'],
      ['دفتر ترکیه', 'استانبول · مسیر ترکیه و اروپا']
    ]
  },
  en: {
    kicker: 'About OMoney',
    title: 'A regional financial brand for exchange, remittance, and international money transfer',
    copy:
      'OMoney supports financial corridors across Oman, the UAE, Turkey, Iran, and selected global markets with a professional, transparent, and human-led service model.',
    trustTitle: 'At OMoney, trust means a clear process, real accountability, and precise execution',
    trustCopy:
      'Every request is reviewed for corridor, rate, documentation, identity, and payment status before processing, so clients can choose the right transfer or exchange route with confidence.',
    stats: [
      ['50+ years', 'Experience in money and exchange'],
      ['3 core corridors', 'Muscat, Dubai, and Istanbul'],
      ['KYC / AML', 'Identity and compliance controls'],
      ['Human support', 'Persian and English']
    ],
    principles: [
      ['Operational clarity', 'Requests, documents, and receipts are handled through a traceable process.'],
      ['Security and compliance', 'Identity checks and fraud controls help reduce risk and protect clients.'],
      ['Regional presence', 'Oman, UAE, Turkey, and selected international routes are supported with operational knowledge.'],
      ['Real support', 'Clients speak with a human specialist, not an opaque or fully automated process.']
    ],
    body: [
      'OMoney draws on more than half a century of experience in money, currency, and international exchange, providing specialized exchange, remittance, and currency services for clients in Oman, the UAE, Turkey, and Iran. Our headquarters is in Muscat, and we deliver services across active regional financial routes, including exchange operations in Muscat, Dubai, and Istanbul.',
      'With practical market experience and knowledge of key currency corridors, we provide international remittance, currency exchange, commercial payments, and financial advisory services with a transparent, secure, and responsible approach. In-person transactions, cash currency delivery, account transfers, international fund transfers, and coordinated delivery are reviewed according to each client’s needs.',
      'OMoney works to make currency transfer and exchange simple, reliable, and trustworthy for Iranian and international clients. From Oman and Turkey remittance routes to financial exchanges involving the UAE, Europe, Canada, and other global destinations, each stage is managed with operational precision, information security, and human support.',
      'Our goal is for every request, from initial consultation to final execution, to meet a professional standard built on trust, so clients can confidently choose the most suitable transfer or exchange route with a trusted exchange group in Oman and across the region.'
    ],
    contactTitle: 'Direct contact with OMoney',
    contactCopy: 'Speak with our support team about transfer corridors, required documents, and expected processing times.',
    officesTitle: 'Offices and operating corridors',
    offices: [
      ['Oman office', 'Muscat · Headquarters and Oman remittance corridor'],
      ['Turkey office', 'Istanbul · Turkey and Europe corridor']
    ]
  }
} as const;

const faqPage = {
  fa: {
    kicker: 'پرسش‌های متداول',
    title: 'پاسخ‌های شفاف درباره خدمات اومانی، نرخ ارز و حواله بین‌المللی',
    copy:
      'در این بخش، مهم‌ترین سوالات مشتریان درباره مسیرهای انتقال، نرخ نهایی، مدارک، امنیت، KYC/AML و پشتیبانی انسانی پاسخ داده شده است.',
    introTitle: 'قبل از ثبت درخواست چه چیزهایی باید بدانید؟',
    introCopy:
      'اومانی تلاش می‌کند تصمیم‌گیری برای حواله و تبدیل ارز ساده‌تر، شفاف‌تر و قابل اعتمادتر باشد. پاسخ‌های زیر برای آشنایی اولیه است؛ جزئیات نهایی هر درخواست پس از بررسی مسیر و مدارک اعلام می‌شود.',
    groups: [
      {
        title: 'نرخ ارز و تبدیل ارز',
        items: [
          ['نرخ‌های سایت قطعی هستند؟', 'نرخ‌های نمایش‌داده‌شده نرخ‌های مرجع و به‌روز بازار هستند. نرخ نهایی حواله یا تبدیل ارز پس از بررسی مبلغ، مسیر، زمان اجرا و تأیید تیم مالی قطعی می‌شود.'],
          ['چرا نرخ خرید و فروش متفاوت است؟', 'در خدمات صرافی، نرخ خرید و فروش با توجه به شرایط بازار، هزینه اجرا، نقدشوندگی و ریسک عملیاتی متفاوت است. اومانی تلاش می‌کند این اختلاف شفاف و قابل توضیح باشد.'],
          ['آیا برای مبالغ بالا نرخ جداگانه اعلام می‌شود؟', 'بله. برای مبالغ بالا یا مسیرهای خاص، تیم مالی می‌تواند نرخ اختصاصی و زمان اجرای دقیق‌تری ارائه کند.']
        ]
      },
      {
        title: 'حواله و مسیرهای بین‌المللی',
        items: [
          ['اومانی چه مسیرهایی را پشتیبانی می‌کند؟', 'مسیرهای اصلی شامل عمان، امارات، ترکیه، ایران و برخی مقاصد منتخب بین‌المللی است. امکان انجام هر مسیر به مبلغ، مدارک، مقصد و شرایط عملیاتی بستگی دارد.'],
          ['مدت زمان انجام حواله چقدر است؟', 'زمان پردازش بر اساس مسیر، مبلغ، تکمیل مدارک و وضعیت پرداخت متفاوت است. پس از بررسی اولیه، زمان تقریبی توسط پشتیبانی اعلام می‌شود.'],
          ['آیا امکان تحویل نقدی یا واریز به حساب وجود دارد؟', 'بسته به کشور مقصد، قوانین محلی و شرایط مسیر، امکان واریز به حساب، تحویل هماهنگ‌شده یا روش‌های دیگر بررسی می‌شود.']
        ]
      },
      {
        title: 'مدارک، امنیت و انطباق',
        items: [
          ['چرا احراز هویت لازم است؟', 'احراز هویت برای حفاظت از مشتری، جلوگیری از سوءاستفاده مالی و رعایت الزامات KYC/AML انجام می‌شود. این فرآیند بخشی از استاندارد حرفه‌ای خدمات مالی است.'],
          ['چه مدارکی لازم است؟', 'معمولاً مدارک هویتی معتبر، اطلاعات فرستنده و گیرنده، رسید پرداخت و جزئیات مسیر مورد نیاز است. مدارک دقیق پس از انتخاب مسیر اعلام می‌شود.'],
          ['اطلاعات من امن است؟', 'اومانی اطلاعات مشتریان را فقط برای بررسی و پردازش درخواست استفاده می‌کند و دسترسی به اطلاعات حساس محدود به تیم مجاز عملیاتی است.']
        ]
      },
      {
        title: 'پشتیبانی و پیگیری',
        items: [
          ['چطور وضعیت درخواست را پیگیری کنم؟', 'پس از ثبت درخواست، وضعیت مراحل توسط تیم پشتیبانی قابل پیگیری است. برای موارد فوری، واتساپ سریع‌ترین مسیر ارتباطی است.'],
          ['آیا قبل از ثبت درخواست می‌توانم مشاوره بگیرم؟', 'بله. قبل از ثبت درخواست می‌توانید مسیر، مدارک، زمان تقریبی و شرایط نرخ را با کارشناس اومانی بررسی کنید.'],
          ['اگر مسیر مورد نظر من در سایت نبود چه کنم؟', 'با پشتیبانی تماس بگیرید. برخی مسیرها پس از بررسی عملیاتی و انطباق قابل انجام هستند، حتی اگر در صفحه عمومی سایت فهرست نشده باشند.']
        ]
      }
    ],
    ctaTitle: 'پاسخ دقیق‌تر می‌خواهید؟ با کارشناس اومانی صحبت کنید',
    ctaCopy:
      'برای بررسی مسیر، مدارک و نرخ مناسب درخواست خود، پشتیبانی انسانی اومانی در واتساپ پاسخگو است.'
  },
  en: {
    kicker: 'Frequently asked questions',
    title: 'Clear answers about OMoney services, exchange rates, and international remittance',
    copy:
      'This page answers the most common questions about transfer corridors, final rates, documents, security, KYC/AML, and human support.',
    introTitle: 'What should you know before submitting a request?',
    introCopy:
      'OMoney is designed to make remittance and currency exchange more transparent and reliable. These answers provide general guidance; final details are confirmed after reviewing the corridor and documentation.',
    groups: [
      {
        title: 'Exchange rates and currency conversion',
        items: [
          ['Are the rates on the website final?', 'Displayed rates are live market references. The final remittance or exchange rate is confirmed after reviewing the amount, corridor, timing, and finance-team approval.'],
          ['Why are buy and sell rates different?', 'Exchange services use separate buy and sell rates based on market conditions, execution cost, liquidity, and operational risk. OMoney aims to keep this difference transparent.'],
          ['Can large amounts receive a custom rate?', 'Yes. For larger amounts or specific corridors, the finance team may provide a tailored rate and clearer execution timeline.']
        ]
      },
      {
        title: 'Remittance and international corridors',
        items: [
          ['Which corridors does OMoney support?', 'Core corridors include Oman, the UAE, Turkey, Iran, and selected international destinations. Availability depends on amount, documentation, destination, and operational conditions.'],
          ['How long does a transfer take?', 'Processing time depends on corridor, amount, document completion, and payment status. Our support team provides an estimated timeline after initial review.'],
          ['Can funds be delivered in cash or deposited to an account?', 'Depending on destination, local rules, and corridor conditions, account deposit, coordinated cash delivery, or other routes may be reviewed.']
        ]
      },
      {
        title: 'Documents, security, and compliance',
        items: [
          ['Why is identity verification required?', 'Identity verification protects clients, helps prevent financial misuse, and supports KYC/AML requirements. It is part of professional financial-service standards.'],
          ['What documents are required?', 'Usually valid identity documents, sender and beneficiary details, payment receipt, and corridor information are required. Exact requirements are confirmed after route selection.'],
          ['Is my information secure?', 'OMoney uses client information only to review and process requests, with sensitive information limited to authorized operations staff.']
        ]
      },
      {
        title: 'Support and tracking',
        items: [
          ['How can I track my request?', 'After submission, the support team can provide status updates. For urgent cases, WhatsApp is the fastest contact channel.'],
          ['Can I speak with someone before submitting a request?', 'Yes. You can discuss route, documents, timing, and rate conditions with an OMoney specialist before submitting.'],
          ['What if my desired corridor is not listed?', 'Contact support. Some corridors may be possible after operational and compliance review, even if they are not listed publicly.']
        ]
      }
    ],
    ctaTitle: 'Need a more specific answer? Speak with an OMoney specialist',
    ctaCopy:
      'For corridor, document, and rate guidance specific to your request, OMoney human support is available on WhatsApp.'
  }
} as const;

const legalPage = {
  fa: {
    terms: {
      kicker: 'قوانین و شرایط استفاده',
      title: 'قوانین استفاده از خدمات اومانی',
      copy:
        'استفاده از خدمات اومانی به معنای پذیرش شرایط زیر است. این قوانین برای شفافیت، امنیت، انطباق و حفاظت از مشتریان در خدمات صرافی و حواله بین‌المللی تنظیم شده‌اند.',
      sections: [
        ['ماهیت خدمات', 'اومانی خدمات صرافی، تبدیل ارز، حواله و هماهنگی انتقال وجه را در مسیرهای منتخب ارائه می‌کند. امکان انجام هر درخواست به بررسی مسیر، مدارک، مقصد، مبلغ، قوانین محلی و ظرفیت عملیاتی وابسته است.'],
        ['نرخ‌ها و اجرای نهایی', 'نرخ‌های نمایش‌داده‌شده در سایت مرجع بازار هستند و ممکن است تا زمان اجرای نهایی تغییر کنند. نرخ قطعی پس از بررسی تیم مالی، مبلغ، مسیر انتقال و زمان اجرا اعلام می‌شود.'],
        ['احراز هویت و مدارک', 'کاربر متعهد است اطلاعات و مدارک معتبر، کامل و صحیح ارائه کند. اومانی می‌تواند برای رعایت الزامات KYC/AML، پیشگیری از تقلب و حفاظت از مشتریان، مدارک تکمیلی درخواست کند.'],
        ['محدودیت و رد درخواست', 'اومانی حق دارد هر درخواست را در صورت ناقص بودن مدارک، مغایرت اطلاعات، ریسک عملیاتی، ملاحظات قانونی یا عدم امکان اجرای مسیر، متوقف یا رد کند.'],
        ['مسئولیت کاربر', 'کاربر مسئول صحت اطلاعات فرستنده، گیرنده، مبلغ، مقصد و رسید پرداخت است. هرگونه تأخیر یا خطای ناشی از اطلاعات نادرست یا مدارک ناقص بر عهده کاربر خواهد بود.'],
        ['زمان پردازش', 'زمان‌های اعلام‌شده تقریبی هستند و ممکن است به دلیل بررسی مدارک، وضعیت بانک‌ها، محدودیت‌های مقصد، تعطیلات رسمی، شرایط بازار یا کنترل‌های انطباق تغییر کنند.'],
        ['کارمزدها و هزینه‌ها', 'کارمزد، اختلاف نرخ خرید و فروش، هزینه انتقال و هزینه‌های احتمالی مقصد پیش از اجرا تا حد امکان شفاف اعلام می‌شود. هزینه نهایی ممکن است بسته به مسیر و شرایط اجرا متفاوت باشد.'],
        ['عدم ارائه مشاوره حقوقی یا سرمایه‌گذاری', 'اطلاعات سایت و پشتیبانی اومانی برای راهنمایی عملیاتی است و نباید به‌عنوان مشاوره حقوقی، مالیاتی، سرمایه‌گذاری یا تضمین سود تلقی شود.'],
        ['به‌روزرسانی قوانین', 'اومانی می‌تواند این شرایط را متناسب با تغییرات عملیاتی، قانونی یا امنیتی به‌روزرسانی کند. نسخه منتشرشده در سایت، مرجع آخرین شرایط استفاده است.']
      ],
      notice: 'در صورت ابهام درباره هر بند، پیش از ثبت درخواست با پشتیبانی اومانی تماس بگیرید.'
    },
    privacy: {
      kicker: 'حریم خصوصی',
      title: 'سیاست حفظ حریم خصوصی اومانی',
      copy:
        'اومانی برای ارائه خدمات امن و قابل پیگیری، بخشی از اطلاعات مشتریان را دریافت و پردازش می‌کند. این سیاست توضیح می‌دهد چه اطلاعاتی جمع‌آوری می‌شود و چگونه از آن محافظت می‌کنیم.',
      sections: [
        ['اطلاعاتی که دریافت می‌کنیم', 'ممکن است اطلاعات هویتی، اطلاعات تماس، مشخصات فرستنده و گیرنده، اطلاعات مسیر انتقال، رسید پرداخت، مدارک لازم برای KYC/AML و سوابق ارتباط با پشتیبانی دریافت شود.'],
        ['هدف استفاده از اطلاعات', 'اطلاعات برای بررسی درخواست، احراز هویت، کنترل انطباق، جلوگیری از تقلب، پردازش حواله یا تبدیل ارز، پاسخگویی پشتیبانی و نگهداری سوابق عملیاتی استفاده می‌شود.'],
        ['حفاظت از داده‌ها', 'دسترسی به اطلاعات حساس محدود به افراد مجاز عملیاتی است. اومانی از روش‌های متعارف امنیتی برای کاهش ریسک دسترسی غیرمجاز، افشا یا سوءاستفاده از اطلاعات استفاده می‌کند.'],
        ['اشتراک‌گذاری اطلاعات', 'اطلاعات فقط در حد لازم برای اجرای خدمت، بررسی انطباق، همکاری با ارائه‌دهندگان عملیاتی، بانک‌ها، شرکای انتقال یا در صورت الزام قانونی به اشتراک گذاشته می‌شود.'],
        ['نگهداری سوابق', 'سوابق مربوط به درخواست‌ها، مدارک و تراکنش‌ها ممکن است برای رعایت الزامات قانونی، حسابداری، انطباق و پیگیری عملیاتی برای مدت لازم نگهداری شود.'],
        ['حقوق کاربر', 'کاربر می‌تواند درباره اطلاعات ثبت‌شده، اصلاح داده‌های نادرست یا وضعیت مدارک خود از پشتیبانی اومانی راهنمایی بخواهد. برخی اطلاعات به دلیل الزامات قانونی قابل حذف فوری نیستند.'],
        ['کوکی‌ها و داده‌های فنی', 'سایت ممکن است برای عملکرد صحیح، امنیت، احراز نشست کاربری و بهبود تجربه کاربری از داده‌های فنی و کوکی‌های ضروری استفاده کند.'],
        ['ارتباط امن با پشتیبانی', 'کاربران باید از ارسال اطلاعات حساس در کانال‌های عمومی خودداری کنند و فقط از مسیرهای رسمی اعلام‌شده در سایت برای ارتباط با اومانی استفاده کنند.'],
        ['تغییرات سیاست حریم خصوصی', 'این سیاست ممکن است متناسب با تغییرات خدمات، الزامات قانونی یا استانداردهای امنیتی به‌روزرسانی شود. نسخه منتشرشده در سایت، مرجع آخرین سیاست حریم خصوصی است.']
      ],
      notice: 'برای هرگونه پرسش درباره اطلاعات شخصی یا مدارک، با پشتیبانی رسمی اومانی تماس بگیرید.'
    }
  },
  en: {
    terms: {
      kicker: 'Terms and conditions',
      title: 'Terms of use for OMoney services',
      copy:
        'By using OMoney services, clients agree to the terms below. These terms support transparency, security, compliance, and client protection in exchange and international remittance services.',
      sections: [
        ['Nature of services', 'OMoney provides exchange, currency conversion, remittance, and transfer coordination across selected corridors. Each request depends on corridor review, documentation, destination, amount, local rules, and operational capacity.'],
        ['Rates and final execution', 'Rates shown on the website are market references and may change before final execution. The final rate is confirmed after finance-team review, transfer amount, corridor, and timing.'],
        ['Identity verification and documents', 'Clients must provide accurate, complete, and valid information. OMoney may request additional documents for KYC/AML, fraud prevention, and client protection.'],
        ['Request limitation or rejection', 'OMoney may pause or reject a request if documents are incomplete, information does not match, operational risk is high, legal concerns exist, or the route cannot be executed.'],
        ['Client responsibility', 'Clients are responsible for the accuracy of sender, beneficiary, amount, destination, and payment receipt information. Delays or errors caused by incorrect data or incomplete documents are the client’s responsibility.'],
        ['Processing time', 'Processing times are estimates and may change due to document review, bank status, destination restrictions, holidays, market conditions, or compliance checks.'],
        ['Fees and costs', 'Fees, buy/sell spreads, transfer costs, and possible destination charges are disclosed as clearly as possible before execution. Final cost may vary depending on corridor and execution conditions.'],
        ['No legal or investment advice', 'Website and support information is operational guidance only and should not be treated as legal, tax, investment, or profit-guarantee advice.'],
        ['Updates to terms', 'OMoney may update these terms in response to operational, legal, or security changes. The version published on the website is the latest applicable version.']
      ],
      notice: 'If any term is unclear, contact OMoney support before submitting a request.'
    },
    privacy: {
      kicker: 'Privacy policy',
      title: 'OMoney privacy policy',
      copy:
        'To provide secure and traceable services, OMoney collects and processes certain client information. This policy explains what we collect and how we protect it.',
      sections: [
        ['Information we collect', 'We may collect identity details, contact information, sender and beneficiary details, transfer route information, payment receipts, KYC/AML documents, and support communication records.'],
        ['How information is used', 'Information is used to review requests, verify identity, perform compliance checks, prevent fraud, process remittance or exchange services, respond to support needs, and maintain operational records.'],
        ['Data protection', 'Access to sensitive information is limited to authorized operations staff. OMoney uses reasonable security practices to reduce unauthorized access, disclosure, or misuse risk.'],
        ['Information sharing', 'Information is shared only as necessary to execute services, perform compliance checks, work with operational providers, banks, transfer partners, or comply with legal requirements.'],
        ['Record retention', 'Request, document, and transaction records may be retained for legal, accounting, compliance, and operational follow-up purposes for as long as necessary.'],
        ['Client rights', 'Clients may contact OMoney support for guidance about recorded information, correction of inaccurate data, or document status. Some information may not be immediately deletable due to legal requirements.'],
        ['Cookies and technical data', 'The website may use essential technical data and cookies for functionality, security, session management, and user-experience improvement.'],
        ['Secure support communication', 'Clients should avoid sharing sensitive information through public channels and use only the official contact routes listed on the website.'],
        ['Changes to this policy', 'This policy may be updated as services, legal requirements, or security standards change. The version published on the website is the latest privacy policy.']
      ],
      notice: 'For questions about personal information or documents, contact official OMoney support.'
    }
  }
} as const;

const contactItems = {
  fa: [
    ['عمان', '+968 9612 9711'],
    ['ترکیه', '+90 531 733 4478'],
    ['ایران', '+98 912 113 3817']
  ],
  en: [
    ['Oman', '+968 9612 9711'],
    ['Turkey', '+90 531 733 4478'],
    ['Iran', '+98 912 113 3817']
  ]
} as const;

export default async function StaticPage({
  params
}: {
  params: Promise<{ locale: keyof typeof pages; page: keyof typeof pages.fa }>;
}) {
  const { locale, page } = await params;
  const title = pages[locale]?.[page];
  if (!title || !content[locale]) notFound();
  const media = await getMediaPlacements();
  const heroMedia = page === 'about'
    ? media.ABOUT_HERO
    : page === 'contact'
      ? media.CONTACT_HERO
      : undefined;
  const fa = locale === 'fa';
  const serviceCopy = servicePage[locale];
  const whatsappHref = getWhatsAppHref(locale);

  return (
    <SiteShell locale={locale}>
      {page === 'services' ? (
        <section className="hero-premium min-h-[620px]">
          <CinematicBackground variant="hero" scene="global" priority />
          <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
            <div>
              <p className="eyebrow text-[#dec58d]">{serviceCopy.kicker}</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.15] text-white md:text-6xl">
                {serviceCopy.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">{serviceCopy.copy}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/${locale}/register`} className="btn-primary">
                  {serviceCopy.ctaPrimary}
                </Link>
                <a href={whatsappHref} className="btn-ghost">
                  {serviceCopy.ctaSecondary}
                </a>
              </div>
            </div>
            <div className="surface-glass rounded-2xl border-white/20 bg-white/10 p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
              <div className="rounded-xl border border-white/10 bg-[#06101d]/80 p-5">
                <ShieldCheck className="text-[#dec58d]" />
                <h2 className="mt-4 text-2xl font-semibold text-white">{serviceCopy.trustTitle}</h2>
                <p className="mt-4 leading-8 text-white/68">{serviceCopy.trustCopy}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {serviceCopy.proof.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/78">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : page === 'about' ? (
        <section className="hero-premium min-h-[620px]">
          <CinematicBackground variant="hero" scene="muscat" priority />
          <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
            <div>
              <p className="eyebrow text-[#dec58d]">{aboutPage[locale].kicker}</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.15] text-white md:text-6xl">
                {aboutPage[locale].title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">{aboutPage[locale].copy}</p>
            </div>
            <div className="surface-glass rounded-2xl border-white/20 bg-white/10 p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
              <div className="rounded-xl border border-white/10 bg-[#06101d]/80 p-5">
                <ShieldCheck className="text-[#dec58d]" />
                <h2 className="mt-4 text-2xl font-semibold text-white">{aboutPage[locale].trustTitle}</h2>
                <p className="mt-4 leading-8 text-white/68">{aboutPage[locale].trustCopy}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {aboutPage[locale].stats.map(([value, label]) => (
                  <div key={value} className="rounded-xl border border-white/10 bg-white/6 px-4 py-3">
                    <p className="text-lg font-semibold text-[#dec58d]">{value}</p>
                    <p className="mt-1 text-xs leading-5 text-white/62">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : page === 'faq' ? (
        <section className="hero-premium min-h-[560px]">
          <CinematicBackground variant="hero" scene="global" priority />
          <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
            <div>
              <p className="eyebrow text-[#dec58d]">{faqPage[locale].kicker}</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.15] text-white md:text-6xl">
                {faqPage[locale].title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">{faqPage[locale].copy}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {['KYC / AML', fa ? 'نرخ نهایی با تأیید مالی' : 'Final rates confirmed by finance', fa ? 'پشتیبانی انسانی' : 'Human support'].map((item) => (
                  <span key={item} className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/78">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="surface-glass rounded-2xl border-white/20 bg-white/10 p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
              <div className="rounded-xl border border-white/10 bg-[#06101d]/80 p-5">
                <Headset className="text-[#dec58d]" />
                <h2 className="mt-4 text-2xl font-semibold text-white">{faqPage[locale].introTitle}</h2>
                <p className="mt-4 leading-8 text-white/68">{faqPage[locale].introCopy}</p>
              </div>
            </div>
          </div>
        </section>
      ) : page === 'terms' || page === 'privacy' ? (
        <section className="hero-premium min-h-[520px]">
          <CinematicBackground variant={page === 'terms' ? 'footer' : 'hero'} scene="global" priority />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 md:px-6 lg:py-20">
            <div className="max-w-4xl">
              <p className="eyebrow text-[#dec58d]">{legalPage[locale][page].kicker}</p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.15] text-white md:text-6xl">
                {legalPage[locale][page].title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 md:text-lg">{legalPage[locale][page].copy}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {['KYC / AML', fa ? 'شفافیت عملیاتی' : 'Operational transparency', fa ? 'حفاظت از مشتری' : 'Client protection'].map((item) => (
                  <span key={item} className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/78">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative isolate overflow-hidden bg-[#0b1624] px-4 py-14 text-white md:px-6">
          <MediaBackground media={heroMedia} eager />
          <div className="relative mx-auto max-w-5xl">
            <p className="eyebrow text-sm">OMoney</p>
            <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
          </div>
        </section>
      )}

      {page === 'services' && (
        <>
          <section className="section-band bg-[#fcfbf8]">
            <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services[locale].map(([serviceTitle, itemCopy], index) => {
                  const Icon = serviceIcons[index] ?? Banknote;
                  return (
                    <article key={serviceTitle} className="trust-card">
                      <div className="trust-card__icon">
                        <Icon size={22} />
                      </div>
                      <h2 className="mt-5 text-xl font-semibold text-[#101e30]">{serviceTitle}</h2>
                      <p className="mt-3 leading-8 text-[#5f6b78]">{itemCopy}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="section-dark section-band">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="eyebrow text-[#dec58d]">{fa ? 'مسیر عملیاتی' : 'Operational flow'}</p>
                <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{serviceCopy.processTitle}</h2>
                <p className="mt-4 leading-8 text-white/70">{serviceCopy.processCopy}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {serviceCopy.steps.map((step, index) => (
                  <article key={step} className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <span className="text-sm font-semibold tracking-widest text-[#dec58d]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-white">{step}</h3>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="section-band">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
              <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#0b1624] to-[#060d18] px-6 py-10 text-white shadow-[var(--shadow-lg)] md:px-10">
                <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="eyebrow text-[#dec58d]">{fa ? 'مشاوره پیش از انتقال' : 'Pre-transfer advisory'}</p>
                    <h2 className="mt-3 text-3xl font-semibold">{serviceCopy.finalCtaTitle}</h2>
                    <p className="mt-4 max-w-2xl leading-8 text-white/72">{serviceCopy.finalCtaCopy}</p>
                  </div>
                  <a className="btn-primary" href={whatsappHref}>
                    <ClipboardCheck size={18} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {page === 'rates' && (
        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <div className="mb-8 max-w-3xl">
            <p className="leading-8 text-[#66707d]">
              {fa
                ? 'در این صفحه نرخ‌های زنده ارزهای اصلی، ارزهای دیجیتال منتخب و قیمت طلا و سکه نمایش داده می‌شود. نرخ نهایی خدمات حواله و تبدیل ارز پس از بررسی تیم مالی قطعی می‌شود.'
                : 'This page shows live major currencies, selected digital assets, and gold and coin prices. Final remittance and exchange execution rates are confirmed by the finance team.'}
            </p>
          </div>
          <RatesCatalog locale={locale} />
        </section>
      )}

      {page === 'faq' && <FaqContent locale={locale} />}

      {(page === 'terms' || page === 'privacy') && <LegalContent locale={locale} page={page} />}

      {page !== 'services' && page !== 'rates' && page !== 'faq' && page !== 'terms' && page !== 'privacy' && (
        <section className={page === 'about' ? 'section-band bg-[#fcfbf8]' : 'mx-auto max-w-5xl px-4 py-12 md:px-6'}>
          {page === 'about' ? (
            <AboutContent locale={locale} />
          ) : (
            <article className="surface rounded-md p-6 leading-8 text-[#66707d]">
              {fa ? 'محتوای این صفحه در مرحله تکمیل است.' : 'This page content is being finalized.'}
            </article>
          )}
        </section>
      )}
    </SiteShell>
  );
}

function AboutContent({ locale }: { locale: keyof typeof pages }) {
  const fa = locale === 'fa';
  const about = aboutPage[locale];
  const whatsappHref = getWhatsAppHref(locale);

  return (
    <>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface rounded-2xl p-6 leading-8 text-[#5f6b78] md:p-8">
          <p className="eyebrow">{fa ? 'روایت برند' : 'Brand story'}</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#101e30]">
            {fa ? 'اومانی برای انتقال‌های واقعی، شفاف و قابل اتکا ساخته شده است' : 'OMoney is built for real, transparent, and accountable transfers'}
          </h2>
          <div className="mt-6 space-y-5">
            {about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <div className="grid gap-4">
          {about.principles.map(([principle, detail], index) => {
            const Icon = [ShieldCheck, FileCheck2, Globe2, Headset][index] ?? ShieldCheck;
            return (
              <article key={principle} className="trust-card">
                <div className="trust-card__icon">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[#101e30]">{principle}</h3>
                <p className="mt-3 leading-8 text-[#5f6b78]">{detail}</p>
              </article>
            );
          })}
        </div>
      </div>

      <section className="section-dark section-band">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow text-[#dec58d]">{fa ? 'اطلاعات رسمی' : 'Official contact'}</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{about.contactTitle}</h2>
            <p className="mt-4 leading-8 text-white/70">{about.contactCopy}</p>
            <a href={whatsappHref} className="btn-primary mt-7 inline-flex">
              <Headset size={18} />
              WhatsApp
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-semibold text-white">{fa ? 'راه‌های ارتباطی' : 'Contact channels'}</h3>
              <div className="mt-5 space-y-4">
                {contactItems[locale].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                    <span className="text-white/60">{label}</span>
                    <a href={`tel:${value.replaceAll(' ', '')}`} dir="ltr" className="font-sans font-semibold text-white">
                      {value}
                    </a>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                  <span className="text-white/60">{fa ? 'ایمیل' : 'Email'}</span>
                  <a href="mailto:info@omoney.online" dir="ltr" className="font-sans font-semibold text-white">
                    info@omoney.online
                  </a>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                  <span className="text-white/60">{fa ? 'تلگرام' : 'Telegram'}</span>
                  <a href="https://t.me/OmoneyEx" target="_blank" rel="noreferrer" dir="ltr" className="font-sans font-semibold text-[#dec58d]">
                    @OmoneyEx
                  </a>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/60">{fa ? 'اینستاگرام' : 'Instagram'}</span>
                  <a
                    href="https://www.instagram.com/omoney_ex?igsh=MWNxYnY4OTc5OG1oNA%3D%3D&utm_source=qr"
                    target="_blank"
                    rel="noreferrer"
                    dir="ltr"
                    className="font-sans font-semibold text-[#dec58d]"
                  >
                    @omoney_ex
                  </a>
                </div>
              </div>
            </article>

            <figure className="relative min-h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
              <Image
                src="/images/offices/consultation-desk.webp"
                alt={fa ? 'فضای مشاوره حرفه‌ای اومانی' : 'OMoney professional consultation office'}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 520px, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060d18] via-transparent to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm leading-7 text-white/72">
                {fa ? 'پشتیبانی انسانی، بررسی مدارک و هماهنگی مسیر انتقال.' : 'Human support, document review, and transfer route coordination.'}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section-band bg-[#fcfbf8]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow">{fa ? 'حضور عملیاتی' : 'Operational presence'}</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#101e30]">{about.officesTitle}</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <OfficeMap
              title={about.offices[0][0]}
              copy={about.offices[0][1]}
              eyebrow={fa ? 'موقعیت دفتر' : 'Office location'}
              mapTitle={fa ? 'نقشه دفتر عمان' : 'Oman office map'}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.3697913581327!2d58.48208117506901!3d23.626924393506066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e91f9a2c012b881%3A0x3c7e13c641358cf!2sEstio%20technology%20development!5e0!3m2!1sen!2som!4v1779019120796!5m2!1sen!2som"
            />
            <OfficeMap
              title={about.offices[1][0]}
              copy={about.offices[1][1]}
              eyebrow={fa ? 'موقعیت دفتر' : 'Office location'}
              mapTitle={fa ? 'نقشه دفتر ترکیه' : 'Turkey office map'}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1505.1290785374433!2d28.649634697547093!3d41.01960767853349!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b55f602ad1050b%3A0xa853d019647567c4!2zbWFuaWdydXDZhdin2YbbjCDar9ix2YjZvg!5e0!3m2!1sen!2som!4v1779019675440!5m2!1sen!2som"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function FaqContent({ locale }: { locale: keyof typeof pages }) {
  const fa = locale === 'fa';
  const faq = faqPage[locale];
  const whatsappHref = getWhatsAppHref(locale);

  return (
    <>
      <section className="section-band bg-[#fcfbf8]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="mb-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="eyebrow">{fa ? 'راهنمای مشتریان' : 'Client guidance'}</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#101e30] md:text-4xl">{faq.introTitle}</h2>
            </div>
            <p className="leading-8 text-[#5f6b78]">{faq.introCopy}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {faq.groups.map((group, groupIndex) => {
              const Icon = [ArrowRightLeft, Globe2, ShieldCheck, Headset][groupIndex] ?? FileCheck2;
              return (
                <section key={group.title} className="surface rounded-2xl p-5 md:p-6">
                  <div className="mb-5 flex items-start gap-3">
                    <div className="trust-card__icon shrink-0">
                      <Icon size={22} />
                    </div>
                    <div>
                      <p className="eyebrow">{String(groupIndex + 1).padStart(2, '0')}</p>
                      <h2 className="mt-1 text-2xl font-semibold text-[#101e30]">{group.title}</h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.items.map(([question, answer]) => (
                      <details
                        key={question}
                        className="group rounded-xl border border-black/10 bg-white/70 p-4 transition hover:border-[#c7a15b]/45 hover:bg-white"
                      >
                        <summary className="cursor-pointer list-none font-semibold leading-7 text-[#101e30]">
                          <span className="inline-flex w-full items-center justify-between gap-4">
                            {question}
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f3ead8] text-[#8a6421] transition group-open:rotate-45">
                              +
                            </span>
                          </span>
                        </summary>
                        <p className="mt-3 leading-8 text-[#5f6b78]">{answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-dark section-band">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="eyebrow text-[#dec58d]">{fa ? 'پشتیبانی مستقیم' : 'Direct support'}</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{faq.ctaTitle}</h2>
              <p className="mt-4 max-w-2xl leading-8 text-white/70">{faq.ctaCopy}</p>
            </div>
            <a href={whatsappHref} className="btn-primary">
              <Headset size={18} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function LegalContent({ locale, page }: { locale: keyof typeof pages; page: 'terms' | 'privacy' }) {
  const legal = legalPage[locale][page];
  const fa = locale === 'fa';
  const whatsappHref = getWhatsAppHref(locale);
  const Icon = page === 'terms' ? ClipboardCheck : ShieldCheck;

  return (
    <>
      <section className="section-band bg-[#fcfbf8]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:px-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="surface-glass sticky top-28 h-fit rounded-2xl p-6">
            <Icon className="text-[#c7a15b]" />
            <h2 className="mt-4 text-2xl font-semibold text-[#101e30]">
              {fa ? 'خلاصه مهم' : 'Key summary'}
            </h2>
            <p className="mt-4 leading-8 text-[#5f6b78]">{legal.copy}</p>
            <div className="mt-6 rounded-xl border border-[#c7a15b]/25 bg-[#fff8e8] p-4 text-sm leading-7 text-[#7d5b1c]">
              {legal.notice}
            </div>
          </aside>

          <article className="surface rounded-2xl p-6 md:p-8">
            <div className="space-y-5">
              {legal.sections.map(([title, copy], index) => (
                <section key={title} className="border-b border-black/10 pb-5 last:border-b-0 last:pb-0">
                  <div className="flex gap-4">
                    <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f3ead8] text-sm font-semibold text-[#8a6421]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold text-[#101e30]">{title}</h2>
                      <p className="mt-3 leading-8 text-[#5f6b78]">{copy}</p>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section-dark section-band">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="eyebrow text-[#dec58d]">{fa ? 'سوال درباره شرایط' : 'Questions about these terms'}</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                {fa ? 'قبل از ثبت درخواست، هر ابهامی را با پشتیبانی اومانی بررسی کنید' : 'Before submitting a request, clarify any question with OMoney support'}
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-white/70">
                {fa
                  ? 'تیم پشتیبانی می‌تواند درباره مدارک، مسیر انتقال، نرخ نهایی و شرایط پردازش راهنمایی عملیاتی ارائه کند.'
                  : 'Our support team can provide operational guidance on documents, transfer corridors, final rates, and processing conditions.'}
              </p>
            </div>
            <a href={whatsappHref} className="btn-primary">
              <Headset size={18} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function OfficeMap({
  title,
  copy,
  eyebrow,
  mapTitle,
  src
}: {
  title: string;
  copy: string;
  eyebrow: string;
  mapTitle: string;
  src: string;
}) {
  return (
    <article className="surface overflow-hidden rounded-2xl">
      <div className="p-6 pb-4">
        <p className="eyebrow">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold text-[#101e30]">{title}</h3>
        <p className="mt-2 leading-7 text-[#5f6b78]">{copy}</p>
      </div>
      <iframe
        title={mapTitle}
        src={src}
        className="h-[320px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </article>
  );
}
