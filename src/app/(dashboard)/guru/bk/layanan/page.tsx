import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBKClasses, getBKGrid } from '@/lib/actions/bk-actions';
import { isJenisLayananBK, type JenisLayananBK } from '@/lib/bk';
import BKGridClient from './_components/bk-grid-client';

export default async function BKLayananPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string; kelas?: string; sesi?: string; siswa?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');

  const params = await searchParams;
  const jenis: JenisLayananBK =
    params.jenis && isJenisLayananBK(params.jenis) ? params.jenis : 'konseling_individu';

  const classes = await getBKClasses();
  const requested = Number(params.kelas);
  const idKelas = requested > 0 ? requested : classes[0]?.id_kelas ?? 0;
  const data = idKelas ? await getBKGrid(jenis, idKelas) : { students: [], sessions: [] };

  const sesi = Number(params.sesi);
  const siswa = Number(params.siswa);
  const initialOpen =
    sesi > 0 && siswa > 0 ? { idLayanan: sesi, idSiswa: siswa } : null;

  return (
    <BKGridClient
      jenis={jenis}
      classes={classes}
      idKelas={idKelas}
      students={data.students}
      sessions={data.sessions}
      initialOpen={initialOpen}
    />
  );
}
