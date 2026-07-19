'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahAktif } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

export async function getInfoPromosi() {
  const authResult = await requireTuAdmin();
  if (authResult.error) return null;

  const sekolah = await getSekolahAktif();

  const [tahunRows]: any = await pool.query(
    'SELECT id_tahun_pelajaran, tahun_pelajaran FROM tahun_pelajaran WHERE id_tahun_pelajaran > ? ORDER BY id_tahun_pelajaran ASC LIMIT 1',
    [sekolah?.tahun || 0]
  );
  if (tahunRows.length === 0) return null;
  const tahunBaru = tahunRows[0];

  const [semesterRows]: any = await pool.query(
    'SELECT id_semester, semester FROM semester WHERE id_semester = 1 LIMIT 1'
  );
  const semester = semesterRows[0];

  const [tingkatRows]: any = await pool.query(`
    SELECT t.id_tingkat, t.tabjad, t.akhir,
      COUNT(DISTINCT sk.id_siswa) AS jumlah_siswa,
      COUNT(DISTINCT sk.id_kelas) AS jumlah_kelas
    FROM siswa_kelas sk
    JOIN kelas k ON sk.id_kelas = k.id_kelas
    JOIN tingkat t ON k.id_tingkat = t.id_tingkat
    WHERE sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL
    GROUP BY t.id_tingkat, t.tabjad, t.akhir
    ORDER BY t.id_tingkat ASC
  `, [sekolah.tahun, sekolah.semester]);

  const rincian: { dari: string; ke: string; jumlah_siswa: number; jumlah_kelas: number; isLulus: boolean }[] = [];
  let totalNaik = 0;
  let totalLulus = 0;

  const allTingkat: any[] = await pool.query('SELECT id_tingkat, tabjad, akhir FROM tingkat ORDER BY id_tingkat ASC').then((r: any) => r[0]);

  for (const t of tingkatRows) {
    if (t.akhir === 1) {
      totalLulus += t.jumlah_siswa;
      rincian.push({ dari: t.tabjad, ke: 'LULUS', jumlah_siswa: t.jumlah_siswa, jumlah_kelas: t.jumlah_kelas, isLulus: true });
    } else {
      const nextTingkat = allTingkat.find((x: any) => x.id_tingkat === t.id_tingkat + 1);
      totalNaik += t.jumlah_siswa;
      rincian.push({ dari: t.tabjad, ke: nextTingkat?.tabjad || '?', jumlah_siswa: t.jumlah_siswa, jumlah_kelas: t.jumlah_kelas, isLulus: false });
    }
  }

  return {
    tahunBaru: tahunBaru.tahun_pelajaran,
    semester: semester?.semester || 'Ganjil',
    rincian,
    totalNaik,
    totalLulus,
  };
}

export async function updateNaikKelas(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_siswa_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idTingkat = formData.get('id_tingkat') as string;

  if (!id) {
    return { success: false, error: 'ID tidak valid' } as const;
  }

  try {
    await pool.query(
      'UPDATE siswa_kelas SET id_kelas = ?, id_tingkat = ? WHERE id_siswa_kelas = ?',
      [idKelas, idTingkat, id]
    );

    revalidatePath('/tu/naik-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function promoteKelas(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const idKelas = formData.get('id_kelas') as string;
  const idTingkatLama = formData.get('id_tingkat_lama') as string;
  const idTingkatBaru = formData.get('id_tingkat_baru') as string;
  const idKelasBaru = formData.get('id_kelas_baru') as string;

  if (!idKelas || !idTingkatBaru || !idKelasBaru) {
    return { success: false, error: 'Data tidak lengkap' } as const;
  }

  const sekolah = await getSekolahAktif();

  // Naik kelas = awal tahun ajaran baru (ganjil = 1), bukan semester aktif
  const semester = 1;

  // Cari id_tahun_pelajaran berikutnya dari tabel, bukan asumsi +1
  const [tahunRows]: any = await pool.query(
    'SELECT id_tahun_pelajaran FROM tahun_pelajaran WHERE id_tahun_pelajaran > ? ORDER BY id_tahun_pelajaran ASC LIMIT 1',
    [sekolah?.tahun || 0]
  );
  if (tahunRows.length === 0) {
    return { success: false, error: 'Tahun pelajaran berikutnya tidak ditemukan. Silakan tambah tahun pelajaran baru di menu Pengaturan.' } as const;
  }
  const tahunBaru = tahunRows[0].id_tahun_pelajaran;

  try {
    const [siswaRows]: any = await pool.query(
      'SELECT id_siswa FROM siswa_kelas WHERE id_kelas = ? AND id_tingkat = ?',
      [idKelas, idTingkatLama]
    );

    if (siswaRows.length > 0) {
      const values = siswaRows.map((siswa: any) => [tahunBaru, semester, idTingkatBaru, idKelasBaru, siswa.id_siswa, 1]);
      await pool.query(
        'INSERT INTO siswa_kelas (tahun, semester, id_tingkat, id_kelas, id_siswa, status) VALUES ?',
        [values]
      );
    }

    revalidatePath('/tu/naik-kelas');
    return {
      success: true,
      count: siswaRows.length,
      message: `Berhasil menaikkan ${siswaRows.length} siswa`
    } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menaikkan kelas' } as const;
  }
}

export async function promoteAllKelas() {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const sekolah = await getSekolahAktif();

  // Naik kelas = awal tahun ajaran baru (ganjil = 1), bukan semester aktif
  const semester = 1;

  const [tahunRows]: any = await pool.query(
    'SELECT id_tahun_pelajaran FROM tahun_pelajaran WHERE id_tahun_pelajaran > ? ORDER BY id_tahun_pelajaran ASC LIMIT 1',
    [sekolah?.tahun || 0]
  );
  if (tahunRows.length === 0) {
    return { success: false, error: 'Tahun pelajaran berikutnya tidak ditemukan. Silakan tambah tahun pelajaran baru di menu Pengaturan.' } as const;
  }
  const tahunBaru = tahunRows[0].id_tahun_pelajaran;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Ambil semua kelas untuk mapping target (tingkat + kompetensi)
    const [allKelasRows]: any = await conn.query(
      'SELECT id_kelas, nama_kelas, id_tingkat, id_kompetensi_keahlian FROM kelas'
    );
    const kelasByTingkatKK = new Map<string, { id_kelas: number; nama_kelas: string }>();
    for (const k of allKelasRows) {
      kelasByTingkatKK.set(`${k.id_tingkat}-${k.id_kompetensi_keahlian}`, k);
    }

    // Ambil semua kelas yang punya siswa di periode aktif, kecuali tingkat akhir (XII)
    const [kelasRows]: any = await conn.query(`
      SELECT k.id_kelas, k.id_tingkat, k.id_kompetensi_keahlian, k.nama_kelas,
        COUNT(sk.id_siswa_kelas) AS jumlah_siswa
      FROM siswa_kelas sk
      JOIN kelas k ON sk.id_kelas = k.id_kelas
      WHERE sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL
        AND k.id_tingkat < (SELECT MAX(id_tingkat) FROM tingkat)
      GROUP BY k.id_kelas
      ORDER BY k.nama_kelas
    `, [sekolah.tahun, semester]);

    if (kelasRows.length === 0) {
      await conn.rollback();
      return { success: false, error: 'Tidak ada kelas yang bisa dinaikkan.' } as const;
    }

    // Batch: ambil semua siswa dari semua kelas asal
    const idKelasList = kelasRows.map((k: any) => k.id_kelas);
    const [allSiswaRows]: any = await conn.query(
      `SELECT sk.id_siswa, sk.id_kelas FROM siswa_kelas sk
       WHERE sk.id_kelas IN (?) AND sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL`,
      [idKelasList, sekolah.tahun, semester]
    );
    const siswaByKelas = new Map<number, number[]>();
    for (const s of allSiswaRows) {
      if (!siswaByKelas.has(s.id_kelas)) siswaByKelas.set(s.id_kelas, []);
      siswaByKelas.get(s.id_kelas)!.push(s.id_siswa);
    }

    // Batch: ambil semua existing di kelas tujuan untuk tahun baru
    const idTingkatBaru = [...new Set(kelasRows.map((k: any) => k.id_tingkat + 1))];
    const [allTargetKelas]: any = await conn.query(
      'SELECT id_kelas, id_tingkat, id_kompetensi_keahlian FROM kelas WHERE id_tingkat IN (?)',
      [idTingkatBaru]
    );
    const targetIdKelasList = allTargetKelas.map((t: any) => t.id_kelas);
    const [allExistingRows]: any = await conn.query(
      'SELECT id_siswa, id_kelas FROM siswa_kelas WHERE id_kelas IN (?) AND tahun = ? AND semester = ? AND deleted_at IS NULL',
      [targetIdKelasList.length > 0 ? targetIdKelasList : [0], tahunBaru, semester]
    );
    const existingByKelas = new Map<number, Set<number>>();
    for (const e of allExistingRows) {
      if (!existingByKelas.has(e.id_kelas)) existingByKelas.set(e.id_kelas, new Set());
      existingByKelas.get(e.id_kelas)!.add(e.id_siswa);
    }

    const hasil: { kelas: string; target: string; siswa: number; status: string }[] = [];

    for (const kelas of kelasRows) {
      const targetKelasKey = `${kelas.id_tingkat + 1}-${kelas.id_kompetensi_keahlian}`;
      const targetKelas = kelasByTingkatKK.get(targetKelasKey);

      if (!targetKelas) {
        hasil.push({ kelas: kelas.nama_kelas, target: '(tidak ditemukan)', siswa: 0, status: 'skip' });
        continue;
      }

      const idSiswaList = siswaByKelas.get(kelas.id_kelas) || [];
      if (idSiswaList.length === 0) {
        hasil.push({ kelas: kelas.nama_kelas, target: targetKelas.nama_kelas, siswa: 0, status: 'skip' });
        continue;
      }

      const existingSet = existingByKelas.get(targetKelas.id_kelas) || new Set();

      const toInsert = idSiswaList.filter((idSiswa: number) => !existingSet.has(idSiswa));
      if (toInsert.length > 0) {
        const values = toInsert.map((idSiswa: number) => [tahunBaru, semester, kelas.id_tingkat + 1, targetKelas.id_kelas, idSiswa, 1]);
        await conn.query(
          'INSERT INTO siswa_kelas (tahun, semester, id_tingkat, id_kelas, id_siswa, status) VALUES ?',
          [values]
        );
      }
      const inserted = toInsert.length;

      hasil.push({
        kelas: kelas.nama_kelas,
        target: targetKelas.nama_kelas,
        siswa: kelas.jumlah_siswa,
        status: `${inserted} siswa dipromosikan` + (inserted < kelas.jumlah_siswa ? ` (${kelas.jumlah_siswa - inserted} sudah ada)` : ''),
      });
    }

    // Proses siswa kelas XII (tingkat akhir) — pindahkan ke lulusan
    const [kelasXIIRows]: any = await conn.query(`
      SELECT k.id_kelas, k.nama_kelas, COUNT(sk.id_siswa_kelas) AS jumlah_siswa
      FROM siswa_kelas sk
      JOIN kelas k ON sk.id_kelas = k.id_kelas
      JOIN tingkat t ON k.id_tingkat = t.id_tingkat
      WHERE sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL AND t.akhir = 1
      GROUP BY k.id_kelas
      ORDER BY k.nama_kelas
    `, [sekolah.tahun, semester]);

    if (kelasXIIRows.length > 0) {
      // Batch: ambil semua siswa XII
      const idKelasXIIList = kelasXIIRows.map((k: any) => k.id_kelas);
      const [allSiswaXIIRows]: any = await conn.query(
        'SELECT sk.id_siswa_kelas, sk.id_siswa, sk.id_kelas, s.nama_siswa FROM siswa_kelas sk JOIN siswa s ON sk.id_siswa = s.id_siswa WHERE sk.id_kelas IN (?) AND sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL',
        [idKelasXIIList, sekolah.tahun, semester]
      );
      const siswaXIIByKelas = new Map<number, any[]>();
      const semuaIdSiswaXII: number[] = [];
      for (const s of allSiswaXIIRows) {
        if (!siswaXIIByKelas.has(s.id_kelas)) siswaXIIByKelas.set(s.id_kelas, []);
        siswaXIIByKelas.get(s.id_kelas)!.push(s);
        semuaIdSiswaXII.push(s.id_siswa);
      }

      // Batch: cek semua lulusan yang sudah ada (periode penyelesaian)
      const [existingLulusanRows]: any = await conn.query(
        'SELECT id_siswa FROM lulusan WHERE id_siswa IN (?) AND tahun = ? AND semester = ?',
        [semuaIdSiswaXII.length > 0 ? semuaIdSiswaXII : [0], sekolah.tahun, sekolah.semester]
      );
      const existingLulusanSet = new Set(existingLulusanRows.map((el: any) => el.id_siswa));

      for (const kelasXII of kelasXIIRows) {
        const siswaXIIList = siswaXIIByKelas.get(kelasXII.id_kelas) || [];
        if (siswaXIIList.length === 0) {
          hasil.push({ kelas: kelasXII.nama_kelas, target: 'LULUS', siswa: 0, status: 'skip' });
          continue;
        }

        let dipindahkan = 0;
        const toGraduate = siswaXIIList.filter((siswa: any) => !existingLulusanSet.has(siswa.id_siswa));

        if (toGraduate.length > 0) {
          // Batch INSERT lulusan
          const tanggalLulus = new Date().toISOString().slice(0, 10);
          const lulusanValues = toGraduate.map((siswa: any) => [sekolah.tahun, sekolah.semester, siswa.id_siswa, tanggalLulus]);
          await conn.query(
            'INSERT INTO lulusan (tahun, semester, id_siswa, tanggal_lulus) VALUES ?',
            [lulusanValues]
          );

          // Batch UPDATE siswa SET aktif = 0
          const idSiswaAktif = toGraduate.map((siswa: any) => siswa.id_siswa);
          await conn.query('UPDATE siswa SET aktif = 0 WHERE id_siswa IN (?)', [idSiswaAktif]);

          // Batch UPDATE siswa_kelas SET deleted_at = NOW()
          const idSiswaKelasList = toGraduate.map((siswa: any) => siswa.id_siswa_kelas);
          await conn.query('UPDATE siswa_kelas SET deleted_at = NOW() WHERE id_siswa_kelas IN (?)', [idSiswaKelasList]);

          dipindahkan = toGraduate.length;
        }

        hasil.push({
          kelas: kelasXII.nama_kelas,
          target: '🎓 LULUS',
          siswa: siswaXIIList.length,
          status: `${dipindahkan} siswa dipindahkan ke lulusan`,
        });
      }
    }

    await conn.commit();
    revalidatePath('/tu/naik-kelas');
    return { success: true, hasil } as const;
  } catch (e: any) {
    await conn.rollback();
    return { success: false, error: 'Gagal menaikkan semua kelas' } as const;
  } finally {
    conn.release();
  }
}
