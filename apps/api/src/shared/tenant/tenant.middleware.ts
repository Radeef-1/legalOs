import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const isProduction = process.env.NODE_ENV === 'production';

    // ── Development-only fallback context (NEVER in production) ──
    const devFallbackTenantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const devFallbackUserId = '11111111-1111-1111-1111-111111111111';
    const devFallbackRole = 'Partner';

    // Extract subdomain from host or custom header
    const host = req.headers.host || '';
    const hostSubdomain = host.split('.')[0];
    const customHeaderSubdomain = (req.headers['x-tenant-subdomain'] as string) || '';
    const resolvedSubdomain = customHeaderSubdomain || (hostSubdomain !== 'localhost' && hostSubdomain !== 'www' ? hostSubdomain : '');

    // ── No Authorization Header ──
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (isProduction) {
        // Production: reject unauthenticated requests (except health check)
        if (req.path === '/v1/health' || req.path === '/health') {
          return TenantContext.run(
            { tenantId: 'system', userId: 'system', role: 'system' },
            () => next(),
          );
        }
        throw new UnauthorizedException({
          code: 'AUTH_REQUIRED',
          message: 'يجب تسجيل الدخول للوصول إلى هذا المورد. Authentication required.',
        });
      }
      // Development: allow dev fallback for easier local testing
      return TenantContext.run(
        {
          tenantId: devFallbackTenantId,
          userId: devFallbackUserId,
          role: devFallbackRole,
        },
        () => next(),
      );
    }

    // ── Verify JWT Token ──
    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      if (!payload.sub || !payload.tenantId) {
        throw new UnauthorizedException({
          code: 'INVALID_TOKEN_PAYLOAD',
          message: 'التوكن لا يحتوي على بيانات المستأجر أو المستخدم.',
        });
      }

      return TenantContext.run(
        {
          tenantId: payload.tenantId,
          userId: payload.sub,
          role: payload.role || 'Viewer',
        },
        () => next(),
      );
    } catch (err) {
      if (isProduction) {
        // Production: NEVER fallback — always reject invalid tokens
        throw new UnauthorizedException({
          code: 'INVALID_TOKEN',
          message: 'انتهت صلاحية الجلسة أو التوكن غير صالح. يرجى تسجيل الدخول مجدداً.',
        });
      }
      // Development: fallback for easier testing
      return TenantContext.run(
        {
          tenantId: devFallbackTenantId,
          userId: devFallbackUserId,
          role: devFallbackRole,
        },
        () => next(),
      );
    }
  }
}
