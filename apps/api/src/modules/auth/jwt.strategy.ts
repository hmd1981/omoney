import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ACCESS_COOKIE } from '../../common/utils/admin-cookies';

function extractAdminToken(request: Request): string | null {
  const bearer = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
  if (bearer) return bearer;
  return (request.cookies?.[ACCESS_COOKIE] as string | undefined) ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: extractAdminToken,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET')
    });
  }
  validate(payload: { sub: string; email: string; role?: string }) {
    return payload;
  }
}
