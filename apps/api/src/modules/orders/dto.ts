import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class CreateOrderDto {
  @IsString() corridorId!: string;
  @IsNumber() @Min(1) sourceAmount!: number;
  @IsNumber() @Min(1) targetAmount!: number;
  @IsNumber() @Min(0) feeAmount!: number;
  @IsString() beneficiaryName!: string;
  @IsOptional() @IsString() beneficiaryBank?: string;
  @IsOptional() @IsString() beneficiaryAccount?: string;
}
