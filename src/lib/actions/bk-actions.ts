'use server';

import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';
import { pool } from '@/lib/db';
import { requireGuruBK, requireTuAdmin } from '@/lib/actions/auth-guard';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import {
  BIDANG_BK,
  BIDANG_LABEL,
  HEADER_FIELD_LABEL,
  JENIS_BK,
  JENIS_FIELDS,
  PESERTA_FIELD_LABEL,
  bidangToArray,
  formatKelamin,
  isJenisLayananBK,
  type BidangBK,
  type BKStudent,
  type BKSession,
  type JenisLayananBK,
} from '@/lib/bk';

export interface BKClass {
  id_kelas: number;
  nama_kelas: string;
  jumlah: number;
}

export interface BKSesiInput {
  tanggal: string;
  jam?: string | null;
  agenda?: string | null;
  pelaksana?: string | null;
  tempat?: string | null;
  pihak_terlibat?: string | null;
  tujuan?: string | null;
  petugas?: string | null;
  bidang: string[];
  permasalahan?: string | null;
  arahan?: string | null;
  tindak_lanjut?: string | null;
  topik?: string | null;
  pelaksana_dituju?: string | null;
  hasil?: string | null;
  peristiwa?: string | null;
  informan?: string | null;
  pembinaan?: string | null;
  referal?: string | null;
  dirujuk_ke?: string | null;
}

export interface BKPesertaInput {
  idSiswa: number;
  bidang: string[];
  permasalahan?: string | null;
  arahan?: string | null;
  tindak_lanjut?: string | null;
  topik?: string | null;
  pelaksana_dituju?: string | null;
  hasil?: string | null;
  peristiwa?: string | null;
  informan?: string | null;
  pembinaan?: string | null;
  referal?: string | null;
  dirujuk_ke?: string | null;
}

export interface BKGroupInput {
  jenis: JenisLayananBK;
  idKelas: number;
  tanggal: string;
  jam?: string | null;
  agenda?: string | null;
  pelaksana?: string | null;
  tempat?: string | null;
  pihak_terlibat?: string | null;
  tujuan?: string | null;
  petugas?: string | null;
  peserta: BKPesertaInput[];
}

const PESERTA_FIELDS = [
  'permasalahan',
  'arahan',
  'tindak_lanjut',
  'topik',
  'pelaksana_dituju',
  'hasil',
  'peristiwa',
  'informan',
  'pembinaan',
  'referal',
  'dirujuk_ke',
] as const;

function clean(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanBidang(values: string[]): BidangBK[] {
  const allowed = new Set(BIDANG_BK.map((b) => b.key));
  return Array.from(new Set(values.filter((v): v is BidangBK => allowed.has(v as BidangBK))));
}

function isDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTime(value: string | null | undefined): boolean {
  return !value || /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}

function selectedFields(jenis: JenisLayananBK, input: BKSesiInput | BKPesertaInput) {
  const rows: Record<string, string | null> = {};
  for (const field of JENIS_FIELDS[jenis].peserta) {
    rows[field] = clean((input as unknown as Record<string, unknown>)[field] as string | null | undefined);
  }
  return rows;
}

function validatePeserta(
  jenis: JenisLayananBK,
  input: BKSesiInput | BKPesertaInput,
  bidang: BidangBK[],
): string | null {
  if (bidang.length === 0) return 'Pilih minimal satu bidang bimbingan';
  for (const field of JENIS_FIELDS[jenis].required) {
    if (!clean((input as unknown as Record<string, unknown>)[field] as string | null | undefined)) {
      return `${PESERTA_FIELD_LABEL[field] ?? field} wajib diisi`;
    }
  }
  return null;
}

function validateHeader(
  jenis: JenisLayananBK,
  input: BKSesiInput | BKGroupInput,
): string | null {
  for (const field of JENIS_FIELDS[jenis].requiredHeader) {
    if (!clean((input as unknown as Record<string, unknown>)[field] as string | null | undefined)) {
      return `${HEADER_FIELD_LABEL[field] ?? field} wajib diisi`;
    }
  }
  return null;
}

async function kelasOfSiswa(idSiswa: number, tahun: number, semester: number) {
  const [rows]: any = await pool.query(
    `SELECT sk.id_kelas, k.nama_kelas
     FROM siswa_kelas sk
     JOIN kelas k ON k.id_kelas = sk.id_kelas
     WHERE sk.id_siswa = ? AND sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL
     LIMIT 1`,
    [idSiswa, tahun, semester],
  );
  return rows[0] as { id_kelas: number; nama_kelas: string } | undefined;
}

export async function getBKClasses(): Promise<BKClass[]> {
  const auth = await requireGuruBK();
  if (auth.error) return [];
  const sekolah = await getSekolahWithFilter();

  const [rows]: any = await pool.query(
    `SELECT k.id_kelas, k.nama_kelas, COUNT(DISTINCT sk.id_siswa) AS jumlah
     FROM kelas k
     JOIN siswa_kelas sk ON sk.id_kelas = k.id_kelas
       AND sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL
     WHERE k.deleted_at IS NULL
     GROUP BY k.id_kelas, k.nama_kelas
     ORDER BY k.nama_kelas ASC`,
    [sekolah.tahun, sekolah.semester],
  );
  return rows.map((r: any) => ({
    id_kelas: Number(r.id_kelas),
    nama_kelas: r.nama_kelas,
    jumlah: Number(r.jumlah),
  }));
}

export async function getBKStudents(idKelas: number): Promise<BKStudent[]> {
  const auth = await requireGuruBK();
  if (auth.error) return [];
  const sekolah = await getSekolahWithFilter();

  const [rows]: any = await pool.query(
    `SELECT s.id_siswa, s.nama_siswa, s.nis, s.nisn, s.kelamin
     FROM siswa s
     JOIN siswa_kelas sk ON sk.id_siswa = s.id_siswa
     WHERE sk.id_kelas = ? AND sk.tahun = ? AND sk.semester = ?
       AND sk.deleted_at IS NULL AND s.deleted_at IS NULL AND s.aktif = 1
     ORDER BY s.nama_siswa ASC`,
    [idKelas, sekolah.tahun, sekolah.semester],
  );
  return rows as BKStudent[];
}

export async function getBKGrid(jenis: string, idKelas: number) {
  const auth = await requireGuruBK();
  if (auth.error) return { students: [] as BKStudent[], sessions: [] as BKSession[] };
  if (!isJenisLayananBK(jenis) || !idKelas) {
    return { students: [] as BKStudent[], sessions: [] as BKSession[] };
  }
  const sekolah = await getSekolahWithFilter();

  const [students]: any = await pool.query(
    `SELECT s.id_siswa, s.nama_siswa, s.nis, s.nisn, s.kelamin
     FROM siswa s
     JOIN siswa_kelas sk ON sk.id_siswa = s.id_siswa
     WHERE sk.id_kelas = ? AND sk.tahun = ? AND sk.semester = ?
       AND sk.deleted_at IS NULL AND s.deleted_at IS NULL AND s.aktif = 1
     ORDER BY s.nama_siswa ASC`,
    [idKelas, sekolah.tahun, sekolah.semester],
  );

  const [sessions]: any = await pool.query(
    `SELECT l.id_layanan, l.id_user, DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            l.jam, l.agenda, l.pelaksana, l.tempat, l.pihak_terlibat, l.tujuan, l.petugas,
            p.id_siswa, p.bidang_bimbingan, p.permasalahan, p.arahan, p.tindak_lanjut,
            p.topik, p.pelaksana_dituju, p.hasil, p.peristiwa, p.informan,
            p.pembinaan, p.referal, p.dirujuk_ke
     FROM layanan_bk l
     JOIN layanan_bk_peserta p ON p.id_layanan = l.id_layanan
     WHERE l.jenis_layanan = ? AND l.id_kelas = ?
       AND l.tahun = ? AND l.semester = ? AND l.deleted_at IS NULL
     ORDER BY l.tanggal ASC, l.id_layanan ASC`,
    [jenis, idKelas, sekolah.tahun, sekolah.semester],
  );

  return { students: students as BKStudent[], sessions: sessions as BKSession[] };
}

export async function getBKSesi(idLayanan: number, idSiswa: number) {
  const auth = await requireGuruBK();
  if (auth.error) return null;
  const sekolah = await getSekolahWithFilter();

  const [[row]]: any = await pool.query(
    `SELECT l.id_layanan, l.id_user, l.jenis_layanan, l.id_kelas,
            DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            l.jam, l.agenda, l.pelaksana, l.tempat, l.pihak_terlibat, l.tujuan, l.petugas,
            p.id_siswa, p.bidang_bimbingan, p.permasalahan, p.arahan, p.tindak_lanjut,
            p.topik, p.pelaksana_dituju, p.hasil, p.peristiwa, p.informan,
            p.pembinaan, p.referal, p.dirujuk_ke
     FROM layanan_bk l
     JOIN layanan_bk_peserta p ON p.id_layanan = l.id_layanan
     WHERE l.id_layanan = ? AND p.id_siswa = ?
       AND l.tahun = ? AND l.semester = ? AND l.deleted_at IS NULL
     LIMIT 1`,
    [idLayanan, idSiswa, sekolah.tahun, sekolah.semester],
  );

  return row ?? null;
}

export async function getBKLayananDetail(idLayanan: number) {
  const auth = await requireGuruBK();
  if (auth.error) return null;
  const sekolah = await getSekolahWithFilter();

  const [[header]]: any = await pool.query(
    `SELECT l.*, k.nama_kelas, DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal_fmt
     FROM layanan_bk l
     JOIN kelas k ON k.id_kelas = l.id_kelas
     WHERE l.id_layanan = ? AND l.tahun = ? AND l.semester = ? AND l.deleted_at IS NULL
     LIMIT 1`,
    [idLayanan, sekolah.tahun, sekolah.semester],
  );
  if (!header) return null;

  const [peserta]: any = await pool.query(
    `SELECT p.*, s.nama_siswa, s.nis, s.nisn, s.kelamin
     FROM layanan_bk_peserta p
     JOIN siswa s ON s.id_siswa = p.id_siswa
     WHERE p.id_layanan = ?
     ORDER BY s.nama_siswa ASC`,
    [idLayanan],
  );

  return { header, peserta };
}

export async function createBKSesi(jenis: string, idKelas: number, idSiswa: number) {
  const auth = await requireGuruBK();
  if (auth.error) return { success: false, error: auth.error } as const;
  if (!isJenisLayananBK(jenis)) return { success: false, error: 'Jenis layanan tidak valid' } as const;

  const sekolah = await getSekolahWithFilter();
  const kelas = await kelasOfSiswa(idSiswa, sekolah.tahun, sekolah.semester);
  if (!kelas || Number(kelas.id_kelas) !== Number(idKelas)) {
    return { success: false, error: 'Siswa tidak terdaftar di kelas ini' } as const;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result]: any = await conn.query(
      `INSERT INTO layanan_bk
         (tahun, semester, id_user, jenis_layanan, id_kelas, tanggal, agenda)
       VALUES (?, ?, ?, ?, ?, CURDATE(), NULL)`,
      [sekolah.tahun, sekolah.semester, auth.user!.id_user, jenis, idKelas],
    );
    const idLayanan = Number(result.insertId);
    await conn.query(
      `INSERT INTO layanan_bk_peserta (id_layanan, id_siswa, bidang_bimbingan) VALUES (?, ?, '')`,
      [idLayanan, idSiswa],
    );
    await conn.commit();
    revalidatePath('/guru/bk');
    revalidatePath('/guru/bk/layanan');
    return { success: true, idLayanan } as const;
  } catch (e) {
    await conn.rollback();
    console.error('createBKSesi error:', e);
    return { success: false, error: 'Gagal membuat sesi' } as const;
  } finally {
    conn.release();
  }
}

export async function saveBKSesi(idLayanan: number, idSiswa: number, input: BKSesiInput) {
  const auth = await requireGuruBK();
  if (auth.error) return { success: false, error: auth.error } as const;
  if (!isDate(input.tanggal)) return { success: false, error: 'Tanggal tidak valid' } as const;
  if (!isTime(input.jam)) return { success: false, error: 'Jam tidak valid' } as const;

  const sekolah = await getSekolahWithFilter();
  const [[header]]: any = await pool.query(
    `SELECT id_layanan, id_user, jenis_layanan FROM layanan_bk
     WHERE id_layanan = ? AND tahun = ? AND semester = ? AND deleted_at IS NULL LIMIT 1`,
    [idLayanan, sekolah.tahun, sekolah.semester],
  );
  if (!header) return { success: false, error: 'Sesi tidak ditemukan' } as const;
  if (Number(header.id_user) !== Number(auth.user!.id_user)) {
    return { success: false, error: 'Hanya pembuat sesi yang dapat mengubah' } as const;
  }

  const jenis = header.jenis_layanan as JenisLayananBK;
  if (!isJenisLayananBK(jenis)) return { success: false, error: 'Jenis layanan tidak valid' } as const;
  const bidang = cleanBidang(input.bidang ?? []);
  const validation = validatePeserta(jenis, input, bidang);
  if (validation) return { success: false, error: validation } as const;
  const headerValidation = validateHeader(jenis, input);
  if (headerValidation) return { success: false, error: headerValidation } as const;
  const fields = selectedFields(jenis, input);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE layanan_bk SET tanggal = ?, jam = ?, agenda = ?, pelaksana = ?, tempat = ?,
              pihak_terlibat = ?, tujuan = ?, petugas = ?
       WHERE id_layanan = ?`,
      [
        input.tanggal,
        clean(input.jam) ?? null,
        clean(input.agenda),
        clean(input.pelaksana),
        clean(input.tempat),
        clean(input.pihak_terlibat),
        clean(input.tujuan),
        clean(input.petugas),
        idLayanan,
      ],
    );

    const setParts = ['bidang_bimbingan = ?'];
    const params: any[] = [bidang.join(',')];
    for (const field of PESERTA_FIELDS) {
      if (JENIS_FIELDS[jenis].peserta.includes(field)) {
        setParts.push(`${field} = ?`);
        params.push(fields[field] ?? null);
      }
    }
    params.push(idLayanan, idSiswa);
    await conn.query(
      `UPDATE layanan_bk_peserta SET ${setParts.join(', ')}
       WHERE id_layanan = ? AND id_siswa = ?`,
      params,
    );

    await conn.commit();
    revalidatePath('/guru/bk');
    revalidatePath('/guru/bk/layanan');
    revalidatePath('/guru/bk/rekap');
    revalidatePath(`/guru/bk/layanan/${idLayanan}`);
    return { success: true } as const;
  } catch (e) {
    await conn.rollback();
    console.error('saveBKSesi error:', e);
    return { success: false, error: 'Gagal menyimpan sesi' } as const;
  } finally {
    conn.release();
  }
}

export async function deleteBKSesi(idLayanan: number, idSiswa: number) {
  const auth = await requireGuruBK();
  if (auth.error) return { success: false, error: auth.error } as const;
  const sekolah = await getSekolahWithFilter();

  const [[header]]: any = await pool.query(
    `SELECT id_layanan, id_user FROM layanan_bk
     WHERE id_layanan = ? AND tahun = ? AND semester = ? AND deleted_at IS NULL LIMIT 1`,
    [idLayanan, sekolah.tahun, sekolah.semester],
  );
  if (!header) return { success: false, error: 'Sesi tidak ditemukan' } as const;
  if (Number(header.id_user) !== Number(auth.user!.id_user)) {
    return { success: false, error: 'Hanya pembuat sesi yang dapat menghapus' } as const;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'DELETE FROM layanan_bk_peserta WHERE id_layanan = ? AND id_siswa = ?',
      [idLayanan, idSiswa],
    );
    const [[count]]: any = await conn.query(
      'SELECT COUNT(*) AS n FROM layanan_bk_peserta WHERE id_layanan = ?',
      [idLayanan],
    );
    if (Number(count.n) === 0) {
      await conn.query('UPDATE layanan_bk SET deleted_at = NOW() WHERE id_layanan = ?', [idLayanan]);
    }
    await conn.commit();
    revalidatePath('/guru/bk');
    revalidatePath('/guru/bk/layanan');
    revalidatePath('/guru/bk/rekap');
    return { success: true } as const;
  } catch (e) {
    await conn.rollback();
    console.error('deleteBKSesi error:', e);
    return { success: false, error: 'Gagal menghapus sesi' } as const;
  } finally {
    conn.release();
  }
}

export async function saveBKLayanan(input: BKGroupInput) {
  const auth = await requireGuruBK();
  if (auth.error) return { success: false, error: auth.error } as const;
  if (!isJenisLayananBK(input.jenis)) return { success: false, error: 'Jenis layanan tidak valid' } as const;
  if (!isDate(input.tanggal)) return { success: false, error: 'Tanggal tidak valid' } as const;
  if (!isTime(input.jam)) return { success: false, error: 'Jam tidak valid' } as const;

  const config = JENIS_FIELDS[input.jenis];
  const headerValidation = validateHeader(input.jenis, input);
  if (headerValidation) return { success: false, error: headerValidation } as const;
  const peserta = input.peserta ?? [];
  if (peserta.length < config.minPeserta) {
    return {
      success: false,
      error: config.multiPeserta
        ? `Minimal ${config.minPeserta} siswa untuk layanan ini`
        : 'Pilih satu siswa',
    } as const;
  }

  const sekolah = await getSekolahWithFilter();
  const ids = peserta.map((p) => p.idSiswa);
  if (new Set(ids).size !== ids.length) {
    return { success: false, error: 'Siswa peserta tidak boleh ganda' } as const;
  }

  const [allowed]: any = await pool.query(
    `SELECT DISTINCT sk.id_siswa
     FROM siswa_kelas sk
     WHERE sk.id_kelas = ? AND sk.tahun = ? AND sk.semester = ?
       AND sk.deleted_at IS NULL AND sk.id_siswa IN (?)`,
    [input.idKelas, sekolah.tahun, sekolah.semester, ids],
  );
  if (allowed.length !== ids.length) {
    return { success: false, error: 'Ada siswa yang tidak terdaftar di kelas ini' } as const;
  }

  for (const p of peserta) {
    const bidang = cleanBidang(p.bidang ?? []);
    const error = validatePeserta(input.jenis, p, bidang);
    if (error) return { success: false, error } as const;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result]: any = await conn.query(
      `INSERT INTO layanan_bk
         (tahun, semester, id_user, jenis_layanan, id_kelas, tanggal, jam, agenda,
          pelaksana, tempat, pihak_terlibat, tujuan, petugas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sekolah.tahun,
        sekolah.semester,
        auth.user!.id_user,
        input.jenis,
        input.idKelas,
        input.tanggal,
        clean(input.jam),
        clean(input.agenda),
        clean(input.pelaksana),
        clean(input.tempat),
        clean(input.pihak_terlibat),
        clean(input.tujuan),
        clean(input.petugas),
      ],
    );
    const idLayanan = Number(result.insertId);

    const values = peserta.map((p) => {
      const bidang = cleanBidang(p.bidang ?? []);
      const fields = selectedFields(input.jenis, p);
      const row = [
        idLayanan,
        p.idSiswa,
        bidang.join(','),
        ...PESERTA_FIELDS.map((field) =>
          JENIS_FIELDS[input.jenis].peserta.includes(field) ? fields[field] ?? null : null,
        ),
      ];
      return row;
    });

    await conn.query(
      `INSERT INTO layanan_bk_peserta
         (id_layanan, id_siswa, bidang_bimbingan, ${PESERTA_FIELDS.join(', ')})
       VALUES ?`,
      [values],
    );

    await conn.commit();
    revalidatePath('/guru/bk');
    revalidatePath('/guru/bk/layanan');
    revalidatePath('/guru/bk/rekap');
    return { success: true, idLayanan } as const;
  } catch (e) {
    await conn.rollback();
    console.error('saveBKLayanan error:', e);
    return { success: false, error: 'Gagal menyimpan layanan' } as const;
  } finally {
    conn.release();
  }
}

export async function getBKSiswaKelas(idKelas: number) {
  const auth = await requireGuruBK();
  if (auth.error) return [] as BKStudent[];
  return getBKStudents(idKelas);
}

export async function getBKStats() {
  const auth = await requireGuruBK();
  if (auth.error) {
    return {
      sesiBulanIni: 0,
      siswaTerlayani: 0,
      perJenis: [] as { jenis: string; jumlah: number }[],
      perBidang: [] as { bidang: string; jumlah: number }[],
      recent: [] as any[],
    };
  }
  const sekolah = await getSekolahWithFilter();

  const [[total]]: any = await pool.query(
    `SELECT COUNT(*) AS n FROM layanan_bk
     WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
       AND MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())`,
    [sekolah.tahun, sekolah.semester],
  );
  const [[siswa]]: any = await pool.query(
    `SELECT COUNT(DISTINCT p.id_siswa) AS n
     FROM layanan_bk l JOIN layanan_bk_peserta p ON p.id_layanan = l.id_layanan
     WHERE l.tahun = ? AND l.semester = ? AND l.deleted_at IS NULL`,
    [sekolah.tahun, sekolah.semester],
  );
  const [perJenis]: any = await pool.query(
    `SELECT jenis_layanan AS jenis, COUNT(*) AS jumlah
     FROM layanan_bk
     WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
     GROUP BY jenis_layanan`,
    [sekolah.tahun, sekolah.semester],
  );
  const [bidangRows]: any = await pool.query(
    `SELECT p.bidang_bimbingan FROM layanan_bk l
     JOIN layanan_bk_peserta p ON p.id_layanan = l.id_layanan
     WHERE l.tahun = ? AND l.semester = ? AND l.deleted_at IS NULL`,
    [sekolah.tahun, sekolah.semester],
  );
  const bidangMap = new Map<string, number>();
  for (const row of bidangRows) {
    for (const b of bidangToArray(row.bidang_bimbingan)) {
      bidangMap.set(b, (bidangMap.get(b) ?? 0) + 1);
    }
  }
  const [recent]: any = await pool.query(
    `SELECT l.id_layanan, DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            l.jenis_layanan, k.nama_kelas,
            GROUP_CONCAT(DISTINCT s.nama_siswa ORDER BY s.nama_siswa SEPARATOR ', ') AS peserta
     FROM layanan_bk l
     JOIN kelas k ON k.id_kelas = l.id_kelas
     JOIN layanan_bk_peserta p ON p.id_layanan = l.id_layanan
     JOIN siswa s ON s.id_siswa = p.id_siswa
     WHERE l.tahun = ? AND l.semester = ? AND l.deleted_at IS NULL
     GROUP BY l.id_layanan, l.tanggal, l.jenis_layanan, k.nama_kelas
     ORDER BY l.tanggal DESC, l.id_layanan DESC
     LIMIT 5`,
    [sekolah.tahun, sekolah.semester],
  );

  return {
    sesiBulanIni: Number(total.n),
    siswaTerlayani: Number(siswa.n),
    perJenis: perJenis.map((r: any) => ({ jenis: r.jenis, jumlah: Number(r.jumlah) })),
    perBidang: Array.from(bidangMap.entries()).map(([bidang, jumlah]) => ({ bidang, jumlah })),
    recent,
  };
}

interface BKClassRow {
  id_kelas: number;
  nama_kelas: string;
  jumlah: number;
}

interface BKRekapRow {
  id_siswa: number;
  nama_siswa: string;
  nis: string | null;
  kelamin: string | null;
  total: number;
  [key: string]: any;
}

interface BKRekapData {
  classes: BKClassRow[];
  idKelas: number | null;
  rows: BKRekapRow[];
}

async function fetchRekap(
  idKelas: number | null,
  tahun: number,
  semester: number,
): Promise<BKRekapData> {
  const [classes]: any = await pool.query(
    `SELECT k.id_kelas, k.nama_kelas, COUNT(DISTINCT sk.id_siswa) AS jumlah
     FROM kelas k
     JOIN siswa_kelas sk ON sk.id_kelas = k.id_kelas
       AND sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL
     WHERE k.deleted_at IS NULL
     GROUP BY k.id_kelas, k.nama_kelas
     ORDER BY k.nama_kelas ASC`,
    [tahun, semester],
  );
  const target = idKelas ?? (classes[0] ? Number(classes[0].id_kelas) : null);
  if (!target) {
    return { classes: [], idKelas: null, rows: [] };
  }

  const jenisSelect = JENIS_BK.map(
    (j) => `SUM(l.jenis_layanan = '${j.key}') AS ${j.key}`,
  ).join(',\n         ');

  const [rows]: any = await pool.query(
    `SELECT s.id_siswa, s.nama_siswa, s.nis, s.kelamin,
            ${jenisSelect},
            COUNT(l.id_layanan) AS total
     FROM siswa s
     JOIN siswa_kelas sk ON sk.id_siswa = s.id_siswa
     LEFT JOIN layanan_bk_peserta p ON p.id_siswa = s.id_siswa
     LEFT JOIN layanan_bk l ON l.id_layanan = p.id_layanan
       AND l.id_kelas = sk.id_kelas AND l.tahun = ? AND l.semester = ? AND l.deleted_at IS NULL
     WHERE sk.id_kelas = ? AND sk.tahun = ? AND sk.semester = ?
       AND sk.deleted_at IS NULL AND s.deleted_at IS NULL AND s.aktif = 1
     GROUP BY s.id_siswa, s.nama_siswa, s.nis, s.kelamin
     ORDER BY s.nama_siswa ASC`,
    [tahun, semester, target, tahun, semester],
  );

  return {
    classes: classes.map((c: any) => ({
      id_kelas: Number(c.id_kelas),
      nama_kelas: c.nama_kelas,
      jumlah: Number(c.jumlah),
    })),
    idKelas: target,
    rows: rows.map((r: any) => {
      const mapped: any = {
        id_siswa: Number(r.id_siswa),
        nama_siswa: r.nama_siswa,
        nis: r.nis,
        kelamin: r.kelamin,
        total: Number(r.total),
      };
      for (const j of JENIS_BK) mapped[j.key] = Number(r[j.key]);
      return mapped;
    }),
  };
}

export async function getBKRekap(idKelas?: number | null) {
  const auth = await requireGuruBK();
  if (auth.error) return { classes: [], idKelas: null, rows: [] as any[] };
  const sekolah = await getSekolahWithFilter();
  return fetchRekap(idKelas ?? null, sekolah.tahun, sekolah.semester);
}

export async function getBKRekapTU(idKelas?: number | null) {
  const auth = await requireTuAdmin();
  if (auth.error) return { classes: [], idKelas: null, rows: [] as any[] };
  const sekolah = await getSekolahWithFilter();
  return fetchRekap(idKelas ?? null, sekolah.tahun, sekolah.semester);
}

export async function getBKInfoSiswa(idSiswa: number) {
  const auth = await requireGuruBK();
  if (auth.error) return null;
  const sekolah = await getSekolahWithFilter();

  const [[siswa]]: any = await pool.query(
    `SELECT s.id_siswa, s.nama_siswa, s.nis, s.nisn, s.kelamin, k.nama_kelas
     FROM siswa s
     JOIN siswa_kelas sk ON sk.id_siswa = s.id_siswa
       AND sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL
     JOIN kelas k ON k.id_kelas = sk.id_kelas
     WHERE s.id_siswa = ? AND s.deleted_at IS NULL
     LIMIT 1`,
    [sekolah.tahun, sekolah.semester, idSiswa],
  );
  if (!siswa) return null;

  const [sessions]: any = await pool.query(
    `SELECT l.id_layanan, l.jenis_layanan, DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal,
            l.jam, l.agenda, l.pelaksana, l.tempat, l.pihak_terlibat, l.tujuan, l.petugas,
            p.bidang_bimbingan, p.permasalahan, p.arahan, p.tindak_lanjut,
            p.topik, p.pelaksana_dituju, p.hasil, p.peristiwa, p.informan,
            p.pembinaan, p.referal, p.dirujuk_ke
     FROM layanan_bk l
     JOIN layanan_bk_peserta p ON p.id_layanan = l.id_layanan
     WHERE p.id_siswa = ? AND l.tahun = ? AND l.semester = ? AND l.deleted_at IS NULL
     ORDER BY l.tanggal ASC, l.id_layanan ASC`,
    [idSiswa, sekolah.tahun, sekolah.semester],
  );

  return { siswa, sessions };
}

export async function exportBKRekap(idKelas: number, forTU = false) {
  const auth = forTU ? await requireTuAdmin() : await requireGuruBK();
  if (auth.error) return { success: false, error: auth.error } as const;
  const sekolah = await getSekolahWithFilter();
  const rekap = await fetchRekap(idKelas, sekolah.tahun, sekolah.semester);
  const kelas = rekap.classes.find((c: BKClassRow) => c.id_kelas === idKelas);
  if (!kelas) return { success: false, error: 'Kelas tidak ditemukan' } as const;

  const [detail]: any = await pool.query(
    `SELECT DATE_FORMAT(l.tanggal, '%Y-%m-%d') AS tanggal, l.jam, l.jenis_layanan,
            k.nama_kelas, s.nama_siswa, s.nis, p.bidang_bimbingan,
            l.agenda, l.pelaksana, l.tempat, l.pihak_terlibat, l.tujuan, l.petugas,
            p.permasalahan, p.arahan, p.tindak_lanjut, p.topik, p.pelaksana_dituju,
            p.hasil, p.peristiwa, p.informan, p.pembinaan, p.referal, p.dirujuk_ke
     FROM layanan_bk l
     JOIN layanan_bk_peserta p ON p.id_layanan = l.id_layanan
     JOIN siswa s ON s.id_siswa = p.id_siswa
     JOIN kelas k ON k.id_kelas = l.id_kelas
     WHERE l.id_kelas = ? AND l.tahun = ? AND l.semester = ? AND l.deleted_at IS NULL
     ORDER BY l.tanggal ASC, s.nama_siswa ASC`,
    [idKelas, sekolah.tahun, sekolah.semester],
  );

  const jenisLabel = new Map(JENIS_BK.map((j) => [j.key, j.label]));
  const bidangLabel = (value: string) =>
    bidangToArray(value).map((b) => BIDANG_LABEL[b] ?? b).join(', ');

  const rekapAoa: any[][] = [
    ['No', 'Nama Siswa', 'NIS', 'L/P', ...JENIS_BK.map((j) => j.short), 'Total'],
    ...rekap.rows.map((r: BKRekapRow, index: number) => [
      index + 1,
      r.nama_siswa,
      r.nis ?? '',
      formatKelamin(r.kelamin),
      ...JENIS_BK.map((j) => r[j.key] ?? 0),
      r.total,
    ]),
  ];

  const detailAoa: any[][] = [
    [
      'Tanggal', 'Jam', 'Jenis', 'Kelas', 'Nama Siswa', 'NIS', 'Bidang',
      'Agenda', 'Pelaksana', 'Tempat', 'Pihak Terlibat', 'Tujuan', 'Petugas',
      'Permasalahan', 'Arahan', 'Tindak Lanjut', 'Topik', 'Pelaksana Dituju',
      'Hasil', 'Peristiwa', 'Informan', 'Pembinaan', 'Referal', 'Dirujuk Ke',
    ],
    ...detail.map((r: any) => [
      r.tanggal ?? '', r.jam ?? '', jenisLabel.get(r.jenis_layanan) ?? r.jenis_layanan,
      r.nama_kelas, r.nama_siswa, r.nis ?? '', bidangLabel(r.bidang_bimbingan),
      r.agenda ?? '', r.pelaksana ?? '', r.tempat ?? '', r.pihak_terlibat ?? '',
      r.tujuan ?? '', r.petugas ?? '', r.permasalahan ?? '', r.arahan ?? '',
      r.tindak_lanjut ?? '', r.topik ?? '', r.pelaksana_dituju ?? '', r.hasil ?? '',
      r.peristiwa ?? '', r.informan ?? '', r.pembinaan ?? '', r.referal ?? '',
      r.dirujuk_ke ?? '',
    ]),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rekapAoa), 'Rekap');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detailAoa), 'Detail');
  const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const safeKelas = String(kelas.nama_kelas).replace(/[^\w-]+/g, '-');
  return {
    success: true,
    filename: `rekap-bk-${safeKelas}-${sekolah.tahun}-${sekolah.semester}.xlsx`,
    base64,
  } as const;
}
