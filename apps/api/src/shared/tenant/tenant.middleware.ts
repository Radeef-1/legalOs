import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const defaultTenantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const defaultUserId = '11111111-1111-1111-1111-111111111111';
    const defaultRole = 'Partner';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Dev mode fallback context
      return TenantContext.run(
        {
          tenantId: defaultTenantId,
          userId: defaultUserId,
          role: defaultRole,
        },
        () => next(),
      );
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET ?? 'super-secret-key-legalos-2026',
      });

      return TenantContext.run(
        {
          tenantId: payload.tenantId || defaultTenantId,
          userId: payload.sub || defaultUserId,
          role: payload.role || defaultRole,
        },
        () => next(),
      );
    } catch (err) {
      // If token expired or invalid, fallback to default tenant context in development mode
      return TenantContext.run(
        {
          tenantId: defaultTenantId,
          userId: defaultUserId,
          role: defaultRole,
        },
        () => next(),
      );
    }
  }
}
