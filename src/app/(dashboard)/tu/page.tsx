import Link from 'next/link';
import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';

interface KelasSebaran {
  nama_kelas: string;
  jumlah: number;
}

async function getStats() {
  try {
    const sekolah = await getSekolahWithFilter();

    const [[guruRows]]: any = await pool.query(
      'SELECT COUNT(*) AS count FROM users WHERE jabatan = 3 AND deleted_at IS NULL'
    );
    const [[siswaKelasRows]]: any = await pool.query(
      'SELECT COUNT(DISTINCT id_siswa) AS count FROM siswa_kelas WHERE tahun = ? AND semester = ? AND status = 1 AND deleted_at IS NULL',
      [sekolah.tahun, sekolah.semester]
    );
    const [[kelasRows]]: any = await pool.query(
      'SELECT COUNT(*) AS count FROM kelas WHERE deleted_at IS NULL'
    );
    const [[mapelRows]]: any = await pool.query(
      'SELECT COUNT(*) AS count FROM mapel WHERE deleted_at IS NULL'
    );
    const [[prakerinRows]]: any = await pool.query(
      'SELECT COUNT(*) AS count FROM prakerin WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );
    const [[eskulRows]]: any = await pool.query(
      'SELECT COUNT(*) AS count FROM eskul WHERE deleted_at IS NULL'
    );
    const [[kompetensiRows]]: any = await pool.query(
      'SELECT COUNT(*) AS count FROM kompetensi_keahlian WHERE deleted_at IS NULL'
    );
    const [[mutasiMasukRows]]: any = await pool.query(
      'SELECT COUNT(*) AS count FROM mutasi_masuk WHERE tahun = ?',
      [sekolah.tahun]
    );
    const [[mutasiKeluarRows]]: any = await pool.query(
      'SELECT COUNT(*) AS count FROM mutasi_keluar WHERE tahun = ?',
      [sekolah.tahun]
    );
    const [[lulusanRows]]: any = await pool.query(
      'SELECT COUNT(*) AS count FROM lulusan WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );

    const [[rataKelasRows]]: any = await pool.query(
      'SELECT ROUND(AVG(nilai), 2) AS rata FROM nilai_kelas WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );
    const [[rataMidRows]]: any = await pool.query(
      'SELECT ROUND(AVG(nilai), 2) AS rata FROM nilai_kelas_mid WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );
    const [[sudahDinilaiRows]]: any = await pool.query(
      'SELECT COUNT(DISTINCT id_siswa) AS count FROM nilai_kelas WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );
    const [[pembagianRows]]: any = await pool.query(
      'SELECT * FROM pembagian_raport WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );
    const [sebaranRows]: any = await pool.query(
      `SELECT k.nama_kelas, COUNT(DISTINCT sk.id_siswa) AS jumlah
       FROM kelas k
       JOIN siswa_kelas sk ON sk.id_kelas = k.id_kelas
         AND sk.tahun = ? AND sk.semester = ? AND sk.status = 1 AND sk.deleted_at IS NULL
       WHERE k.deleted_at IS NULL
       GROUP BY k.id_kelas, k.nama_kelas
       ORDER BY jumlah DESC, k.nama_kelas ASC
       LIMIT 8`,
      [sekolah.tahun, sekolah.semester]
    );

    const [[semesterRows]]: any = await pool.query(
      'SELECT * FROM semester WHERE id_semester = ?',
      [sekolah.semester]
    );
    const [[tahunRows]]: any = await pool.query(
      'SELECT * FROM tahun_pelajaran WHERE id_tahun_pelajaran = ?',
      [sekolah.tahun]
    );

    const totalSiswa = Number(siswaKelasRows.count);
    const sudahDinilai = Number(sudahDinilaiRows.count);
    const persenDinilai = totalSiswa > 0 ? Math.round((sudahDinilai / totalSiswa) * 100) : 0;

    return {
      sekolah,
      stats: {
        jmlGuru: Number(guruRows.count),
        jmlSiswa: totalSiswa,
        jmlKelas: Number(kelasRows.count),
        jmlMapel: Number(mapelRows.count),
        jmlPrakerin: Number(prakerinRows.count),
        jmlEskul: Number(eskulRows.count),
        jmlJurusan: Number(kompetensiRows.count),
        jmlMutasiMasuk: Number(mutasiMasukRows.count),
        jmlMutasiKeluar: Number(mutasiKeluarRows.count),
        jmlLulusan: Number(lulusanRows.count),
        rataNilai: rataKelasRows.rata ?? '-',
        rataMid: rataMidRows.rata ?? '-',
        sudahDinilai,
        belumDinilai: Math.max(0, totalSiswa - sudahDinilai),
        persenDinilai,
        tanggalRapor: pembagianRows?.tanggal_rapor || '-',
        tanggalMid: pembagianRows?.tanggal_mid || '-',
        tahunPelajaran: tahunRows?.tahun_pelajaran || '-',
        semester: semesterRows?.semester || '-',
        npsn: sekolah.npsn,
      },
      sebaran: sebaranRows.map((row: any) => ({
        nama_kelas: row.nama_kelas,
        jumlah: Number(row.jumlah),
      })) as KelasSebaran[],
    };
  } catch (error) {
    console.error('Dashboard error:', error);
    return { sekolah: null, stats: null, sebaran: [] as KelasSebaran[] };
  }
}

const ICONS: Record<string, React.ReactNode> = {
  siswa: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
    </svg>
  ),
  guru: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  kelas: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  mapel: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  rapor: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  sync: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  check: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  piket: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

const TONES: Record<string, { bg: string; text: string }> = {
  blueDark: { bg: 'bg-blue-50', text: 'text-blue-600' },
  blue: { bg: 'bg-sky-50', text: 'text-sky-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
};

function StatCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: string;
  label: string;
  value: number | string;
  hint: string;
  tone: keyof typeof TONES;
}) {
  const color = TONES[tone];
  return (
    <div className="neu-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.bg} ${color.text}`}>
          {ICONS[icon]}
        </div>
        <span className="text-[10px] text-[#94A3B8]">{hint}</span>
      </div>
      <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-[#1E293B]">{value}</div>
      <div className="text-xs text-[#64748B]">{label}</div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { href: '/tu/kesiswaan', label: 'Data Siswa', icon: 'siswa' },
  { href: '/tu/pegawai', label: 'Data Pegawai', icon: 'guru' },
  { href: '/tu/rombel', label: 'Kelas / Rombel', icon: 'kelas' },
  { href: '/tu/laporan-pendidikan/daftar-rapor', label: 'Daftar Rapor', icon: 'rapor' },
  { href: '/tu/singkron-dapodik', label: 'Sinkron Dapodik', icon: 'sync' },
  { href: '/tu/piket-harian', label: 'Piket Harian', icon: 'piket' },
];

export default async function TUDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');

  const { stats, sebaran } = await getStats();

  if (!stats) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500">Gagal memuat data dashboard. Periksa koneksi database.</p>
      </div>
    );
  }

  const formatDate = (val: any): string => {
    if (!val || val === '-') return '-';
    const d = typeof val === 'string' ? new Date(val + 'T00:00:00') : new Date(val);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const maxSebaran = Math.max(1, ...sebaran.map((row) => row.jumlah));
  const tahunPelajaran = String(stats.tahunPelajaran).replace('-', '/');
  const sudahPenuh = stats.persenDinilai >= 100 && stats.jmlSiswa > 0;

  const pendukung = [
    { label: 'Praktik Kerja Industri', value: stats.jmlPrakerin },
    { label: 'Ekstrakurikuler', value: stats.jmlEskul },
    { label: 'Kompetensi Keahlian', value: stats.jmlJurusan },
    { label: 'Mutasi Masuk', value: stats.jmlMutasiMasuk },
    { label: 'Mutasi Keluar', value: stats.jmlMutasiKeluar },
    { label: 'Lulusan', value: stats.jmlLulusan },
  ];

  return (
    <div className="neu-page -m-3 space-y-6 p-3 sm:-m-6 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">
            <span>Tata Usaha</span>
            <span className="text-[#D1D5DB]">•</span>
            <span>NPSN {stats.npsn}</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1E293B]">Ringkasan Sekolah</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Tahun Pelajaran {tahunPelajaran} · Semester {stats.semester}
          </p>
        </div>
        <Link
          href="/tu/laporan-pendidikan/daftar-rapor"
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Buka Daftar Rapor
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="siswa" label="Peserta Didik" value={stats.jmlSiswa} hint="Aktif" tone="blue" />
        <StatCard icon="guru" label="Tenaga Pendidik" value={stats.jmlGuru} hint="Guru" tone="emerald" />
        <StatCard icon="kelas" label="Kelas / Rombel" value={stats.jmlKelas} hint="Rombel" tone="amber" />
        <StatCard icon="mapel" label="Mata Pelajaran" value={stats.jmlMapel} hint="Mapel" tone="blueDark" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="neu-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[#1E293B]">Kesiapan Rapor</h2>
              <p className="mt-0.5 text-xs text-[#64748B]">Progres penilaian siswa pada periode ini.</p>
            </div>
            <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[#64748B]">
              {stats.semester} {tahunPelajaran}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-1">
            <span className={`text-4xl font-bold tabular-nums tracking-tight ${sudahPenuh ? 'text-emerald-600' : 'text-[#1E293B]'}`}>
              {stats.persenDinilai}%
            </span>
            <p className="pb-1 text-xs text-[#64748B]">
              <span className="font-semibold text-[#1E293B]">{stats.sudahDinilai}</span> dari{' '}
              {stats.jmlSiswa} siswa sudah dinilai
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F1F2F5]">
            <div
              className={`h-full rounded-full transition-all ${sudahPenuh ? 'bg-emerald-500' : 'bg-[#2563EB]'}`}
              style={{ width: `${Math.min(100, stats.persenDinilai)}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Rata-rata', value: stats.rataNilai },
              { label: 'Tengah Semester', value: stats.rataMid },
              { label: 'Belum Dinilai', value: stats.belumDinilai },
              { label: 'Sudah Dinilai', value: stats.sudahDinilai },
            ].map((item) => (
              <div key={item.label} className="neu-inset rounded-xl px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">{item.label}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#1E293B]">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[rgba(0,0,0,0.04)] pt-3 text-xs text-[#64748B]">
            <span>
              Pembagian rapor: <strong className="font-medium text-[#1E293B]">{formatDate(stats.tanggalRapor)}</strong>
            </span>
            <span>
              Rapor tengah: <strong className="font-medium text-[#1E293B]">{formatDate(stats.tanggalMid)}</strong>
            </span>
          </div>
        </section>

        <section className="self-start neu-card p-5">
          <h2 className="text-sm font-semibold text-[#1E293B]">Aksi Cepat</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="neu-btn flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-xs font-medium text-[#1E293B] transition-colors hover:text-[#2563EB]"
              >
                <span className="text-[#94A3B8]">{ICONS[item.icon]}</span>
                <span className="leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="neu-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#1E293B]">Sebaran Siswa</h2>
              <p className="mt-0.5 text-xs text-[#64748B]">Kelas dengan siswa terbanyak.</p>
            </div>
            <Link href="/tu/rombel" className="text-[11px] font-medium text-[#2563EB] hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {sebaran.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#94A3B8]">Belum ada data siswa.</p>
            ) : (
              sebaran.map((row) => (
                <div key={row.nama_kelas} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 truncate text-xs font-medium text-[#1E293B]">{row.nama_kelas}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1F2F5]">
                    <div
                      className="h-full rounded-full bg-[#2563EB]"
                      style={{ width: `${(row.jumlah / maxSebaran) * 100}%` }}
                    />
                  </div>
                  <span className="w-7 shrink-0 text-right text-xs font-semibold tabular-nums text-[#1E293B]">
                    {row.jumlah}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="self-start neu-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#1E293B]">Data Pendukung</h2>
              <p className="mt-0.5 text-xs text-[#64748B]">Ringkasan data lain di periode ini.</p>
            </div>
            <span className="text-[#94A3B8]">{ICONS.check}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pendukung.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2 neu-inset rounded-xl px-3 py-2">
                <span className="text-[11px] text-[#64748B]">{item.label}</span>
                <span className={`text-sm font-semibold tabular-nums ${item.value === 0 ? 'text-[#D1D5DB]' : 'text-[#1E293B]'}`}>
                  {item.value === 0 ? '—' : item.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
