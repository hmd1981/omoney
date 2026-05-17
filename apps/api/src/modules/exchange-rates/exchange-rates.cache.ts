import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PublicCatalogRate, PublicExchangeRate } from './types/exchange-rate.types';

@Injectable()
export class ExchangeRatesCache implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(config: ConfigService) {
    this.redis = new Redis(config.getOrThrow<string>('REDIS_URL'), {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true
    });
  }

  async getHomepage() {
    const value = await this.redis.get('exchange-rates:homepage');
    return value ? JSON.parse(value) as PublicExchangeRate[] : null;
  }

  async setHomepage(rates: PublicExchangeRate[], ttlSec: number) {
    await this.redis.set('exchange-rates:homepage', JSON.stringify(rates), 'EX', ttlSec);
  }

  async getCatalog() {
    const value = await this.redis.get('exchange-rates:catalog');
    return value ? JSON.parse(value) as PublicCatalogRate[] : null;
  }

  async setCatalog(rates: PublicCatalogRate[], ttlSec: number) {
    await this.redis.set('exchange-rates:catalog', JSON.stringify(rates), 'EX', ttlSec);
  }

  async setIfMissing(key: string, value: string, ttlSec: number) {
    return this.redis.set(key, value, 'EX', ttlSec, 'NX');
  }

  async getCounter(key: string) {
    return Number(await this.redis.get(key) ?? 0);
  }

  async incrementCounter(key: string, ttlSec: number) {
    const count = await this.redis.incr(key);
    if (count === 1) await this.redis.expire(key, ttlSec);
    return count;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
