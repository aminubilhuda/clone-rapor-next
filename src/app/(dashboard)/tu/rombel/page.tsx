import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DataTable from '@/components/ui/data-table';

async function getRombel() {
  const [kelas]: any = await pool.query(`
    SELECT k.*, t.tingkat, kk.kompetensi_keahlian
    FROM kelas k
    JOIN tingkat t ON k.id_tingkat = t.id_tingkat
    JOIN kompetensi_keahlian kk ON k.id_kompetensi_keahlian = kk.id_kompetensi_keahlian
    ORDER BY k.id_kelas ASC
  `);
  return kelas;
}

export default async function RombelPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const rombel = await getRombel();

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Kelas / Rombel</h4>
      <DataTable
        title="Daftar Kelas"
        addLabel="Tambah Kelas"
        columns={[
          { key: 'id_kelas', label: 'ID' },
          { key: 'nama_kelas', label: 'Nama Kelas' },
          { key: 'tingkat', label: 'Tingkat' },
          { key: 'kompetensi_keahlian', label: 'Kompetensi Keahlian' },
        ]}
        data={rombel}
      />
    </div>
  );
}
