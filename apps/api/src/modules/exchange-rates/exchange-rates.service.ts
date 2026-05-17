import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { CompositeRateProvider } from './providers/composite-rate.provider';
import { ExchangeRatesCache } from './exchange-rates.cache';
import { HOMEPAGE_PAIRS, ProviderRate, PublicCatalogRate, PublicExchangeRate } from './types/exchange-rate.types';
import { NavasanProvider } from './providers/navasan.provider';

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly cache: ExchangeRatesCache,
    private readonly provider: CompositeRateProvider,
    private readonly navasan: NavasanProvider
  ) {}

  async homepageRates(): Promise<PublicExchangeRate[]> {
    const cached = await this.cache.getHomepage().catch(() => null);
    if (cached?.length) return this.markStaleIfNeeded(cached);

    const snapshots = await this.latestSnapshots();
    if (snapshots.length) return snapshots;

    return this.refreshFromManualOnly();
  }

  async catalogRates() {
    const cached = await this.cache.getCatalog().catch(() => null);
    if (cached?.length) return cached;

    try {
      const catalog = await this.navasan.fetchCatalogRates();
      if (catalog.length) {
        await this.cache.setCatalog(catalog, this.cacheTtlSec());
        return catalog;
      }
    } catch (error) {
      this.logger.warn(`Catalog rate fetch failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }

    return this.catalogFromLatestSnapshots();
  }

  async providerHealth() {
    return {
      provider: this.navasan.name,
      healthy: await this.navasan.healthCheck()
    };
  }

  async getSettings() {
    return this.prisma.exchangeRateSettings.upsert({
      where: { id: 'global' },
      update: {},
      create: {
        id: 'global',
        enableLiveRates: true,
        defaultProvider: this.config.get<string>('EXCHANGE_RATE_DEFAULT_PROVIDER', 'navasan'),
        fallbackProvider: this.config.get<string>('EXCHANGE_RATE_FALLBACK_PROVIDER', 'manual'),
        staleAfterSec: Number(this.config.get<string>('EXCHANGE_RATE_STALE_AFTER_SEC', '300')),
        globalBuyMarkupPercent: Number(this.config.get<string>('EXCHANGE_RATE_BUY_MARKUP_PERCENT', '0.75')),
        globalSellMarkupPercent: Number(this.config.get<string>('EXCHANGE_RATE_SELL_MARKUP_PERCENT', '0.75'))
      }
    });
  }

  async updateSettings(data: {
    enableLiveRates?: boolean;
    defaultProvider?: string;
    fallbackProvider?: string;
    staleAfterSec?: number;
    globalBuyMarkupPercent?: number;
    globalSellMarkupPercent?: number;
  }) {
    return this.prisma.exchangeRateSettings.upsert({
      where: { id: 'global' },
      update: data,
      create: {
        id: 'global',
        enableLiveRates: data.enableLiveRates ?? true,
        defaultProvider: data.defaultProvider ?? this.config.get<string>('EXCHANGE_RATE_DEFAULT_PROVIDER', 'navasan'),
        fallbackProvider: data.fallbackProvider ?? this.config.get<string>('EXCHANGE_RATE_FALLBACK_PROVIDER', 'manual'),
        staleAfterSec: data.staleAfterSec ?? Number(this.config.get<string>('EXCHANGE_RATE_STALE_AFTER_SEC', '300')),
        globalBuyMarkupPercent: data.globalBuyMarkupPercent ?? Number(this.config.get<string>('EXCHANGE_RATE_BUY_MARKUP_PERCENT', '0.75')),
        globalSellMarkupPercent: data.globalSellMarkupPercent ?? Number(this.config.get<string>('EXCHANGE_RATE_SELL_MARKUP_PERCENT', '0.75'))
      }
    });
  }

  upsertOverride(baseCurrency: string, data: {
    enabled?: boolean;
    frozen?: boolean;
    manualMarketRateToman?: number | null;
    buyMarkupPercent?: number | null;
    sellMarkupPercent?: number | null;
    fixedBuyRateToman?: number | null;
    fixedSellRateToman?: number | null;
    reason?: string | null;
  }) {
    return this.prisma.exchangeRateOverride.upsert({
      where: { baseCurrency_quoteCurrency: { baseCurrency, quoteCurrency: 'TOMAN' } },
      update: data,
      create: {
        baseCurrency,
        quoteCurrency: 'TOMAN',
        ...data
      }
    });
  }

  async refreshScheduledRates() {
    const settings = await this.getSettings();
    if (!settings.enableLiveRates) {
      return this.latestSnapshots();
    }
    const bundle = await this.navasan.fetchBundle();
    const homepage = await this.normalizeAndPersist(this.navasan.name, bundle.homepage);
    await this.cache.setCatalog(bundle.catalog, this.cacheTtlSec());
    return homepage;
  }

  private async refreshFromProvider() {
    const { provider, rates } = await this.provider.fetchLatestRates();
    return this.normalizeAndPersist(provider, rates);
  }

  private async refreshFromManualOnly() {
    const manual = await this.provider.fetchLatestRates();
    return this.normalizeAndPersist(manual.provider, manual.rates);
  }

  private async normalizeAndPersist(provider: string, rates: ProviderRate[]) {
    const [previous, settings, overrides] = await Promise.all([
      this.latestSnapshotMap(),
      this.getSettings(),
      this.prisma.exchangeRateOverride.findMany()
    ]);
    const overrideMap = new Map(overrides.map((override) => [override.baseCurrency, override]));
    const now = new Date();
    const normalized = await Promise.all(HOMEPAGE_PAIRS.map(async (pair) => {
      const rate = rates.find((item) => item.baseCurrency === pair.baseCurrency);
      const prior = previous.get(pair.baseCurrency);
      const override = overrideMap.get(pair.baseCurrency);
      const manualRateToman = override?.manualMarketRateToman ? Number(override.manualMarketRateToman) : null;
      const providerMarketRateIrr = rate?.marketRateIrr ?? null;
      const useManual = Boolean(override?.enabled && manualRateToman !== null);
      const frozenMarketRateToman = override?.frozen && prior?.marketRateToman ? Number(prior.marketRateToman) : null;
      const marketRateToman = useManual
        ? manualRateToman
        : frozenMarketRateToman ?? (providerMarketRateIrr === null ? null : providerMarketRateIrr / 10);
      const marketRateIrr = marketRateToman === null ? null : marketRateToman * 10;
      const buyRateToman = marketRateToman === null
        ? null
        : override?.fixedBuyRateToman
          ? Number(override.fixedBuyRateToman)
          : this.applyMarkup(marketRateToman, -1, override?.buyMarkupPercent ? Number(override.buyMarkupPercent) : Number(settings.globalBuyMarkupPercent));
      const sellRateToman = marketRateToman === null
        ? null
        : override?.fixedSellRateToman
          ? Number(override.fixedSellRateToman)
          : this.applyMarkup(marketRateToman, 1, override?.sellMarkupPercent ? Number(override.sellMarkupPercent) : Number(settings.globalSellMarkupPercent));
      const providerChangeAmountToman = rate?.providerChangeAmount === null || rate?.providerChangeAmount === undefined
        ? null
        : rate.providerChangeAmount / 10;
      const changeAmount = providerChangeAmountToman ?? (
        marketRateToman === null || !prior?.marketRateToman
          ? null
          : marketRateToman - Number(prior.marketRateToman)
      );
      const direction = changeAmount === null ? 'unknown' : changeAmount > 0 ? 'up' : changeAmount < 0 ? 'down' : 'stable';
      const unavailable = marketRateToman === null || (!useManual && !frozenMarketRateToman && (rate?.unavailable ?? true));

      const snapshot = await this.prisma.exchangeRateSnapshot.create({
        data: {
          baseCurrency: pair.baseCurrency,
          quoteCurrency: pair.providerQuoteCurrency,
          displayCurrency: pair.displayQuoteCurrency,
          marketRateIrr: marketRateIrr === null ? null : new Prisma.Decimal(marketRateIrr),
          marketRateToman: marketRateToman === null ? null : new Prisma.Decimal(marketRateToman),
          buyRateToman: buyRateToman === null ? null : new Prisma.Decimal(buyRateToman),
          sellRateToman: sellRateToman === null ? null : new Prisma.Decimal(sellRateToman),
          sourceProvider: useManual ? 'manual-override' : frozenMarketRateToman !== null ? 'frozen' : provider,
          sourceKey: useManual ? `ADMIN_${pair.baseCurrency}_TOMAN` : rate?.sourceKey ?? null,
          sourceTimestamp: rate?.sourceTimestamp ?? null,
          direction,
          changeAmount: changeAmount === null ? null : new Prisma.Decimal(changeAmount),
          stale: false,
          unavailable
        }
      });

      return this.toPublicRate(snapshot);
    }));

    await this.cache.setHomepage(normalized, this.cacheTtlSec());
    return normalized;
  }

  private async latestSnapshotMap() {
    const snapshots = await this.prisma.exchangeRateSnapshot.findMany({
      where: { baseCurrency: { in: HOMEPAGE_PAIRS.map((pair) => pair.baseCurrency) } },
      orderBy: { createdAt: 'desc' }
    });
    const map = new Map<string, (typeof snapshots)[number]>();
    for (const snapshot of snapshots) {
      if (!map.has(snapshot.baseCurrency)) map.set(snapshot.baseCurrency, snapshot);
    }
    return map;
  }

  private async latestSnapshots() {
    const map = await this.latestSnapshotMap();
    return HOMEPAGE_PAIRS.map((pair) => {
      const snapshot = map.get(pair.baseCurrency);
      return snapshot
        ? this.toPublicRate(snapshot, true)
        : this.unavailableRate(pair.baseCurrency);
    });
  }

  private async catalogFromLatestSnapshots(): Promise<PublicCatalogRate[]> {
    const snapshots = await this.latestSnapshots();
    return snapshots
      .filter((rate) => !rate.unavailable && rate.marketRateToman !== null)
      .map((rate) => ({
        code: rate.baseCurrency,
        marketRateToman: rate.marketRateToman as number,
        changeAmountToman: null,
        sourceKey: rate.sourceKey ?? rate.source,
        sourceTimestamp: rate.updatedAt,
        sourceDate: null,
        assetType: 'currency' as const
      }));
  }

  private markStaleIfNeeded(rates: PublicExchangeRate[]) {
    const staleAfterMs = this.config.get<number>('EXCHANGE_RATE_STALE_AFTER_SEC', 300) * 1000;
    return rates.map((rate) => ({
      ...rate,
      stale: Date.now() - new Date(rate.updatedAt).getTime() > staleAfterMs
    }));
  }

  private toPublicRate(
    snapshot: {
      baseCurrency: string;
      marketRateToman: Prisma.Decimal | null;
      buyRateToman: Prisma.Decimal | null;
      sellRateToman: Prisma.Decimal | null;
      sourceProvider: string;
      sourceKey: string | null;
      direction: string;
      unavailable: boolean;
      createdAt: Date;
    },
    stale = false
  ): PublicExchangeRate {
    return {
      baseCurrency: snapshot.baseCurrency,
      quoteCurrency: 'TOMAN',
      marketRateToman: snapshot.marketRateToman ? Number(snapshot.marketRateToman) : null,
      buyRateToman: snapshot.buyRateToman ? Number(snapshot.buyRateToman) : null,
      sellRateToman: snapshot.sellRateToman ? Number(snapshot.sellRateToman) : null,
      source: snapshot.sourceProvider,
      sourceKey: snapshot.sourceKey,
      updatedAt: snapshot.createdAt.toISOString(),
      stale,
      unavailable: snapshot.unavailable,
      direction: ['up', 'down', 'stable'].includes(snapshot.direction)
        ? snapshot.direction as PublicExchangeRate['direction']
        : 'unknown'
    };
  }

  private applyMarkup(rate: number, direction: -1 | 1, percent: number) {
    return Math.round(rate * (1 + direction * (percent / 100)));
  }

  private unavailableRate(baseCurrency: string): PublicExchangeRate {
    return {
      baseCurrency,
      quoteCurrency: 'TOMAN',
      marketRateToman: null,
      buyRateToman: null,
      sellRateToman: null,
      source: 'unavailable',
      sourceKey: null,
      updatedAt: new Date().toISOString(),
      stale: true,
      unavailable: true,
      direction: 'unknown'
    };
  }

  private cacheTtlSec() {
    return this.config.get<number>('EXCHANGE_RATE_CACHE_TTL_SEC', 600);
  }
}
