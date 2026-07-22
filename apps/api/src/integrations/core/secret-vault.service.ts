import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SecretVaultService {
  private readonly algorithm = 'aes-256-gcm';
  // 32-byte secret key derived from JWT_SECRET or default secret
  private readonly secretKey = crypto
    .createHash('sha256')
    .update(process.env.JWT_SECRET || 'legalos-integration-vault-secret-key-2026')
    .digest();

  /**
   * Encrypts sensitive credentials (OAuth tokens, API keys, certificates) into an AES-256-GCM string.
   */
  encrypt(data: Record<string, any>): string {
    const jsonStr = JSON.stringify(data || {});
    const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);

    let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Return combined payload: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts AES-256-GCM encrypted vault string back into original credential object.
   */
  decrypt(vaultStr: string): Record<string, any> {
    if (!vaultStr) return {};

    try {
      const parts = vaultStr.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid vault ciphertext format');
      }

      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (err: any) {
      throw new Error(`Secret Vault Decryption Failed: ${err.message}`);
    }
  }
}
