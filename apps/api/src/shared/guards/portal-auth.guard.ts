import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PortalAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const portalToken = request.headers['x-portal-token'];
    const tenantId = request.headers['x-tenant-id'];

    if (!portalToken || !tenantId) {
      throw new UnauthorizedException({
        code: 'PORTAL_AUTH_REQUIRED',
        message: 'يجب تسجيل الدخول للوصول إلى بوابة العملاء',
      });
    }

    const session = await (this.prisma as any).portalSession.findFirst({
      where: {
        token: portalToken,
        organizationId: tenantId,
        isVerified: true,
        expiresAt: { gte: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedException({
        code: 'PORTAL_SESSION_EXPIRED',
        message: 'جلسة البوابة منتهية أو غير صالحة. يرجى تسجيل الدخول مجدداً',
      });
    }

    // Attach client info to request for downstream use
    request.portalClientId = session.clientId;
    request.portalOrganizationId = session.organizationId;
    request.portalSessionId = session.id;

    return true;
  }
}
