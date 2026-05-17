import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto } from './dto';
import { clearAdminAuthCookies, setAdminAuthCookies } from '../../common/utils/admin-cookies';
import { clientIp } from '../../common/utils/client-ip';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService
  ) {}
  @Post('register') register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.auth.login(dto.email, dto.password, clientIp(request), request.headers['user-agent']);
  }

  @Post('admin/login')
  async adminLogin(@Body() dto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.adminLogin(dto.email, dto.password, clientIp(request));
    setAdminAuthCookies(response, this.config, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
    return { admin: result.admin };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/me')
  adminMe(@Req() request: { user: { sub: string; role?: string } }) {
    if (!request.user.role) throw new ForbiddenException();
    return this.auth.adminMe(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/logout')
  async adminLogout(
    @Req() request: Request & { user: { sub: string; role?: string } },
    @Res({ passthrough: true }) response: Response
  ) {
    if (!request.user.role) throw new ForbiddenException();
    await this.auth.adminLogout(request.user.sub, clientIp(request));
    clearAdminAuthCookies(response, this.config);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Req() request: { user: { sub: string; role?: string } },
    @Body() dto: Partial<RefreshDto>
  ) {
    if (request.user.role) throw new ForbiddenException();
    return this.auth.logout(request.user.sub, dto.refreshToken);
  }

  @Post('refresh') refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }

  @Get('mojoauth/start')
  mojoAuthStart(@Query('locale') locale: 'fa' | 'en' = 'fa', @Res() response: Response) {
    return response.redirect(this.auth.createMojoAuthAuthorizationUrl(locale));
  }

  @Get('social/:provider/start')
  async socialStart(
    @Param('provider') provider: string,
    @Query('locale') locale: 'fa' | 'en' = 'fa',
    @Res() response: Response
  ) {
    if (provider !== 'google' && provider !== 'apple') {
      throw new BadRequestException('Only Google and Apple sign-in are supported.');
    }
    try {
      const url = await this.auth.socialStartUrl(provider, locale);
      return response.redirect(url);
    } catch (error) {
      const code =
        error instanceof BadRequestException &&
        typeof error.message === 'string' &&
        error.message.startsWith('SOCIAL_NOT_CONFIGURED:')
          ? 'social_not_configured'
          : 'social_failed';
      return response.redirect(this.auth.authErrorRedirect(locale, code));
    }
  }

  @Get('social/:locale/:provider/callback')
  async socialCallbackPath(
    @Param('locale') locale: 'fa' | 'en',
    @Param('provider') provider: string,
    @Query('state_id') stateId: string,
    @Query('stateId') stateIdAlt: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response
  ) {
    if (code && state) {
      return this.mojoAuthCallback(code, state, response);
    }
    return this.handleSocialCallback(stateId || stateIdAlt, locale, provider, response);
  }

  @Get('social/callback')
  async socialCallback(
    @Query('state_id') stateId: string,
    @Query('stateId') stateIdAlt: string,
    @Query('locale') locale: 'fa' | 'en' = 'fa',
    @Query('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response
  ) {
    if (code && state) {
      return this.mojoAuthCallback(code, state, response);
    }
    return this.handleSocialCallback(stateId || stateIdAlt, locale, provider || 'google', response);
  }

  private async handleSocialCallback(
    stateId: string,
    locale: 'fa' | 'en',
    provider: string,
    response: Response
  ) {
    try {
      if (!stateId) {
        return response.redirect(this.auth.authErrorRedirect(locale, 'social_missing_state'));
      }
      const redirectUrl = await this.auth.handleMojoAuthSocialCallback(stateId, locale, provider);
      return response.redirect(redirectUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'social_failed';
      const code = message.includes('expired')
        ? 'social_expired'
        : message.includes('Missing state_id')
          ? 'social_missing_state'
          : 'social_failed';
      return response.redirect(this.auth.authErrorRedirect(locale, code));
    }
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response
  ) {
    try {
      const redirectUrl = await this.auth.handleGoogleCallback(code, state);
      return response.redirect(redirectUrl);
    } catch {
      const locale = await this.auth.parseOAuthLocale(state);
      return response.redirect(this.auth.authErrorRedirect(locale, 'google_failed'));
    }
  }

  @Get('mojoauth/callback')
  async mojoAuthCallback(@Query('code') code: string, @Query('state') state: string, @Res() response: Response) {
    try {
      const redirectUrl = await this.auth.handleMojoAuthCallback(code, state);
      return response.redirect(redirectUrl);
    } catch {
      const locale = await this.auth.parseOAuthLocale(state);
      return response.redirect(this.auth.authErrorRedirect(locale, 'mojoauth_failed'));
    }
  }
}
