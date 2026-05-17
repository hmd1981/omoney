import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateExchangeRateSettingsDto {
  @IsOptional() @IsBoolean() enableLiveRates?: boolean;
  @IsOptional() @IsString() defaultProvider?: string;
  @IsOptional() @IsString() fallbackProvider?: string;
  @IsOptional() @IsNumber() @Min(30) @Max(86_400) staleAfterSec?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(25) globalBuyMarkupPercent?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(25) globalSellMarkupPercent?: number;
}
