import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class ReportQueryDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsString() targetCurrency?: string;
  @IsOptional() @IsString() sourceCurrency?: string;
  @IsOptional() @IsIn(['csv', 'xlsx', 'pdf']) format?: string;
}
