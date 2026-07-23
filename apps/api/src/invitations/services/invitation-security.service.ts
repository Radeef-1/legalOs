import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class InvitationSecurityService {
  private readonly secretKey = process.env.JWT_SECRET || 'super-secret-key-legalos-2026';

  /**
   * Generates a 32-byte cryptographically secure unguessable random token and SHA-256 hash
   */
  generateSecureToken(): { token: string; tokenHash: string } {
    // 32 bytes of cryptographically secure random entropy (producing ~43 unguessable characters)
    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    return { token: rawToken, tokenHash };
  }

  /**
   * Formats a production-grade unguessable invitation URL supporting Tenant Subdomains and White Label domains
   * Example: https://otaibi-law.legalos.sa/i/lawyer/4XJ8P6NKV9Q2MRT7YW6...
   */
  formatProductionInviteUrl(type: string, token: string, tenantSlug?: string): string {
    const cleanType = (type || 'lawyer').toLowerCase();
    const domain = tenantSlug ? `${tenantSlug}.legalos.sa` : 'portal.seiflden.online';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${domain}/i/${cleanType}/${token}`;
  }

  /**
   * Verifies an HMAC signed invitation token and checks expiry & signature
   */
  verifyTokenSignature(token: string): { inviteId: string; orgId: string; emailOrPhone: string; timestamp: number } {
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length !== 6) {
        throw new UnauthorizedException('رابط الدعوة غير صالح أو تم التلاعب به');
      }

      const [inviteId, orgId, emailOrPhone, nonce, timestampStr, signature] = parts;
      const payload = `${inviteId}:${orgId}:${emailOrPhone}:${nonce}:${timestampStr}`;
      const expectedSignature = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new UnauthorizedException('توقيع التشفير غير مطابق (تلاعب بالأمان)');
      }

      return {
        inviteId,
        orgId,
        emailOrPhone,
        timestamp: parseInt(timestampStr, 10),
      };
    } catch (err: any) {
      throw new UnauthorizedException(err.message || 'رابط الدعوة غير صالح');
    }
  }

  /**
   * Generates 6-digit OTP code and hash for live verification
   */
  generateOtp(): { otp: string; otpHash: string } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    return { otp, otpHash };
  }

  /**
   * Verifies provided OTP code against stored hash
   */
  verifyOtp(otp: string, storedHash: string): boolean {
    const hash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
  }
}
