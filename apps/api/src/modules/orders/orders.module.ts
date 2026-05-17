import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../../prisma.service';
@Module({ imports: [StorageModule], controllers: [OrdersController], providers: [PrismaService] })
export class OrdersModule {}
