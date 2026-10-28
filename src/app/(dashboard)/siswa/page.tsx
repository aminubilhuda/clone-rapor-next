import Link from 'next/link';
import {
  getNilaiSiswa,
  getPresensiSiswa,
  getSiswaPortalContext,
} from '@/lib/siswa-portal-data';

function formatTanggal(value: string | Date | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

const ICONS: Record<string, React.ReactNode> = {
  nilai: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  presensi: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  profil: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  akun: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
};

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border-b border-[rgba(0,0,0,0.04)] py-2 last:border-0">
      <dt className="text-[10px] uppercase tracking-wider text-[#94A3B8]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-[#1E293B]">{value || '—'}</dd>
    </div>
  );
}

export default async function SiswaDashboardPage() {
  const [context, nilaiData, presensiData] = await Promise.all([
    getSiswaPortalContext(),
    getNilaiSiswa(),
    getPresensiSiswa(),
  ]);
  const { siswa, periode } = context;

  const nilaiList = nilaiData.nilai;
  const nilaiTerisi = nilaiList.filter((item) => typeof item.nilai === 'number');
  const rataRata = nilaiTerisi.length
    ? Math.round(nilaiTerisi.reduce((sum, item) => sum + (item.nilai ?? 0), 0) / nilaiTerisi.length)
    : null;

  const presensi = (key: string) =>
    presensiData.presensi.find((item) => item.absen.toLowerCase().includes(key))?.jumlah ?? 0;
  const hadir = presensi('hadir');
  const sakit = presensi('sakit');
  const izin = presensi('izin');
  const tanpaBerita = presensi('tanpa');
  const totalPresensi = hadir + sakit + izin + tanpaBerita;
  const persenHadir = totalPresensi > 0 ? Math.round((hadir / totalPresensi) * 100) : 0;

  const topNilai = [...nilaiTerisi]
    .sort((a, b) => (b.nilai ?? 0) - (a.nilai ?? 0))
    .slice(0, 6);

  const quickActions = [
    { href: '/siswa/nilai', label: 'Nilai Saya', icon: 'nilai' },
    { href: '/siswa/presensi', label: 'Presensi', icon: 'presensi' },
    { href: '/siswa/profile', label: 'Edit Profil', icon: 'profil' },
    { href: '/siswa/akun', label: 'Akun & Keamanan', icon: 'akun' },
  ];

  return (
    <div className="neu-page -m-3 min-h-full p-3 sm:-m-6 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-6 text-white shadow-[0_20px_50px_rgba(37,99,235,0.25)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">Portal Siswa</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">{siswa.nama_siswa}</h1>
            <p className="mt-1 text-sm text-white/55">
              {siswa.nama_kelas} · NIS {siswa.nis || '—'} · {periode.nama_semester} {periode.tahun_pelajaran}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/siswa/profile"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profil
              </Link>
              <Link
                href="/siswa/nilai"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.12]"
              >
                Lihat Nilai
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[280px]">
            <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40">Rata-rata</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{rataRata ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40">Kehadiran</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{persenHadir}%</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <div className="neu-card p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">{ICONS.nilai}</span>
            <span className="text-[10px] text-[#94A3B8]">Nilai</span>
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-[#1E293B]">{rataRata ?? '—'}</p>
          <p className="text-xs text-[#64748B]">Rata-rata</p>
        </div>
        <div className="neu-card p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">{ICONS.nilai}</span>
            <span className="text-[10px] text-[#94A3B8]">Mapel</span>
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-[#1E293B]">{nilaiList.length}</p>
          <p className="text-xs text-[#64748B]">Mata pelajaran</p>
        </div>
        <div className="neu-card p-4">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">{ICONS.presensi}</span>
            <span className="text-[10px] text-[#94A3B8]">Hadir</span>
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-[#1E293B]">{persenHadir}%</p>
          <p className="text-xs text-[#64748B]">Kehadiran</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="neu-card p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#1E293B]">Nilai Saya</h2>
              <p className="mt-0.5 text-xs text-[#64748B]">
                {nilaiTerisi.length} dari {nilaiList.length} mapel sudah dinilai.
              </p>
            </div>
            <Link href="/siswa/nilai" className="text-[11px] font-medium text-[#2563EB] hover:underline">
              Lihat semua
            </Link>
          </div>

          {topNilai.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#94A3B8]">Belum ada nilai pada periode ini.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {topNilai.map((item) => (
                <div key={item.nama_mapel}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-[#1E293B]">{item.nama_mapel}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-[#1E293B]">
                      {item.nilai ?? '—'}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#F1F2F5]">
                    <div
                      className={`h-full rounded-full ${(item.nilai ?? 0) >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, item.nilai ?? 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="neu-card p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[#1E293B]">Presensi</h2>
                <p className="mt-0.5 text-xs text-[#64748B]">Rekap kehadiran periode ini.</p>
              </div>
              <span className="text-2xl font-bold tabular-nums text-[#1E293B]">{persenHadir}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F1F2F5]">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${persenHadir}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: 'Hadir', value: hadir, color: 'text-emerald-600' },
                { label: 'Sakit', value: sakit, color: 'text-amber-600' },
                { label: 'Izin', value: izin, color: 'text-sky-600' },
                { label: 'Tanpa Berita', value: tanpaBerita, color: 'text-rose-600' },
              ].map((item) => (
                <div key={item.label} className="neu-inset rounded-xl px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">{item.label}</p>
                  <p className={`mt-0.5 text-sm font-semibold tabular-nums ${item.value === 0 ? 'text-[#D1D5DB]' : item.color}`}>
                    {item.value === 0 ? '—' : item.value}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/siswa/presensi" className="mt-3 inline-block text-[11px] font-medium text-[#2563EB] hover:underline">
              Lihat detail presensi
            </Link>
          </section>

          <section className="neu-card p-5">
            <h2 className="text-sm font-semibold text-[#1E293B]">Aksi Cepat</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {quickActions.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col gap-1.5 rounded-xl border border-[rgba(0,0,0,0.05)] px-3 py-2.5 text-xs font-medium text-[#1E293B] transition-colors hover:border-[rgba(37,99,235,0.3)] hover:bg-[#EFF6FF]"
                >
                  <span className="text-[#94A3B8]">{ICONS[item.icon]}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="neu-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#1E293B]">Identitas & Kontak</h2>
            <p className="mt-0.5 text-xs text-[#64748B]">Pastikan data diri sudah benar.</p>
          </div>
          <Link href="/siswa/profile" className="text-[11px] font-medium text-[#2563EB] hover:underline">
            Edit Profil
          </Link>
        </div>
        <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
          <Info label="Nama Lengkap" value={siswa.nama_siswa} />
          <Info label="NIS / NISN" value={`${siswa.nis || '—'} / ${siswa.nisn || '—'}`} />
          <Info label="Jenis Kelamin" value={siswa.jenis_kelamin} />
          <Info label="Agama" value={siswa.agama} />
          <Info label="Tempat, Tanggal Lahir" value={`${siswa.tempat_lahir || '—'}, ${formatTanggal(siswa.tanggal_lahir)}`} />
          <Info label="Kelas / Kompetensi Keahlian" value={`${siswa.nama_kelas} / ${siswa.kompetensi_keahlian}`} />
          <Info label="Nomor Kontak" value={siswa.kontak_siswa} />
          <Info label="Alamat" value={siswa.alamat} />
        </dl>
      </section>
      </div>
    </div>
  );
}
