import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { clientIp } from '../../common/utils/client-ip';
import { AdminService } from './admin.service';
import { ListSessionsDto } from './dto/list-sessions.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListAuditDto } from './dto/list-audit.dto';
import { ListSupportTicketsDto } from './dto/list-support-tickets.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { UpdateExchangeRateSettingsDto } from './dto/update-exchange-rate-settings.dto';
import { UpsertExchangeRateOverrideDto } from './dto/upsert-exchange-rate-override.dto';
import { CreateOrderNoteDto } from './dto/create-order-note.dto';

type AdminRequest = Request & { user: { sub: string; email: string; role: AdminRole } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.FINANCE_MANAGER,
    AdminRole.KYC_REVIEWER,
    AdminRole.SUPPORT_AGENT,
    AdminRole.AUDITOR
  )
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('users')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.KYC_REVIEWER, AdminRole.SUPPORT_AGENT, AdminRole.AUDITOR)
  listUsers(@Query() query: ListUsersDto) {
    return this.admin.listUsers(query);
  }

  @Get('users/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.KYC_REVIEWER, AdminRole.SUPPORT_AGENT, AdminRole.AUDITOR)
  getUser(@Param('id') id: string) {
    return this.admin.getUser(id);
  }

  @Patch('users/:id/status')
  @Roles(AdminRole.SUPER_ADMIN)
  updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() request: AdminRequest
  ) {
    return this.admin.updateUserStatus(id, dto.status, request.user, clientIp(request));
  }

  @Get('sessions')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUDITOR)
  listSessions(@Query() query: ListSessionsDto) {
    return this.admin.listSessions(query);
  }

  @Post('sessions/:id/revoke')
  @Roles(AdminRole.SUPER_ADMIN)
  revokeSession(@Param('id') id: string, @Req() request: AdminRequest) {
    return this.admin.revokeSession(id, request.user, clientIp(request));
  }

  @Get('orders')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.FINANCE_MANAGER, AdminRole.AUDITOR)
  listOrders(@Query() query: ListOrdersDto) {
    return this.admin.listOrders(query);
  }

  @Get('orders/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.FINANCE_MANAGER, AdminRole.AUDITOR)
  getOrder(@Param('id') id: string) {
    return this.admin.getOrder(id);
  }

  @Patch('orders/:id/status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.FINANCE_MANAGER)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() request: AdminRequest
  ) {
    return this.admin.updateOrderStatus(id, dto, request.user, clientIp(request));
  }

  @Post('orders/:id/notes')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.FINANCE_MANAGER)
  createOrderNote(
    @Param('id') id: string,
    @Body() dto: CreateOrderNoteDto,
    @Req() request: AdminRequest
  ) {
    return this.admin.createOrderNote(id, dto.body, request.user, clientIp(request));
  }

  @Get('audit-logs')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUDITOR)
  listAuditLogs(@Query() query: ListAuditDto) {
    return this.admin.listAuditLogs(query);
  }

  @Get('support-tickets')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_AGENT, AdminRole.AUDITOR)
  listSupportTickets(@Query() query: ListSupportTicketsDto) {
    return this.admin.listSupportTickets(query);
  }

  @Patch('support-tickets/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_AGENT)
  updateSupportTicket(
    @Param('id') id: string,
    @Body() dto: UpdateSupportTicketDto,
    @Req() request: AdminRequest
  ) {
    return this.admin.updateSupportTicket(id, dto, request.user, clientIp(request));
  }

  @Get('exchange-rates')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.FINANCE_MANAGER, AdminRole.AUDITOR)
  exchangeRates() {
    return this.admin.exchangeRates();
  }

  @Post('exchange-rates/refresh')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.FINANCE_MANAGER)
  refreshExchangeRates() {
    return this.admin.refreshExchangeRates();
  }

  @Patch('exchange-rates/settings')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.FINANCE_MANAGER)
  updateExchangeRateSettings(
    @Body() dto: UpdateExchangeRateSettingsDto,
    @Req() request: AdminRequest
  ) {
    return this.admin.updateExchangeRateSettings(dto, request.user, clientIp(request));
  }

  @Patch('exchange-rates/overrides/:baseCurrency')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.FINANCE_MANAGER)
  upsertExchangeRateOverride(
    @Param('baseCurrency') baseCurrency: string,
    @Body() dto: UpsertExchangeRateOverrideDto,
    @Req() request: AdminRequest
  ) {
    return this.admin.upsertExchangeRateOverride(baseCurrency, dto, request.user, clientIp(request));
  }
}
