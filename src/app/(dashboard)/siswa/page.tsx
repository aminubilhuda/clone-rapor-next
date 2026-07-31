import { getSiswaPortalContext } from '@/lib/siswa-portal-data';

function formatTanggal(value: string | Date | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-black/[0.04] py-3 last:border-0 sm:grid-cols-[150px_1fr]">
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="text-sm font-medium text-[#1A1A2E]">{value || '-'}</dd>
    </div>
  );
}

export default async function SiswaDashboardPage() {
  const { siswa, periode } = await getSiswaPortalContext();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-[#151526] p-6 text-white premium-shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-red-300">Data Peserta Didik</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{siswa.nama_siswa}</h1>
            <div className="mt-3 flex items-center gap-3">
              <p className="text-sm text-white/55">
                Pastikan data diri Anda sudah benar.
              </p>
              <a href="/siswa/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-red-300 hover:text-red-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Data
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
              <p className="text-xs text-white/45">Kelas</p>
              <p className="mt-1 font-semibold">{siswa.nama_kelas}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
              <p className="text-xs text-white/45">Periode Aktif</p>
              <p className="mt-1 font-semibold">{periode.nama_semester} {periode.tahun_pelajaran}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/[0.04] bg-white p-5 premium-shadow sm:p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <h2 className="font-semibold text-[#1A1A2E]">Identitas Siswa</h2>
              <p className="text-xs text-[#6B7280]">Data pokok peserta didik</p>
            </div>
          </div>
          <dl>
            <DataRow label="Nama Lengkap" value={siswa.nama_siswa} />
            <DataRow label="NIS" value={siswa.nis} />
            <DataRow label="NISN" value={siswa.nisn} />
            <DataRow label="Jenis Kelamin" value={siswa.jenis_kelamin} />
            <DataRow label="Agama" value={siswa.agama} />
            <DataRow label="Tempat Lahir" value={siswa.tempat_lahir} />
            <DataRow label="Tanggal Lahir" value={formatTanggal(siswa.tanggal_lahir)} />
          </dl>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-black/[0.04] bg-white p-5 premium-shadow sm:p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div>
                <h2 className="font-semibold text-[#1A1A2E]">Data Akademik</h2>
                <p className="text-xs text-[#6B7280]">Penempatan pada periode aktif</p>
              </div>
            </div>
            <dl>
              <DataRow label="Kelas" value={siswa.nama_kelas} />
              <DataRow label="Kompetensi Keahlian" value={siswa.kompetensi_keahlian} />
              <DataRow label="Semester" value={periode.nama_semester} />
              <DataRow label="Tahun Pelajaran" value={periode.tahun_pelajaran} />
            </dl>
          </div>

          <div className="rounded-2xl border border-black/[0.04] bg-white p-5 premium-shadow sm:p-6">
            <h2 className="font-semibold text-[#1A1A2E]">Kontak dan Alamat</h2>
            <dl className="mt-2">
              <DataRow label="Nomor Kontak" value={siswa.kontak_siswa} />
              <DataRow label="Alamat" value={siswa.alamat} />
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
