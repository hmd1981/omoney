import { ProviderRate } from '../types/exchange-rate.types';

export interface ExchangeRateProvider {
  readonly name: string;
  healthCheck(): Promise<boolean>;
  supportedPairs(): string[];
  fetchLatestRates(): Promise<ProviderRate[]>;
}
