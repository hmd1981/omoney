import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { Request, Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { clientIp } from '../../common/utils/client-ip';
import { StorageService } from '../storage/storage.service';
import { ListKycDto } from '../admin/dto/list-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { KycService } from './kyc.service';

type AdminRequest = Request & { user: { sub: string; email: string; role: AdminRole } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/kyc')
export class AdminKycController {
  constructor(
    private readonly kyc: KycService,
    private readonly storage: StorageService
  ) {}

  @Get('documents')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.KYC_REVIEWER, AdminRole.AUDITOR)
  listPending(@Query() query: ListKycDto) {
    return this.kyc.listForAdmin(query);
  }

  @Patch('documents/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.KYC_REVIEWER)
  review(
    @Param('id') id: string,
    @Body() dto: ReviewKycDto,
    @Req() request: AdminRequest
  ) {
    return this.kyc.review(id, dto.status, request.user, dto.rejectionReason, clientIp(request));
  }

  @Get('documents/:id/file')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.KYC_REVIEWER, AdminRole.AUDITOR)
  async file(@Param('id') id: string, @Res() response: Response) {
    const file = await this.kyc.getFileForAdmin(id);
    const metadata = await this.storage.stat(file.key);
    response.setHeader('Content-Type', file.mimeType);
    response.setHeader('Content-Length', metadata.size);
    response.setHeader('Cache-Control', 'private, no-store');
    this.storage.stream(file.key).pipe(response);
  }
}
