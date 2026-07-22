import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function comparePassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
}
