'use client';

import { ArrowDownRight, ArrowUpRight, Minus, RefreshCw } from 'lucide-react';
import { Locale, intlLocale } from '../lib/i18n';
import { LiveRate, useHomepageRates } from './use-homepage-rates';

const rateMeta: Record<string, { fa: string; en: string; ar: string; mark: string }> = {
  USD: { fa: 'دلار آمریکا', en: 'US Dollar', ar: 'الدولار الأمريكي', mark: '$' },
  CAD: { fa: 'دلار کانادا', en: 'Canadian Dollar', ar: 'الدولار الكندي', mark: 'C$' },
  AUD: { fa: 'دلار استرالیا', en: 'Australian Dollar', ar: 'الدولار الأسترالي', mark: 'A$' },
  EUR: { fa: 'یورو', en: 'Euro', ar: 'اليورو', mark: 'EUR' },
  AED: { fa: 'درهم امارات', en: 'UAE Dirham', ar: 'الدرهم الإماراتي', mark: 'AED' },
  OMR: { fa: 'ریال عمان', en: 'Omani Rial', ar: 'الريال العُماني', mark: 'OMR' },
  TRY: { fa: 'لیر ترکیه', en: 'Turkish Lira', ar: 'الليرة التركية', mark: 'TRY' }
};

const copy = {
  kicker: { fa: 'نرخ زنده بازار', en: 'Live market rates', ar: 'أسعار السوق المباشرة' },
  title: { fa: 'نرخ ارز به تومان', en: 'Exchange rates in Toman', ar: 'أسعار الصرف بالتومان' },
  latest: { fa: 'آخرین نرخ موجود نمایش داده می‌شود', en: 'The latest available rate is shown.', ar: 'يتم عرض آخر سعر متاح.' },
  refresh: { fa: 'به‌روزرسانی خودکار طبق برنامه', en: 'Scheduled automatic refresh', ar: 'تحديث تلقائي حسب الجدولة' },
  buy: { fa: 'خرید', en: 'Buy', ar: 'شراء' },
  sell: { fa: 'فروش', en: 'Sell', ar: 'بيع' },
  stale: { fa: 'قدیمی', en: 'Stale', ar: 'قديم' },
  unavailable: { fa: 'ناموجود', en: 'Unavailable', ar: 'غير متاح' },
  toman: { fa: 'تومان', en: 'Toman', ar: 'تومان' }
} satisfies Record<string, Record<Locale, string>>;

export function LiveRatesSection({ locale }: { locale: Locale }) {
  const { rates, loading, refreshing, hasFetchError } = useHomepageRates();
  return (
    <section className="section-band bg-[#f7f4ee]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-sm">{copy.kicker[locale]}</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#101e30]">{copy.title[locale]}</h2>
            <p className="mt-3 text-sm leading-7 text-[#66707d]">{copy.latest[locale]}</p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-[#66707d]">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{copy.refresh[locale]}</span>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 7 }).map((_, index) => <RateSkeleton key={index} />)
            : rates.map((rate) => <RateCard key={rate.baseCurrency} rate={rate} locale={locale} />)}
        </div>

        {!loading && rates.length === 0 && (
          <div className="surface mt-4 rounded-md px-4 py-3 text-sm text-[#66707d]">{copy.latest[locale]}</div>
        )}

        {!loading && hasFetchError && rates.length > 0 && (
          <p className="mt-4 text-sm text-[#8a6421]">{copy.latest[locale]}</p>
        )}
      </div>
    </section>
  );
}

function RateCard({ rate, locale }: { rate: LiveRate; locale: Locale }) {
  const meta = rateMeta[rate.baseCurrency] ?? {
    fa: rate.baseCurrency,
    en: rate.baseCurrency,
    ar: rate.baseCurrency,
    mark: rate.baseCurrency
  };
  const direction = directionMeta(rate.direction);
  const DirectionIcon = direction.icon;
  return (
    <article className="rate-card surface rounded-md p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-[#101e30] text-sm font-semibold text-[#dec58d]">
            {meta.mark}
          </span>
          <div>
            <h3 className="font-semibold text-[#101e30]">{meta[locale]}</h3>
            <p className="mt-1 text-xs text-[#66707d]">{rate.baseCurrency} / TOMAN</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${direction.className}`}>
          <DirectionIcon size={13} />
          {direction[locale]}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <RateValue label={copy.buy[locale]} value={rate.buyRateToman} locale={locale} unavailable={rate.unavailable} />
        <RateValue label={copy.sell[locale]} value={rate.sellRateToman} locale={locale} unavailable={rate.unavailable} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-3 text-xs text-[#66707d]">
        <span>{formatUpdatedAt(rate.updatedAt, locale)}</span>
        <div className="flex items-center gap-2">
          {rate.stale && <span className="rounded-full bg-[#f3e7c8] px-2 py-1 text-[#8a6421]">{copy.stale[locale]}</span>}
          {rate.unavailable && <span className="rounded-full bg-[#f4dddd] px-2 py-1 text-[#9c3333]">{copy.unavailable[locale]}</span>}
        </div>
      </div>
    </article>
  );
}

function RateValue({
  label,
  value,
  locale,
  unavailable
}: {
  label: string;
  value: number | null;
  locale: Locale;
  unavailable: boolean;
}) {
  return (
    <div className="rounded-md bg-black/[0.03] p-3">
      <p className="text-xs text-[#66707d]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#101e30]">
        {unavailable || value === null ? '—' : `${formatNumber(value, locale)} ${copy.toman[locale]}`}
      </p>
    </div>
  );
}

function RateSkeleton() {
  return (
    <article className="surface rounded-md p-5">
      <div className="animate-pulse">
        <div className="h-11 w-11 rounded-md bg-black/10" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="h-16 rounded-md bg-black/10" />
          <div className="h-16 rounded-md bg-black/10" />
        </div>
        <div className="mt-4 h-4 rounded bg-black/10" />
      </div>
    </article>
  );
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 0 }).format(value);
}

function formatUpdatedAt(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function directionMeta(direction: LiveRate['direction']) {
  if (direction === 'up') {
    return { icon: ArrowUpRight, fa: 'صعودی', en: 'Up', ar: 'صاعد', className: 'bg-[#e4f1e8] text-[#24734a]' };
  }
  if (direction === 'down') {
    return { icon: ArrowDownRight, fa: 'نزولی', en: 'Down', ar: 'هابط', className: 'bg-[#f6e7e7] text-[#9f3535]' };
  }
  return { icon: Minus, fa: 'ثابت', en: 'Stable', ar: 'مستقر', className: 'bg-black/[0.06] text-[#66707d]' };
}
