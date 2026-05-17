import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma.service';
class CreateTicketDto { @IsString() subject!: string; @IsString() message!: string; }
@UseGuards(JwtAuthGuard)
@Controller('support/tickets')
export class SupportController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() list(@Req() req: { user: { sub: string } }) {
    return this.prisma.supportTicket.findMany({
      where: { userId: req.user.sub },
      orderBy: { updatedAt: 'desc' }
    });
  }
  @Post() create(@Req() req: { user: { sub: string } }, @Body() dto: CreateTicketDto) {
    return this.prisma.supportTicket.create({
      data: { userId: req.user.sub, ...dto }
    });
  }
}
