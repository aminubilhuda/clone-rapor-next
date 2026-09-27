import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { verifyApiJwt, ApiJwtPayload } from './api-jwt';
import { apiError } from './api-response';
import { pool } from './db';

export type AllowedRole = 'super_admin' | 'tu_admin' | 'guru' | 'siswa';

export const ALL_ROLES: AllowedRole[] = ['super_admin', 'tu_admin', 'guru', 'siswa'];
export const STAFF_ROLES: AllowedRole[] = ['super_admin', 'tu_admin', 'guru'];
export const GURU_UP_ROLES: AllowedRole[] = ['super_admin', 'tu_admin', 'guru'];

export interface ApiAuthResult {
  authorized: boolean;
  user?: ApiJwtPayload;
  errorResponse?: ReturnType<typeof apiError>;
}

const ROLE_JABATAN: Record<AllowedRole, number> = {
  super_admin: 1,
  tu_admin: 2,
  guru: 3,
  siswa: 4,
};

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function isRoleAllowed(role: AllowedRole, allowedRoles?: AllowedRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
}

function forbiddenResponse(): ApiAuthResult {
  return {
    authorized: false,
    errorResponse: apiError(
      'Anda tidak memiliki hak akses (permission) untuk endpoint ini.',
      403,
      'FORBIDDEN'
    ),
  };
}

async function resolveApiKey(apiKey: string): Promise<{ id: number; nama: string; role: AllowedRole } | null> {
  const hash = sha256(apiKey);
  const [keyRows]: any = await pool.query(
    `SELECT id_api_key, nama, role
     FROM api_keys
     WHERE (key_value = ? OR key_value = ?) AND is_active = 1 AND deleted_at IS NULL
     LIMIT 1`,
    [hash, apiKey]
  );

  if (keyRows.length === 0) return null;

  const storedRole = keyRows[0].role as AllowedRole;
  const role: AllowedRole = ALL_ROLES.includes(storedRole) ? storedRole : 'tu_admin';

  return {
    id: keyRows[0].id_api_key,
    nama: keyRows[0].nama,
    role,
  };
}

export async function requireApiAuth(
  req: NextRequest,
  allowedRoles?: AllowedRole[]
): Promise<ApiAuthResult> {
  const authHeader = req.headers.get('authorization');
  const apiKeyHeader = req.headers.get('x-api-key');

  const configuredApiKey = process.env.API_SECRET_KEY || process.env.API_KEY;

  if (apiKeyHeader) {
    if (configuredApiKey && safeEqual(apiKeyHeader, configuredApiKey)) {
      const masterRole: AllowedRole = 'super_admin';
      if (!isRoleAllowed(masterRole, allowedRoles)) return forbiddenResponse();
      return {
        authorized: true,
        user: {
          username: 'api_client',
          nama: 'API Integration Client (Master)',
          jabatan: ROLE_JABATAN[masterRole],
          role: masterRole,
        },
      };
    }

    let keyRecord: { id: number; nama: string; role: AllowedRole } | null = null;
    try {
      keyRecord = await resolveApiKey(apiKeyHeader);
    } catch (e) {
      console.error('API Key DB check error:', e);
    }

    if (!keyRecord) {
      return {
        authorized: false,
        errorResponse: apiError(
          'API Key yang diberikan tidak valid atau telah dinonaktifkan.',
          401,
          'INVALID_API_KEY'
        ),
      };
    }

    if (!isRoleAllowed(keyRecord.role, allowedRoles)) return forbiddenResponse();

    pool
      .query('UPDATE api_keys SET last_used_at = NOW() WHERE id_api_key = ?', [keyRecord.id])
      .catch(() => {});

    return {
      authorized: true,
      user: {
        username: `apikey_${keyRecord.id}`,
        nama: keyRecord.nama,
        jabatan: ROLE_JABATAN[keyRecord.role],
        role: keyRecord.role,
      },
    };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      errorResponse: apiError(
        'Akses ditolak. Header Authorization: Bearer <token> atau X-API-KEY diperlukan.',
        401,
        'UNAUTHORIZED'
      ),
    };
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyApiJwt(token);

  if (!payload) {
    return {
      authorized: false,
      errorResponse: apiError(
        'Token autentikasi tidak valid atau telah kedaluwarsa.',
        401,
        'INVALID_TOKEN'
      ),
    };
  }

  if (!isRoleAllowed(payload.role as AllowedRole, allowedRoles)) return forbiddenResponse();

  return {
    authorized: true,
    user: payload,
  };
}
