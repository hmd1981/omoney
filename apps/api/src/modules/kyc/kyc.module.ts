import { Module } from '@nestjs/common';
import { AuditService } from '../../common/services/audit.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaService } from '../../prisma.service';
import { StorageModule } from '../storage/storage.module';
import { AdminKycController } from './admin-kyc.controller';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';

@Module({
  imports: [StorageModule],
  controllers: [KycController, AdminKycController],
  providers: [KycService, PrismaService, AuditService, RolesGuard],
  exports: [KycService]
})
export class KycModule {}
