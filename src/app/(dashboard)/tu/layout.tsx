import { pool } from '@/lib/db';
import { getViewFilter } from '@/lib/view-filter';
import DashboardLayout from '@/components/layout/dashboard-layout';
import SidebarTU from '@/components/layout/sidebar-tu';

async function getSidebarData() {
  const [tahunRows]: any = await pool.query('SELECT * FROM tahun_pelajaran ORDER BY id_tahun_pelajaran DESC');
  const [semesterRows]: any = await pool.query('SELECT * FROM semester ORDER BY id_semester ASC');
  const [sekolahRows]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];

  const filter = await getViewFilter();

  // Build combined options
  const options: { value: string; label: string; tahun: string; semester: string }[] = [];
  for (const sm of semesterRows) {
    for (const tp of tahunRows) {
      options.push({
        value: `${tp.id_tahun_pelajaran}_${sm.id_semester}`,
        label: `${sm.semester} ${tp.tahun_pelajaran}`,
        tahun: tp.id_tahun_pelajaran.toString(),
        semester: sm.id_semester.toString(),
      });
    }
  }
  // Newest first
  options.reverse();

  // Get active label
  const activeSemester = semesterRows.find((s: any) => s.id_semester === sekolah.semester);
  const activeTahun = tahunRows.find((tp: any) => tp.id_tahun_pelajaran === sekolah.tahun);
  const activeLabel = activeTahun && activeSemester
    ? `${activeSemester.semester} ${activeTahun.tahun_pelajaran}`
    : 'Data Aktif';

  const currentValue = filter.tahun && filter.semester
    ? `${filter.tahun}_${filter.semester}`
    : '';

  return {
    options,
    currentValue,
    activeLabel,
    isHistorical: !!currentValue,
  };
}

export default async function TULayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarData = await getSidebarData();

  return (
    <DashboardLayout sidebar={<SidebarTU data={sidebarData} />}>
      {children}
    </DashboardLayout>
  );
}
