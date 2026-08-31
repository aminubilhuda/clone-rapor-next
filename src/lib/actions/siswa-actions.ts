'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { normalizePhone } from '@/lib/utils/normalize-phone';
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

export async function getSiswaList(search: string, page: number, perPage: number, tahun: number, semester: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return [];

  const offset = page * perPage;
  const like = `%${search}%`;
  const cols = ['s.nama_siswa', 's.nis', 's.nisn', 'jk.jenis_kelamin', 'a.agama', 'kk.kompetensi_keahlian', 'COALESCE(k.nama_kelas, \'Belum Bergabung\')'];
  const where = cols.map((c) => `${c} LIKE ?`).join(' OR ');

  const [rows]: any = await pool.query(`
    SELECT
      s.id_siswa, s.nama_siswa, s.nik_pd, s.nkk,
      s.nis, s.nisn, s.terima_kelas,
      s.tempat_lahir, s.tanggal_lahir, s.kelamin, s.agama, s.jurusan,
      s.kontak_siswa, s.hub_keluarga, s.jumlah_saudara, s.anak_ke,
      s.nama_ayah, s.nik_ayah, s.tahun_ayah, s.pendidikan_ayah, s.pekerjaan_ayah, s.kontak_ayah,
      s.nama_ibu, s.nik_ibu, s.tahun_ibu, s.pendidikan_ibu, s.pekerjaan_ibu, s.kontak_ibu,
      s.alamat, s.alamat_orang_tua,
      s.nama_wali, s.alamat_wali, s.pekerjaan_wali, s.kontak_wali,
      s.terima_tingkat, s.sekolah_asal, s.terima_tanggal,
      s.username, s.foto, s.jenis_siswa, s.aktif,
      jk.jenis_kelamin, a.agama,
      kk.kompetensi_keahlian,
      COALESCE(k.nama_kelas, 'Belum Bergabung') as kelas_display
    FROM siswa s
    LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
    LEFT JOIN agama a ON s.agama = a.id_agama
    LEFT JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
    LEFT JOIN (
      SELECT id_siswa, id_kelas FROM siswa_kelas
      WHERE tahun = ? AND semester = ?
      GROUP BY id_siswa
    ) sk ON s.id_siswa = sk.id_siswa
    LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
    WHERE s.deleted_at IS NULL AND s.aktif = 1
      AND (${where})
    ORDER BY s.id_siswa ASC
    LIMIT ? OFFSET ?
  `, [tahun, semester, ...Array(cols.length).fill(like), perPage, offset]);

  return rows.map((s: any) => {
    let tglFormatted = '';
    const tgl = s.tanggal_lahir;
    if (tgl) {
      try {
        const d = typeof tgl === 'string' ? new Date(tgl + 'T00:00:00') : new Date(tgl);
        if (!isNaN(d.getTime())) {
          const hari = String(d.getDate()).padStart(2, '0');
          const bulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
          ][d.getMonth()];
          const tahun = d.getFullYear();
          tglFormatted = `${hari} ${bulan} ${tahun}`;
        }
      } catch {}
    }
    return {
      ...s,
      tempat_tanggal_lahir: tglFormatted ? `${s.tempat_lahir}, ${tglFormatted}` : s.tempat_lahir,
    };
  });
}

export async function getSiswaCount(search: string, tahun: number, semester: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return 0;

  const like = `%${search}%`;
  const cols = ['s.nama_siswa', 's.nis', 's.nisn', 'jk.jenis_kelamin', 'a.agama', 'kk.kompetensi_keahlian', 'COALESCE(k.nama_kelas, \'Belum Bergabung\')'];
  const where = cols.map((c) => `${c} LIKE ?`).join(' OR ');

  const [rows]: any = await pool.query(`
    SELECT COUNT(*) as total
    FROM siswa s
    LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
    LEFT JOIN agama a ON s.agama = a.id_agama
    LEFT JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
    LEFT JOIN (
      SELECT id_siswa, id_kelas FROM siswa_kelas
      WHERE tahun = ? AND semester = ?
      GROUP BY id_siswa
    ) sk ON s.id_siswa = sk.id_siswa
    LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
    WHERE s.deleted_at IS NULL AND s.aktif = 1
      AND (${where})
  `, [tahun, semester, ...Array(cols.length).fill(like)]);

  return rows[0]?.total ?? 0;
}

export async function updateSiswa(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_siswa') as string;
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
  const kontakSiswa = normalizePhone(formData.get('kontak_siswa') as string) || null;
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
  const kontakAyah = normalizePhone(formData.get('kontak_ayah') as string) || null;
  const namaIbu = (formData.get('nama_ibu') as string)?.trim() || null;
  const nikIbu = (formData.get('nik_ibu') as string)?.trim() || null;
  const tahunIbuRaw = formData.get('tahun_ibu') as string;
  const tahunIbu = tahunIbuRaw ? Number(tahunIbuRaw) : 0;
  const pendidikanIbu = (formData.get('pendidikan_ibu') as string)?.trim() || null;
  const pekerjaanIbu = (formData.get('pekerjaan_ibu') as string)?.trim() || null;
  const kontakIbu = normalizePhone(formData.get('kontak_ibu') as string) || null;
  const alamat = (formData.get('alamat') as string)?.trim() || null;
  const alamatOrtu = (formData.get('alamat_orang_tua') as string)?.trim() || null;
  const namaWali = (formData.get('nama_wali') as string)?.trim() || null;
  const alamatWali = (formData.get('alamat_wali') as string)?.trim() || null;
  const pekerjaanWali = (formData.get('pekerjaan_wali') as string)?.trim() || null;
  const kontakWali = normalizePhone(formData.get('kontak_wali') as string) || null;
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
    if (!id) {
      // Check username duplicate in siswa table
      const [userDup]: any = await pool.query(
        `SELECT id_siswa FROM siswa WHERE username = ? AND deleted_at IS NULL`,
        [username]
      );
      if (userDup.length > 0) {
        return { success: false, error: `Username "${username}" sudah digunakan siswa lain` } as const;
      }

      // Cek duplikat NIS/NISN sebelum insert
      if (nis || nisn) {
        const conds: string[] = [];
        const params: any[] = [];
        if (nis) { conds.push('nis = ?'); params.push(nis); }
        if (nisn) { conds.push('nisn = ?'); params.push(nisn); }
        const [existing]: any = await pool.query(
          `SELECT id_siswa, nis, nisn FROM siswa
          WHERE deleted_at IS NULL AND (${conds.join(' OR ')})`,
          params
        );
        if (existing.length > 0) {
          const dup = existing[0];
          if (nis && dup.nis === nis) return { success: false, error: `NIS "${nis}" sudah digunakan siswa lain` } as const;
          if (nisn && dup.nisn === nisn) return { success: false, error: `NISN "${nisn}" sudah digunakan siswa lain` } as const;
        }
      }

      if (!hashedPassword) return { success: false, error: 'Password wajib diisi untuk siswa baru' } as const;

      await pool.query(
        `INSERT INTO siswa (
          nama_siswa, nik_pd, nkk, nis, nisn,
          tempat_lahir, tanggal_lahir, kelamin, agama,
          kontak_siswa, hub_keluarga, jumlah_saudara, anak_ke,
          nama_ayah, nik_ayah, tahun_ayah, pendidikan_ayah, pekerjaan_ayah, kontak_ayah,
          nama_ibu, nik_ibu, tahun_ibu, pendidikan_ibu, pekerjaan_ibu, kontak_ibu,
          alamat, alamat_orang_tua,
          nama_wali, alamat_wali, pekerjaan_wali, kontak_wali,
          jurusan, terima_tingkat, terima_kelas, sekolah_asal,
          terima_tanggal, jenis_siswa, username, password, pass, foto, aktif
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [namaSiswa, nikPd, nkk, nis, nisn,
          tempatLahir, tanggalLahir || '1970-01-01', kelamin, agama,
          kontakSiswa, hubKeluarga, jumlahSaudara, anakKe,
          namaAyah, nikAyah, tahunAyah, pendidikanAyah, pekerjaanAyah, kontakAyah,
          namaIbu, nikIbu, tahunIbu, pendidikanIbu, pekerjaanIbu, kontakIbu,
          alamat, alamatOrtu,
          namaWali, alamatWali, pekerjaanWali, kontakWali,
          jurusan, (await resolveTingkat(terimaKelas)) ?? terimaTingkat, terimaKelas, sekolahAsal,
          terimaTanggal, jenisSiswa, username, hashedPassword, '', '']
      );
    } else {
      // Edit mode: check username duplicate
      const [userDup]: any = await pool.query(
        `SELECT id_siswa FROM siswa WHERE username = ? AND id_siswa != ? AND deleted_at IS NULL`,
        [username, id]
      );
      if (userDup.length > 0) {
        return { success: false, error: `Username "${username}" sudah digunakan siswa lain` } as const;
      }

      // Check NIS/NISN duplicate
      if (nis || nisn) {
        const conds: string[] = [];
        const params: any[] = [];
        if (nis) { conds.push('nis = ?'); params.push(nis); }
        if (nisn) { conds.push('nisn = ?'); params.push(nisn); }
        const [existing]: any = await pool.query(
          `SELECT id_siswa, nis, nisn FROM siswa
          WHERE deleted_at IS NULL AND id_siswa != ? AND (${conds.join(' OR ')})`,
          [id, ...params]
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
      const values: any[] = [namaSiswa, nikPd, nkk, nis, nisn, tempatLahir, tanggalLahir || '1970-01-01', kelamin, agama, kontakSiswa, hubKeluarga, jumlahSaudara, anakKe, namaAyah, nikAyah, tahunAyah, pendidikanAyah, pekerjaanAyah, kontakAyah, namaIbu, nikIbu, tahunIbu, pendidikanIbu, pekerjaanIbu, kontakIbu, alamat, alamatOrtu, namaWali, alamatWali, pekerjaanWali, kontakWali, jurusan, (await resolveTingkat(terimaKelas)) ?? terimaTingkat, terimaKelas, sekolahAsal, terimaTanggal, jenisSiswa, username];

      if (hashedPassword) {
        fields.push('password = ?');
        values.push(hashedPassword);
      }

      values.push(id);
      await pool.query(`UPDATE siswa SET ${fields.join(', ')} WHERE id_siswa = ?`, values);
    }

    revalidatePath('/tu/kesiswaan');
    return { success: true } as const;
  } catch (e: any) {
    console.error('Error updateSiswa:', e);
    if (e.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Username, NIS, atau NISN sudah terdaftar di sistem' } as const;
    }
    return { success: false, error: e?.message || 'Gagal menyimpan data' } as const;
  }
}

export async function importSiswa(rows: {
  nama_siswa?: string;
  nik_pd?: string;
  nkk?: string;
  nis?: string;
  nisn?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string | null;
  kelamin?: number | null;
  agama?: number | null;
  kontak_siswa?: string;
  hub_keluarga?: number | null;
  jumlah_saudara?: number;
  anak_ke?: number;
  nama_ayah?: string;
  nik_ayah?: string;
  tahun_ayah?: number;
  pendidikan_ayah?: string;
  pekerjaan_ayah?: string;
  kontak_ayah?: string;
  nama_ibu?: string;
  nik_ibu?: string;
  tahun_ibu?: number;
  pendidikan_ibu?: string;
  pekerjaan_ibu?: string;
  kontak_ibu?: string;
  alamat?: string;
  alamat_orang_tua?: string;
  nama_wali?: string;
  alamat_wali?: string;
  pekerjaan_wali?: string;
  kontak_wali?: string;
  jurusan?: number | null;
  terima_tingkat?: number | null;
  terima_kelas?: string;
  sekolah_asal?: string;
  terima_tanggal?: string | null;
  jenis_siswa?: number;
  username?: string;
  password?: string;
}[]) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  // Batch: ambil semua NIS + NISN yang sudah ada → Map ke id_siswa
  const [existingRows]: any = await pool.query(
    `SELECT id_siswa, nis, nisn FROM siswa WHERE deleted_at IS NULL AND (nis IS NOT NULL AND nis != '' OR nisn IS NOT NULL AND nisn != '')`
  );
  const existingNisToId = new Map<string, number>();
  const existingNisnToId = new Map<string, number>();
  for (const row of existingRows) {
    if (row.nis) existingNisToId.set(String(row.nis), row.id_siswa);
    if (row.nisn) existingNisnToId.set(String(row.nisn), row.id_siswa);
  }

  // Batch: ambil data tingkat untuk auto-detect
  const [tingkatRows]: any = await pool.query(
    `SELECT id_tingkat, tabjad FROM tingkat WHERE deleted_at IS NULL`
  );
  const tabjadToId = new Map<string, number>();
  for (const t of tingkatRows) {
    if (t.tabjad) tabjadToId.set(String(t.tabjad).trim().toUpperCase(), t.id_tingkat);
  }

  // Phase 1: Validasi & kategorisasi semua baris sekaligus
  interface PreparedRow {
    index: number;
    data: (typeof rows)[0];
    existingId: number | null;
    terimaTingkat: number | null;
    hash?: string;
  }

  const toInsert: PreparedRow[] = [];
  const toUpdate: PreparedRow[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.nama_siswa) { errors.push(`Baris ${i + 1}: nama siswa wajib diisi`); continue; }
    if (!r.username) { errors.push(`Baris ${i + 1} (${r.nama_siswa}): username wajib diisi`); continue; }

    // Auto-detect terima_tingkat dari terima_kelas jika tidak diisi
    let terimaTingkat = r.terima_tingkat ?? null;
    if (!terimaTingkat && r.terima_kelas) {
      const roman = r.terima_kelas.trim().split(/\s+/)[0].toUpperCase();
      const found = tabjadToId.get(roman);
      if (found) terimaTingkat = found;
    }

    // Cari existing by NIS atau NISN
    const existingId = (r.nis && existingNisToId.get(r.nis)) || (r.nisn && existingNisnToId.get(r.nisn)) || null;

    if (existingId && existingId > 0) {
      toUpdate.push({ index: i, data: r, existingId, terimaTingkat });
    } else {
      if (!r.password) {
        errors.push(`Baris ${i + 1} (${r.nama_siswa}): password wajib diisi untuk siswa baru`);
        continue;
      }
      toInsert.push({ index: i, data: r, existingId: null, terimaTingkat });
    }
  }

  // Phase 2: Hash password secara paralel (chunked concurrency)
  const HASH_CONCURRENCY = 10;
  const needsHash: PreparedRow[] = [
    ...toInsert,
    ...toUpdate.filter(p => p.data.password),
  ];
  for (let i = 0; i < needsHash.length; i += HASH_CONCURRENCY) {
    const chunk = needsHash.slice(i, i + HASH_CONCURRENCY);
    await Promise.all(chunk.map(async (p) => {
      p.hash = await bcrypt.hash(p.data.password!, 10);
    }));
  }

  // Phase 3: Eksekusi dalam transaction
  let inserted = 0;
  let updated = 0;
  const conn = await pool.getConnection();

  const INSERT_SQL = `INSERT INTO siswa (
    nama_siswa, nik_pd, nkk, nis, nisn,
    tempat_lahir, tanggal_lahir, kelamin, agama,
    kontak_siswa, hub_keluarga, jumlah_saudara, anak_ke,
    nama_ayah, nik_ayah, tahun_ayah, pendidikan_ayah, pekerjaan_ayah, kontak_ayah,
    nama_ibu, nik_ibu, tahun_ibu, pendidikan_ibu, pekerjaan_ibu, kontak_ibu,
    alamat, alamat_orang_tua,
    nama_wali, alamat_wali, pekerjaan_wali, kontak_wali,
    jurusan, terima_tingkat, terima_kelas, sekolah_asal,
    terima_tanggal, jenis_siswa, username, password, pass, foto, aktif
  )`;

  const buildInsertValues = (p: PreparedRow) => {
    const r = p.data;
    return [
      r.nama_siswa, r.nik_pd || null, r.nkk || null, r.nis || '', r.nisn || '',
      r.tempat_lahir || '', r.tanggal_lahir || '1970-01-01', r.kelamin || null, r.agama || null,
      normalizePhone(r.kontak_siswa), r.hub_keluarga || null, r.jumlah_saudara || 0, r.anak_ke || 0,
      r.nama_ayah || '', r.nik_ayah || null, r.tahun_ayah || 0, r.pendidikan_ayah || '', r.pekerjaan_ayah || '', normalizePhone(r.kontak_ayah),
      r.nama_ibu || '', r.nik_ibu || null, r.tahun_ibu || 0, r.pendidikan_ibu || '', r.pekerjaan_ibu || '', normalizePhone(r.kontak_ibu),
      r.alamat || '', r.alamat_orang_tua || '',
      r.nama_wali || '', r.alamat_wali || '', r.pekerjaan_wali || '', normalizePhone(r.kontak_wali),
      r.jurusan || 0, p.terimaTingkat, r.terima_kelas || '', r.sekolah_asal || '',
      r.terima_tanggal || null, r.jenis_siswa || 1, r.username, p.hash, '', '',
    ];
  };

  try {
    await conn.beginTransaction();

    // Batch INSERT siswa baru (chunk 50 baris per query)
    const INSERT_CHUNK = 50;
    const ROW_PLACEHOLDER = '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)';

    for (let i = 0; i < toInsert.length; i += INSERT_CHUNK) {
      const chunk = toInsert.slice(i, i + INSERT_CHUNK);
      const placeholders = chunk.map(() => ROW_PLACEHOLDER).join(', ');
      const values: any[] = [];
      for (const p of chunk) values.push(...buildInsertValues(p));

      try {
        await conn.query(`${INSERT_SQL} VALUES ${placeholders}`, values);
        inserted += chunk.length;
        for (const p of chunk) {
          if (p.data.nis) existingNisToId.set(p.data.nis, -1);
          if (p.data.nisn) existingNisnToId.set(p.data.nisn, -1);
        }
      } catch {
        // Batch gagal — fallback per-baris untuk identifikasi error
        for (const p of chunk) {
          try {
            await conn.query(
              `${INSERT_SQL} VALUES ${ROW_PLACEHOLDER}`,
              buildInsertValues(p)
            );
            inserted++;
            if (p.data.nis) existingNisToId.set(p.data.nis, -1);
            if (p.data.nisn) existingNisnToId.set(p.data.nisn, -1);
          } catch (e2: any) {
            errors.push(`Baris ${p.index + 1} (${p.data.nama_siswa}): ${e2?.message || 'Gagal menyimpan data'}`);
          }
        }
      }
    }

    // Individual UPDATE untuk siswa existing
    for (const p of toUpdate) {
      const r = p.data;
      try {
        const pwClause = p.hash ? ', password = ?' : '';
        const pwVal = p.hash ? [p.hash] : [];
        await conn.query(
          `UPDATE siswa SET
            nama_siswa = ?, nik_pd = ?, nkk = ?, nis = ?, nisn = ?,
            tempat_lahir = ?, tanggal_lahir = ?, kelamin = ?, agama = ?,
            kontak_siswa = ?, hub_keluarga = ?, jumlah_saudara = ?, anak_ke = ?,
            nama_ayah = ?, nik_ayah = ?, tahun_ayah = ?, pendidikan_ayah = ?, pekerjaan_ayah = ?, kontak_ayah = ?,
            nama_ibu = ?, nik_ibu = ?, tahun_ibu = ?, pendidikan_ibu = ?, pekerjaan_ibu = ?, kontak_ibu = ?,
            alamat = ?, alamat_orang_tua = ?,
            nama_wali = ?, alamat_wali = ?, pekerjaan_wali = ?, kontak_wali = ?,
            jurusan = ?, terima_tingkat = ?, terima_kelas = ?, sekolah_asal = ?,
            terima_tanggal = ?, jenis_siswa = ?, username = ?
            ${pwClause}
          WHERE id_siswa = ?`,
          [
            r.nama_siswa,
            r.nik_pd || null, r.nkk || null, r.nis || '', r.nisn || '',
            r.tempat_lahir || '', r.tanggal_lahir || '1970-01-01', r.kelamin || null, r.agama || null,
            normalizePhone(r.kontak_siswa), r.hub_keluarga || null, r.jumlah_saudara || 0, r.anak_ke || 0,
            r.nama_ayah || '', r.nik_ayah || null, r.tahun_ayah || 0, r.pendidikan_ayah || '', r.pekerjaan_ayah || '', normalizePhone(r.kontak_ayah),
            r.nama_ibu || '', r.nik_ibu || null, r.tahun_ibu || 0, r.pendidikan_ibu || '', r.pekerjaan_ibu || '', normalizePhone(r.kontak_ibu),
            r.alamat || '', r.alamat_orang_tua || '',
            r.nama_wali || '', r.alamat_wali || '', r.pekerjaan_wali || '', normalizePhone(r.kontak_wali),
            r.jurusan || 0, p.terimaTingkat, r.terima_kelas || '', r.sekolah_asal || '',
            r.terima_tanggal || null, r.jenis_siswa || 1, r.username,
            ...pwVal,
            p.existingId,
          ]
        );
        updated++;
      } catch (e: any) {
        errors.push(`Baris ${p.index + 1} (${r.nama_siswa}): ${e?.message || 'Gagal menyimpan data'}`);
      }
    }

    await conn.commit();
  } catch (e: any) {
    await conn.rollback();
    return { success: false, error: 'Gagal import data: ' + (e?.message || ''), count: 0, inserted: 0, updated: 0, errors } as const;
  } finally {
    conn.release();
  }

  revalidatePath('/tu/kesiswaan');
  return { success: errors.length === 0, count: inserted + updated, inserted, updated, errors } as const;
}

export async function deleteSiswa(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE siswa SET deleted_at = NOW() WHERE id_siswa = ?', [id]);
    await conn.query('UPDATE siswa_kelas SET deleted_at = NOW() WHERE id_siswa = ?', [id]);
    await conn.query('UPDATE mapel_siswa SET deleted_at = NOW() WHERE id_siswa = ?', [id]);
    await conn.commit();
    revalidatePath('/tu/kesiswaan');
    return { success: true } as const;
  } catch (e: any) {
    await conn.rollback();
    return { success: false, error: 'Gagal menghapus data' } as const;
  } finally {
    conn.release();
  }
}

export async function nonaktifkanSiswa(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE siswa SET aktif = 0 WHERE id_siswa = ?', [id]);
    await conn.query(
      'UPDATE siswa_kelas SET deleted_at = NOW(), status = 2 WHERE id_siswa = ? AND deleted_at IS NULL',
      [id]
    );
    await conn.query(
      'UPDATE mapel_siswa SET deleted_at = NOW() WHERE id_siswa = ? AND deleted_at IS NULL',
      [id]
    );
    await conn.commit();
    revalidatePath('/tu/kesiswaan');
    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch (e: any) {
    await conn.rollback();
    return { success: false, error: 'Gagal menonaktifkan siswa' } as const;
  } finally {
    conn.release();
  }
}

export async function generateUsernamePasswordBulk() {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    const [rows]: any = await pool.query(`
      SELECT id_siswa, nisn FROM siswa
      WHERE deleted_at IS NULL AND aktif = 1
        AND nisn IS NOT NULL AND nisn != ''
    `);

    let updated = 0;
    for (const s of rows) {
      const nisnStr = String(s.nisn).trim();
      const hash = await bcrypt.hash(nisnStr, 10);
      await pool.query(
        `UPDATE siswa SET username = ?, password = ? WHERE id_siswa = ?`,
        [nisnStr, hash, s.id_siswa]
      );
      updated++;
    }

    revalidatePath('/tu/kesiswaan');
    return { success: true, count: updated } as const;
  } catch (e: any) {
    return { success: false, error: e?.message || 'Gagal generate username/password' } as const;
  }
}
