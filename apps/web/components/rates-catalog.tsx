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

const faNames: Record<string, string> = {
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
};

const enNames: Record<string, string> = {
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
};

const arNames: Record<string, string> = {
  AED: 'درهم إماراتي',
  BCH: 'بيتكوين كاش',
  BNB: 'بينانس كوين',
  BTC: 'بيتكوين',
  DOGE: 'دوجكوين',
  EUR: 'يورو',
  ETH: 'إيثيريوم',
  GBP: 'جنيه إسترليني',
  JPY: 'ين ياباني',
  LTC: 'لايتكوين',
  TRY: 'ليرة تركية',
  USD: 'دولار أمريكي',
  USDT: 'تيثر',
  XRP: 'ريبل',
  '18AYAR': 'ذهب عيار 18',
  SEKKEH: 'عملة إمامي',
  BAHAR: 'سكة بهار آزادي',
  NIM: 'نصف عملة',
  ROB: 'ربع عملة'
};

function assetName(code: string, locale: Locale) {
  if (locale === 'fa') return faNames[code] ?? code;
  if (locale === 'ar') return arNames[code] ?? enNames[code] ?? code;
  return enNames[code] ?? code;
}

async function getCatalog() {
  try {
    const response = await fetch(`${apiBase}/exchange-rates/catalog`, { next: { revalidate: 60 } });
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
  const fa = locale === 'fa';
  const ar = locale === 'ar';
  const groups = [
    { key: 'currency', title: fa ? 'ارزهای اصلی' : ar ? 'العملات الرئيسية' : 'Major currencies' },
    { key: 'digital', title: fa ? 'ارزهای دیجیتال' : ar ? 'الأصول الرقمية' : 'Digital assets' },
    { key: 'gold', title: fa ? 'طلا و سکه' : ar ? 'الذهب والعملات' : 'Gold and coins' }
  ] as const;

  if (!rates.length) {
    return (
      <div className="surface rounded-md p-6 text-[#66707d]">
        {fa
          ? 'دریافت نرخ‌ها موقتاً ممکن نیست.'
          : ar
            ? 'الأسعار غير متاحة مؤقتاً.'
            : 'Rates are temporarily unavailable.'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const items = rates.filter((rate) => rate.assetType === group.key);
        if (!items.length) return null;
        return (
          <section key={group.key}>
            <div className="mb-4">
              <p className="eyebrow text-sm">
                {fa ? 'نرخ زنده بازار' : ar ? 'أسعار السوق المباشرة' : 'Live market rates'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#101e30]">{group.title}</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((rate) => (
                <article key={rate.code} className="surface rounded-md p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#101e30]">{assetName(rate.code, locale)}</p>
                      <p className="mt-1 text-sm text-[#66707d]">{rate.code}</p>
                    </div>
                    <span className="rounded-full bg-[#f3ead8] px-2.5 py-1 text-xs text-[#8a6421]">
                      {fa ? 'تومان' : ar ? 'تومان' : 'Toman'}
                    </span>
                  </div>
                  <p className="mt-5 text-2xl font-semibold text-[#101e30]">
                    {formatNumber(rate.marketRateToman, locale)}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/10 pt-3 text-xs text-[#66707d]">
                    <span className="rounded-full bg-black/[0.04] px-2.5 py-1 font-sans uppercase tracking-wide">
                      {rate.sourceKey}
                    </span>
                    <span className="rounded-full bg-[#f8f0df] px-2.5 py-1 text-[#8a6421]">
                      {rate.changeAmountToman === null
                        ? fa
                          ? 'بدون تغییر'
                          : ar
                            ? 'بدون تغيير'
                            : 'No change'
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
