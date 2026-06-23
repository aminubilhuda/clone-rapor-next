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

  // Get mapel_kelas info
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
      const nilai = parseFloat(entry.nilai);
      if (isNaN(nilai) || entry.nilai === '') {
        let where = 'tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? AND id_siswa = ?';
        const params: any[] = [sekolah.tahun, sekolah.semester, mk.id_kelas, mk.id_mapel, entry.id_siswa];
        if (config.hasIdTujuan) {
          where += ' AND id_tujuan = ?';
          params.push(entry.id_tujuan);
        }
        await conn.execute(`DELETE FROM \`${tableName}\` WHERE ${where}`, params);
        continue;
      }

      let where = 'tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? AND id_siswa = ?';
      const params: any[] = [sekolah.tahun, sekolah.semester, mk.id_kelas, mk.id_mapel, entry.id_siswa];
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
        const vals: any[] = [sekolah.tahun, sekolah.semester, mk.id_kelas, mk.id_mapel, entry.id_siswa];
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
    return NextResponse.json({ success: true });
  } catch (err: any) {
    await conn.rollback();
    console.error('Save penilaian error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
