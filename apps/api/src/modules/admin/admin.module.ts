import { Module } from '@nestjs/common';
import { AuditService } from '../../common/services/audit.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaService } from '../../prisma.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';

@Module({
  imports: [ExchangeRatesModule],
  controllers: [AdminController],
  providers: [AdminService, AuditService, PrismaService, RolesGuard],
  exports: [AuditService]
})
export class AdminModule {}
