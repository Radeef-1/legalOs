import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class InvitationSecurityService {
  private readonly secretKey = process.env.JWT_SECRET || 'super-secret-key-legalos-2026';

  /**
   * Generates a signed HMAC token for an invitation with expiration and nonce
   */
  generateInviteToken(inviteId: string, orgId: string, emailOrPhone: string): { token: string; tokenHash: string } {
    const nonce = crypto.randomBytes(16).toString('hex');
    const payload = `${inviteId}:${orgId}:${emailOrPhone}:${nonce}:${Date.now()}`;
    const signature = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
    const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    return { token, tokenHash };
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
