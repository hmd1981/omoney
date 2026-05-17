import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

const ACCESS_COOKIE = 'omoney_admin_access';
const REFRESH_COOKIE = 'omoney_admin_refresh';

export function setAdminAuthCookies(
  response: Response,
  config: ConfigService,
  tokens: { accessToken: string; refreshToken: string }
) {
  const domain = config.get<string>('ADMIN_COOKIE_DOMAIN');
  const secure = config.get<string>('NODE_ENV') === 'production';
  const base = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    ...(domain ? { domain } : {})
  };
  response.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: 15 * 60 * 1000
  });
  response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

export function clearAdminAuthCookies(response: Response, config: ConfigService) {
  const domain = config.get<string>('ADMIN_COOKIE_DOMAIN');
  const secure = config.get<string>('NODE_ENV') === 'production';
  const base = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    ...(domain ? { domain } : {})
  };
  response.clearCookie(ACCESS_COOKIE, base);
  response.clearCookie(REFRESH_COOKIE, base);
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
