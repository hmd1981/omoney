import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, TicketPriority, TicketStatus, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { ListSessionsDto } from './dto/list-sessions.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListAuditDto } from './dto/list-audit.dto';
import { ListSupportTicketsDto } from './dto/list-support-tickets.dto';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { UpdateExchangeRateSettingsDto } from './dto/update-exchange-rate-settings.dto';
import { UpsertExchangeRateOverrideDto } from './dto/upsert-exchange-rate-override.dto';

const openOrderStatuses: OrderStatus[] = [
  'SUBMITTED',
  'WAITING_FOR_PAYMENT',
  'PAYMENT_UPLOADED',
  'UNDER_REVIEW',
  'PROCESSING'
];

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly exchangeRatesService: ExchangeRatesService
  ) {}

  async dashboard() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      pendingVerification,
      pendingKyc,
      openOrders,
      processingOrders,
      openTickets,
      completedOrders,
      rejectedOrders,
      ordersToday,
      completedVolume,
      recentOrders,
      recentTickets,
      recentKyc
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'PENDING_VERIFICATION' } }),
      this.prisma.kycDocument.count({ where: { status: 'PENDING' } }),
      this.prisma.remittanceOrder.count({ where: { status: { in: openOrderStatuses } } }),
      this.prisma.remittanceOrder.count({ where: { status: 'PROCESSING' } }),
      this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.prisma.remittanceOrder.count({ where: { status: 'COMPLETED' } }),
      this.prisma.remittanceOrder.count({ where: { status: 'REJECTED' } }),
      this.prisma.remittanceOrder.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.remittanceOrder.aggregate({
        where: { status: 'COMPLETED', updatedAt: { gte: sevenDaysAgo } },
        _sum: { targetAmount: true }
      }),
      this.prisma.remittanceOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          beneficiaryName: true,
          targetAmount: true,
          createdAt: true,
          user: { select: { email: true } }
        }
      }),
      this.prisma.supportTicket.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          subject: true,
          status: true,
          updatedAt: true,
          user: { select: { email: true } }
        }
      }),
      this.prisma.kycDocument.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 5,
        select: {
          id: true,
          documentType: true,
          createdAt: true,
          user: { select: { email: true } }
        }
      })
    ]);

    return {
      totalUsers,
      pendingVerification,
      pendingKyc,
      openOrders,
      processingOrders,
      openTickets,
      completedOrders,
      rejectedOrders,
      ordersToday,
      completedVolume7d: completedVolume._sum.targetAmount ? Number(completedVolume._sum.targetAmount) : 0,
      recentOrders,
      recentTickets,
      recentKyc
    };
  }

  listUsers(query: ListUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UserWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { profile: { is: { firstName: { contains: q, mode: 'insensitive' } } } },
        { profile: { is: { lastName: { contains: q, mode: 'insensitive' } } } }
      ];
    }
    return Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          profile: { select: { firstName: true, lastName: true, country: true } },
          _count: { select: { orders: true, kycDocuments: true, sessions: true } }
        }
      }),
      this.prisma.user.count({ where })
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        externalAuthProvider: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        phones: { orderBy: { createdAt: 'asc' } },
        bankAccounts: { orderBy: { createdAt: 'desc' } },
        kycDocuments: { orderBy: { createdAt: 'desc' }, take: 10 },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            status: true,
            sourceAmount: true,
            targetAmount: true,
            beneficiaryName: true,
            createdAt: true,
            corridor: {
              select: {
                sourceCountry: true,
                targetCountry: true,
                sourceCurrency: { select: { code: true } },
                targetCurrency: { select: { code: true } }
              }
            }
          }
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            expiresAt: true,
            revokedAt: true,
            createdAt: true
          }
        },
        _count: { select: { orders: true, tickets: true, notifications: true } }
      }
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserStatus(
    userId: string,
    status: UserStatus,
    admin: { sub: string; email: string },
    ipAddress?: string
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, email: true, status: true }
    });
    await this.audit.log({
      adminUserId: admin.sub,
      action: 'USER_STATUS_UPDATED',
      entityType: 'User',
      entityId: userId,
      metadata: { status, email: user.email },
      ipAddress
    });
    return user;
  }

  listSessions(query: ListSessionsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UserSessionWhereInput = {};
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.user = {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } }
        ]
      };
    }
    return Promise.all([
      this.prisma.userSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          expiresAt: true,
          revokedAt: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              profile: { select: { firstName: true, lastName: true } }
            }
          }
        }
      }),
      this.prisma.userSession.count({ where })
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  async revokeSession(
    sessionId: string,
    admin: { sub: string },
    ipAddress?: string
  ) {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, revokedAt: true }
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.revokedAt) return session;
    const updated = await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
      select: { id: true, userId: true, revokedAt: true }
    });
    await this.audit.log({
      adminUserId: admin.sub,
      action: 'USER_SESSION_REVOKED',
      entityType: 'UserSession',
      entityId: sessionId,
      metadata: { userId: session.userId },
      ipAddress
    });
    return updated;
  }

  listOrders(query: ListOrdersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.RemittanceOrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.createdFrom || query.createdTo) {
      where.createdAt = {
        ...(query.createdFrom ? { gte: new Date(query.createdFrom) } : {}),
        ...(query.createdTo ? { lte: new Date(query.createdTo) } : {})
      };
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { beneficiaryName: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } }
      ];
    }
    return Promise.all([
      this.prisma.remittanceOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
          corridor: { include: { sourceCurrency: true, targetCurrency: true } },
          paymentProofs: true
        }
      }),
      this.prisma.remittanceOrder.count({ where })
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  async getOrder(id: string) {
    const order = await this.prisma.remittanceOrder.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, phone: true, profile: true } },
        corridor: { include: { sourceCurrency: true, targetCurrency: true } },
        paymentProofs: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        internalNotes: {
          orderBy: { createdAt: 'desc' },
          include: { adminUser: { select: { email: true, role: true } } }
        }
      }
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    admin: { sub: string; email: string },
    ipAddress?: string
  ) {
    const current = await this.prisma.remittanceOrder.findUnique({
      where: { id: orderId },
      select: { status: true }
    });
    if (!current) throw new NotFoundException('Order not found');
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.remittanceOrder.update({
        where: { id: orderId },
        data: { status: dto.status }
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: current.status,
          toStatus: dto.status,
          note: dto.note,
          changedById: admin.sub
        }
      });
      return order;
    });
    await this.audit.log({
      adminUserId: admin.sub,
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'RemittanceOrder',
      entityId: orderId,
      metadata: { fromStatus: current.status, toStatus: dto.status, note: dto.note },
      ipAddress
    });
    return updated;
  }

  async createOrderNote(
    orderId: string,
    body: string,
    admin: { sub: string },
    ipAddress?: string
  ) {
    await this.getOrder(orderId);
    const note = await this.prisma.orderInternalNote.create({
      data: { orderId, adminUserId: admin.sub, body: body.trim() },
      include: { adminUser: { select: { email: true, role: true } } }
    });
    await this.audit.log({
      adminUserId: admin.sub,
      action: 'ORDER_INTERNAL_NOTE_CREATED',
      entityType: 'RemittanceOrder',
      entityId: orderId,
      metadata: { noteId: note.id },
      ipAddress
    });
    return note;
  }

  listAuditLogs(query: ListAuditDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AuditLogWhereInput = query.q?.trim()
      ? {
          OR: [
            { action: { contains: query.q.trim(), mode: 'insensitive' } },
            { entityType: { contains: query.q.trim(), mode: 'insensitive' } },
            { entityId: { contains: query.q.trim(), mode: 'insensitive' } },
            { adminUser: { email: { contains: query.q.trim(), mode: 'insensitive' } } }
          ]
        }
      : {};
    return Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { adminUser: { select: { email: true, role: true } } }
      }),
      this.prisma.auditLog.count({ where })
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  listSupportTickets(query: ListSupportTicketsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.SupportTicketWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedTo === 'me') where.assignedToId = { not: null };
    if (query.assignedTo === 'unassigned') where.assignedToId = null;
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { subject: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } }
      ];
    }
    return Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
          assignedTo: { select: { email: true } }
        }
      }),
      this.prisma.supportTicket.count({ where })
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  async updateSupportTicket(
    ticketId: string,
    dto: { status?: TicketStatus; priority?: TicketPriority; assignedToId?: string | null },
    admin: { sub: string },
    ipAddress?: string
  ) {
    const ticket = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.priority ? { priority: dto.priority } : {}),
        ...(dto.assignedToId !== undefined
          ? { assignedToId: dto.assignedToId }
          : dto.status && dto.status !== 'OPEN'
            ? { assignedToId: admin.sub }
            : {})
      }
    });
    await this.audit.log({
      adminUserId: admin.sub,
      action: 'SUPPORT_TICKET_STATUS_UPDATED',
      entityType: 'SupportTicket',
      entityId: ticketId,
      metadata: dto,
      ipAddress
    });
    return ticket;
  }

  async exchangeRates() {
    const [snapshots, settings, overrides] = await Promise.all([
      this.prisma.exchangeRateSnapshot.findMany({
      orderBy: { createdAt: 'desc' },
      distinct: ['baseCurrency'],
      take: 20
      }),
      this.exchangeRatesService.getSettings(),
      this.prisma.exchangeRateOverride.findMany({ orderBy: { baseCurrency: 'asc' } })
    ]);
    return {
      snapshots,
      providerHealth: await this.exchangeRatesService.providerHealth(),
      settings,
      overrides
    };
  }

  refreshExchangeRates() {
    return this.exchangeRatesService.refreshScheduledRates();
  }

  async updateExchangeRateSettings(
    dto: UpdateExchangeRateSettingsDto,
    admin: { sub: string },
    ipAddress?: string
  ) {
    const settings = await this.exchangeRatesService.updateSettings(dto);
    await this.audit.log({
      adminUserId: admin.sub,
      action: 'EXCHANGE_RATE_SETTINGS_UPDATED',
      entityType: 'ExchangeRateSettings',
      entityId: settings.id,
      metadata: { ...dto },
      ipAddress
    });
    return settings;
  }

  async upsertExchangeRateOverride(
    baseCurrency: string,
    dto: UpsertExchangeRateOverrideDto,
    admin: { sub: string },
    ipAddress?: string
  ) {
    const override = await this.exchangeRatesService.upsertOverride(baseCurrency.toUpperCase(), dto);
    await this.audit.log({
      adminUserId: admin.sub,
      action: 'EXCHANGE_RATE_OVERRIDE_UPSERTED',
      entityType: 'ExchangeRateOverride',
      entityId: override.id,
      metadata: { baseCurrency: baseCurrency.toUpperCase(), ...dto },
      ipAddress
    });
    return override;
  }
}
