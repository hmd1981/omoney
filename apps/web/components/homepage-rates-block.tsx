'use client';

import { HomepageMarketPanel } from './homepage-market-panel';
import { LiveRatesSection } from './live-rates-section';
import { Locale } from '../lib/i18n';

export function HomepageMarketPanelWithRates({ locale }: { locale: Locale }) {
  return <HomepageMarketPanel locale={locale} />;
}

export function HomepageLiveRatesWithSharedState({ locale }: { locale: Locale }) {
  return <LiveRatesSection locale={locale} />;
}
