'use server';

import { auth } from '@/lib/auth';
import { JABATAN } from '@/lib/constants';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateSiswaProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id_siswa || session.user.jabatan !== JABATAN.SISWA) {
    return { success: false, error: 'Sesi login tidak valid' } as const;
  }

  const idSiswa = session.user.id_siswa;

  // Editable Student Fields
  const username = (formData.get('username') as string)?.trim();
  const kontakSiswa = (formData.get('kontak_siswa') as string)?.trim() || null;
  const alamat = (formData.get('alamat') as string)?.trim() || null;
  const alamatOrtu = (formData.get('alamat_orang_tua') as string)?.trim() || null;

  const tempatLahir = (formData.get('tempat_lahir') as string)?.trim() || null;
  const tanggalLahirRaw = (formData.get('tanggal_lahir') as string)?.trim();
  const tanggalLahir = tanggalLahirRaw || '1970-01-01';

  const kelaminRaw = formData.get('kelamin') as string;
  const kelamin = kelaminRaw ? Number(kelaminRaw) : null;
  const agamaRaw = formData.get('agama') as string;
  const agama = agamaRaw ? Number(agamaRaw) : null;

  const hubKeluargaRaw = formData.get('hub_keluarga') as string;
  const hubKeluarga = hubKeluargaRaw ? Number(hubKeluargaRaw) : null;
  const jumlahSaudaraRaw = formData.get('jumlah_saudara') as string;
  const jumlahSaudara = jumlahSaudaraRaw ? Number(jumlahSaudaraRaw) : 0;
  const anakKeRaw = formData.get('anak_ke') as string;
  const anakKe = anakKeRaw ? Number(anakKeRaw) : 0;

  // Data Ayah
  const namaAyah = (formData.get('nama_ayah') as string)?.trim() || null;
  const nikAyah = (formData.get('nik_ayah') as string)?.trim() || null;
  const tahunAyahRaw = formData.get('tahun_ayah') as string;
  const tahunAyah = tahunAyahRaw ? Number(tahunAyahRaw) : 0;
  const pendidikanAyah = (formData.get('pendidikan_ayah') as string)?.trim() || null;
  const pekerjaanAyah = (formData.get('pekerjaan_ayah') as string)?.trim() || null;
  const kontakAyah = (formData.get('kontak_ayah') as string)?.trim() || null;

  // Data Ibu
  const namaIbu = (formData.get('nama_ibu') as string)?.trim() || null;
  const nikIbu = (formData.get('nik_ibu') as string)?.trim() || null;
  const tahunIbuRaw = formData.get('tahun_ibu') as string;
  const tahunIbu = tahunIbuRaw ? Number(tahunIbuRaw) : 0;
  const pendidikanIbu = (formData.get('pendidikan_ibu') as string)?.trim() || null;
  const pekerjaanIbu = (formData.get('pekerjaan_ibu') as string)?.trim() || null;
  const kontakIbu = (formData.get('kontak_ibu') as string)?.trim() || null;

  // Data Wali
  const namaWali = (formData.get('nama_wali') as string)?.trim() || null;
  const alamatWali = (formData.get('alamat_wali') as string)?.trim() || null;
  const pekerjaanWali = (formData.get('pekerjaan_wali') as string)?.trim() || null;
  const kontakWali = (formData.get('kontak_wali') as string)?.trim() || null;

  // Password Change
  const newPassword = (formData.get('new_password') as string)?.trim();
  const confirmPassword = (formData.get('confirm_password') as string)?.trim();

  if (!username) {
    return { success: false, error: 'Username wajib diisi' } as const;
  }

  if (!tanggalLahirRaw) {
    return { success: false, error: 'Tanggal lahir tidak boleh kosong' } as const;
  }

  if (newPassword) {
    if (newPassword.length < 4) {
      return { success: false, error: 'Password baru minimal 4 karakter' } as const;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return { success: false, error: 'Konfirmasi password baru tidak cocok' } as const;
    }
  }

  try {
    // Check username duplicate against other users
    const [userDup]: any = await pool.query(
      `SELECT id_siswa FROM siswa WHERE username = ? AND id_siswa != ? AND deleted_at IS NULL`,
      [username, idSiswa]
    );
    if (userDup.length > 0) {
      return { success: false, error: `Username "${username}" sudah digunakan oleh siswa lain` } as const;
    }

    const fields = [
      'username = ?',
      'tempat_lahir = ?',
      'tanggal_lahir = ?',
      'kelamin = ?',
      'agama = ?',
      'kontak_siswa = ?',
      'hub_keluarga = ?',
      'jumlah_saudara = ?',
      'anak_ke = ?',
      'nama_ayah = ?',
      'nik_ayah = ?',
      'tahun_ayah = ?',
      'pendidikan_ayah = ?',
      'pekerjaan_ayah = ?',
      'kontak_ayah = ?',
      'nama_ibu = ?',
      'nik_ibu = ?',
      'tahun_ibu = ?',
      'pendidikan_ibu = ?',
      'pekerjaan_ibu = ?',
      'kontak_ibu = ?',
      'alamat = ?',
      'alamat_orang_tua = ?',
      'nama_wali = ?',
      'alamat_wali = ?',
      'pekerjaan_wali = ?',
      'kontak_wali = ?',
    ];

    const values: any[] = [
      username,
      tempatLahir,
      tanggalLahir,
      kelamin,
      agama,
      kontakSiswa,
      hubKeluarga,
      jumlahSaudara,
      anakKe,
      namaAyah,
      nikAyah,
      tahunAyah,
      pendidikanAyah,
      pekerjaanAyah,
      kontakAyah,
      namaIbu,
      nikIbu,
      tahunIbu,
      pendidikanIbu,
      pekerjaanIbu,
      kontakIbu,
      alamat,
      alamatOrtu,
      namaWali,
      alamatWali,
      pekerjaanWali,
      kontakWali,
    ];

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    values.push(idSiswa);
    await pool.query(
      `UPDATE siswa SET ${fields.join(', ')} WHERE id_siswa = ? AND deleted_at IS NULL`,
      values
    );

    revalidatePath('/siswa/profile');
    revalidatePath('/siswa');
    return { success: true } as const;
  } catch (e: any) {
    console.error('Error updateSiswaProfile:', e);
    if (e.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Username sudah digunakan di sistem' } as const;
    }
    if (
      e?.message?.includes('tanggal_lahir') ||
      e?.sqlMessage?.includes('tanggal_lahir') ||
      (e?.code === 'ER_BAD_NULL_ERROR' && e?.sqlMessage?.includes('tanggal_lahir'))
    ) {
      return { success: false, error: 'Tanggal lahir tidak boleh kosong' } as const;
    }
    return { success: false, error: e?.message || 'Gagal menyimpan data profil' } as const;
  }
}