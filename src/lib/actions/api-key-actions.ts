'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export interface ApiKeyItem {
  id_api_key: number;
  nama: string;
  key_value: string;
  is_active: number;
  deskripsi: string | null;
  last_used_at: string | null;
  created_at: string;
}

export async function getApiKeys(): Promise<ApiKeyItem[]> {
  const auth = await requireTuAdmin();
  if (auth.error) return [];

  try {
    const [rows]: any = await pool.query(
      `SELECT id_api_key, nama, key_value, is_active, deskripsi, last_used_at, created_at
       FROM api_keys
       WHERE deleted_at IS NULL
       ORDER BY id_api_key DESC`
    );
    return rows;
  } catch (error) {
    console.error('getApiKeys error:', error);
    return [];
  }
}

export async function createApiKey(formData: FormData) {
  const auth = await requireTuAdmin();
  if (auth.error) return { success: false, error: auth.error } as const;

  const nama = (formData.get('nama') as string)?.trim();
  const deskripsi = (formData.get('deskripsi') as string)?.trim() || null;

  if (!nama) {
    return { success: false, error: 'Nama aplikasi / klien wajib diisi' } as const;
  }

  try {
    const randomHex = crypto.randomBytes(18).toString('hex');
    const keyValue = `raporkm_live_${randomHex}`;

    await pool.query(
      `INSERT INTO api_keys (nama, key_value, is_active, deskripsi) VALUES (?, ?, 1, ?)`,
      [nama, keyValue, deskripsi]
    );

    revalidatePath('/tu/integrasi-api');
    return { success: true, key: keyValue } as const;
  } catch (error: any) {
    console.error('createApiKey error:', error);
    return { success: false, error: 'Gagal membuat API Key baru' } as const;
  }
}

export async function toggleApiKeyStatus(id: number, currentActive: boolean) {
  const auth = await requireTuAdmin();
  if (auth.error) return { success: false, error: auth.error } as const;

  try {
    const newStatus = currentActive ? 0 : 1;
    await pool.query(
      'UPDATE api_keys SET is_active = ? WHERE id_api_key = ?',
      [newStatus, id]
    );

    revalidatePath('/tu/integrasi-api');
    return { success: true, is_active: newStatus } as const;
  } catch (error) {
    console.error('toggleApiKeyStatus error:', error);
    return { success: false, error: 'Gagal memperbarui status API Key' } as const;
  }
}

export async function deleteApiKey(id: number) {
  const auth = await requireTuAdmin();
  if (auth.error) return { success: false, error: auth.error } as const;

  try {
    await pool.query(
      'UPDATE api_keys SET deleted_at = NOW() WHERE id_api_key = ?',
      [id]
    );

    revalidatePath('/tu/integrasi-api');
    return { success: true } as const;
  } catch (error) {
    console.error('deleteApiKey error:', error);
    return { success: false, error: 'Gagal menghapus API Key' } as const;
  }
}
