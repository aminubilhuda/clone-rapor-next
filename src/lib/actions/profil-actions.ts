'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { SEKOLAH_ID } from '@/lib/constants';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';

async function saveFile(file: File, currentFilename: string | null): Promise<string | null> {
  if (!file || file.size === 0) return currentFilename;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `logo_${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'sekolah');
    const filepath = join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filepath, buffer);

    // Delete old file if exists
    if (currentFilename) {
      try {
        const oldPath = join(uploadDir, currentFilename);
        await unlink(oldPath);
      } catch {
        // Ignore if old file doesn't exist
      }
    }

    return filename;
  } catch (err: any) {
    if (err?.code === 'EACCES') {
      throw new Error(`Izin folder upload ditolak server (EACCES). Silakan jalankan 'chmod -R 777 public/uploads' atau 'chown -R www:www public/uploads' di aaPanel.`);
    }
    throw err;
  }
}

export async function updateProfil(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const fields = [
    'npsn', 'nama_sekolah', 'alamat', 'desa', 'kecamatan',
    'kabupaten', 'provinsi', 'email', 'kontak', 'website', 'yayasan',
    'visi', 'misi',
  ];

  try {
    const kepalaUserId = Number(formData.get('kepala_user_id'));
    if (!Number.isInteger(kepalaUserId) || kepalaUserId < 1) {
      return { success: false, error: 'Pilih kepala sekolah terlebih dahulu' } as const;
    }

    const [pegawaiRows]: any = await pool.query(
      `SELECT nama, nip, nuptk
       FROM users
       WHERE id_user = ? AND jabatan IN (1, 3) AND deleted_at IS NULL
       LIMIT 1`,
      [kepalaUserId]
    );
    const kepala = pegawaiRows[0];
    if (!kepala) {
      return { success: false, error: 'Data kepala sekolah tidak valid' } as const;
    }

    const periode = await getSekolahWithFilter();

    // Get current logo filenames
    const [current]: any = await pool.query(
      'SELECT logo, logo_prov FROM sekolah WHERE id_sekolah = ?',
      [SEKOLAH_ID]
    );
    const currentLogo = current[0]?.logo || null;
    const currentLogoProv = current[0]?.logo_prov || null;

    // Handle file uploads
    const logoFile = formData.get('logo_file') as File;
    const logoProvFile = formData.get('logo_prov_file') as File;

    let logoFilename = currentLogo;
    let logoProvFilename = currentLogoProv;

    if (logoFile && logoFile.size > 0) {
      logoFilename = await saveFile(logoFile, currentLogo);
    }
    if (logoProvFile && logoProvFile.size > 0) {
      logoProvFilename = await saveFile(logoProvFile, currentLogoProv);
    }

    // Update text fields
    const setClauses = fields.map((f) => `\`${f}\` = ?`).join(', ');
    const values: any[] = fields.map((f) => formData.get(f) as string);

    // Add logo fields
    const updateQuery = `UPDATE sekolah SET ${setClauses}, logo = ?, logo_prov = ? WHERE id_sekolah = ?`;
    values.push(logoFilename || '', logoProvFilename || '', SEKOLAH_ID);

    await pool.query(updateQuery, values);

    const [kepalaRows]: any = await pool.query(
      `SELECT id_kepala_sekolah
       FROM kepala_sekolah
       WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
       ORDER BY id_kepala_sekolah DESC
       LIMIT 1`,
      [periode.tahun, periode.semester]
    );
    const kepalaId = kepalaRows[0]?.id_kepala_sekolah;

    if (kepalaId) {
      await pool.query(
        `UPDATE kepala_sekolah
         SET nama = ?, nip = ?, nuptk = ?, deleted_at = NULL
         WHERE id_kepala_sekolah = ?`,
        [kepala.nama || '', kepala.nip || '', kepala.nuptk || '', kepalaId]
      );
      await pool.query(
        `UPDATE kepala_sekolah
         SET deleted_at = NOW()
         WHERE tahun = ? AND semester = ?
           AND id_kepala_sekolah <> ? AND deleted_at IS NULL`,
        [periode.tahun, periode.semester, kepalaId]
      );
    } else {
      await pool.query(
        `INSERT INTO kepala_sekolah (tahun, semester, nama, nip, nuptk)
         VALUES (?, ?, ?, ?, ?)`,
        [
          periode.tahun,
          periode.semester,
          kepala.nama || '',
          kepala.nip || '',
          kepala.nuptk || '',
        ]
      );
    }

    revalidatePath('/tu/profil');
    return { success: true } as const;
  } catch (e: any) {
    console.error('Error updateProfil:', e);
    return { success: false, error: e?.message || 'Gagal menyimpan data' } as const;
  }
}
