import { IsString, MinLength } from 'class-validator';

export class CreateOrderNoteDto {
  @IsString()
  @MinLength(2)
  body!: string;
}
