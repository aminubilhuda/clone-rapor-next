'use server';

import { auth } from '@/lib/auth';
import { JABATAN } from '@/lib/constants';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

async function resolveTingkat(terimaKelas: string | null): Promise<number | null> {
  if (!terimaKelas) return null;
  const roman = terimaKelas.trim().split(/\s+/)[0].toUpperCase();
  const [rows]: any = await pool.query(
    `SELECT id_tingkat FROM tingkat WHERE deleted_at IS NULL AND tabjad = ?`,
    [roman]
  );
  return rows[0]?.id_tingkat ?? null;
}

export async function updateSiswaProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id_siswa || session.user.jabatan !== JABATAN.SISWA) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idSiswa = session.user.id_siswa;
  const namaSiswa = (formData.get('nama_siswa') as string)?.trim();
  const nikPd = (formData.get('nik_pd') as string)?.trim() || null;
  const nkk = (formData.get('nkk') as string)?.trim() || null;
  const nis = (formData.get('nis') as string)?.trim() || null;
  const nisn = (formData.get('nisn') as string)?.trim() || null;
  const tempatLahir = (formData.get('tempat_lahir') as string)?.trim() || null;
  const tanggalLahir = (formData.get('tanggal_lahir') as string)?.trim() || null;
  const kelaminRaw = formData.get('kelamin') as string;
  const kelamin = kelaminRaw ? Number(kelaminRaw) : null;
  const agamaRaw = formData.get('agama') as string;
  const agama = agamaRaw ? Number(agamaRaw) : null;
  const kontakSiswa = (formData.get('kontak_siswa') as string)?.trim() || null;
  const hubKeluargaRaw = formData.get('hub_keluarga') as string;
  const hubKeluarga = hubKeluargaRaw ? Number(hubKeluargaRaw) : null;
  const jumlahSaudaraRaw = formData.get('jumlah_saudara') as string;
  const jumlahSaudara = jumlahSaudaraRaw ? Number(jumlahSaudaraRaw) : 0;
  const anakKeRaw = formData.get('anak_ke') as string;
  const anakKe = anakKeRaw ? Number(anakKeRaw) : 0;
  const namaAyah = (formData.get('nama_ayah') as string)?.trim() || null;
  const nikAyah = (formData.get('nik_ayah') as string)?.trim() || null;
  const tahunAyahRaw = formData.get('tahun_ayah') as string;
  const tahunAyah = tahunAyahRaw ? Number(tahunAyahRaw) : 0;
  const pendidikanAyah = (formData.get('pendidikan_ayah') as string)?.trim() || null;
  const pekerjaanAyah = (formData.get('pekerjaan_ayah') as string)?.trim() || null;
  const kontakAyah = (formData.get('kontak_ayah') as string)?.trim() || null;
  const namaIbu = (formData.get('nama_ibu') as string)?.trim() || null;
  const nikIbu = (formData.get('nik_ibu') as string)?.trim() || null;
  const tahunIbuRaw = formData.get('tahun_ibu') as string;
  const tahunIbu = tahunIbuRaw ? Number(tahunIbuRaw) : 0;
  const pendidikanIbu = (formData.get('pendidikan_ibu') as string)?.trim() || null;
  const pekerjaanIbu = (formData.get('pekerjaan_ibu') as string)?.trim() || null;
  const kontakIbu = (formData.get('kontak_ibu') as string)?.trim() || null;
  const alamat = (formData.get('alamat') as string)?.trim() || null;
  const alamatOrtu = (formData.get('alamat_orang_tua') as string)?.trim() || null;
  const namaWali = (formData.get('nama_wali') as string)?.trim() || null;
  const alamatWali = (formData.get('alamat_wali') as string)?.trim() || null;
  const pekerjaanWali = (formData.get('pekerjaan_wali') as string)?.trim() || null;
  const kontakWali = (formData.get('kontak_wali') as string)?.trim() || null;
  const jurusanRaw = formData.get('jurusan') as string;
  const jurusan = jurusanRaw ? Number(jurusanRaw) : null;
  const terimaTingkatRaw = formData.get('terima_tingkat') as string;
  const terimaTingkat = terimaTingkatRaw ? Number(terimaTingkatRaw) : null;
  const terimaKelas = (formData.get('terima_kelas') as string)?.trim() || null;
  const sekolahAsal = (formData.get('sekolah_asal') as string)?.trim() || null;
  const terimaTanggal = (formData.get('terima_tanggal') as string)?.trim() || null;
  const jenisSiswaRaw = formData.get('jenis_siswa') as string;
  const jenisSiswa = jenisSiswaRaw ? Number(jenisSiswaRaw) : 1;
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  if (!namaSiswa) return { success: false, error: 'Nama siswa wajib diisi' } as const;
  if (!username) return { success: false, error: 'Username wajib diisi' } as const;

  try {
    const [userDup]: any = await pool.query(
      `SELECT id_siswa FROM siswa WHERE username = ? AND id_siswa != ? AND deleted_at IS NULL`,
      [username, idSiswa]
    );
    if (userDup.length > 0) {
      return { success: false, error: `Username "${username}" sudah digunakan siswa lain` } as const;
    }

    if (nis || nisn) {
      const conds: string[] = [];
      const params: any[] = [];
      if (nis) { conds.push('nis = ?'); params.push(nis); }
      if (nisn) { conds.push('nisn = ?'); params.push(nisn); }
      const [existing]: any = await pool.query(
        `SELECT id_siswa, nis, nisn FROM siswa
        WHERE deleted_at IS NULL AND id_siswa != ? AND (${conds.join(' OR ')})`,
        [idSiswa, ...params]
      );
      if (existing.length > 0) {
        const dup = existing[0];
        if (nis && dup.nis === nis) return { success: false, error: `NIS "${nis}" sudah digunakan siswa lain` } as const;
        if (nisn && dup.nisn === nisn) return { success: false, error: `NISN "${nisn}" sudah digunakan siswa lain` } as const;
      }
    }

    const fields = [
      'nama_siswa = ?', 'nik_pd = ?', 'nkk = ?', 'nis = ?', 'nisn = ?',
      'tempat_lahir = ?', 'tanggal_lahir = ?', 'kelamin = ?', 'agama = ?',
      'kontak_siswa = ?', 'hub_keluarga = ?', 'jumlah_saudara = ?', 'anak_ke = ?',
      'nama_ayah = ?', 'nik_ayah = ?', 'tahun_ayah = ?', 'pendidikan_ayah = ?', 'pekerjaan_ayah = ?', 'kontak_ayah = ?',
      'nama_ibu = ?', 'nik_ibu = ?', 'tahun_ibu = ?', 'pendidikan_ibu = ?', 'pekerjaan_ibu = ?', 'kontak_ibu = ?',
      'alamat = ?', 'alamat_orang_tua = ?',
      'nama_wali = ?', 'alamat_wali = ?', 'pekerjaan_wali = ?', 'kontak_wali = ?',
      'jurusan = ?', 'terima_tingkat = ?', 'terima_kelas = ?', 'sekolah_asal = ?',
      'terima_tanggal = ?', 'jenis_siswa = ?', 'username = ?',
    ];
    const values: any[] = [namaSiswa, nikPd, nkk, nis, nisn, tempatLahir, tanggalLahir, kelamin, agama, kontakSiswa, hubKeluarga, jumlahSaudara, anakKe, namaAyah, nikAyah, tahunAyah, pendidikanAyah, pekerjaanAyah, kontakAyah, namaIbu, nikIbu, tahunIbu, pendidikanIbu, pekerjaanIbu, kontakIbu, alamat, alamatOrtu, namaWali, alamatWali, pekerjaanWali, kontakWali, jurusan, (await resolveTingkat(terimaKelas)) ?? terimaTingkat, terimaKelas, sekolahAsal, terimaTanggal, jenisSiswa, username];

    if (hashedPassword) {
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    values.push(idSiswa);
    await pool.query(`UPDATE siswa SET ${fields.join(', ')} WHERE id_siswa = ? AND deleted_at IS NULL`, values);

    revalidatePath('/siswa/profile');
    revalidatePath('/siswa');
    return { success: true } as const;
  } catch (e: any) {
    console.error('Error updateSiswaProfile:', e);
    if (e.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Username, NIS, atau NISN sudah terdaftar di sistem' } as const;
    }
    return { success: false, error: e?.message || 'Gagal menyimpan data' } as const;
  }
}