import { hashPassword, verifyPassword, needsRehash } from './password.util';

describe('Password Utility (Argon2id)', () => {
  const plainPassword = 'SuperSecurePassword2026!';

  it('should generate a valid Argon2id hash', async () => {
    const hash = await hashPassword(plainPassword);
    expect(hash).toBeDefined();
    expect(hash).toContain('$argon2id$');
  });

  it('should verify correct password against hash', async () => {
    const hash = await hashPassword(plainPassword);
    const isValid = await verifyPassword(hash, plainPassword);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password against hash', async () => {
    const hash = await hashPassword(plainPassword);
    const isValid = await verifyPassword(hash, 'WrongPassword123');
    expect(isValid).toBe(false);
  });

  it('should correctly evaluate needsRehash for newly hashed password', async () => {
    const hash = await hashPassword(plainPassword);
    const rehashNeeded = needsRehash(hash);
    expect(rehashNeeded).toBe(false);
  });
});
