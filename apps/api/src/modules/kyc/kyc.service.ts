import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AdminRole, KycStatus } from '@prisma/client';
import { AuditService } from '../../common/services/audit.service';
import { PrismaService } from '../../prisma.service';
import { StorageService } from '../storage/storage.service';
import { KYC_DOCUMENT_TYPES, KycDocumentType } from './dto/upload-kyc.dto';
import { ListKycDto } from '../admin/dto/list-kyc.dto';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService
  ) {}

  listForUser(userId: string) {
    return this.prisma.kycDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        documentType: true,
        mimeType: true,
        sizeBytes: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
        createdAt: true
      }
    });
  }

  async upload(userId: string, documentType: KycDocumentType, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    if (!KYC_DOCUMENT_TYPES.includes(documentType)) {
      throw new BadRequestException('Invalid document type');
    }

    const saved = await this.storage.save(file, 'kyc', [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ]);

    return this.prisma.kycDocument.create({
      data: {
        userId,
        documentType,
        fileKey: saved.key,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        status: KycStatus.PENDING
      },
      select: {
        id: true,
        documentType: true,
        mimeType: true,
        sizeBytes: true,
        status: true,
        createdAt: true
      }
    });
  }

  async getFileForUser(documentId: string, userId: string) {
    const doc = await this.prisma.kycDocument.findFirst({
      where: { id: documentId, userId }
    });
    if (!doc) throw new NotFoundException('Document not found');
    return { mimeType: doc.mimeType, key: doc.fileKey };
  }

  listForAdmin(query: ListKycDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.q?.trim()
        ? {
            user: {
              OR: [
                { email: { contains: query.q.trim(), mode: 'insensitive' as const } },
                { phone: { contains: query.q.trim(), mode: 'insensitive' as const } },
                { profile: { is: { firstName: { contains: query.q.trim(), mode: 'insensitive' as const } } } },
                { profile: { is: { lastName: { contains: query.q.trim(), mode: 'insensitive' as const } } } }
              ]
            }
          }
        : {})
    };
    return Promise.all([
      this.prisma.kycDocument.findMany({
        where,
        orderBy: query.status === KycStatus.PENDING || !query.status ? { createdAt: 'asc' } : { reviewedAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              profile: { select: { firstName: true, lastName: true, country: true } }
            }
          }
        }
      }),
      this.prisma.kycDocument.count({ where })
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  async getFileForAdmin(documentId: string) {
    const doc = await this.prisma.kycDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    return { mimeType: doc.mimeType, key: doc.fileKey };
  }

  async review(
    documentId: string,
    status: KycStatus,
    admin: { sub: string; email: string },
    rejectionReason?: string,
    ipAddress?: string
  ) {
    if (status === KycStatus.PENDING) {
      throw new BadRequestException('Use APPROVED or REJECTED');
    }
    if (status === KycStatus.REJECTED && !rejectionReason?.trim()) {
      throw new BadRequestException('Rejection reason is required');
    }

    const doc = await this.prisma.kycDocument.update({
      where: { id: documentId },
      data: {
        status,
        rejectionReason: status === KycStatus.REJECTED ? rejectionReason?.trim() : null,
        reviewedById: admin.sub,
        reviewedAt: new Date()
      },
      include: {
        user: { select: { id: true, email: true } }
      }
    });

    await this.audit.log({
      adminUserId: admin.sub,
      action: 'KYC_DOCUMENT_REVIEWED',
      entityType: 'KycDocument',
      entityId: documentId,
      metadata: { status, userId: doc.userId, email: doc.user.email },
      ipAddress
    });

    return doc;
  }
}
