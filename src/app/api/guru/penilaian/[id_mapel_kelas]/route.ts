import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface Entry {
  id_siswa: number;
  id_tujuan: number;
  nilai: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id_mapel_kelas: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id_mapel_kelas } = await params;
  const body = await req.json();
  const { detail, entries } = body as { detail: string; entries: Entry[] };

  // Determine table name
  const tableMap: Record<string, string> = {
    formatif: 'nilai_formatif',
    'sumatif-harian': 'nilai_sumatif_ph',
    'sumatif-ts': 'nilai_sumatif_ts',
    'sumatif-as': 'nilai_sumatif_as',
  };
  const tableName = tableMap[detail];
  if (!tableName) {
    return NextResponse.json({ error: 'Invalid detail type' }, { status: 400 });
  }

  // Get sekolah & mapel_kelas info
  const [sekolahRows]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];

  const [mkRows]: any = await pool.query(
    'SELECT * FROM mapel_kelas WHERE id_mapel_kelas = ?',
    [id_mapel_kelas]
  );
  if (mkRows.length === 0) {
    return NextResponse.json({ error: 'Mapel kelas not found' }, { status: 404 });
  }
  const mk = mkRows[0];
  const idKelas = mk.id_kelas;
  const idMapel = mk.id_mapel;
  const tahun = sekolah.tahun;
  const semester = sekolah.semester;

  const tableConfig: Record<string, { pk: string; hasIdTujuan: boolean; hasNas: boolean }> = {
    nilai_formatif: { pk: 'id_nilai_formatif', hasIdTujuan: true, hasNas: true },
    nilai_sumatif_ph: { pk: 'id_nilai_sumatif_ph', hasIdTujuan: true, hasNas: false },
    nilai_sumatif_ts: { pk: 'id_nilai_sumatif_ts', hasIdTujuan: false, hasNas: false },
    nilai_sumatif_as: { pk: 'id_nilai_sumatif_as', hasIdTujuan: false, hasNas: false },
  };
  const config = tableConfig[tableName];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const entry of entries) {
      if (entry.nilai === '') {
        let where = 'tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? AND id_siswa = ?';
        const params: any[] = [tahun, semester, idKelas, idMapel, entry.id_siswa];
        if (config.hasIdTujuan) {
          where += ' AND id_tujuan = ?';
          params.push(entry.id_tujuan);
        }
        await conn.execute(`DELETE FROM \`${tableName}\` WHERE ${where}`, params);
        continue;
      }

      const nilai = Math.round(parseFloat(entry.nilai) * 100) / 100;
      if (isNaN(nilai) || nilai < 0 || nilai > 100) {
        throw new Error(`Nilai tidak valid untuk siswa ${entry.id_siswa}: harus 0-100 (diterima: ${entry.nilai})`);
      }

      let where = 'tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? AND id_siswa = ?';
      const params: any[] = [tahun, semester, idKelas, idMapel, entry.id_siswa];
      if (config.hasIdTujuan) {
        where += ' AND id_tujuan = ?';
        params.push(entry.id_tujuan);
      }
      const [existing]: any = await conn.execute(
        `SELECT ${config.pk} FROM \`${tableName}\` WHERE ${where}`,
        params
      );

      if (existing.length > 0) {
        let setClause = 'nilai = ?';
        const updateParams: any[] = [nilai];
        if (config.hasNas) {
          setClause += ', nas = 1';
        }
        updateParams.push(existing[0][config.pk]);
        await conn.execute(
          `UPDATE \`${tableName}\` SET ${setClause} WHERE ${config.pk} = ?`,
          updateParams
        );
      } else {
        const cols: string[] = ['tahun', 'semester', 'id_kelas', 'id_mapel', 'id_siswa'];
        const vals: any[] = [tahun, semester, idKelas, idMapel, entry.id_siswa];
        if (config.hasIdTujuan) {
          cols.push('id_tujuan');
          vals.push(entry.id_tujuan);
        }
        cols.push('nilai');
        vals.push(nilai);
        if (config.hasNas) {
          cols.push('nas');
          vals.push(1);
        }
        await conn.execute(
          `INSERT INTO \`${tableName}\` (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
          vals
        );
      }
    }

    await conn.commit();

    // Jika save dari tab Sumatif AS, hitung dan simpan nilaiAkhir ke nilai_mata_pelajaran
    if (detail === 'sumatif-as' && entries.length > 0) {
      try {
        // Ambil semua data Formatif + PH + AS untuk kelas & mapel ini
        const [fmtRows]: any = await pool.query(
          'SELECT id_siswa, ROUND(AVG(nilai), 2) AS rata FROM nilai_formatif WHERE tahun=? AND semester=? AND id_kelas=? AND id_mapel=? GROUP BY id_siswa',
          [tahun, semester, idKelas, idMapel]
        );
        const [phRows]: any = await pool.query(
          'SELECT id_siswa, ROUND(AVG(nilai), 2) AS rata FROM nilai_sumatif_ph WHERE tahun=? AND semester=? AND id_kelas=? AND id_mapel=? GROUP BY id_siswa',
          [tahun, semester, idKelas, idMapel]
        );
        const [asRows]: any = await pool.query(
          'SELECT id_siswa, nilai FROM nilai_sumatif_as WHERE tahun=? AND semester=? AND id_kelas=? AND id_mapel=?',
          [tahun, semester, idKelas, idMapel]
        );

        // Map data per siswa
        const fmtMap = new Map<number, number>(fmtRows.map((r: any) => [r.id_siswa, parseFloat(r.rata)]));
        const phMap = new Map<number, number>(phRows.map((r: any) => [r.id_siswa, parseFloat(r.rata)]));
        const asMap = new Map<number, number>(asRows.map((r: any) => [r.id_siswa, parseFloat(r.nilai)]));

        // Himpunan semua siswa yang punya data di salah satu tabel
        const semuaSiswa = new Set<number>([...fmtMap.keys(), ...phMap.keys(), ...asMap.keys()]);

        for (const idSiswa of semuaSiswa) {
          const nilaiF = fmtMap.get(idSiswa) || 0;
          const nilaiPH = phMap.get(idSiswa) || 0;
          const nilaiAS = asMap.get(idSiswa) || 0;
          const nilaiAkhir = Math.round((nilaiF * 0.35 + nilaiPH * 0.35 + nilaiAS * 0.30) * 100) / 100;

          const [existingNmp]: any = await pool.query(
            'SELECT id_nilai_mata_pelajaran FROM nilai_mata_pelajaran WHERE tahun=? AND semester=? AND id_kelas=? AND id_mapel=? AND id_siswa=?',
            [tahun, semester, idKelas, idMapel, idSiswa]
          );

          if (existingNmp.length > 0) {
            await pool.query(
              'UPDATE nilai_mata_pelajaran SET nilai=? WHERE id_nilai_mata_pelajaran=?',
              [nilaiAkhir, existingNmp[0].id_nilai_mata_pelajaran]
            );
          } else {
            await pool.query(
              'INSERT INTO nilai_mata_pelajaran (tahun, semester, id_kelas, id_mapel, id_siswa, nilai) VALUES (?,?,?,?,?,?)',
              [tahun, semester, idKelas, idMapel, idSiswa, nilaiAkhir]
            );
          }
        }
      } catch (err: any) {
        console.error('Gagal menyimpan nilai akhir ke nilai_mata_pelajaran:', err);
        // Jangan throw — nilai sudah tersimpan di tabel asal, ini hanya bonus
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    await conn.rollback();
    console.error('Save penilaian error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
