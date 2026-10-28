import Link from 'next/link';
import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { redirect } from 'next/navigation';
import {
  getKelengkapanPembina,
  hrefKelengkapan,
  labelKelengkapan,
} from '@/lib/kelengkapan-ekstra';

interface KelasAmpuh {
  id_kelas: number;
  nama_kelas: string;
  jumlah_mapel: number;
}

async function getGuruDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const idUser = session.user.id_user;

  try {
    const sekolah = await getSekolahWithFilter();

    const [[user]]: any = await pool.query('SELECT * FROM users WHERE id_user = ?', [idUser]);

    const [kelasWaliRows]: any = await pool.query(
      `SELECT kw.*, k.nama_kelas
       FROM kelas_wali kw
       JOIN kelas k ON kw.id_kelas = k.id_kelas
       WHERE kw.tahun = ? AND kw.semester = ? AND kw.id_user = ? AND kw.deleted_at IS NULL`,
      [sekolah.tahun, sekolah.semester, idUser]
    );
    const jumlahWali = kelasWaliRows.length;
    const dataKelas = kelasWaliRows[0] || null;

    const [kelasAmpuhRows]: any = await pool.query(
      `SELECT k.id_kelas, k.nama_kelas, COUNT(DISTINCT mk.id_mapel) AS jumlah_mapel
       FROM mapel_kelas mk
       JOIN kelas k ON k.id_kelas = mk.id_kelas
       WHERE mk.tahun = ? AND mk.semester = ? AND mk.id_user = ? AND mk.deleted_at IS NULL
       GROUP BY k.id_kelas, k.nama_kelas
       ORDER BY k.nama_kelas ASC`,
      [sekolah.tahun, sekolah.semester, idUser]
    );

    let jumlahAnggotaKelas = 0;
    if (dataKelas) {
      const [[anggotaRows]]: any = await pool.query(
        'SELECT COUNT(*) AS count FROM siswa_kelas WHERE tahun = ? AND semester = ? AND id_kelas = ? AND deleted_at IS NULL',
        [sekolah.tahun, sekolah.semester, dataKelas.id_kelas]
      );
      jumlahAnggotaKelas = Number(anggotaRows.count);
    }

    const [[semesterRows]]: any = await pool.query(
      'SELECT * FROM semester WHERE id_semester = ?',
      [sekolah.semester]
    );
    const [[tahunRows]]: any = await pool.query(
      'SELECT * FROM tahun_pelajaran WHERE id_tahun_pelajaran = ?',
      [sekolah.tahun]
    );
    const tugas = await getKelengkapanPembina(Number(idUser), sekolah.tahun, sekolah.semester);

    return {
      user,
      tugas,
      stats: {
        jumlahKelasAmpuh: kelasAmpuhRows.length,
        kelasAmpuh: kelasAmpuhRows.map((row: any) => ({
          id_kelas: Number(row.id_kelas),
          nama_kelas: row.nama_kelas,
          jumlah_mapel: Number(row.jumlah_mapel),
        })) as KelasAmpuh[],
        jumlahWali,
        jumlahAnggotaKelas,
        namaKelas: dataKelas?.nama_kelas || null,
        semester: semesterRows?.semester,
        tahunPelajaran: tahunRows?.tahun_pelajaran,
        isBK: String(user?.moto ?? '') === '1',
      },
    };
  } catch (error) {
    console.error('Guru dashboard error:', error);
    return null;
  }
}

const ICONS: Record<string, React.ReactNode> = {
  kelas: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  siswa: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  tugas: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  nilai: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  target: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  wali: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H6a2 2 0 00-2 2v13a2 2 0 002 2h13a2 2 0 002-2v-5m-1.414-8.414a2 2 0 112.828 2.828L11.828 17H9v-2.828l6.586-6.586z" />
    </svg>
  ),
  rapor: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  ),
  bk: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  piket: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  profil: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

const TONES: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-sky-50', text: 'text-sky-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
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
    <div className="rounded-2xl border border-[rgba(0,0,0,0.04)] bg-white p-4 premium-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.bg} ${color.text}`}>
          {ICONS[icon]}
        </div>
        <span className="text-[10px] text-[#9CA3AF]">{hint}</span>
      </div>
      <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-[#1A1A2E]">{value}</div>
      <div className="text-xs text-[#6B7280]">{label}</div>
    </div>
  );
}

export default async function GuruDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const data = await getGuruDashboard();
  if (!data) {
    return <div className="py-20 text-center text-red-500">Gagal memuat data dashboard.</div>;
  }

  const { user, stats, tugas } = data;
  const belumLengkap = tugas.filter((item) => !item.lengkap);
  const nama = user?.nama || session.user.name || 'Guru';
  const initial = nama.charAt(0).toUpperCase();
  const tahunPelajaran = String(stats.tahunPelajaran ?? '-').replace('-', '/');
  const isWali = stats.jumlahWali > 0;

  const quickActions = [
    { href: '/guru/tujuan-pembelajaran', label: 'Tujuan Pembelajaran', icon: 'target' },
    { href: '/guru/kelas-ku', label: 'Penilaian Angka', icon: 'nilai' },
    ...(isWali
      ? [
          { href: '/guru/catatan-wali', label: 'Catatan Wali', icon: 'wali' },
          { href: '/guru/catatan-rapor', label: 'Daftar Rapor', icon: 'rapor' },
          { href: '/guru/lager-nilai-kelas', label: 'Leger Nilai', icon: 'nilai' },
        ]
      : []),
    { href: '/guru/piket-harian', label: 'Piket Harian', icon: 'piket' },
    ...(stats.isBK ? [{ href: '/guru/bk', label: 'Layanan BK', icon: 'bk' }] : []),
    { href: '/guru/profil', label: 'Profil Saya', icon: 'profil' },
  ];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-[#1A1A2E] px-6 py-5 text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#DC2626]/25 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold">
              {initial}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">Guru</p>
              <h1 className="text-xl font-semibold tracking-tight">Selamat datang, {nama}</h1>
              <p className="mt-0.5 text-sm text-white/60">
                Tahun Pelajaran {tahunPelajaran} · Semester {stats.semester}
              </p>
            </div>
          </div>
          <Link
            href="/guru/tujuan-pembelajaran"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1A2E] transition-colors hover:bg-white/90"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Mulai Penilaian
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon="kelas" label="Kelas Diampu" value={stats.jumlahKelasAmpuh} hint="Kelas" tone="blue" />
        <StatCard
          icon="siswa"
          label="Siswa Wali"
          value={isWali ? stats.jumlahAnggotaKelas : '—'}
          hint={stats.namaKelas || 'Bukan wali'}
          tone="amber"
        />
        <StatCard
          icon="tugas"
          label="Perlu Diisi"
          value={belumLengkap.length}
          hint={belumLengkap.length === 0 ? 'Lengkap' : 'Item'}
          tone={belumLengkap.length === 0 ? 'emerald' : 'amber'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#1A1A2E]">Tugas Saya</h2>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  Kelengkapan administrasi ekstrakurikuler dan organisasi.
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  belumLengkap.length === 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {belumLengkap.length === 0 ? 'Lengkap' : `${belumLengkap.length} item`}
              </span>
            </div>

            {belumLengkap.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50/70 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-800">Semua administrasi lengkap</p>
                  <p className="text-xs text-emerald-700">Tidak ada data yang perlu dilengkapi saat ini.</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {belumLengkap.map((item) => (
                  <div
                    key={`${item.jenis}-${item.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1A1A2E]">{item.nama}</p>
                      <p className="text-[11px] text-amber-700">
                        {item.jenis === 'eskul' ? 'Ekstrakurikuler' : 'Organisasi'} · {labelKelengkapan(item)}
                      </p>
                    </div>
                    <Link
                      href={hrefKelengkapan(item)}
                      className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
                    >
                      Isi
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#1A1A2E]">Kelas yang Diampu</h2>
                <p className="mt-0.5 text-xs text-[#6B7280]">Kelas tempat Anda mengajar mapel.</p>
              </div>
              <Link href="/guru/kelas-ku" className="text-[11px] font-medium text-[#DC2626] hover:underline">
                Buka penilaian
              </Link>
            </div>
            {stats.kelasAmpuh.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#9CA3AF]">Belum ada kelas yang diampu.</p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {stats.kelasAmpuh.map((kelas) => (
                  <Link
                    key={kelas.id_kelas}
                    href="/guru/kelas-ku"
                    className="flex items-center justify-between gap-2 rounded-xl border border-[rgba(0,0,0,0.05)] px-3 py-2.5 transition-colors hover:border-[rgba(220,38,38,0.3)] hover:bg-[#FEF2F2]"
                  >
                    <span className="text-sm font-medium text-[#1A1A2E]">{kelas.nama_kelas}</span>
                    <span className="rounded-full bg-[#F8F9FB] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">
                      {kelas.jumlah_mapel} mapel
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="self-start rounded-2xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow">
          <h2 className="text-sm font-semibold text-[#1A1A2E]">Aksi Cepat</h2>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {quickActions.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="flex items-center gap-3 rounded-xl border border-[rgba(0,0,0,0.05)] px-3 py-2.5 text-sm font-medium text-[#1A1A2E] transition-colors hover:border-[rgba(220,38,38,0.3)] hover:bg-[#FEF2F2]"
              >
                <span className="text-[#9CA3AF]">{ICONS[item.icon]}</span>
                {item.label}
              </Link>
            ))}
          </div>
          {!isWali && (
            <p className="mt-4 rounded-lg bg-[#F8F9FB] px-3 py-2 text-[11px] text-[#6B7280]">
              Anda bukan wali kelas pada periode ini.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
