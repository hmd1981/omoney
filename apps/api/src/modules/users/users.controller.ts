import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { isUserProfileComplete } from '../../common/utils/profile-complete';
import { PrismaService } from '../../prisma.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';

class UpdateProfileDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsString() country!: string;
  @IsOptional() @IsString() city?: string;
  @IsString() address!: string;
}

enum UserPhoneTypeDto {
  PRIMARY = 'PRIMARY',
  WHATSAPP = 'WHATSAPP',
  OMAN = 'OMAN',
  UAE = 'UAE',
  TURKEY = 'TURKEY',
  IRAN = 'IRAN',
  OTHER = 'OTHER'
}

class CreatePhoneDto {
  @IsEnum(UserPhoneTypeDto) type!: UserPhoneTypeDto;
  @IsOptional() @IsString() label?: string;
  @IsString() number!: string;
  @IsOptional() @IsBoolean() isPrimary?: boolean;
}

class CreateBankAccountDto {
  @IsString() country!: string;
  @IsString() bankName!: string;
  @IsString() accountHolderName!: string;
  @IsOptional() @IsString() iban?: string;
  @IsOptional() @IsString() accountNumber?: string;
  @IsString() currency!: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getMe(@Req() req: { user: { sub: string } }) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        profile: true,
        phones: true,
        bankAccounts: true,
        createdAt: true
      }
    });
    if (!user) return null;
    const profileComplete = isUserProfileComplete(user.profile) && Boolean(user.phone);
    return { ...user, profileComplete };
  }

  @Post('complete-profile')
  async completeProfile(@Req() req: { user: { sub: string } }, @Body() dto: CompleteProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      include: { profile: true }
    });
    if (!user) throw new BadRequestException('User not found.');

    try {
    await this.prisma.$transaction(async (tx) => {
      await tx.userProfile.upsert({
        where: { userId: user.id },
        update: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          country: dto.country.trim(),
          city: dto.city?.trim(),
          address: dto.address?.trim() ?? ''
        },
        create: {
          userId: user.id,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          country: dto.country.trim(),
          city: dto.city?.trim(),
          address: dto.address?.trim() ?? ''
        }
      });
      await tx.user.update({
        where: { id: user.id },
        data: { phone: dto.phone.trim(), status: 'ACTIVE' }
      });
      const existingPrimary = await tx.userPhone.findFirst({
        where: { userId: user.id, isPrimary: true }
      });
      if (existingPrimary) {
        await tx.userPhone.update({
          where: { id: existingPrimary.id },
          data: { number: dto.phone.trim() }
        });
      } else {
        await tx.userPhone.create({
          data: {
            userId: user.id,
            type: 'PRIMARY',
            number: dto.phone.trim(),
            isPrimary: true,
            isVerified: false
          }
        });
      }
    });
    } catch {
      throw new BadRequestException('Could not save profile. Phone may already be registered.');
    }

    return { ok: true, status: 'ACTIVE' };
  }

  @Get('dashboard')
  async dashboard(@Req() req: { user: { sub: string } }) {
    const [orders, notifications, kycDocuments] = await Promise.all([
      this.prisma.remittanceOrder.findMany({
        where: { userId: req.user.sub },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { corridor: { include: { sourceCurrency: true, targetCurrency: true } } }
      }),
      this.prisma.notification.findMany({
        where: { userId: req.user.sub },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      this.prisma.kycDocument.findMany({
        where: { userId: req.user.sub },
        orderBy: { createdAt: 'desc' },
        take: 1
      })
    ]);
    return {
      activeOrders: await this.prisma.remittanceOrder.count({
        where: { userId: req.user.sub, status: { in: ['SUBMITTED', 'WAITING_FOR_PAYMENT', 'PAYMENT_UPLOADED', 'UNDER_REVIEW', 'PROCESSING'] } }
      }),
      completedOrders: await this.prisma.remittanceOrder.count({
        where: { userId: req.user.sub, status: 'COMPLETED' }
      }),
      latestKycStatus: kycDocuments[0]?.status ?? null,
      recentOrders: orders,
      recentNotifications: notifications
    };
  }

  @Patch('profile')
  updateProfile(@Req() req: { user: { sub: string } }, @Body() dto: UpdateProfileDto) {
    return this.prisma.userProfile.upsert({
      where: { userId: req.user.sub },
      update: dto,
      create: { userId: req.user.sub, ...dto }
    });
  }

  @Get('phones')
  listPhones(@Req() req: { user: { sub: string } }) {
    return this.prisma.userPhone.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: 'asc' } });
  }

  @Post('phones')
  async createPhone(@Req() req: { user: { sub: string } }, @Body() dto: CreatePhoneDto) {
    if (dto.isPrimary) {
      await this.prisma.userPhone.updateMany({ where: { userId: req.user.sub }, data: { isPrimary: false } });
    }
    return this.prisma.userPhone.create({ data: { userId: req.user.sub, ...dto } });
  }

  @Delete('phones/:id')
  deletePhone(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.prisma.userPhone.deleteMany({ where: { id, userId: req.user.sub, isPrimary: false } });
  }

  @Get('bank-accounts')
  listBankAccounts(@Req() req: { user: { sub: string } }) {
    return this.prisma.userBankAccount.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: 'desc' } });
  }

  @Post('bank-accounts')
  async createBankAccount(@Req() req: { user: { sub: string } }, @Body() dto: CreateBankAccountDto) {
    if (dto.isDefault) {
      await this.prisma.userBankAccount.updateMany({ where: { userId: req.user.sub }, data: { isDefault: false } });
    }
    return this.prisma.userBankAccount.create({ data: { userId: req.user.sub, ...dto } });
  }
}
