import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, TicketPriority, TicketStatus, UserStatus } from '@prisma/client';
import { Response } from 'express';
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
import { ListLedgerDto } from './dto/list-ledger.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import {
  LedgerExportRow,
  ReportExportPayload,
  ledgerRowsToTable,
  sendCsv,
  sendCsvLines,
  sendPdf,
  sendReportXlsx,
  sendXlsx
} from './admin-export.util';

const openOrderStatuses: OrderStatus[] = [
  'SUBMITTED',
  'WAITING_FOR_PAYMENT',
  'PAYMENT_UPLOADED',
  'UNDER_REVIEW',
  'PROCESSING'
];

export type UserAccountSummary = {
  totalOrders: number;
  completedOrders: number;
  openOrders: number;
  rejectedOrders: number;
  cancelledOrders: number;
  totalSourceVolume: number;
  completedTargetVolume: number;
  openTargetExposure: number;
  totalFees: number;
  completedFees: number;
  openTickets: number;
  totalTickets: number;
  kycPending: number;
  kycApproved: number;
  kycRejected: number;
  bankAccounts: number;
  activeSessions: number;
};

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly exchangeRatesService: ExchangeRatesService
  ) {}

  async dashboard() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const activeSessionWhere = { revokedAt: null, expiresAt: { gt: now } };

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      pendingVerification,
      newUsersToday,
      newUsers7d,
      activeSessions,
      pendingKyc,
      kycApproved,
      kycRejected,
      openOrders,
      processingOrders,
      waitingPayment,
      paymentUploaded,
      underReview,
      openTickets,
      urgentTickets,
      completedOrders,
      rejectedOrders,
      cancelledOrders,
      totalOrders,
      ordersToday,
      completedVolume,
      feeVolume7d,
      ordersByStatus,
      recentUsers,
      recentOrders,
      recentTickets,
      recentKyc,
      platformCompletedVolume,
      platformCompletedFees,
      platformOpenExposure,
      platformTotalSourceVolume
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      this.prisma.user.count({ where: { status: UserStatus.PENDING_VERIFICATION } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.userSession.count({ where: activeSessionWhere }),
      this.prisma.kycDocument.count({ where: { status: 'PENDING' } }),
      this.prisma.kycDocument.count({ where: { status: 'APPROVED' } }),
      this.prisma.kycDocument.count({ where: { status: 'REJECTED' } }),
      this.prisma.remittanceOrder.count({ where: { status: { in: openOrderStatuses } } }),
      this.prisma.remittanceOrder.count({ where: { status: OrderStatus.PROCESSING } }),
      this.prisma.remittanceOrder.count({ where: { status: OrderStatus.WAITING_FOR_PAYMENT } }),
      this.prisma.remittanceOrder.count({ where: { status: OrderStatus.PAYMENT_UPLOADED } }),
      this.prisma.remittanceOrder.count({ where: { status: OrderStatus.UNDER_REVIEW } }),
      this.prisma.supportTicket.count({ where: { status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] } } }),
      this.prisma.supportTicket.count({
        where: {
          status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] },
          priority: TicketPriority.HIGH
        }
      }),
      this.prisma.remittanceOrder.count({ where: { status: OrderStatus.COMPLETED } }),
      this.prisma.remittanceOrder.count({ where: { status: OrderStatus.REJECTED } }),
      this.prisma.remittanceOrder.count({ where: { status: OrderStatus.CANCELLED } }),
      this.prisma.remittanceOrder.count(),
      this.prisma.remittanceOrder.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.remittanceOrder.aggregate({
        where: { status: OrderStatus.COMPLETED, updatedAt: { gte: sevenDaysAgo } },
        _sum: { targetAmount: true }
      }),
      this.prisma.remittanceOrder.aggregate({
        where: { status: OrderStatus.COMPLETED, updatedAt: { gte: sevenDaysAgo } },
        _sum: { feeAmount: true }
      }),
      this.prisma.remittanceOrder.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
          profile: { select: { firstName: true, lastName: true } },
          _count: { select: { orders: true, sessions: true } }
        }
      }),
      this.prisma.remittanceOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          status: true,
          beneficiaryName: true,
          targetAmount: true,
          createdAt: true,
          corridor: {
            select: {
              sourceCurrency: { select: { code: true } },
              targetCurrency: { select: { code: true } }
            }
          },
          user: { select: { email: true } }
        }
      }),
      this.prisma.supportTicket.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 6,
        select: {
          id: true,
          subject: true,
          status: true,
          priority: true,
          updatedAt: true,
          user: { select: { email: true } }
        }
      }),
      this.prisma.kycDocument.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 6,
        select: {
          id: true,
          documentType: true,
          createdAt: true,
          user: { select: { email: true } }
        }
      }),
      this.prisma.remittanceOrder.aggregate({
        where: { status: OrderStatus.COMPLETED },
        _sum: { targetAmount: true }
      }),
      this.prisma.remittanceOrder.aggregate({
        where: { status: OrderStatus.COMPLETED },
        _sum: { feeAmount: true }
      }),
      this.prisma.remittanceOrder.aggregate({
        where: { status: { in: openOrderStatuses } },
        _sum: { targetAmount: true }
      }),
      this.prisma.remittanceOrder.aggregate({ _sum: { sourceAmount: true } })
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      pendingVerification,
      newUsersToday,
      newUsers7d,
      activeSessions,
      pendingKyc,
      kycApproved,
      kycRejected,
      openOrders,
      processingOrders,
      waitingPayment,
      paymentUploaded,
      underReview,
      openTickets,
      urgentTickets,
      completedOrders,
      rejectedOrders,
      cancelledOrders,
      totalOrders,
      ordersToday,
      completedVolume7d: completedVolume._sum.targetAmount ? Number(completedVolume._sum.targetAmount) : 0,
      feeVolume7d: feeVolume7d._sum.feeAmount ? Number(feeVolume7d._sum.feeAmount) : 0,
      platformCompletedVolume: platformCompletedVolume._sum.targetAmount
        ? Number(platformCompletedVolume._sum.targetAmount)
        : 0,
      platformCompletedFees: platformCompletedFees._sum.feeAmount
        ? Number(platformCompletedFees._sum.feeAmount)
        : 0,
      platformOpenExposure: platformOpenExposure._sum.targetAmount
        ? Number(platformOpenExposure._sum.targetAmount)
        : 0,
      platformTotalSourceVolume: platformTotalSourceVolume._sum.sourceAmount
        ? Number(platformTotalSourceVolume._sum.sourceAmount)
        : 0,
      ordersByStatus: ordersByStatus.map((row) => ({
        status: row.status,
        count: row._count._all
      })),
      recentUsers,
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
    ]).then(async ([items, total]) => {
      const summaries = await this.buildUserAccountSummaries(items.map((item) => item.id));
      return {
        items: items.map((item) => ({ ...item, accountSummary: summaries[item.id] })),
        total,
        page,
        limit
      };
    });
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
        kycDocuments: { orderBy: { createdAt: 'desc' } },
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            sourceAmount: true,
            targetAmount: true,
            feeAmount: true,
            beneficiaryName: true,
            beneficiaryBank: true,
            beneficiaryAccount: true,
            createdAt: true,
            updatedAt: true,
            corridor: {
              select: {
                sourceCountry: true,
                targetCountry: true,
                sourceCurrency: { select: { code: true } },
                targetCurrency: { select: { code: true } }
              }
            },
            paymentProofs: { select: { id: true, mimeType: true, createdAt: true } },
            _count: { select: { statusHistory: true, internalNotes: true } }
          }
        },
        tickets: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            subject: true,
            status: true,
            priority: true,
            createdAt: true,
            updatedAt: true
          }
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 15,
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
    const accountSummary = await this.buildUserAccountSummary(id);
    return { ...user, accountSummary };
  }

  private emptyAccountSummary(): UserAccountSummary {
    return {
      totalOrders: 0,
      completedOrders: 0,
      openOrders: 0,
      rejectedOrders: 0,
      cancelledOrders: 0,
      totalSourceVolume: 0,
      completedTargetVolume: 0,
      openTargetExposure: 0,
      totalFees: 0,
      completedFees: 0,
      openTickets: 0,
      totalTickets: 0,
      kycPending: 0,
      kycApproved: 0,
      kycRejected: 0,
      bankAccounts: 0,
      activeSessions: 0
    };
  }

  private decimal(value: Prisma.Decimal | null | undefined) {
    return value ? Number(value) : 0;
  }

  async buildUserAccountSummary(userId: string): Promise<UserAccountSummary> {
    const summaries = await this.buildUserAccountSummaries([userId]);
    return summaries[userId] ?? this.emptyAccountSummary();
  }

  async buildUserAccountSummaries(userIds: string[]): Promise<Record<string, UserAccountSummary>> {
    const result: Record<string, UserAccountSummary> = {};
    for (const userId of userIds) {
      result[userId] = this.emptyAccountSummary();
    }
    if (!userIds.length) return result;

    const now = new Date();
    const [
      allOrders,
      completedOrders,
      openOrders,
      rejectedOrders,
      cancelledOrders,
      openTickets,
      totalTickets,
      kycGroups,
      bankAccounts,
      activeSessions
    ] = await Promise.all([
      this.prisma.remittanceOrder.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { _all: true },
        _sum: { sourceAmount: true, targetAmount: true, feeAmount: true }
      }),
      this.prisma.remittanceOrder.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, status: OrderStatus.COMPLETED },
        _count: { _all: true },
        _sum: { targetAmount: true, feeAmount: true }
      }),
      this.prisma.remittanceOrder.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, status: { in: openOrderStatuses } },
        _count: { _all: true },
        _sum: { targetAmount: true }
      }),
      this.prisma.remittanceOrder.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, status: OrderStatus.REJECTED },
        _count: { _all: true }
      }),
      this.prisma.remittanceOrder.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, status: OrderStatus.CANCELLED },
        _count: { _all: true }
      }),
      this.prisma.supportTicket.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] } },
        _count: { _all: true }
      }),
      this.prisma.supportTicket.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { _all: true }
      }),
      this.prisma.kycDocument.groupBy({
        by: ['userId', 'status'],
        where: { userId: { in: userIds } },
        _count: { _all: true }
      }),
      this.prisma.userBankAccount.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { _all: true }
      }),
      this.prisma.userSession.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, revokedAt: null, expiresAt: { gt: now } },
        _count: { _all: true }
      })
    ]);

    for (const row of allOrders) {
      const summary = result[row.userId];
      summary.totalOrders = row._count._all;
      summary.totalSourceVolume = this.decimal(row._sum.sourceAmount);
      summary.totalFees = this.decimal(row._sum.feeAmount);
    }
    for (const row of completedOrders) {
      const summary = result[row.userId];
      summary.completedOrders = row._count._all;
      summary.completedTargetVolume = this.decimal(row._sum.targetAmount);
      summary.completedFees = this.decimal(row._sum.feeAmount);
    }
    for (const row of openOrders) {
      const summary = result[row.userId];
      summary.openOrders = row._count._all;
      summary.openTargetExposure = this.decimal(row._sum.targetAmount);
    }
    for (const row of rejectedOrders) result[row.userId].rejectedOrders = row._count._all;
    for (const row of cancelledOrders) result[row.userId].cancelledOrders = row._count._all;
    for (const row of openTickets) result[row.userId].openTickets = row._count._all;
    for (const row of totalTickets) result[row.userId].totalTickets = row._count._all;
    for (const row of bankAccounts) result[row.userId].bankAccounts = row._count._all;
    for (const row of activeSessions) result[row.userId].activeSessions = row._count._all;
    for (const row of kycGroups) {
      const summary = result[row.userId];
      if (row.status === 'PENDING') summary.kycPending = row._count._all;
      if (row.status === 'APPROVED') summary.kycApproved = row._count._all;
      if (row.status === 'REJECTED') summary.kycRejected = row._count._all;
    }

    return result;
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
    const where = this.buildLedgerWhere({
      q: query.q,
      status: query.status,
      createdFrom: query.createdFrom,
      createdTo: query.createdTo,
      targetCurrency: query.targetCurrency,
      sourceCurrency: query.sourceCurrency
    });
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

  private buildLedgerWhere(query: ListLedgerDto): Prisma.RemittanceOrderWhereInput {
    const where: Prisma.RemittanceOrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.userId) where.userId = query.userId;
    if (query.targetCurrency?.trim() || query.sourceCurrency?.trim()) {
      where.corridor = {
        ...(query.targetCurrency?.trim()
          ? { targetCurrency: { code: query.targetCurrency.trim().toUpperCase() } }
          : {}),
        ...(query.sourceCurrency?.trim()
          ? { sourceCurrency: { code: query.sourceCurrency.trim().toUpperCase() } }
          : {})
      };
    }
    if (query.createdFrom || query.createdTo) {
      where.createdAt = {};
      if (query.createdFrom) where.createdAt.gte = new Date(query.createdFrom);
      if (query.createdTo) {
        const end = new Date(query.createdTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { beneficiaryName: { contains: q, mode: 'insensitive' } },
        { id: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { profile: { is: { firstName: { contains: q, mode: 'insensitive' } } } } },
        { user: { profile: { is: { lastName: { contains: q, mode: 'insensitive' } } } } }
      ];
    }
    return where;
  }

  private mapOrderToLedgerRow(order: {
    id: string;
    createdAt: Date;
    status: OrderStatus;
    sourceAmount: Prisma.Decimal;
    targetAmount: Prisma.Decimal;
    feeAmount: Prisma.Decimal;
    beneficiaryName: string;
    paymentProofs: { length: number } | unknown[];
    user: {
      email: string;
      profile: { firstName: string; lastName: string } | null;
    };
    corridor: {
      sourceCurrency: { code: string };
      targetCurrency: { code: string };
    };
  }): LedgerExportRow {
    const proofs = Array.isArray(order.paymentProofs) ? order.paymentProofs.length : 0;
    const name = order.user.profile
      ? `${order.user.profile.firstName} ${order.user.profile.lastName}`.trim()
      : order.user.email;
    return {
      id: order.id,
      createdAt: order.createdAt.toISOString(),
      customerEmail: order.user.email,
      customerName: name,
      beneficiaryName: order.beneficiaryName,
      corridor: `${order.corridor.sourceCurrency.code} -> ${order.corridor.targetCurrency.code}`,
      sourceAmount: this.decimal(order.sourceAmount),
      targetAmount: this.decimal(order.targetAmount),
      feeAmount: this.decimal(order.feeAmount),
      sourceCurrency: order.corridor.sourceCurrency.code,
      targetCurrency: order.corridor.targetCurrency.code,
      status: order.status,
      paymentProofs: proofs
    };
  }

  private resolveReportRange(query: ReportQueryDto) {
    const to = query.to ? new Date(query.to) : new Date();
    to.setHours(23, 59, 59, 999);
    const from = query.from ? new Date(query.from) : new Date(to);
    if (!query.from) from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);
    return {
      from,
      to,
      fromLabel: from.toISOString().slice(0, 10),
      toLabel: to.toISOString().slice(0, 10)
    };
  }

  async listLedger(query: ListLedgerDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where = this.buildLedgerWhere(query);
    const [items, total, aggregates, completedAgg] = await Promise.all([
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
      this.prisma.remittanceOrder.count({ where }),
      this.prisma.remittanceOrder.aggregate({
        where,
        _count: { _all: true },
        _sum: { sourceAmount: true, targetAmount: true, feeAmount: true }
      }),
      this.prisma.remittanceOrder.aggregate({
        where: { ...where, status: OrderStatus.COMPLETED },
        _count: { _all: true },
        _sum: { targetAmount: true, feeAmount: true }
      })
    ]);

    return {
      items,
      total,
      page,
      limit,
      summary: {
        orderCount: aggregates._count._all,
        sourceVolume: this.decimal(aggregates._sum.sourceAmount),
        targetVolume: this.decimal(aggregates._sum.targetAmount),
        feeVolume: this.decimal(aggregates._sum.feeAmount),
        completedCount: completedAgg._count._all,
        completedTargetVolume: this.decimal(completedAgg._sum.targetAmount),
        completedFees: this.decimal(completedAgg._sum.feeAmount)
      }
    };
  }

  listCurrencies() {
    return this.prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
      select: { code: true, name: true, symbol: true }
    });
  }

  async reportSummary(query: ReportQueryDto) {
    const range = this.resolveReportRange(query);
    const where = this.buildLedgerWhere({
      createdFrom: range.fromLabel,
      createdTo: range.toLabel,
      targetCurrency: query.targetCurrency,
      sourceCurrency: query.sourceCurrency
    });
    where.createdAt = { gte: range.from, lte: range.to };

    const orders = await this.prisma.remittanceOrder.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 5000,
      include: {
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
        corridor: { include: { sourceCurrency: true, targetCurrency: true } },
        paymentProofs: true
      }
    });

    const dailyMap = new Map<
      string,
      { orderCount: number; sourceVolume: number; targetVolume: number; feeVolume: number; completedCount: number }
    >();

    let completedCount = 0;
    let completedTargetVolume = 0;
    let completedFees = 0;
    let sourceVolume = 0;
    let targetVolume = 0;
    let feeVolume = 0;

    for (const order of orders) {
      const day = order.createdAt.toISOString().slice(0, 10);
      const bucket = dailyMap.get(day) ?? {
        orderCount: 0,
        sourceVolume: 0,
        targetVolume: 0,
        feeVolume: 0,
        completedCount: 0
      };
      const source = this.decimal(order.sourceAmount);
      const target = this.decimal(order.targetAmount);
      const fee = this.decimal(order.feeAmount);
      bucket.orderCount += 1;
      bucket.sourceVolume += source;
      bucket.targetVolume += target;
      bucket.feeVolume += fee;
      sourceVolume += source;
      targetVolume += target;
      feeVolume += fee;
      if (order.status === OrderStatus.COMPLETED) {
        bucket.completedCount += 1;
        completedCount += 1;
        completedTargetVolume += target;
        completedFees += fee;
      }
      dailyMap.set(day, bucket);
    }

    const daily = [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, row]) => ({ date, ...row }));

    return {
      period: { from: range.fromLabel, to: range.toLabel },
      generatedAt: new Date().toISOString(),
      totals: {
        orderCount: orders.length,
        completedCount,
        sourceVolume,
        targetVolume,
        feeVolume,
        completedTargetVolume,
        completedFees
      },
      daily,
      recentOrders: orders.slice(-20).reverse()
    };
  }

  private async fetchLedgerExportRows(query: ListLedgerDto) {
    const where = this.buildLedgerWhere(query);
    const orders = await this.prisma.remittanceOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: {
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
        corridor: { include: { sourceCurrency: true, targetCurrency: true } },
        paymentProofs: true
      }
    });
    return orders.map((order) => this.mapOrderToLedgerRow(order));
  }

  async exportLedger(res: Response, query: ListLedgerDto, format: string) {
    const rows = await this.fetchLedgerExportRows(query);
    const { headers, data } = ledgerRowsToTable(rows);
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'csv') return sendCsv(res, `omoney-ledger-${stamp}.csv`, headers, data);
    if (format === 'xlsx') return sendXlsx(res, `omoney-ledger-${stamp}.xlsx`, 'Ledger', headers, data);
    if (format === 'pdf') {
      const summary = rows.reduce(
        (acc, row) => {
          acc.source += row.sourceAmount;
          acc.target += row.targetAmount;
          acc.fees += row.feeAmount;
          return acc;
        },
        { source: 0, target: 0, fees: 0 }
      );
      return sendPdf(res, `omoney-ledger-${stamp}.pdf`, 'OMoney Ledger Export', [
        {
          heading: 'Summary',
          lines: [
            `Rows: ${rows.length}`,
            `Source volume: ${summary.source.toFixed(2)}`,
            `Target volume: ${summary.target.toFixed(2)}`,
            `Fees: ${summary.fees.toFixed(2)}`,
            `Generated: ${new Date().toISOString()}`
          ]
        },
        {
          heading: 'Recent rows (max 40)',
          lines: rows.slice(0, 40).map(
            (row) =>
              `${row.createdAt.slice(0, 10)} | ${row.customerEmail} | ${row.beneficiaryName} | ${row.sourceAmount} -> ${row.targetAmount} | ${row.status}`
          )
        }
      ]);
    }
    throw new BadRequestException('Invalid export format. Use csv, xlsx, or pdf.');
  }

  async exportReport(res: Response, query: ReportQueryDto, format: string) {
    const report = await this.reportSummary(query);
    const rows = (
      await this.fetchLedgerExportRows({
        createdFrom: report.period.from,
        createdTo: report.period.to,
        targetCurrency: query.targetCurrency,
        sourceCurrency: query.sourceCurrency,
        page: 1,
        limit: 5000
      })
    );
    const payload: ReportExportPayload = {
      from: report.period.from,
      to: report.period.to,
      generatedAt: report.generatedAt,
      totals: report.totals,
      daily: report.daily,
      rows
    };
    const stamp = `${payload.from}_${payload.to}`;
    const dailyHeaders = ['Date', 'Orders', 'Source', 'Target', 'Fees', 'Completed'];
    const dailyData = payload.daily.map((day) => [
      day.date,
      day.orderCount,
      day.sourceVolume,
      day.targetVolume,
      day.feeVolume,
      day.completedCount
    ]);

    if (format === 'csv') {
      const { headers, data } = ledgerRowsToTable(payload.rows);
      return sendCsvLines(res, `omoney-report-${stamp}.csv`, [
        ['OMoney Financial Report'],
        ['From', payload.from],
        ['To', payload.to],
        ['Generated', payload.generatedAt],
        ['Total orders', payload.totals.orderCount],
        ['Completed', payload.totals.completedCount],
        ['Source volume', payload.totals.sourceVolume],
        ['Target volume', payload.totals.targetVolume],
        ['Fees', payload.totals.feeVolume],
        ['Completed target', payload.totals.completedTargetVolume],
        ['Completed fees', payload.totals.completedFees],
        [],
        dailyHeaders,
        ...dailyData,
        [],
        headers,
        ...data
      ]);
    }

    if (format === 'xlsx') {
      return sendReportXlsx(res, `omoney-report-${stamp}.xlsx`, payload);
    }

    if (format === 'pdf') {
      return sendPdf(res, `omoney-report-${stamp}.pdf`, 'OMoney Financial Report', [
        {
          heading: 'Period',
          lines: [`From: ${payload.from}`, `To: ${payload.to}`, `Generated: ${payload.generatedAt}`]
        },
        {
          heading: 'Totals',
          lines: [
            `Orders: ${payload.totals.orderCount}`,
            `Completed: ${payload.totals.completedCount}`,
            `Source volume: ${payload.totals.sourceVolume.toFixed(2)}`,
            `Target volume: ${payload.totals.targetVolume.toFixed(2)}`,
            `Fees: ${payload.totals.feeVolume.toFixed(2)}`,
            `Completed target: ${payload.totals.completedTargetVolume.toFixed(2)}`,
            `Completed fees: ${payload.totals.completedFees.toFixed(2)}`
          ]
        },
        {
          heading: 'Daily breakdown',
          lines: payload.daily.map(
            (day) =>
              `${day.date}: orders=${day.orderCount}, source=${day.sourceVolume.toFixed(2)}, target=${day.targetVolume.toFixed(2)}, fees=${day.feeVolume.toFixed(2)}, completed=${day.completedCount}`
          )
        }
      ]);
    }

    throw new BadRequestException('Invalid export format. Use csv, xlsx, or pdf.');
  }
}
