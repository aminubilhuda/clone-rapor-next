'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BIDANG_LABEL,
  JENIS_BK,
  JENIS_FIELDS,
  bidangToArray,
  formatKelamin,
  formatTanggalPendek,
  getJenisConfig,
  sesiSummary,
  type BKStudent,
  type BKSession,
  type JenisLayananBK,
} from '@/lib/bk';
import type { BKClass } from '@/lib/actions/bk-actions';
import { createBKSesi } from '@/lib/actions/bk-actions';
import { useToast } from '@/components/ui/toast-provider';
import BKSessionDrawer from './bk-session-drawer';
import BKGroupForm from './bk-group-form';

interface Props {
  jenis: JenisLayananBK;
  classes: BKClass[];
  idKelas: number;
  students: BKStudent[];
  sessions: BKSession[];
  initialOpen?: { idLayanan: number; idSiswa: number } | null;
}

const COLORS: Record<string, { badge: string; dot: string; soft: string }> = {
  emerald: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', soft: 'bg-emerald-50' },
  sky: { badge: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500', soft: 'bg-sky-50' },
  amber: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', soft: 'bg-amber-50' },
  violet: { badge: 'bg-violet-50 text-violet-700', dot: 'bg-violet-500', soft: 'bg-violet-50' },
  rose: { badge: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500', soft: 'bg-rose-50' },
  indigo: { badge: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500', soft: 'bg-indigo-50' },
  teal: { badge: 'bg-teal-50 text-teal-700', dot: 'bg-teal-500', soft: 'bg-teal-50' },
  orange: { badge: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500', soft: 'bg-orange-50' },
};

function SessionCard({ session, onClick }: { session: BKSession; onClick: () => void }) {
  const bidang = bidangToArray(session.bidang_bimbingan);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-2.5 py-2 text-left transition-colors hover:border-[rgba(220,38,38,0.35)] hover:bg-[#FEF2F2]/40"
    >
      <p className="text-[11px] font-semibold text-[#1A1A2E]">{formatTanggalPendek(session.tanggal)}</p>
      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#6B7280]">{sesiSummary(session)}</p>
      {bidang.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {bidang.slice(0, 2).map((b) => (
            <span key={b} className="rounded-full bg-[#F8F9FB] px-1.5 py-0.5 text-[9px] font-medium text-[#6B7280]">
              {BIDANG_LABEL[b]}
            </span>
          ))}
          {bidang.length > 2 && (
            <span className="text-[9px] text-[#9CA3AF]">+{bidang.length - 2}</span>
          )}
        </div>
      )}
    </button>
  );
}

export default function BKGridClient({ jenis, classes, idKelas, students, sessions, initialOpen }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const config = getJenisConfig(jenis);
  const fields = JENIS_FIELDS[jenis];
  const colors = COLORS[config.color] ?? COLORS.emerald;
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<{ idLayanan: number; idSiswa: number } | null>(initialOpen ?? null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [creating, setCreating] = useState<number | null>(null);

  const byStudent = useMemo(() => {
    const map = new Map<number, BKSession[]>();
    for (const session of sessions) {
      const list = map.get(Number(session.id_siswa)) ?? [];
      list.push(session);
      map.set(Number(session.id_siswa), list);
    }
    return map;
  }, [sessions]);

  const maxSessions = useMemo(
    () => Math.max(0, ...Array.from(byStudent.values()).map((list) => list.length)),
    [byStudent],
  );
  const columns = Math.max(3, maxSessions + 1);

  const filtered = useMemo(
    () => students.filter((s) => s.nama_siswa.toLowerCase().includes(search.toLowerCase().trim())),
    [students, search],
  );

  const openSession = (session: BKSession) =>
    setOpen({ idLayanan: Number(session.id_layanan), idSiswa: Number(session.id_siswa) });

  const createSession = async (student: BKStudent) => {
    setCreating(student.id_siswa);
    const result = await createBKSesi(jenis, idKelas, student.id_siswa);
    setCreating(null);
    if (result.success && result.idLayanan) {
      setOpen({ idLayanan: result.idLayanan, idSiswa: student.id_siswa });
      router.refresh();
    } else {
      showToast(result.error || 'Gagal membuat sesi', 'error');
    }
  };

  const openStudent = open ? students.find((s) => s.id_siswa === open.idSiswa) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-xl font-semibold text-[#1A1A2E]">Layanan BK</h4>
          <p className="mt-1 text-sm text-[#6B7280]">
            Catatan layanan per siswa. Klik sesi untuk mengisi detail.
          </p>
        </div>
        {fields.multiPeserta && (
          <button
            type="button"
            onClick={() => setGroupOpen(true)}
            disabled={!idKelas}
            className="inline-flex items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Layanan
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {JENIS_BK.map((item) => {
          const active = item.key === jenis;
          return (
            <Link
              key={item.key}
              href={`/guru/bk/layanan?jenis=${item.key}&kelas=${idKelas}`}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                  : 'border-[rgba(0,0,0,0.08)] bg-white text-[#6B7280] hover:border-[rgba(0,0,0,0.16)]'
              }`}
            >
              {item.short}
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white premium-shadow">
        <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(0,0,0,0.04)] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors.badge}`}>
              {config.label}
            </span>
          </div>

          <select
            value={idKelas}
            onChange={(e) =>
              router.push(`/guru/bk/layanan?jenis=${jenis}&kelas=${e.target.value}`)
            }
            className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#F8F9FB] px-3 py-1.5 text-xs outline-none focus:border-[#DC2626]"
          >
            {classes.length === 0 && <option value={0}>Belum ada kelas</option>}
            {classes.map((k) => (
              <option key={k.id_kelas} value={k.id_kelas}>
                {k.nama_kelas} ({k.jumlah})
              </option>
            ))}
          </select>

          <div className="relative ml-auto">
            <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari siswa..."
              className="w-44 rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#F8F9FB] py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#DC2626]"
            />
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FB]">
              <tr className="border-b border-[rgba(0,0,0,0.06)]">
                <th className="w-12 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">No</th>
                <th className="min-w-[180px] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Nama</th>
                <th className="w-10 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">L/P</th>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="min-w-[170px] px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Sesi {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3 + columns} className="px-4 py-12 text-center text-sm text-[#9CA3AF]">
                    {students.length === 0 ? 'Belum ada siswa di kelas ini.' : 'Tidak ada siswa yang cocok.'}
                  </td>
                </tr>
              ) : (
                filtered.map((student, rowIndex) => {
                  const list = byStudent.get(student.id_siswa) ?? [];
                  return (
                    <tr key={student.id_siswa} className="border-b border-[rgba(0,0,0,0.04)] last:border-0 hover:bg-[#F8F9FB]/50">
                      <td className="px-3 py-2 text-xs tabular-nums text-[#9CA3AF]">{rowIndex + 1}</td>
                      <td className="px-3 py-2 font-medium text-[#1A1A2E]">{student.nama_siswa}</td>
                      <td className="px-2 py-2 text-center text-xs text-[#6B7280]">{formatKelamin(student.kelamin)}</td>
                      {Array.from({ length: columns }).map((_, index) => {
                        const session = list[index];
                        if (session) {
                          return (
                            <td key={index} className="px-1.5 py-1.5">
                              <SessionCard session={session} onClick={() => openSession(session)} />
                            </td>
                          );
                        }
                        if (index === list.length) {
                          return (
                            <td key={index} className="px-1.5 py-1.5">
                              <button
                                type="button"
                                onClick={() => createSession(student)}
                                disabled={creating === student.id_siswa}
                                className="flex h-[58px] w-full items-center justify-center gap-1 rounded-lg border border-dashed border-[rgba(0,0,0,0.14)] text-[11px] font-medium text-[#9CA3AF] transition-colors hover:border-[#DC2626] hover:text-[#DC2626] disabled:opacity-40"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {creating === student.id_siswa ? '…' : 'Tambah'}
                              </button>
                            </td>
                          );
                        }
                        return (
                          <td key={index} className="px-1.5 py-1.5">
                            <div className="flex h-[58px] items-center justify-center rounded-lg border border-dashed border-[rgba(0,0,0,0.05)] text-[11px] text-[#E5E7EB]">
                              —
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-[rgba(0,0,0,0.04)] md:hidden">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[#9CA3AF]">
              {students.length === 0 ? 'Belum ada siswa di kelas ini.' : 'Tidak ada siswa yang cocok.'}
            </p>
          ) : (
            filtered.map((student) => {
              const list = byStudent.get(student.id_siswa) ?? [];
              return (
                <div key={student.id_siswa} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1A1A2E]">{student.nama_siswa}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{student.nis ?? '—'} · {formatKelamin(student.kelamin)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => createSession(student)}
                      disabled={creating === student.id_siswa}
                      className="shrink-0 rounded-lg border border-dashed border-[rgba(0,0,0,0.15)] px-2.5 py-1.5 text-[11px] text-[#6B7280] disabled:opacity-40"
                    >
                      + Sesi
                    </button>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {list.length === 0 ? (
                      <p className="text-[11px] text-[#9CA3AF]">Belum ada sesi.</p>
                    ) : (
                      list.map((session) => (
                        <SessionCard key={session.id_layanan} session={session} onClick={() => openSession(session)} />
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {open && openStudent && (
        <BKSessionDrawer
          key={`${open.idLayanan}-${open.idSiswa}`}
          idLayanan={open.idLayanan}
          idSiswa={open.idSiswa}
          studentName={openStudent.nama_siswa}
          jenis={jenis}
          onClose={() => setOpen(null)}
          onSaved={() => router.refresh()}
        />
      )}

      {groupOpen && (
        <BKGroupForm
          jenis={jenis}
          idKelas={idKelas}
          onClose={() => setGroupOpen(false)}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}
