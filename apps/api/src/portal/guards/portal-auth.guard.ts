import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/database/prisma.service';

@Injectable()
export class PortalAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    const portalTokenHeader = req.headers['x-portal-token'];

    let token: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (portalTokenHeader) {
      token = portalTokenHeader as string;
    }

    if (!token) {
      throw new UnauthorizedException('تنسيق التوكن غير صحيح أو مفقود. يرجى تسجيل الدخول ببوابة الموكلين.');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.PORTAL_JWT_SECRET || 'legalos_portal_secret_key_2026_prod',
      });
    } catch (err) {
      // Fallback check against portalSession database records
      const session = await this.prisma.db.portalSession.findFirst({
        where: { token },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('جلسة الدخول غير صالحة أو منتهية الصلاحية.');
      }

      req.portalClientId = session.clientId;
      req.portalOrgId = session.organizationId;
      req.portalSessionId = session.id;
      return true;
    }

    if (payload.type !== 'portal' || !payload.sub || !payload.orgId) {
      throw new UnauthorizedException('نوع التوكن غير مخصص لبوابة الموكلين.');
    }

    // Verify session still exists and active in DB
    const dbSession = await this.prisma.db.portalSession.findFirst({
      where: { id: payload.sessionId },
    });

    if (!dbSession || dbSession.expiresAt < new Date()) {
      throw new UnauthorizedException('تم إلغاء الجلسة أو انتهت صلاحيتها.');
    }

    req.portalClientId = payload.sub;
    req.portalOrgId = payload.orgId;
    req.portalSessionId = payload.sessionId;

    return true;
  }
}
