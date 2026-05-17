'use client';

import { ArrowDownRight, ArrowUpRight, Minus, RefreshCw } from 'lucide-react';
import { content } from '../lib/content';
import { LiveRate, useHomepageRates } from './use-homepage-rates';

const rateMeta: Record<string, { fa: string; en: string; mark: string }> = {
  USD: { fa: 'دلار آمریکا', en: 'US Dollar', mark: '$' },
  CAD: { fa: 'دلار کانادا', en: 'Canadian Dollar', mark: 'C$' },
  AUD: { fa: 'دلار استرالیا', en: 'Australian Dollar', mark: 'A$' },
  EUR: { fa: 'یورو', en: 'Euro', mark: 'EUR' },
  AED: { fa: 'درهم امارات', en: 'UAE Dirham', mark: 'AED' },
  OMR: { fa: 'ریال عمان', en: 'Omani Rial', mark: 'OMR' },
  TRY: { fa: 'لیر ترکیه', en: 'Turkish Lira', mark: 'TRY' }
};

export function LiveRatesSection({ locale }: { locale: 'fa' | 'en' }) {
  const { rates, loading, refreshing, hasFetchError } = useHomepageRates();
  const t = content[locale];
  const fa = locale === 'fa';

  return (
    <section className="rates-terminal section-band relative isolate overflow-hidden">
      <img
        src="/images/live-rates/market-terminal.webp"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
        aria-hidden
      />
      <img
        src="/images/overlays/market-particles.svg"
        alt=""
        className="particle-field pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="live-dot" aria-hidden />
              <p className="eyebrow text-[#dec58d]">{fa ? 'نرخ زنده بازار' : 'Live market rates'}</p>
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
              {fa ? 'نرخ ارز به تومان' : 'Exchange rates in Toman'}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">{t.updated}</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white/70 ${refreshing ? 'shimmer' : ''}`}>
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-[#dec58d]' : 'text-[#dec58d]'} />
            <span>{fa ? 'به‌روزرسانی هر ۶۰ ثانیه' : 'Refreshes every 60 seconds'}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 7 }).map((_, index) => <RateSkeleton key={index} />)
            : rates.map((rate) => (
                <RateCard key={rate.baseCurrency} rate={rate} locale={locale} refreshing={refreshing} />
              ))}
        </div>

        {!loading && rates.length === 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
            {fa ? 'آخرین نرخ موجود نمایش داده می‌شود.' : 'The latest available rate is shown.'}
          </div>
        )}

        {!loading && hasFetchError && rates.length > 0 && (
          <p className="mt-4 text-sm text-[#dec58d]">
            {fa ? 'آخرین نرخ موجود نمایش داده می‌شود.' : 'Showing the latest available rate.'}
          </p>
        )}
      </div>
    </section>
  );
}

function RateCard({
  rate,
  locale,
  refreshing
}: {
  rate: LiveRate;
  locale: 'fa' | 'en';
  refreshing: boolean;
}) {
  const fa = locale === 'fa';
  const meta = rateMeta[rate.baseCurrency] ?? { fa: rate.baseCurrency, en: rate.baseCurrency, mark: rate.baseCurrency };
  const direction = directionMeta(rate.direction);
  const DirectionIcon = direction.icon;

  return (
    <article className={`rate-terminal-card p-5 ${refreshing ? 'opacity-95' : ''}`}>
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#c7a15b]/15 text-sm font-bold text-[#dec58d] ring-1 ring-[#c7a15b]/30">
              {meta.mark}
            </span>
            <div>
              <h3 className="font-semibold text-white">{fa ? meta.fa : meta.en}</h3>
              <p className="mt-0.5 text-xs text-white/50">{rate.baseCurrency} / TOMAN</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${direction.className}`}>
            <DirectionIcon size={13} />
            {fa ? direction.fa : direction.en}
          </span>
        </div>

        <Sparkline direction={rate.direction} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <RateValue label={fa ? 'خرید' : 'Buy'} value={rate.buyRateToman} locale={locale} unavailable={rate.unavailable} />
          <RateValue label={fa ? 'فروش' : 'Sell'} value={rate.sellRateToman} locale={locale} unavailable={rate.unavailable} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-white/55">
          <span className="inline-flex items-center gap-1.5">
            <span className="live-dot scale-75" aria-hidden />
            {formatUpdatedAt(rate.updatedAt, locale)}
          </span>
          <div className="flex items-center gap-2">
            {rate.stale && (
              <span className="rounded-full bg-[#c7a15b]/20 px-2 py-0.5 text-[#dec58d]">{fa ? 'قدیمی' : 'Stale'}</span>
            )}
            {rate.unavailable && (
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-red-300">{fa ? 'ناموجود' : 'N/A'}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Sparkline({ direction }: { direction: LiveRate['direction'] }) {
  const up = direction === 'up';
  const down = direction === 'down';
  const points = up
    ? '0,28 12,22 24,18 36,14 48,10 60,8 72,6 84,4 96,2 108,4 120,2'
    : down
      ? '0,4 12,8 24,12 36,14 48,18 60,20 72,22 84,24 96,26 108,28 120,30'
      : '0,16 15,14 30,16 45,14 60,16 75,14 90,16 105,14 120,16';
  const stroke = up ? '#3ecf8e' : down ? '#e87c7c' : '#dec58d';

  return (
    <svg className="sparkline mt-4" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden>
      <polyline fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" points={points} opacity="0.85" />
    </svg>
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
  locale: 'fa' | 'en';
  unavailable: boolean;
}) {
  return (
    <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/8">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1.5 text-lg font-semibold text-white">
        {unavailable || value === null ? '—' : `${formatNumber(value, locale)}`}
      </p>
      <p className="mt-0.5 text-[10px] text-white/40">{locale === 'fa' ? 'تومان' : 'Toman'}</p>
    </div>
  );
}

function RateSkeleton() {
  return (
    <article className="rate-terminal-card p-5">
      <div className="animate-pulse space-y-4">
        <div className="flex gap-3">
          <div className="h-11 w-11 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-3 w-16 rounded bg-white/10" />
          </div>
        </div>
        <div className="h-8 rounded bg-white/10" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 rounded-lg bg-white/10" />
          <div className="h-14 rounded-lg bg-white/10" />
        </div>
      </div>
    </article>
  );
}

function formatNumber(value: number, locale: 'fa' | 'en') {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 0 }).format(value);
}

function formatUpdatedAt(value: string, locale: 'fa' | 'en') {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function directionMeta(direction: LiveRate['direction']) {
  if (direction === 'up') {
    return { icon: ArrowUpRight, fa: 'صعودی', en: 'Up', className: 'bg-emerald-500/15 text-emerald-300' };
  }
  if (direction === 'down') {
    return { icon: ArrowDownRight, fa: 'نزولی', en: 'Down', className: 'bg-red-500/15 text-red-300' };
  }
  return { icon: Minus, fa: 'ثابت', en: 'Stable', className: 'bg-white/10 text-white/60' };
}
