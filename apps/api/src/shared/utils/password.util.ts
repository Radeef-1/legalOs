import * as argon2 from 'argon2';

/**
 * LegalOS Password Hashing Utility — Argon2id (OWASP 2026 recommended)
 *
 * Uses Argon2id variant which provides:
 * - Side-channel attack resistance (from Argon2i)
 * - GPU-cracking resistance (from Argon2d)
 * - Memory-hard design preventing ASIC attacks
 *
 * Configuration follows OWASP 2026 guidelines:
 * - memoryCost: 65536 KB (64 MB) — minimum recommended
 * - timeCost: 3 iterations
 * - parallelism: 4 threads
 */

const ARGON2_OPTIONS: any = {
  type: argon2.argon2id,
  memoryCost: 65536,    // 64 MB
  timeCost: 3,          // 3 iterations
  parallelism: 4,       // 4 threads
  hashLength: 32,       // 256-bit output
};

/**
 * Hash a plaintext password using Argon2id
 * @param password - The plaintext password to hash
 * @returns The hashed password string (includes salt, params, and hash)
 */
export async function hashPassword(password: string): Promise<string> {
  const result = await argon2.hash(password, ARGON2_OPTIONS);
  return String(result);
}

/**
 * Verify a plaintext password against an Argon2id hash
 * @param hash - The stored hash to verify against
 * @param password - The plaintext password to check
 * @returns true if the password matches the hash
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Check if a hash needs to be re-hashed (e.g., after config update)
 * @param hash - The stored hash to check
 * @returns true if the hash should be regenerated
 */
export function needsRehash(hash: string): boolean {
  try {
    return argon2.needsRehash(hash, ARGON2_OPTIONS);
  } catch {
    return true; // If we can't parse it, it needs rehashing
  }
}
