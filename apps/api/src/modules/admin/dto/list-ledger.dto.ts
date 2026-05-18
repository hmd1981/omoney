import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class ListLedgerDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() userId?: string;
  /** Currency purchased / received (corridor target) */
  @IsOptional() @IsString() targetCurrency?: string;
  /** Currency paid by customer (corridor source) */
  @IsOptional() @IsString() sourceCurrency?: string;
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @IsDateString() createdFrom?: string;
  @IsOptional() @IsDateString() createdTo?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) limit?: number = 50;
  @IsOptional() @IsIn(['csv', 'xlsx', 'pdf']) format?: string;
}
