import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertExchangeRateOverrideDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsBoolean() frozen?: boolean;
  @IsOptional() @IsNumber() @Min(0) manualMarketRateToman?: number | null;
  @IsOptional() @IsNumber() @Min(0) @Max(25) buyMarkupPercent?: number | null;
  @IsOptional() @IsNumber() @Min(0) @Max(25) sellMarkupPercent?: number | null;
  @IsOptional() @IsNumber() @Min(0) fixedBuyRateToman?: number | null;
  @IsOptional() @IsNumber() @Min(0) fixedSellRateToman?: number | null;
  @IsOptional() @IsString() reason?: string | null;
}
