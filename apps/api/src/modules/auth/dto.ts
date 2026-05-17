import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(10) password!: string;
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsString() phone!: string;
  @IsString() country!: string;
  @IsString() address!: string;
  @IsOptional() @IsString() city?: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(10) password!: string;
}

export class RefreshDto {
  @IsString() refreshToken!: string;
}
