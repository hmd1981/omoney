import { headers } from 'next/headers';
import { serverApiFetch } from '../../../lib/api';
import { RefreshButton } from './refresh-button';
import { RateSettingsForm } from './rate-settings-form';
import { RateOverrideForm } from './rate-override-form';

type Settings = {
  enableLiveRates: boolean;
  defaultProvider: string;
  fallbackProvider: string;
  staleAfterSec: number;
  globalBuyMarkupPercent: string;
  globalSellMarkupPercent: string;
};

type Snapshot = {
  id: string;
  baseCurrency: string;
  marketRateToman: string | null;
  buyRateToman: string | null;
  sellRateToman: string | null;
  sourceProvider: string;
  createdAt: string;
  stale: boolean;
  unavailable: boolean;
};

type Override = {
  baseCurrency: string;
  enabled: boolean;
  frozen: boolean;
  manualMarketRateToman: string | null;
  buyMarkupPercent: string | null;
  sellMarkupPercent: string | null;
  fixedBuyRateToman: string | null;
  fixedSellRateToman: string | null;
  reason: string | null;
};

type Response = {
  snapshots: Snapshot[];
  settings: Settings;
  overrides: Override[];
  providerHealth: { provider: string; healthy: boolean };
};

export default async function RatesPage() {
  const data = await serverApiFetch<Response>('/admin/exchange-rates', (await headers()).get('cookie'));
  const overrideMap = new Map(data.overrides.map((item) => [item.baseCurrency, item]));

  return (
    <main className="mx-auto max-w-7xl space-y-5 p-5">
      <header className="admin-page-header">
        <div>
          <p>Market control</p>
          <h1>Exchange rates</h1>
          <span>
            {data.providerHealth.provider} provider · {data.providerHealth.healthy ? 'healthy' : 'unavailable'}
          </span>
        </div>
        <RefreshButton />
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]">
        <RateSettingsForm settings={data.settings} />
        <article className="admin-panel">
          <p className="text-sm text-black/60">Operating note</p>
          <h2 className="mt-1 text-lg font-semibold">Priority of rate resolution</h2>
          <ol className="mt-3 space-y-2 text-sm text-black/70">
            <li>1. Fixed buy/sell rates, when set for a pair.</li>
            <li>2. Manual market rate override, when enabled.</li>
            <li>3. Frozen last approved market rate, when freeze is active.</li>
            <li>4. Live provider market rate with global or pair-specific markup.</li>
          </ol>
        </article>
      </section>

      <section className="grid gap-4">
        {data.snapshots.map((snapshot) => (
          <RateOverrideForm
            key={snapshot.baseCurrency}
            snapshot={snapshot}
            override={overrideMap.get(snapshot.baseCurrency) ?? null}
          />
        ))}
      </section>
    </main>
  );
}
