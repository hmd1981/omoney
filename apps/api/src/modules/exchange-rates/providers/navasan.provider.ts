import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExchangeRateProvider } from './exchange-rate-provider.interface';
import { CURATED_CATALOG_KEYS, HOMEPAGE_PAIRS, ProviderRate, PublicCatalogRate } from '../types/exchange-rate.types';

type RawNavasanResponse = Record<string, unknown>;
type RawNavasanItem = {
  value?: unknown;
  change?: unknown;
  timestamp?: unknown;
  date?: unknown;
};

@Injectable()
export class NavasanProvider implements ExchangeRateProvider {
  readonly name = 'navasan';
  private readonly logger = new Logger(NavasanProvider.name);

  constructor(private readonly config: ConfigService) {}

  async healthCheck() {
    if (!this.isEnabled()) return false;
    try {
      await this.fetchPayload();
      return true;
    } catch {
      return false;
    }
  }

  supportedPairs() {
    return HOMEPAGE_PAIRS.map((pair) => `${pair.baseCurrency}/${pair.providerQuoteCurrency}`);
  }

  async fetchLatestRates(): Promise<ProviderRate[]> {
    if (!this.isEnabled()) throw new Error('Provider disabled');
    const payload = await this.fetchPayload();
    return this.mapHomepageRates(payload);
  }

  async fetchBundle() {
    if (!this.isEnabled()) throw new Error('Provider disabled');
    const payload = await this.fetchPayload();
    return {
      homepage: this.mapHomepageRates(payload),
      catalog: this.mapCatalogRates(payload)
    };
  }

  private mapHomepageRates(payload: RawNavasanResponse): ProviderRate[] {
    return HOMEPAGE_PAIRS.map((pair) => {
      const match = pair.sourceKeys.find((key) => this.readItem(payload[key]) !== null) ?? null;
      const item = match ? this.readItem(payload[match]) : null;
      const value = item ? this.normalizeToInternalIrr(item.value) : null;
      return {
        baseCurrency: pair.baseCurrency,
        quoteCurrency: pair.providerQuoteCurrency,
        marketRateIrr: value,
        sourceKey: match,
        sourceTimestamp: item?.timestamp ?? null,
        sourceDate: item?.date ?? null,
        providerChangeAmount: item?.change === null || item?.change === undefined
          ? null
          : this.normalizeToInternalIrr(item.change),
        unavailable: value === null
      };
    });
  }

  async fetchCatalogRates(): Promise<PublicCatalogRate[]> {
    if (!this.isEnabled()) throw new Error('Provider disabled');
    const payload = await this.fetchPayload();
    return this.mapCatalogRates(payload);
  }

  private mapCatalogRates(payload: RawNavasanResponse): PublicCatalogRate[] {
    const rates: PublicCatalogRate[] = [];

    for (const [key, definition] of CURATED_CATALOG_KEYS.entries()) {
        const item = this.readItem(payload[key]);
        if (!item) continue;

        rates.push({
          code: definition.code,
          marketRateToman: this.normalizeToPublicToman(item.value),
          changeAmountToman: item.change === null ? null : this.normalizeToPublicToman(item.change),
          sourceKey: key,
          sourceTimestamp: item.timestamp ? item.timestamp.toISOString() : null,
          sourceDate: item.date,
          assetType: definition.assetType
        });
    }

    return rates.sort((left, right) => left.code.localeCompare(right.code));
  }

  private async fetchPayload(): Promise<RawNavasanResponse> {
    const apiKey = this.config.get<string>('NAVASAN_API_KEY');
    const apiUrl = this.config.get<string>('NAVASAN_API_URL', 'http://api.navasan.tech/latest/');
    if (!apiKey) throw new Error('Missing Navasan API key');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let lastError: unknown;
    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const url = new URL(apiUrl);
          url.searchParams.set('api_key', apiKey);
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const payload = await response.json();
          if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid provider payload');
          return payload as RawNavasanResponse;
        } catch (error) {
          lastError = error;
          if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
    } finally {
      clearTimeout(timeout);
    }
    this.logger.warn(`Navasan fetch failed: ${lastError instanceof Error ? lastError.message : 'unknown error'}`);
    throw new Error('Provider unavailable');
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value.replaceAll(',', '').trim());
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private readItem(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const item = value as RawNavasanItem;
    const parsedValue = this.toNumber(item.value);
    if (parsedValue === null) return null;
    return {
      value: parsedValue,
      change: this.toNumber(item.change),
      timestamp: this.toTimestamp(item.timestamp),
      date: typeof item.date === 'string' ? item.date : null
    };
  }

  private normalizeToInternalIrr(value: number) {
    return this.rateUnit() === 'irr' ? value : value * 10;
  }

  private normalizeToPublicToman(value: number) {
    return this.rateUnit() === 'irr' ? value / 10 : value;
  }

  private toTimestamp(value: unknown) {
    const numeric = this.toNumber(value);
    return numeric === null ? null : new Date(numeric * 1000);
  }

  private rateUnit(): 'toman' | 'irr' {
    return this.config.get<string>('NAVASAN_RATE_UNIT', 'toman') === 'irr' ? 'irr' : 'toman';
  }

  private isEnabled() {
    return this.config.get<string>('NAVASAN_ENABLED', 'true') === 'true';
  }
}
