import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  @Get() list() { return []; }
}
