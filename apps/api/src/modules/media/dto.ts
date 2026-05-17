import { MediaPlacementKey, MediaType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => value === true || value === 'true';
const toNumber = ({ value }: { value: unknown }) => Number(value);

export class CreateMediaDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsEnum(MediaType)
  mediaType!: MediaType;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(0)
  @Max(1)
  overlayOpacity?: number;

  @IsOptional()
  @IsString()
  focalPoint?: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  autoplay?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  muted?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  loop?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  published?: boolean;
}

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  overlayOpacity?: number;

  @IsOptional()
  focalPoint?: { x: number; y: number };

  @IsOptional()
  @IsBoolean()
  autoplay?: boolean;

  @IsOptional()
  @IsBoolean()
  muted?: boolean;

  @IsOptional()
  @IsBoolean()
  loop?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class AssignPlacementDto {
  @IsEnum(MediaPlacementKey)
  placement!: MediaPlacementKey;

  @IsString()
  mediaId!: string;
}
