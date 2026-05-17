import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaPlacementKey, MediaType, Prisma } from '@prisma/client';
import sharp from 'sharp';
import { PrismaService } from '../../prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateMediaDto, UpdateMediaDto } from './dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService
  ) {}

  async create(
    dto: CreateMediaDto,
    files: {
      file?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      mobileFile?: Express.Multer.File[];
    },
    adminUserId?: string
  ) {
    const primary = files.file?.[0];
    if (!primary) throw new BadRequestException('Primary media file is required');
    this.assertMediaType(dto.mediaType, primary.mimetype);
    this.assertAuxiliaryFiles(dto.mediaType, files.thumbnail?.[0], files.mobileFile?.[0]);
    const allowed = this.mediaAllowedMimeTypes();
    const saved = await this.storage.save(primary, 'media/originals', allowed);
    const thumbnail = files.thumbnail?.[0]
      ? await this.storage.save(files.thumbnail[0], 'media/thumbnails', allowed)
      : dto.mediaType === MediaType.IMAGE
        ? { key: await this.storage.saveBuffer(await sharp(primary.buffer).resize(640, 360, { fit: 'cover' }).webp({ quality: 82 }).toBuffer(), 'media/thumbnails', '.webp') }
        : null;
    const mobile = files.mobileFile?.[0]
      ? await this.storage.save(files.mobileFile[0], 'media/mobile', allowed)
      : dto.mediaType === MediaType.IMAGE
        ? { key: await this.storage.saveBuffer(await sharp(primary.buffer).resize(900, 1200, { fit: 'cover' }).webp({ quality: 84 }).toBuffer(), 'media/mobile', '.webp') }
        : null;

    const focalPoint = this.parseFocalPoint(dto.focalPoint);
    return this.prisma.media.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        mediaType: dto.mediaType,
        altText: dto.altText,
        overlayOpacity: dto.overlayOpacity ?? 0.45,
        focalPoint: focalPoint as Prisma.InputJsonValue | undefined,
        autoplay: dto.autoplay ?? dto.mediaType === MediaType.VIDEO,
        muted: dto.muted ?? true,
        loop: dto.loop ?? dto.mediaType === MediaType.VIDEO,
        published: dto.published ?? false,
        fileKey: saved.key,
        thumbnailKey: thumbnail?.key,
        mobileFileKey: mobile?.key,
        fileUrl: '',
        thumbnailUrl: null,
        mobileFileUrl: null,
        createdById: adminUserId
      }
    }).then((media) => this.attachUrls(media));
  }

  async list(query?: string, published?: boolean) {
    const items = await this.prisma.media.findMany({
      where: {
        ...(query ? { OR: [{ title: { contains: query, mode: 'insensitive' } }, { slug: { contains: query, mode: 'insensitive' } }] } : {}),
        ...(published === undefined ? {} : { published })
      },
      include: { placements: true },
      orderBy: { createdAt: 'desc' }
    });
    return items.map((item) => this.attachUrls(item));
  }

  async get(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id }, include: { placements: true } });
    if (!media) throw new NotFoundException('Media not found');
    return this.attachUrls(media);
  }

  async update(id: string, dto: UpdateMediaDto) {
    const media = await this.prisma.media.update({
      where: { id },
      data: {
        ...dto,
        focalPoint: dto.focalPoint as Prisma.InputJsonValue | undefined
      },
      include: { placements: true }
    }).catch(() => {
      throw new NotFoundException('Media not found');
    });
    return this.attachUrls(media);
  }

  async replace(
    id: string,
    files: { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[]; mobileFile?: Express.Multer.File[] }
  ) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    const allowed = this.mediaAllowedMimeTypes();
    this.assertAuxiliaryFiles(media.mediaType, files.thumbnail?.[0], files.mobileFile?.[0]);
    const primary = files.file?.[0] ? await this.storage.save(files.file[0], 'media/originals', allowed) : null;
    const thumbnail = files.thumbnail?.[0]
      ? await this.storage.save(files.thumbnail[0], 'media/thumbnails', allowed)
      : files.file?.[0] && media.mediaType === MediaType.IMAGE
        ? { key: await this.storage.saveBuffer(await sharp(files.file[0].buffer).resize(640, 360, { fit: 'cover' }).webp({ quality: 82 }).toBuffer(), 'media/thumbnails', '.webp') }
        : null;
    const mobile = files.mobileFile?.[0]
      ? await this.storage.save(files.mobileFile[0], 'media/mobile', allowed)
      : files.file?.[0] && media.mediaType === MediaType.IMAGE
        ? { key: await this.storage.saveBuffer(await sharp(files.file[0].buffer).resize(900, 1200, { fit: 'cover' }).webp({ quality: 84 }).toBuffer(), 'media/mobile', '.webp') }
        : null;
    if (files.file?.[0]) this.assertMediaType(media.mediaType, files.file[0].mimetype);

    const updated = await this.prisma.media.update({
      where: { id },
      data: {
        fileKey: primary?.key ?? media.fileKey,
        thumbnailKey: thumbnail?.key ?? media.thumbnailKey,
        mobileFileKey: mobile?.key ?? media.mobileFileKey
      },
      include: { placements: true }
    });

    await Promise.all([
      primary ? this.storage.remove(media.fileKey) : Promise.resolve(),
      thumbnail ? this.storage.remove(media.thumbnailKey) : Promise.resolve(),
      mobile ? this.storage.remove(media.mobileFileKey) : Promise.resolve()
    ]);
    return this.attachUrls(updated);
  }

  async delete(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id }, include: { placements: true } });
    if (!media) throw new NotFoundException('Media not found');
    if (media.placements.length > 0) throw new BadRequestException('Media is still assigned to placements');
    await this.prisma.media.delete({ where: { id } });
    await Promise.all([
      this.storage.remove(media.fileKey),
      this.storage.remove(media.thumbnailKey),
      this.storage.remove(media.mobileFileKey)
    ]);
    return { deleted: true };
  }

  async assignPlacement(placement: MediaPlacementKey, mediaId: string) {
    await this.prisma.media.findUniqueOrThrow({ where: { id: mediaId } }).catch(() => {
      throw new NotFoundException('Media not found');
    });
    return this.prisma.mediaPlacement.upsert({
      where: { placement },
      update: { mediaId },
      create: { placement, mediaId },
      include: { media: true }
    });
  }

  async publicPlacements() {
    const placements = await this.prisma.mediaPlacement.findMany({
      where: { media: { published: true } },
      include: { media: true }
    });
    return Object.fromEntries(placements.map(({ placement, media }) => [placement, this.attachUrls(media)]));
  }

  async stream(id: string, variant: 'file' | 'thumbnail' | 'mobile') {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    const key = variant === 'thumbnail' ? media.thumbnailKey : variant === 'mobile' ? media.mobileFileKey : media.fileKey;
    if (!key) throw new NotFoundException('Variant not found');
    return { key, mediaType: this.contentTypeFor(media, variant) };
  }

  private attachUrls<T extends { id: string; updatedAt: Date }>(media: T) {
    const base = this.config.get<string>('PUBLIC_API_URL', 'http://localhost:4000');
    const version = media.updatedAt.getTime();
    return {
      ...media,
      fileUrl: `${base}/media/files/${media.id}/file?v=${version}`,
      thumbnailUrl: 'thumbnailKey' in media && media.thumbnailKey ? `${base}/media/files/${media.id}/thumbnail?v=${version}` : null,
      mobileFileUrl: 'mobileFileKey' in media && media.mobileFileKey ? `${base}/media/files/${media.id}/mobile?v=${version}` : null
    };
  }

  private parseFocalPoint(value?: string) {
    if (!value) return undefined;
    try {
      const parsed = JSON.parse(value) as { x: number; y: number };
      if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') throw new Error();
      return parsed;
    } catch {
      throw new BadRequestException('Invalid focal point');
    }
  }

  private mediaAllowedMimeTypes() {
    return (this.config.get<string>('MEDIA_ALLOWED_UPLOAD_MIME_TYPES') ?? 'image/jpeg,image/png,image/webp,video/mp4,video/webm')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private assertMediaType(mediaType: MediaType, mimeType: string) {
    if (mediaType === MediaType.IMAGE && !mimeType.startsWith('image/')) {
      throw new BadRequestException('Expected an image upload');
    }
    if (mediaType === MediaType.VIDEO && !mimeType.startsWith('video/')) {
      throw new BadRequestException('Expected a video upload');
    }
  }

  private assertAuxiliaryFiles(mediaType: MediaType, thumbnail?: Express.Multer.File, mobile?: Express.Multer.File) {
    if (thumbnail && !thumbnail.mimetype.startsWith('image/')) {
      throw new BadRequestException('Thumbnail must be an image');
    }
    if (mobile) this.assertMediaType(mediaType, mobile.mimetype);
  }

  private contentTypeFor(media: { mediaType: MediaType; fileKey: string; thumbnailKey: string | null; mobileFileKey: string | null }, variant: 'file' | 'thumbnail' | 'mobile') {
    const key = variant === 'thumbnail' ? media.thumbnailKey : variant === 'mobile' ? media.mobileFileKey : media.fileKey;
    const extension = key?.split('.').pop()?.toLowerCase();
    if (extension === 'png') return 'image/png';
    if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
    if (extension === 'webp') return 'image/webp';
    if (extension === 'webm') return 'video/webm';
    return media.mediaType === MediaType.VIDEO ? 'video/mp4' : 'application/octet-stream';
  }
}
