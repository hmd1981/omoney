import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { RegisterDto } from './dto';
import {
  isUserProfileComplete,
  PROFILE_PLACEHOLDER_COUNTRY,
  PROFILE_PLACEHOLDER_FIRST,
  PROFILE_PLACEHOLDER_LAST,
  resolveSocialNames
} from '../../common/utils/profile-complete';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash: await argon2.hash(dto.password),
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            country: dto.country,
            city: dto.city,
            address: dto.address
          }
        },
        phones: {
          create: {
            type: 'PRIMARY',
            number: dto.phone,
            isPrimary: true
          }
        }
      }
    });
    return this.createSessionAndIssueUserTokens(user.id, user.email);
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) throw new UnauthorizedException();
    return this.createSessionAndIssueUserTokens(user.id, user.email, ipAddress, userAgent);
  }

  async adminLogin(email: string, password: string, ipAddress?: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin || !admin.isActive || !(await argon2.verify(admin.passwordHash, password))) {
      throw new UnauthorizedException();
    }
    const tokens = this.issueAdminTokens(admin.id, admin.email, admin.role);
    await this.audit.log({
      adminUserId: admin.id,
      action: 'ADMIN_LOGIN',
      entityType: 'AdminUser',
      entityId: admin.id,
      metadata: { email: admin.email, role: admin.role },
      ipAddress
    });
    return {
      ...tokens,
      admin: { id: admin.id, email: admin.email, role: admin.role }
    };
  }

  async adminMe(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, role: true, isActive: true, createdAt: true }
    });
    if (!admin || !admin.isActive) throw new UnauthorizedException();
    return admin;
  }

  async adminLogout(adminId: string, ipAddress?: string) {
    await this.audit.log({
      adminUserId: adminId,
      action: 'ADMIN_LOGOUT',
      entityType: 'AdminUser',
      entityId: adminId,
      ipAddress
    });
    return { ok: true };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const sessions = await this.prisma.userSession.findMany({
        where: { userId, revokedAt: null, expiresAt: { gt: new Date() } }
      });
      for (const session of sessions) {
        if (await argon2.verify(session.refreshTokenHash, refreshToken)) {
          await this.prisma.userSession.update({
            where: { id: session.id },
            data: { revokedAt: new Date() }
          });
          return { ok: true };
        }
      }
    } else {
      await this.prisma.userSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }
    return { ok: true };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwt.verifyAsync<{ sub: string; email: string }>(refreshToken, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET')
    });
    const sessions = await this.prisma.userSession.findMany({
      where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } }
    });
    const validSession = await Promise.any(
      sessions.map(async (session) => ((await argon2.verify(session.refreshTokenHash, refreshToken)) ? session : Promise.reject()))
    ).catch(() => null);
    if (!validSession) throw new UnauthorizedException();
    return this.issueUserAccessToken(payload.sub, payload.email);
  }

  createMojoAuthAuthorizationUrl(locale: 'fa' | 'en') {
    const state = this.jwt.sign(
      { locale, provider: 'mojoauth', nonce: crypto.randomUUID() },
      {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: '10m'
      }
    );
    const issuer = this.config.getOrThrow<string>('MOJOAUTH_ISSUER');
    const redirectUri = this.config.getOrThrow<string>('MOJOAUTH_REDIRECT_URI');
    const params = new URLSearchParams({
      client_id: this.config.getOrThrow<string>('MOJOAUTH_CLIENT_ID'),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state
    });
    return `${issuer}/oauth/authorize?${params.toString()}`;
  }

  socialCallbackUrl(locale: 'fa' | 'en', provider: 'google' | 'apple') {
    const apiPublicUrl = this.config.getOrThrow<string>('PUBLIC_API_URL').replace(/\/$/, '');
    return `${apiPublicUrl}/auth/social/${locale}/${provider}/callback`;
  }

  createMojoAuthSocialUrl(locale: 'fa' | 'en', provider: 'google' | 'apple') {
    const apiKey = this.config.get<string>('MOJOAUTH_API_KEY') ?? this.config.getOrThrow('MOJOAUTH_CLIENT_ID');
    const params = new URLSearchParams({
      api_key: apiKey,
      provider,
      redirect_url: this.socialCallbackUrl(locale, provider)
    });
    return `https://api.mojoauth.com/oauth/social?${params.toString()}`;
  }

  async isMojoAuthSocialReady(provider: 'google' | 'apple') {
    const url = `https://api.mojoauth.com/oauth/social?api_key=${
      this.config.get<string>('MOJOAUTH_API_KEY') ?? this.config.getOrThrow('MOJOAUTH_CLIENT_ID')
    }&provider=${provider}&redirect_url=${encodeURIComponent(this.socialCallbackUrl('fa', provider))}`;
    const response = await fetch(url, { redirect: 'manual' });
    if (response.status >= 500) return false;
    const location = response.headers.get('location') ?? '';
    return response.status < 400 && !location.includes('error');
  }

  createGoogleAuthUrl(locale: 'fa' | 'en') {
    const clientId = this.config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.config.getOrThrow<string>('GOOGLE_REDIRECT_URI');
    const state = this.jwt.sign(
      { locale, provider: 'google', nonce: crypto.randomUUID() },
      { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: '10m' }
    );
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account'
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async socialStartUrl(provider: 'google' | 'apple', locale: 'fa' | 'en') {
    if (provider === 'google' && this.config.get<string>('GOOGLE_CLIENT_ID')) {
      return this.createGoogleAuthUrl(locale);
    }
    const ready = await this.isMojoAuthSocialReady(provider);
    if (!ready) {
      throw new BadRequestException(`SOCIAL_NOT_CONFIGURED:${provider}`);
    }
    return this.createMojoAuthSocialUrl(locale, provider);
  }

  private mojoAuthApiKey() {
    return this.config.get<string>('MOJOAUTH_API_KEY') ?? this.config.getOrThrow('MOJOAUTH_CLIENT_ID');
  }

  private resolveMojoAuthEmail(user: { email?: string; identifier?: string }) {
    const email = user.email?.trim().toLowerCase();
    if (email && email.includes('@')) return email;
    const identifier = user.identifier?.trim().toLowerCase();
    if (identifier && identifier.includes('@')) return identifier;
    return null;
  }

  private async fetchMojoAuthStatus(stateId: string) {
    const response = await fetch(
      `https://api.mojoauth.com/users/status?state_id=${encodeURIComponent(stateId)}`,
      { headers: { 'x-api-key': this.mojoAuthApiKey(), 'X-API-Key': this.mojoAuthApiKey() } }
    );
    const payload = (await response.json()) as {
      authenticated?: boolean;
      oauth?: { access_token?: string };
      user?: {
        user_id?: string;
        identifier?: string;
        email?: string;
        name?: string;
        given_name?: string;
        family_name?: string;
      };
      code?: number;
      message?: string;
    };
    return { response, payload };
  }

  async handleMojoAuthSocialCallback(stateId: string, locale: 'fa' | 'en', provider: string) {
    if (!stateId) throw new BadRequestException('Missing state_id from identity provider.');

    let statusPayload: Awaited<ReturnType<AuthService['fetchMojoAuthStatus']>>['payload'] | null = null;
    for (let attempt = 0; attempt < 12; attempt++) {
      const { response, payload } = await this.fetchMojoAuthStatus(stateId);
      if (response.ok && payload.authenticated && payload.user && this.resolveMojoAuthEmail(payload.user)) {
        statusPayload = payload;
        break;
      }
      if (payload.code === 924) {
        throw new UnauthorizedException('Social sign-in session expired. Please try again.');
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    const email = statusPayload?.user ? this.resolveMojoAuthEmail(statusPayload.user) : null;
    if (!email || !statusPayload?.user) {
      this.logger.warn(
        `MojoAuth social callback missing email provider=${provider} stateId=${stateId.slice(0, 8)}...`
      );
      throw new UnauthorizedException(
        'Google did not return an email address. Allow email permission in MojoAuth/Google, or sign in with email.'
      );
    }

    return this.finishSocialLogin({
      locale,
      provider,
      email,
      sub: statusPayload.user.user_id ?? email,
      givenName: statusPayload.user.given_name,
      familyName: statusPayload.user.family_name,
      name: statusPayload.user.name
    });
  }

  async handleGoogleCallback(code: string, state: string) {
    if (!code || !state) throw new BadRequestException('Missing Google authorization response.');
    const payload = await this.jwt.verifyAsync<{ locale: 'fa' | 'en' }>(state, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET')
    });
    const clientId = this.config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.config.getOrThrow<string>('GOOGLE_REDIRECT_URI');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    if (!tokenResponse.ok) throw new UnauthorizedException('Google token exchange failed.');
    const tokens = (await tokenResponse.json()) as { access_token?: string };
    if (!tokens.access_token) throw new UnauthorizedException('Google access token missing.');
    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    if (!profileResponse.ok) throw new UnauthorizedException('Google profile lookup failed.');
    const profile = (await profileResponse.json()) as {
      sub?: string;
      email?: string;
      given_name?: string;
      family_name?: string;
      name?: string;
    };
    if (!profile.sub || !profile.email) throw new UnauthorizedException('Google profile incomplete.');
    return this.finishSocialLogin({
      locale: payload.locale,
      provider: 'google',
      email: profile.email,
      sub: profile.sub,
      givenName: profile.given_name,
      familyName: profile.family_name,
      name: profile.name
    });
  }

  async handleMojoAuthCallback(code: string, state: string) {
    if (!code || !state) throw new BadRequestException('Missing authorization response.');
    const payload = await this.jwt.verifyAsync<{ locale: 'fa' | 'en'; provider?: string }>(state, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET')
    });
    const authProvider =
      payload.provider && payload.provider !== 'email' ? payload.provider : 'mojoauth';
    const issuer = this.config.getOrThrow<string>('MOJOAUTH_ISSUER');
    const clientId = this.config.getOrThrow<string>('MOJOAUTH_CLIENT_ID');
    const clientSecret = this.config.getOrThrow<string>('MOJOAUTH_CLIENT_SECRET');
    const redirectUri = this.config.getOrThrow<string>('MOJOAUTH_REDIRECT_URI');
    const tokenResponse = await fetch(`${issuer}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });
    if (!tokenResponse.ok) throw new UnauthorizedException('Identity provider token exchange failed.');
    const tokenPayload = await tokenResponse.json() as { access_token?: string };
    if (!tokenPayload.access_token) throw new UnauthorizedException('Identity provider access token missing.');
    const userInfoResponse = await fetch(`${issuer}/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${tokenPayload.access_token}` }
    });
    if (!userInfoResponse.ok) throw new UnauthorizedException('Identity provider userinfo lookup failed.');
    const profile = await userInfoResponse.json() as {
      sub?: string;
      email?: string;
      given_name?: string;
      family_name?: string;
      name?: string;
      phone_number?: string;
    };
    if (!profile.sub || !profile.email) throw new UnauthorizedException('Identity provider profile incomplete.');
    return this.finishSocialLogin({
      locale: payload.locale,
      provider: authProvider,
      email: profile.email,
      sub: profile.sub,
      givenName: profile.given_name,
      familyName: profile.family_name,
      name: profile.name,
      phone: profile.phone_number
    });
  }

  private async finishSocialLogin(input: {
    locale: 'fa' | 'en';
    provider: string;
    email: string;
    sub: string;
    givenName?: string;
    familyName?: string;
    name?: string;
    phone?: string;
  }) {
    const email = input.email.trim().toLowerCase();
    if (!email.includes('@')) {
      throw new UnauthorizedException('Invalid account email from identity provider.');
    }
    const { firstName, lastName } = resolveSocialNames(input);
    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    let user = existing;
    if (!user) {
      const hasProviderNames = firstName.length >= 2 && lastName.length >= 2;
      user = await this.prisma.user.create({
        data: {
          email,
          phone: input.phone,
          externalAuthProvider: input.provider,
          externalAuthSubject: input.sub,
          passwordHash: await argon2.hash(crypto.randomUUID()),
          status: 'PENDING_VERIFICATION',
          ...(hasProviderNames
            ? {
                profile: {
                  create: {
                    firstName,
                    lastName,
                    country: PROFILE_PLACEHOLDER_COUNTRY
                  }
                }
              }
            : {}),
          ...(input.phone
            ? {
                phones: {
                  create: {
                    type: 'PRIMARY' as const,
                    number: input.phone,
                    isPrimary: true,
                    isVerified: true
                  }
                }
              }
            : {})
        },
        include: { profile: true }
      });
    } else {
      if (firstName.length >= 2 && lastName.length >= 2) {
        if (user.profile) {
          const needsName =
            user.profile.firstName === PROFILE_PLACEHOLDER_FIRST ||
            user.profile.lastName === PROFILE_PLACEHOLDER_LAST ||
            user.profile.firstName.length < 2 ||
            user.profile.lastName.length < 2;
          if (needsName) {
            await this.prisma.userProfile.update({
              where: { userId: user.id },
              data: { firstName, lastName }
            });
          }
        } else {
          await this.prisma.userProfile.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
              country: PROFILE_PLACEHOLDER_COUNTRY
            }
          });
        }
      }
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          externalAuthProvider: input.provider,
          externalAuthSubject: input.sub,
          phone: input.phone ?? undefined
        },
        include: { profile: true }
      });
    }

    const profile = await this.prisma.userProfile.findUnique({ where: { userId: user.id } });
    const profileComplete = isUserProfileComplete(profile) && Boolean(user.phone ?? input.phone);
    if (profileComplete) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE' }
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'PENDING_VERIFICATION' }
      });
    }

    const tokens = await this.createSessionAndIssueUserTokens(user.id, user.email);
    const publicWebUrl = this.config.getOrThrow<string>('PUBLIC_WEB_URL');
    const fragment = new URLSearchParams({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });
    if (!profileComplete) {
      fragment.set('profile_incomplete', '1');
    }
    return `${publicWebUrl}/${input.locale}/auth/callback#${fragment.toString()}`;
  }

  authErrorRedirect(locale: 'fa' | 'en', code: string) {
    const publicWebUrl = this.config.getOrThrow<string>('PUBLIC_WEB_URL');
    return `${publicWebUrl}/${locale}/login?auth_error=${encodeURIComponent(code)}`;
  }

  async parseOAuthLocale(state?: string): Promise<'fa' | 'en'> {
    if (!state) return 'fa';
    try {
      const payload = await this.jwt.verifyAsync<{ locale?: 'fa' | 'en' }>(state, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET')
      });
      return payload.locale ?? 'fa';
    } catch {
      return 'fa';
    }
  }

  private async createSessionAndIssueUserTokens(
    sub: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const tokens = this.issueTokens({ sub, email });
    await this.prisma.userSession.create({
      data: {
        userId: sub,
        refreshTokenHash: await argon2.hash(tokens.refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress,
        userAgent
      }
    });
    return tokens;
  }

  private issueUserAccessToken(sub: string, email: string) {
    return {
      accessToken: this.jwt.sign({ sub, email }, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_TTL', '15m')
      })
    };
  }

  private issueAdminTokens(sub: string, email: string, role: string) {
    return this.issueTokens({ sub, email, role });
  }

  private issueTokens(payload: Record<string, string>) {
    return {
      accessToken: this.jwt.sign(payload, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_TTL', '15m')
      }),
      refreshToken: this.jwt.sign(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_TTL', '30d')
      })
    };
  }
}
