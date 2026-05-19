import { Locale, intlLocale } from '../lib/i18n';

type CatalogRate = {
  code: string;
  marketRateToman: number;
  changeAmountToman: number | null;
  sourceKey: string;
  sourceTimestamp: string | null;
  sourceDate: string | null;
  assetType: 'currency' | 'digital' | 'gold';
};

const apiBase = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const names: Record<Locale, Record<string, string>> = {
  fa: {
    AED: 'درهم امارات',
    BCH: 'بیت کوین کش',
    BNB: 'بایننس کوین',
    BTC: 'بیت کوین',
    DOGE: 'دوج کوین',
    EUR: 'یورو',
    ETH: 'اتریوم',
    GBP: 'پوند انگلیس',
    JPY: 'ین ژاپن',
    LTC: 'لایت کوین',
    TRY: 'لیر ترکیه',
    USD: 'دلار آمریکا',
    USDT: 'تتر',
    XRP: 'ریپل',
    '18AYAR': 'طلای ۱۸ عیار',
    SEKKEH: 'سکه امامی',
    BAHAR: 'سکه بهار آزادی',
    NIM: 'نیم سکه',
    ROB: 'ربع سکه'
  },
  en: {
    AED: 'UAE Dirham',
    BCH: 'Bitcoin Cash',
    BNB: 'BNB',
    BTC: 'Bitcoin',
    DOGE: 'Dogecoin',
    EUR: 'Euro',
    ETH: 'Ethereum',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    LTC: 'Litecoin',
    TRY: 'Turkish Lira',
    USD: 'US Dollar',
    USDT: 'Tether',
    XRP: 'XRP',
    '18AYAR': '18K Gold',
    SEKKEH: 'Emami Coin',
    BAHAR: 'Bahar Azadi Coin',
    NIM: 'Half Coin',
    ROB: 'Quarter Coin'
  },
  ar: {
    AED: 'الدرهم الإماراتي',
    BCH: 'بيتكوين كاش',
    BNB: 'عملة بایننس',
    BTC: 'بيتكوين',
    DOGE: 'دوجكوين',
    EUR: 'اليورو',
    ETH: 'إيثريوم',
    GBP: 'الجنيه الإسترليني',
    JPY: 'الين الياباني',
    LTC: 'لايتكوين',
    TRY: 'الليرة التركية',
    USD: 'الدولار الأمريكي',
    USDT: 'تيثر',
    XRP: 'ريبل',
    '18AYAR': 'ذهب عيار 18',
    SEKKEH: 'سكة إمامي',
    BAHAR: 'سكة بهار آزادي',
    NIM: 'نصف سكة',
    ROB: 'ربع سكة'
  }
};

const copy = {
  groups: {
    currency: { fa: 'ارزهای اصلی', en: 'Major currencies', ar: 'العملات الرئيسية' },
    digital: { fa: 'ارزهای دیجیتال', en: 'Digital assets', ar: 'الأصول الرقمية' },
    gold: { fa: 'طلا و سکه', en: 'Gold and coins', ar: 'الذهب والعملات الذهبية' }
  },
  unavailable: {
    fa: 'دریافت نرخ‌ها موقتاً ممکن نیست.',
    en: 'Rates are temporarily unavailable.',
    ar: 'لا يمكن عرض الأسعار مؤقتاً.'
  },
  live: { fa: 'نرخ زنده بازار', en: 'Live market rates', ar: 'أسعار السوق المباشرة' },
  toman: { fa: 'تومان', en: 'Toman', ar: 'تومان' },
  noChange: { fa: 'بدون تغییر', en: 'No change', ar: 'بدون تغيير' }
};

async function getCatalog() {
  try {
    const response = await fetch(`${apiBase}/exchange-rates/catalog`, { cache: 'no-store' });
    if (!response.ok) return [] as CatalogRate[];
    return (await response.json()) as CatalogRate[];
  } catch {
    return [] as CatalogRate[];
  }
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale)).format(Math.round(value));
}

export async function RatesCatalog({ locale }: { locale: Locale }) {
  const rates = await getCatalog();
  const groups = [
    { key: 'currency', title: copy.groups.currency[locale] },
    { key: 'digital', title: copy.groups.digital[locale] },
    { key: 'gold', title: copy.groups.gold[locale] }
  ] as const;

  if (!rates.length) {
    return <div className="surface rounded-md p-6 text-[#66707d]">{copy.unavailable[locale]}</div>;
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const items = rates.filter((rate) => rate.assetType === group.key);
        if (!items.length) return null;
        return (
          <section key={group.key}>
            <div className="mb-4">
              <p className="eyebrow text-sm">{copy.live[locale]}</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#101e30]">{group.title}</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((rate) => (
                <article key={rate.code} className="surface rounded-md p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#101e30]">{names[locale][rate.code] ?? rate.code}</p>
                      <p className="mt-1 text-sm text-[#66707d]">{rate.code}</p>
                    </div>
                    <span className="rounded-full bg-[#f3ead8] px-2.5 py-1 text-xs text-[#8a6421]">
                      {copy.toman[locale]}
                    </span>
                  </div>
                  <p className="mt-5 text-2xl font-semibold text-[#101e30]">
                    {formatNumber(rate.marketRateToman, locale)}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-[#66707d]">
                    <span>{rate.sourceKey}</span>
                    <span>
                      {rate.changeAmountToman === null
                        ? copy.noChange[locale]
                        : `${rate.changeAmountToman > 0 ? '+' : ''}${formatNumber(rate.changeAmountToman, locale)}`}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
