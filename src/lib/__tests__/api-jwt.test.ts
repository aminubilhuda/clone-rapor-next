import { describe, it, expect, beforeAll } from 'vitest';
import { signApiJwt, verifyApiJwt } from '../api-jwt';

beforeAll(() => {
  process.env.AUTH_SECRET = 'test-secret-for-unit-test';
});

describe('api-jwt', () => {
  it('signs and verifies a token', () => {
    const token = signApiJwt({ username: 'u', nama: 'Uji', jabatan: 2, role: 'tu_admin' });
    const payload = verifyApiJwt(token);
    expect(payload?.role).toBe('tu_admin');
    expect(payload?.username).toBe('u');
  });

  it('rejects a tampered token', () => {
    const token = signApiJwt({ username: 'u', nama: 'Uji', jabatan: 3, role: 'guru' });
    const tampered = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa');
    expect(verifyApiJwt(tampered)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    expect(verifyApiJwt('not-a-token')).toBeNull();
    expect(verifyApiJwt('a.b')).toBeNull();
  });

  it('rejects expired tokens', () => {
    const token = signApiJwt(
      { username: 'u', nama: 'Uji', jabatan: 2, role: 'tu_admin' },
      -10
    );
    expect(verifyApiJwt(token)).toBeNull();
  });
});
