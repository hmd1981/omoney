'use client';

import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Locale, intlLocale } from '../lib/i18n';
import { LiveRate, useHomepageRates } from './use-homepage-rates';

const corridorConfig = [
  { baseCurrency: 'OMR', fa: 'ریال عمان', en: 'Omani Rial', ar: 'الريال العُماني', exampleAmount: 100 },
  { baseCurrency: 'AED', fa: 'درهم امارات', en: 'UAE Dirham', ar: 'الدرهم الإماراتي', exampleAmount: 1000 },
  { baseCurrency: 'TRY', fa: 'لیر ترکیه', en: 'Turkish Lira', ar: 'الليرة التركية', exampleAmount: 10000 },
  { baseCurrency: 'EUR', fa: 'یورو', en: 'Euro', ar: 'اليورو', exampleAmount: 1000 },
  { baseCurrency: 'USD', fa: 'دلار آمریکا', en: 'US Dollar', ar: 'الدولار الأمريكي', exampleAmount: 1000 },
  { baseCurrency: 'CAD', fa: 'دلار کانادا', en: 'Canadian Dollar', ar: 'الدولار الكندي', exampleAmount: 1000 }
] as const;

const currencyMeta: Record<string, Record<Locale, string>> = {
  USD: { fa: 'دلار آمریکا', en: 'US Dollar', ar: 'الدولار الأمريكي' },
  CAD: { fa: 'دلار کانادا', en: 'Canadian Dollar', ar: 'الدولار الكندي' },
  AUD: { fa: 'دلار استرالیا', en: 'Australian Dollar', ar: 'الدولار الأسترالي' },
  EUR: { fa: 'یورو', en: 'Euro', ar: 'اليورو' },
  AED: { fa: 'درهم امارات', en: 'UAE Dirham', ar: 'الدرهم الإماراتي' },
  OMR: { fa: 'ریال عمان', en: 'Omani Rial', ar: 'الريال العُماني' },
  TRY: { fa: 'لیر ترکیه', en: 'Turkish Lira', ar: 'الليرة التركية' }
};

const copy = {
  todayRates: { fa: 'نرخ‌های عملیاتی امروز', en: 'Today’s operational rates', ar: 'أسعار اليوم التشغيلية' },
  corridors: { fa: 'مسیرهای اصلی انتقال', en: 'Primary transfer corridors', ar: 'مسارات التحويل الرئيسية' },
  liveRate: { fa: 'نرخ به‌روز بازار', en: 'Live market rate', ar: 'سعر السوق المباشر' },
  quickEstimate: { fa: 'محاسبه سریع', en: 'Quick estimate', ar: 'حساب سريع' },
  payout: { fa: 'برآورد دریافت به تومان', en: 'Estimated payout in Toman', ar: 'تقدير الاستلام بالتومان' },
  sourceCurrency: { fa: 'ارز مبدا', en: 'Source currency', ar: 'عملة المصدر' },
  amount: { fa: 'مبلغ', en: 'Amount', ar: 'المبلغ' },
  currentEstimate: { fa: 'برآورد فعلی', en: 'Current estimate', ar: 'التقدير الحالي' },
  toman: { fa: 'تومان', en: 'Toman', ar: 'تومان' },
  financeReview: {
    fa: 'مبلغ نهایی پس از بررسی و تایید تیم مالی قطعی می‌شود.',
    en: 'Final settlement is confirmed after finance review.',
    ar: 'يتم تأكيد المبلغ النهائي بعد مراجعة واعتماد فريق المالية.'
  },
  unavailable: { fa: 'ناموجود', en: 'Unavailable', ar: 'غير متاح' },
  latestShown: {
    fa: 'آخرین نرخ موجود نمایش داده می‌شود.',
    en: 'Showing the latest available rate.',
    ar: 'يتم عرض آخر سعر متاح.'
  }
} satisfies Record<string, Record<Locale, string>>;

export function HomepageMarketPanel({ locale }: { locale: Locale }) {
  const { rates, loading, refreshing, hasFetchError } = useHomepageRates();
  const rateMap = useMemo(() => new Map(rates.map((rate) => [rate.baseCurrency, rate])), [rates]);
  const selectableRates = rates.filter((rate) => !rate.unavailable && rate.buyRateToman !== null);
  const [selectedCurrency, setSelectedCurrency] = useState('OMR');
  const [amount, setAmount] = useState('100');

  const activeRate = rateMap.get(selectedCurrency) ?? selectableRates[0];
  const numericAmount = Number(amount.replaceAll(',', ''));
  const estimate =
    activeRate && activeRate.buyRateToman !== null && Number.isFinite(numericAmount)
      ? numericAmount * activeRate.buyRateToman
      : null;

  return (
    <aside className="hero-market-panel fade-up rounded-md border border-white/12 bg-white/[0.96] p-5 text-[#202732] shadow-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-black/10 pb-4">
        <div>
          <p className="text-sm text-[#66707d]">{copy.todayRates[locale]}</p>
          <h2 className="mt-1 text-xl font-semibold text-[#101e30]">{copy.corridors[locale]}</h2>
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-[#66707d]">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {copy.liveRate[locale]}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {corridorConfig.map((corridor) => (
          <CorridorRow
            key={corridor.baseCurrency}
            rate={rateMap.get(corridor.baseCurrency)}
            corridor={corridor}
            locale={locale}
          />
        ))}
      </div>

      <div className="quick-estimate-card mt-5 rounded-md bg-[#101e30] p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-white/62">{copy.quickEstimate[locale]}</p>
            <h3 className="mt-1 font-semibold">{copy.payout[locale]}</h3>
          </div>
          <ArrowLeftRight size={18} className="text-[#dec58d]" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_132px]">
          <label className="grid gap-2 text-sm">
            <span className="text-white/68">{copy.sourceCurrency[locale]}</span>
            <select
              className="h-12 w-full rounded-md border border-white/14 bg-white/8 px-3 text-white outline-none"
              value={activeRate?.baseCurrency ?? selectedCurrency}
              onChange={(event) => setSelectedCurrency(event.target.value)}
            >
              {selectableRates.map((rate) => (
                <option key={rate.baseCurrency} value={rate.baseCurrency} className="text-[#101e30]">
                  {currencyMeta[rate.baseCurrency]?.[locale] ?? rate.baseCurrency}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-white/68">{copy.amount[locale]}</span>
            <input
              inputMode="numeric"
              className="h-12 w-full rounded-md border border-white/14 bg-white/8 px-3 text-white outline-none"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ''))}
            />
          </label>
        </div>

        <div className="mt-4 rounded-md border border-white/10 bg-white/6 p-4">
          <p className="text-sm text-white/65">{copy.currentEstimate[locale]}</p>
          <p className="mt-2 text-2xl font-semibold text-[#dec58d]">
            {estimate === null ? '—' : `${formatNumber(estimate, locale)} ${copy.toman[locale]}`}
          </p>
          <p className="mt-2 text-xs leading-6 text-white/58">{copy.financeReview[locale]}</p>
        </div>
      </div>

      {!loading && hasFetchError && <p className="mt-4 text-sm text-[#8a6421]">{copy.latestShown[locale]}</p>}
    </aside>
  );
}

function CorridorRow({
  corridor,
  rate,
  locale
}: {
  corridor: (typeof corridorConfig)[number];
  rate?: LiveRate;
  locale: Locale;
}) {
  const payout =
    rate?.buyRateToman === null || rate?.buyRateToman === undefined
      ? null
      : corridor.exampleAmount * rate.buyRateToman;

  return (
    <div className="rounded-md border border-black/10 px-4 py-3 transition hover:border-[#c7a15b]/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-[#101e30]">{corridor[locale]}</p>
          <p className="mt-1 text-xs text-[#66707d]">{corridor.baseCurrency} → TOMAN</p>
        </div>
        <div className="text-end">
          <p className="text-sm font-semibold text-[#101e30]">
            {rate?.buyRateToman === null || rate?.buyRateToman === undefined
              ? '—'
              : `${formatNumber(rate.buyRateToman, locale)} ${copy.toman[locale]}`}
          </p>
          <p className="mt-1 text-xs text-[#66707d]">
            {payout === null
              ? copy.unavailable[locale]
              : `${formatNumber(corridor.exampleAmount, locale)} ${corridor.baseCurrency} ≈ ${formatNumber(payout, locale)}`}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 0 }).format(value);
}
