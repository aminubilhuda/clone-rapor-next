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

  // 1. Data Identitas & Pribadi Siswa
  const namaSiswa = (formData.get('nama_siswa') as string)?.trim();
  const nis = (formData.get('nis') as string)?.trim() || '';
  const nikPd = (formData.get('nik_pd') as string)?.trim() || null;
  const nkk = (formData.get('nkk') as string)?.trim() || null;
  const kontakSiswa = (formData.get('kontak_siswa') as string)?.trim() || '';
  const tempatLahir = (formData.get('tempat_lahir') as string)?.trim() || '';
  const tanggalLahirRaw = (formData.get('tanggal_lahir') as string)?.trim();
  const tanggalLahir = tanggalLahirRaw || '1970-01-01';

  const kelaminRaw = formData.get('kelamin') as string;
  const kelamin = kelaminRaw ? Number(kelaminRaw) : null;
  const agamaRaw = formData.get('agama') as string;
  const agama = agamaRaw ? Number(agamaRaw) : null;
  const jurusanRaw = formData.get('jurusan') as string;
  const jurusan = jurusanRaw ? Number(jurusanRaw) : null;

  const hubKeluargaRaw = formData.get('hub_keluarga') as string;
  const hubKeluarga = hubKeluargaRaw ? Number(hubKeluargaRaw) : null;
  const jumlahSaudaraRaw = formData.get('jumlah_saudara') as string;
  const jumlahSaudara = jumlahSaudaraRaw ? Number(jumlahSaudaraRaw) : 0;
  const anakKeRaw = formData.get('anak_ke') as string;
  const anakKe = anakKeRaw ? Number(anakKeRaw) : 0;

  const alamat = (formData.get('alamat') as string)?.trim() || '';
  const alamatOrtu = (formData.get('alamat_orang_tua') as string)?.trim() || '';

  // 2. Data Ayah
  const namaAyah = (formData.get('nama_ayah') as string)?.trim() || '';
  const nikAyah = (formData.get('nik_ayah') as string)?.trim() || null;
  const tahunAyahRaw = formData.get('tahun_ayah') as string;
  const tahunAyah = tahunAyahRaw ? Number(tahunAyahRaw) : 0;
  const pendidikanAyah = (formData.get('pendidikan_ayah') as string)?.trim() || '';
  const pekerjaanAyah = (formData.get('pekerjaan_ayah') as string)?.trim() || '';
  const kontakAyah = (formData.get('kontak_ayah') as string)?.trim() || '';

  // 3. Data Ibu
  const namaIbu = (formData.get('nama_ibu') as string)?.trim() || '';
  const nikIbu = (formData.get('nik_ibu') as string)?.trim() || null;
  const tahunIbuRaw = formData.get('tahun_ibu') as string;
  const tahunIbu = tahunIbuRaw ? Number(tahunIbuRaw) : 0;
  const pendidikanIbu = (formData.get('pendidikan_ibu') as string)?.trim() || '';
  const pekerjaanIbu = (formData.get('pekerjaan_ibu') as string)?.trim() || '';
  const kontakIbu = (formData.get('kontak_ibu') as string)?.trim() || '';

  // 4. Data Wali
  const namaWali = (formData.get('nama_wali') as string)?.trim() || '';
  const alamatWali = (formData.get('alamat_wali') as string)?.trim() || '';
  const pekerjaanWali = (formData.get('pekerjaan_wali') as string)?.trim() || '';
  const kontakWali = (formData.get('kontak_wali') as string)?.trim() || '';

  // 5. Data Pendaftaran Masuk
  const terimaKelas = (formData.get('terima_kelas') as string)?.trim() || null;
  const terimaTingkatRaw = formData.get('terima_tingkat') as string;
  const terimaTingkat = terimaTingkatRaw ? Number(terimaTingkatRaw) : null;
  const terimaTanggal = (formData.get('terima_tanggal') as string)?.trim() || null;
  const sekolahAsal = (formData.get('sekolah_asal') as string)?.trim() || null;
  const jenisSiswaRaw = formData.get('jenis_siswa') as string;
  const jenisSiswa = jenisSiswaRaw ? Number(jenisSiswaRaw) : 1;

  if (!namaSiswa) {
    return { success: false, error: 'Nama siswa wajib diisi' } as const;
  }

  if (!tanggalLahirRaw) {
    return { success: false, error: 'Tanggal lahir tidak boleh kosong' } as const;
  }

  try {
    // Check NIS duplicate against other students
    if (nis && nis !== '0') {
      const [nisDup]: any = await pool.query(
        `SELECT id_siswa FROM siswa WHERE nis = ? AND id_siswa != ? AND deleted_at IS NULL`,
        [nis, idSiswa]
      );
      if (nisDup.length > 0) {
        return { success: false, error: `NIS "${nis}" sudah digunakan oleh siswa lain` } as const;
      }
    }

    const fields = [
      'nama_siswa = ?',
      'nis = ?',
      'nik_pd = ?',
      'nkk = ?',
      'tempat_lahir = ?',
      'tanggal_lahir = ?',
      'kelamin = ?',
      'agama = ?',
      'jurusan = ?',
      'kontak_siswa = ?',
      'hub_keluarga = ?',
      'jumlah_saudara = ?',
      'anak_ke = ?',
      'alamat = ?',
      'alamat_orang_tua = ?',
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
      'nama_wali = ?',
      'alamat_wali = ?',
      'pekerjaan_wali = ?',
      'kontak_wali = ?',
      'terima_kelas = ?',
      'terima_tingkat = ?',
      'terima_tanggal = ?',
      'sekolah_asal = ?',
      'jenis_siswa = ?',
    ];

    const values: any[] = [
      namaSiswa,
      nis,
      nikPd,
      nkk,
      tempatLahir,
      tanggalLahir,
      kelamin,
      agama,
      jurusan,
      kontakSiswa,
      hubKeluarga,
      jumlahSaudara,
      anakKe,
      alamat,
      alamatOrtu,
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
      namaWali,
      alamatWali,
      pekerjaanWali,
      kontakWali,
      terimaKelas,
      terimaTingkat,
      terimaTanggal,
      sekolahAsal,
      jenisSiswa,
      idSiswa,
    ];

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
      return { success: false, error: 'Data yang dimasukkan duplikat dengan siswa lain' } as const;
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

export async function updateSiswaAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id_siswa || session.user.jabatan !== JABATAN.SISWA) {
    return { success: false, error: 'Sesi login tidak valid' } as const;
  }

  const idSiswa = session.user.id_siswa;
  const username = (formData.get('username') as string)?.trim();
  const newPassword = (formData.get('new_password') as string)?.trim();
  const confirmPassword = (formData.get('confirm_password') as string)?.trim();

  if (!username) {
    return { success: false, error: 'Username wajib diisi' } as const;
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
    // Check username duplicate against other students
    const [userDup]: any = await pool.query(
      `SELECT id_siswa FROM siswa WHERE username = ? AND id_siswa != ? AND deleted_at IS NULL`,
      [username, idSiswa]
    );
    if (userDup.length > 0) {
      return { success: false, error: `Username "${username}" sudah digunakan oleh siswa lain` } as const;
    }

    const fields = ['username = ?'];
    const values: any[] = [username];

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

    revalidatePath('/siswa/akun');
    revalidatePath('/siswa/profile');
    revalidatePath('/siswa');
    return { success: true } as const;
  } catch (e: any) {
    console.error('Error updateSiswaAccount:', e);
    if (e.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Username sudah digunakan di sistem' } as const;
    }
    return { success: false, error: e?.message || 'Gagal menyimpan data akun' } as const;
  }
}