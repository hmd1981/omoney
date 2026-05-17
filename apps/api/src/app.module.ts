import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { KycModule } from './modules/kyc/kyc.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AdminModule } from './modules/admin/admin.module';
import { RatesModule } from './modules/rates/rates.module';
import { SupportModule } from './modules/support/support.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StorageModule } from './modules/storage/storage.module';
import { MediaModule } from './modules/media/media.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { PrismaService } from './prisma.service';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.getOrThrow<string>('REDIS_URL') }
      })
    }),
    AuthModule,
    UsersModule,
    KycModule,
    OrdersModule,
    AdminModule,
    RatesModule,
    SupportModule,
    NotificationsModule,
    StorageModule,
    MediaModule,
    ExchangeRatesModule,
    AiAssistantModule
  ],
  controllers: [HealthController],
  providers: [PrismaService],
  exports: [PrismaService]
})
export class AppModule {}
