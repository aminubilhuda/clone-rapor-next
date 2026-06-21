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

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const entry of entries) {
      const nilai = parseFloat(entry.nilai);
      if (isNaN(nilai) || entry.nilai === '') {
        // Delete if empty
        await conn.execute(
          `DELETE FROM \`${tableName}\` WHERE tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? AND id_siswa = ? AND id_tujuan = ?`,
          [sekolah.tahun, sekolah.semester, mk.id_kelas, mk.id_mapel, entry.id_siswa, entry.id_tujuan]
        );
        continue;
      }

      // Upsert
      const [existing]: any = await conn.execute(
        `SELECT id FROM \`${tableName}\` WHERE tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? AND id_siswa = ? AND id_tujuan = ?`,
        [sekolah.tahun, sekolah.semester, mk.id_kelas, mk.id_mapel, entry.id_siswa, entry.id_tujuan]
      );

      if (existing.length > 0) {
        await conn.execute(
          `UPDATE \`${tableName}\` SET nilai = ?, nas = 1 WHERE id = ?`,
          [nilai, existing[0].id]
        );
      } else {
        await conn.execute(
          `INSERT INTO \`${tableName}\` (tahun, semester, id_kelas, id_mapel, id_siswa, id_tujuan, nas, nilai) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
          [sekolah.tahun, sekolah.semester, mk.id_kelas, mk.id_mapel, entry.id_siswa, entry.id_tujuan, nilai]
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
