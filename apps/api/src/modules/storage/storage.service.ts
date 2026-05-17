import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { mkdir, readFile, rm, stat, writeFile } from 'fs/promises';
import { extname, join } from 'path';

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService) {}

  async save(file: Express.Multer.File, folder: string, allowedMimeTypes?: string[]) {
    const maxMb = this.config.get<number>('MAX_UPLOAD_SIZE_MB', 10);
    const max = maxMb * 1024 * 1024;
    const allowedTypes = new Set(
      allowedMimeTypes ??
      (this.config.get<string>('ALLOWED_UPLOAD_MIME_TYPES') ?? 'image/jpeg,image/png,application/pdf')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    );
    if (!allowedTypes.has(file.mimetype)) throw new BadRequestException('Unsupported file type');
    if (file.size > max) throw new BadRequestException('File too large');
    const root = this.config.get<string>('UPLOAD_DIR', './storage/uploads');
    const dir = join(root, folder);
    await mkdir(dir, { recursive: true });
    const extension = extname(file.originalname).toLowerCase();
    const safeExtension = extension.match(/^\.[a-z0-9]+$/) ? extension : '';
    const key = `${folder}/${randomUUID()}${safeExtension}`;
    await writeFile(join(root, key), file.buffer);
    return { key, mimeType: file.mimetype, sizeBytes: file.size };
  }

  async saveBuffer(buffer: Buffer, folder: string, extension: string) {
    const root = this.config.get<string>('UPLOAD_DIR', './storage/uploads');
    const dir = join(root, folder);
    await mkdir(dir, { recursive: true });
    const key = `${folder}/${randomUUID()}${extension}`;
    await writeFile(join(root, key), buffer);
    return key;
  }

  async read(key: string) {
    const path = this.pathFor(key);
    try {
      return await readFile(path);
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  stream(key: string, options?: { start?: number; end?: number }) {
    return createReadStream(this.pathFor(key), options);
  }

  stat(key: string) {
    return stat(this.pathFor(key));
  }

  async remove(key?: string | null) {
    if (!key) return;
    await rm(this.pathFor(key), { force: true });
  }

  private pathFor(key: string) {
    const root = this.config.get<string>('UPLOAD_DIR', './storage/uploads');
    return join(root, key);
  }
}
