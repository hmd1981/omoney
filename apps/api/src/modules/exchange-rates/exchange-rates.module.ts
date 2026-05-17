import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ExchangeRatesCache } from './exchange-rates.cache';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesScheduler } from './exchange-rates.scheduler';
import { CompositeRateProvider } from './providers/composite-rate.provider';
import { ManualRateProvider } from './providers/manual-rate.provider';
import { NavasanProvider } from './providers/navasan.provider';

@Module({
  controllers: [ExchangeRatesController],
  providers: [
    PrismaService,
    ExchangeRatesCache,
    ExchangeRatesService,
    ExchangeRatesScheduler,
    NavasanProvider,
    ManualRateProvider,
    CompositeRateProvider
  ],
  exports: [ExchangeRatesService]
})
export class ExchangeRatesModule {}
