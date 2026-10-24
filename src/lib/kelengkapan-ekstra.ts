import { pool } from './db';

export interface KelengkapanItem {
  jenis: 'eskul' | 'organisasi';
  id: number;
  nama: string;
  anggota: number;
  tanpaPredikat: number;
  lengkap: boolean;
}

export interface KelengkapanPembina {
  idUser: number;
  nama: string;
  eskul: KelengkapanItem[];
  organisasi: KelengkapanItem[];
  belumLengkap: number;
}

export function labelKelengkapan(item: KelengkapanItem): string {
  if (item.anggota === 0) return 'belum ada anggota';
  if (item.jenis === 'eskul' && item.tanpaPredikat > 0) {
    return `${item.tanpaPredikat} anggota belum ada predikat`;
  }
  return 'sudah lengkap';
}

export function hrefKelengkapan(item: KelengkapanItem): string {
  return item.jenis === 'eskul' ? `/guru/ekstra?id_eskul=${item.id}` : '/guru/organisasi';
}

/**
 * Status kelengkapan eskul/organisasi untuk satu pembina pada satu periode.
 * Ekstra dianggap lengkap bila punya anggota dan semua anggotanya sudah
 * punya predikat; organisasi cukup punya anggota.
 */
export async function getKelengkapanPembina(
  idUser: number,
  tahun: number,
  semester: number,
): Promise<KelengkapanItem[]> {
  const [eskulRows]: any = await pool.query(
    `SELECT e.id_eskul, e.nama_eskul,
            COUNT(se.id_siswa_eskul) AS anggota,
            COALESCE(SUM(
              CASE WHEN se.id_siswa_eskul IS NOT NULL
                    AND (se.predikat IS NULL OR se.predikat = '') THEN 1 ELSE 0 END
            ), 0) AS tanpa_predikat
     FROM pembina_eskul pe
     JOIN eskul e ON pe.id_eskul = e.id_eskul AND e.deleted_at IS NULL
     LEFT JOIN siswa_eskul se
       ON se.id_eskul = e.id_eskul AND se.tahun = ? AND se.semester = ? AND se.deleted_at IS NULL
     WHERE pe.id_user = ? AND pe.tahun = ? AND pe.semester = ? AND pe.deleted_at IS NULL
     GROUP BY e.id_eskul, e.nama_eskul
     ORDER BY e.nama_eskul ASC`,
    [tahun, semester, idUser, tahun, semester],
  );

  const [orgRows]: any = await pool.query(
    `SELECT o.id_organisasi, o.nama_organisasi,
            COUNT(so.id_siswa_organisasi) AS anggota
     FROM pembina_organisasi po
     JOIN organisasi o ON po.id_organisasi = o.id_organisasi AND o.deleted_at IS NULL
     LEFT JOIN siswa_organisasi so
       ON so.id_organisasi = o.id_organisasi AND so.tahun = ? AND so.semester = ? AND so.deleted_at IS NULL
     WHERE po.id_user = ? AND po.tahun = ? AND po.semester = ? AND po.deleted_at IS NULL
     GROUP BY o.id_organisasi, o.nama_organisasi
     ORDER BY o.nama_organisasi ASC`,
    [tahun, semester, idUser, tahun, semester],
  );

  const eskul: KelengkapanItem[] = eskulRows.map((r: any) => {
    const anggota = Number(r.anggota) || 0;
    const tanpaPredikat = Number(r.tanpa_predikat) || 0;
    return {
      jenis: 'eskul',
      id: Number(r.id_eskul),
      nama: String(r.nama_eskul ?? ''),
      anggota,
      tanpaPredikat,
      lengkap: anggota > 0 && tanpaPredikat === 0,
    };
  });

  const organisasi: KelengkapanItem[] = orgRows.map((r: any) => {
    const anggota = Number(r.anggota) || 0;
    return {
      jenis: 'organisasi',
      id: Number(r.id_organisasi),
      nama: String(r.nama_organisasi ?? ''),
      anggota,
      tanpaPredikat: 0,
      lengkap: anggota > 0,
    };
  });

  return [...eskul, ...organisasi];
}

/** Rekap seluruh pembina pada satu periode, untuk halaman TU. */
export async function getRekapKelengkapanPembina(
  tahun: number,
  semester: number,
): Promise<KelengkapanPembina[]> {
  const [pembinaRows]: any = await pool.query(
    `SELECT DISTINCT u.id_user, u.nama
     FROM users u
     WHERE u.deleted_at IS NULL
       AND (
         EXISTS (SELECT 1 FROM pembina_eskul pe
                 WHERE pe.id_user = u.id_user AND pe.tahun = ? AND pe.semester = ? AND pe.deleted_at IS NULL)
         OR EXISTS (SELECT 1 FROM pembina_organisasi po
                    WHERE po.id_user = u.id_user AND po.tahun = ? AND po.semester = ? AND po.deleted_at IS NULL)
       )
     ORDER BY u.nama ASC`,
    [tahun, semester, tahun, semester],
  );

  const hasil: KelengkapanPembina[] = [];
  for (const p of pembinaRows) {
    const items = await getKelengkapanPembina(Number(p.id_user), tahun, semester);
    hasil.push({
      idUser: Number(p.id_user),
      nama: String(p.nama ?? ''),
      eskul: items.filter((i) => i.jenis === 'eskul'),
      organisasi: items.filter((i) => i.jenis === 'organisasi'),
      belumLengkap: items.filter((i) => !i.lengkap).length,
    });
  }
  return hasil;
}
