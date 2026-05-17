import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';
import { UploadKycDto } from './dto/upload-kyc.dto';
import { KycService } from './kyc.service';

@UseGuards(JwtAuthGuard)
@Controller('kyc')
export class KycController {
  constructor(
    private readonly kyc: KycService,
    private readonly storage: StorageService
  ) {}

  @Get('documents')
  list(@Req() request: { user: { sub: string; role?: string } }) {
    if (request.user.role) throw new ForbiddenException();
    return this.kyc.listForUser(request.user.sub);
  }

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Req() request: { user: { sub: string; role?: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadKycDto
  ) {
    if (request.user.role) throw new ForbiddenException();
    return this.kyc.upload(request.user.sub, dto.documentType, file);
  }

  @Get('documents/:id/file')
  async file(
    @Param('id') id: string,
    @Req() request: { user: { sub: string; role?: string } },
    @Res() response: Response
  ) {
    if (request.user.role) throw new ForbiddenException();
    const file = await this.kyc.getFileForUser(id, request.user.sub);
    const metadata = await this.storage.stat(file.key);
    response.setHeader('Content-Type', file.mimeType);
    response.setHeader('Content-Length', metadata.size);
    response.setHeader('Cache-Control', 'private, no-store');
    this.storage.stream(file.key).pipe(response);
  }
}
