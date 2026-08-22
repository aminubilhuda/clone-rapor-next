import { NextRequest } from 'next/server';
import { verifyApiJwt, ApiJwtPayload } from './api-jwt';
import { apiError } from './api-response';
import { pool } from './db';

export type AllowedRole = 'super_admin' | 'tu_admin' | 'guru' | 'siswa';

export interface ApiAuthResult {
  authorized: boolean;
  user?: ApiJwtPayload;
  errorResponse?: ReturnType<typeof apiError>;
}

export async function requireApiAuth(
  req: NextRequest,
  allowedRoles?: AllowedRole[]
): Promise<ApiAuthResult> {
  const authHeader = req.headers.get('authorization');
  const apiKeyHeader = req.headers.get('x-api-key');

  const configuredApiKey = process.env.API_SECRET_KEY || process.env.API_KEY;

  // 1. Check API Key Header
  if (apiKeyHeader) {
    // Check fallback .env
    if (configuredApiKey && apiKeyHeader === configuredApiKey) {
      return {
        authorized: true,
        user: {
          username: 'api_client',
          nama: 'API Integration Client (Master)',
          jabatan: 1,
          role: 'super_admin',
        },
      };
    }

    // Check Database table api_keys
    try {
      const [keyRows]: any = await pool.query(
        `SELECT id_api_key, nama, key_value, is_active
         FROM api_keys
         WHERE key_value = ? AND is_active = 1 AND deleted_at IS NULL
         LIMIT 1`,
        [apiKeyHeader]
      );

      if (keyRows.length > 0) {
        // Update last_used_at asynchronously
        pool.query(
          'UPDATE api_keys SET last_used_at = NOW() WHERE id_api_key = ?',
          [keyRows[0].id_api_key]
        ).catch(() => {});

        return {
          authorized: true,
          user: {
            username: `apikey_${keyRows[0].id_api_key}`,
            nama: keyRows[0].nama,
            jabatan: 1,
            role: 'super_admin',
          },
        };
      }
    } catch (e) {
      console.error('API Key DB check error:', e);
    }

    return {
      authorized: false,
      errorResponse: apiError(
        'API Key yang diberikan tidak valid atau telah dinonaktifkan.',
        401,
        'INVALID_API_KEY'
      ),
    };
  }

  // 2. Check Bearer Token
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

  // 3. Role check if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(payload.role as AllowedRole)) {
      return {
        authorized: false,
        errorResponse: apiError(
          'Anda tidak memiliki hak akses (permission) untuk endpoint ini.',
          403,
          'FORBIDDEN'
        ),
      };
    }
  }

  return {
    authorized: true,
    user: payload,
  };
}
