import { IsIn, IsOptional } from 'class-validator';

export class ExportFormatDto {
  @IsOptional() @IsIn(['csv', 'xlsx', 'pdf']) format?: 'csv' | 'xlsx' | 'pdf';
}
