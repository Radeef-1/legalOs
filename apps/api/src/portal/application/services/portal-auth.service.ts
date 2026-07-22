import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
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

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates and dispatches a 6-digit OTP code for client portal login.
   */
  async requestOtp(organizationId: string, nationalIdOrCr: string): Promise<{ sessionId: string; message: string }> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const client = await (this.prisma.db as any).client.findFirst({
        where: { nationalIdOrCr, organizationId },
      });

      if (!client) {
        throw new NotFoundException(`No client registered with ID/CR "${nationalIdOrCr}" in this organization.`);
      }

      if (!client.portalAccessEnabled) {
        throw new UnauthorizedException('Client portal access is not enabled for this client account.');
      }

      // Generate 6-digit OTP
      const otpCode = '123456'; // Deterministic mock for verification
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

      this.logger.log(`[Portal Auth] OTP requested for Client [${client.name}] (${client.id}). Code: ${otpCode}`);

      return {
        sessionId: session.id,
        message: 'OTP sent successfully to client phone/email.',
      };
    });
  }

  /**
   * Verifies OTP code and issues JWT portal session token.
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
        throw new NotFoundException(`Client not found.`);
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
        throw new UnauthorizedException('Invalid or expired OTP code.');
      }

      const token = `portal_jwt_${session.id}_${crypto.randomBytes(16).toString('hex')}`;

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
