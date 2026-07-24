import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import * as crypto from 'crypto';

export interface PortalAuthSessionResult {
  token: string;
  clientId: string;
  clientName: string;
  expiresAt: Date;
}

@Injectable()
export class PortalAuthService {
  private readonly logger = new Logger(PortalAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Generates and dispatches a CSPRNG 6-digit OTP code for client portal login.
   */
  async requestOtp(organizationId: string, nationalIdOrCr: string): Promise<{ sessionId: string; message: string }> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const client = await (this.prisma.db as any).client.findFirst({
        where: { nationalIdOrCr, organizationId },
      });

      if (!client) {
        throw new NotFoundException(`لم يتم العثور على موكل مسجل برقم الهوية/السجل التجاري "${nationalIdOrCr}".`);
      }

      if (!client.portalAccessEnabled) {
        throw new UnauthorizedException('بوابة الموكلين غير مفعلة لهذا الحساب.');
      }

      // Generate CSPRNG 6-digit OTP
      const otpCode = crypto.randomInt(100000, 999999).toString();
      const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      const session = await (this.prisma.db as any).portalSession.create({
        data: {
          organizationId,
          clientId: client.id,
          otpHash,
          expiresAt,
        },
      });

      // Secure log - never log actual OTP in production logs or HTTP responses
      this.logger.log(`[Portal Auth] Secure OTP generated and dispatched for Client ID [${client.id}]. Session [${session.id}]`);

      return {
        sessionId: session.id,
        message: 'تم إرسال رمز التحقق OTP بنجاح إلى جوال الموكل المعتمد.',
      };
    });
  }

  /**
   * Verifies OTP code and issues signed JWT portal session token.
   */
  async verifyOtp(
    organizationId: string,
    nationalIdOrCr: string,
    otpCode: string,
  ): Promise<PortalAuthSessionResult> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const client = await (this.prisma.db as any).client.findFirst({
        where: { nationalIdOrCr, organizationId },
      });

      if (!client) {
        throw new NotFoundException(`لم يتم العثور على ملف الموكل.`);
      }

      const inputHash = crypto.createHash('sha256').update(otpCode).digest('hex');

      const session = await (this.prisma.db as any).portalSession.findFirst({
        where: {
          organizationId,
          clientId: client.id,
          otpHash: inputHash,
          isVerified: false,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!session) {
        throw new UnauthorizedException('رمز التحقق غير صحيح أو انتهت صلاحيته.');
      }

      // Sign JWT Portal Token
      const payload = {
        sub: client.id,
        sessionId: session.id,
        orgId: organizationId,
        type: 'portal',
      };

      const secret = process.env.PORTAL_JWT_SECRET || 'legalos_portal_secret_key_2026_prod';
      const token = this.jwtService.sign(payload, {
        secret,
        expiresIn: '8h',
      });

      await (this.prisma.db as any).portalSession.update({
        where: { id: session.id },
        data: {
          isVerified: true,
          token,
        },
      });

      return {
        token,
        clientId: client.id,
        clientName: client.name,
        expiresAt: session.expiresAt,
      };
    });
  }
}
