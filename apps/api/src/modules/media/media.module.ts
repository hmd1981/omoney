import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaService } from '../../prisma.service';
import { StorageModule } from '../storage/storage.module';
import { AdminMediaController, MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [StorageModule],
  controllers: [MediaController, AdminMediaController],
  providers: [MediaService, PrismaService, RolesGuard]
})
export class MediaModule {}
