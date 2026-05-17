import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateOrderDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly storage: StorageService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.prisma.remittanceOrder.findMany({
      where: { userId: req.user.sub },
      include: { corridor: { include: { sourceCurrency: true, targetCurrency: true } }, paymentProofs: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get(':id')
  getOne(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.prisma.remittanceOrder.findFirst({
      where: { id, userId: req.user.sub },
      include: { corridor: { include: { sourceCurrency: true, targetCurrency: true } }, paymentProofs: true, statusHistory: true }
    });
  }

  @Post()
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateOrderDto) {
    return this.prisma.remittanceOrder.create({
      data: { userId: req.user.sub, ...dto }
    });
  }

  @Post(':id/payment-proof')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProof(@Req() req: { user: { sub: string } }, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const order = await this.prisma.remittanceOrder.findFirstOrThrow({ where: { id, userId: req.user.sub } });
    const saved = await this.storage.save(file, `payment-proofs/${order.id}`);
    return this.prisma.paymentProof.create({
      data: {
        orderId: order.id,
        fileKey: saved.key,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes
      }
    });
  }
}
