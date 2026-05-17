import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExchangeRateProvider } from './exchange-rate-provider.interface';
import { HOMEPAGE_PAIRS, ProviderRate } from '../types/exchange-rate.types';

@Injectable()
export class ManualRateProvider implements ExchangeRateProvider {
  readonly name = 'manual';

  constructor(private readonly config: ConfigService) {}

  async healthCheck() {
    return HOMEPAGE_PAIRS.some((pair) => this.readManualToman(pair.baseCurrency) !== null);
  }

  supportedPairs() {
    return HOMEPAGE_PAIRS.map((pair) => `${pair.baseCurrency}/${pair.providerQuoteCurrency}`);
  }

  async fetchLatestRates(): Promise<ProviderRate[]> {
    return HOMEPAGE_PAIRS.map((pair) => {
      const toman = this.readManualToman(pair.baseCurrency);
      return {
        baseCurrency: pair.baseCurrency,
        quoteCurrency: pair.providerQuoteCurrency,
        marketRateIrr: toman === null ? null : toman * 10,
        sourceKey: toman === null ? null : `MANUAL_${pair.baseCurrency}_TOMAN`,
        sourceTimestamp: toman === null ? null : new Date(),
        unavailable: toman === null
      };
    });
  }

  private readManualToman(baseCurrency: string) {
    const value = this.config.get<string>(`MANUAL_${baseCurrency}_TOMAN`);
    if (!value) return null;
    const parsed = Number(value.replaceAll(',', '').trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
}
