import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExchangeRatesCache } from './exchange-rates.cache';
import { ExchangeRatesService } from './exchange-rates.service';

type MuscatClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

@Injectable()
export class ExchangeRatesScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExchangeRatesScheduler.name);
  private interval?: NodeJS.Timeout;

  constructor(
    private readonly config: ConfigService,
    private readonly cache: ExchangeRatesCache,
    private readonly rates: ExchangeRatesService
  ) {}

  onModuleInit() {
    void this.tick();
    this.interval = setInterval(() => void this.tick(), 15_000);
  }

  onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  private async tick() {
    if (this.config.get<string>('NAVASAN_ENABLED', 'true') !== 'true') return;

    const lock = await this.cache.setIfMissing('exchange-rates:scheduler:lock', '1', 20);
    if (!lock) return;

    try {
      const now = this.muscatNow();
      const keys = this.quotaKeys(now);
      const [monthUsed, dayUsed, hourUsed] = await Promise.all([
        this.cache.getCounter(keys.month),
        this.cache.getCounter(keys.day),
        this.cache.getCounter(keys.hour)
      ]);
      const monthLimit = this.config.get<number>('NAVASAN_MONTHLY_LIMIT', 30_000);
      const dayLimit = this.config.get<number>('NAVASAN_DAILY_LIMIT', 1_000);
      const hourLimit = this.config.get<number>('NAVASAN_HOURLY_LIMIT', 42);
      const daysRemaining = this.daysInMonth(now.year, now.month) - now.day + 1;
      const monthRemaining = Math.max(monthLimit - monthUsed, 0);
      const dailyTarget = Math.min(dayLimit, Math.floor(monthRemaining / daysRemaining));
      const secondsElapsed = now.hour * 3600 + now.minute * 60 + now.second;
      const shouldHaveUsed = Math.floor((secondsElapsed / 86_400) * dailyTarget);

      if (dailyTarget <= 0 || dayUsed >= dailyTarget || hourUsed >= hourLimit || dayUsed >= shouldHaveUsed) {
        return;
      }

      await Promise.all([
        this.cache.incrementCounter(keys.month, this.secondsUntilNextMonth(now)),
        this.cache.incrementCounter(keys.day, this.secondsUntilTomorrow(now)),
        this.cache.incrementCounter(keys.hour, this.secondsUntilNextHour(now))
      ]);
      await this.rates.refreshScheduledRates();
    } catch (error) {
      this.logger.warn(`Scheduled rate refresh failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  private muscatNow(): MuscatClock {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Muscat',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date())
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, Number(part.value)])
    );

    return {
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
      second: parts.second
    };
  }

  private quotaKeys(now: MuscatClock) {
    const date = `${now.year}-${this.pad(now.month)}-${this.pad(now.day)}`;
    return {
      month: `exchange-rates:quota:navasan:month:${now.year}-${this.pad(now.month)}`,
      day: `exchange-rates:quota:navasan:day:${date}`,
      hour: `exchange-rates:quota:navasan:hour:${date}T${this.pad(now.hour)}`
    };
  }

  private daysInMonth(year: number, month: number) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  private secondsUntilTomorrow(now: MuscatClock) {
    return 86_400 - (now.hour * 3600 + now.minute * 60 + now.second) + 60;
  }

  private secondsUntilNextHour(now: MuscatClock) {
    return 3600 - (now.minute * 60 + now.second) + 60;
  }

  private secondsUntilNextMonth(now: MuscatClock) {
    const remainingDaysAfterToday = this.daysInMonth(now.year, now.month) - now.day;
    return this.secondsUntilTomorrow(now) + remainingDaysAfterToday * 86_400 + 60;
  }

  private pad(value: number) {
    return String(value).padStart(2, '0');
  }
}
