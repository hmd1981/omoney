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

async function getCatalog() {
  try {
    const response = await fetch(`${apiBase}/exchange-rates/catalog`, { cache: 'no-store' });
    if (!response.ok) return [] as CatalogRate[];
    return (await response.json()) as CatalogRate[];
  } catch {
    return [] as CatalogRate[];
  }
}

function formatNumber(value: number, locale: 'fa' | 'en') {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(Math.round(value));
}

export async function RatesCatalog({ locale }: { locale: 'fa' | 'en' }) {
  const rates = await getCatalog();
  const fa = locale === 'fa';
  const groups = [
    { key: 'currency', title: fa ? 'ارزهای اصلی' : 'Major currencies' },
    { key: 'digital', title: fa ? 'ارزهای دیجیتال' : 'Digital assets' },
    { key: 'gold', title: fa ? 'طلا و سکه' : 'Gold and coins' }
  ] as const;

  if (!rates.length) {
    return (
      <div className="surface rounded-md p-6 text-[#66707d]">
        {fa ? 'دریافت نرخ‌ها موقتاً ممکن نیست.' : 'Rates are temporarily unavailable.'}
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
              <p className="eyebrow text-sm">{fa ? 'نرخ زنده بازار' : 'Live market rates'}</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#101e30]">{group.title}</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((rate) => (
                <article key={rate.code} className="surface rounded-md p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#101e30]">
                        {(fa ? faNames : enNames)[rate.code] ?? rate.code}
                      </p>
                      <p className="mt-1 text-sm text-[#66707d]">{rate.code}</p>
                    </div>
                    <span className="rounded-full bg-[#f3ead8] px-2.5 py-1 text-xs text-[#8a6421]">
                      {fa ? 'تومان' : 'Toman'}
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
                        ? fa ? 'بدون تغییر' : 'No change'
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
