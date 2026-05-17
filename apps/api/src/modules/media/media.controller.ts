import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MediaPlacementKey } from '@prisma/client';
import { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminRole } from '@prisma/client';
import { AssignPlacementDto, CreateMediaDto, UpdateMediaDto } from './dto';
import { MediaService } from './media.service';
import { StorageService } from '../storage/storage.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly media: MediaService,
    private readonly storage: StorageService
  ) {}

  @Get('placements')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  placements() {
    return this.media.publicPlacements();
  }

  @Get('files/:id/:variant')
  async file(
    @Param('id') id: string,
    @Param('variant') variant: 'file' | 'thumbnail' | 'mobile',
    @Req() request: { headers: { range?: string } },
    @Res() response: Response
  ) {
    const file = await this.media.stream(id, variant);
    response.setHeader('Content-Type', file.mediaType);
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    const metadata = await this.storage.stat(file.key);
    const range = request.headers.range;
    if (range) {
      const [startRaw, endRaw] = range.replace(/bytes=/, '').split('-');
      const start = Number(startRaw);
      const end = endRaw ? Number(endRaw) : metadata.size - 1;
      response.status(206);
      response.setHeader('Accept-Ranges', 'bytes');
      response.setHeader('Content-Range', `bytes ${start}-${end}/${metadata.size}`);
      response.setHeader('Content-Length', end - start + 1);
      this.storage.stream(file.key, { start, end }).pipe(response);
      return;
    }
    response.setHeader('Content-Length', metadata.size);
    this.storage.stream(file.key).pipe(response);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.FINANCE_MANAGER)
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list(@Query('q') q?: string, @Query('published') published?: string) {
    return this.media.list(q, published === undefined ? undefined : published === 'true');
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'mobileFile', maxCount: 1 }
  ]))
  create(
    @Body() dto: CreateMediaDto,
    @UploadedFiles() files: { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[]; mobileFile?: Express.Multer.File[] },
    @Req() request: { user?: { sub?: string } }
  ) {
    return this.media.create(dto, files, request.user?.sub);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.media.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    return this.media.update(id, dto);
  }

  @Post(':id/replace')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'mobileFile', maxCount: 1 }
  ]))
  replace(
    @Param('id') id: string,
    @UploadedFiles() files: { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[]; mobileFile?: Express.Multer.File[] }
  ) {
    return this.media.replace(id, files);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.media.delete(id);
  }

  @Post('placements/assign')
  assign(@Body() dto: AssignPlacementDto) {
    return this.media.assignPlacement(dto.placement as MediaPlacementKey, dto.mediaId);
  }
}
