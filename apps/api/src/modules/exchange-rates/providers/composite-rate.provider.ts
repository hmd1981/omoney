import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExchangeRateProvider } from './exchange-rate-provider.interface';
import { ManualRateProvider } from './manual-rate.provider';
import { NavasanProvider } from './navasan.provider';
import { ProviderRate, PublicCatalogRate } from '../types/exchange-rate.types';

@Injectable()
export class CompositeRateProvider {
  constructor(
    private readonly config: ConfigService,
    private readonly navasan: NavasanProvider,
    private readonly manual: ManualRateProvider
  ) {}

  async fetchLatestRates(): Promise<{ provider: string; rates: ProviderRate[] }> {
    const providers = this.providersByPriority();
    for (const provider of providers) {
      try {
        const rates = await provider.fetchLatestRates();
        if (rates.some((rate) => !rate.unavailable)) return { provider: provider.name, rates };
      } catch {
        continue;
      }
    }
    return { provider: this.manual.name, rates: await this.manual.fetchLatestRates() };
  }

  providersHealth() {
    return Promise.all(this.providersByPriority().map(async (provider) => ({
      provider: provider.name,
      healthy: await provider.healthCheck()
    })));
  }

  async fetchCatalogRates(): Promise<PublicCatalogRate[]> {
    return this.navasan.fetchCatalogRates();
  }

  private providersByPriority(): ExchangeRateProvider[] {
    const map: Record<string, ExchangeRateProvider> = {
      navasan: this.navasan,
      manual: this.manual
    };
    const defaultProvider = this.config.get<string>('EXCHANGE_RATE_DEFAULT_PROVIDER', 'navasan');
    const fallbackProvider = this.config.get<string>('EXCHANGE_RATE_FALLBACK_PROVIDER', 'manual');
    return [defaultProvider, fallbackProvider]
      .map((name) => map[name])
      .filter((provider, index, providers): provider is ExchangeRateProvider => Boolean(provider) && providers.indexOf(provider) === index);
  }
}
