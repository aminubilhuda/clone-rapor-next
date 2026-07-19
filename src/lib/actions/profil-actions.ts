'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { SEKOLAH_ID } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

async function saveFile(file: File, currentFilename: string | null): Promise<string | null> {
  if (!file || file.size === 0) return currentFilename;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'png';
  const filename = `logo_${Date.now()}.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'sekolah');
  const filepath = join(uploadDir, filename);

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

    revalidatePath('/tu/profil');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}
