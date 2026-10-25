'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getBKRekap } from '@/lib/actions/bk-actions';
import type { BKClass } from '@/lib/actions/bk-actions';
import { formatKelamin } from '@/lib/bk';

interface Row {
  id_siswa: number;
  nama_siswa: string;
  nis: string | null;
  kelamin: string | null;
  total: number;
  [key: string]: any;
}

interface Props {
  classes: BKClass[];
  idKelas: number | null;
  rows: Row[];
}

export default function BKSiswaClient({ classes, idKelas, rows }: Props) {
  const [data, setData] = useState<Row[]>(rows);
  const [kelas, setKelas] = useState<number | null>(idKelas);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKelas = async (value: number) => {
    setKelas(value);
    setLoading(true);
    const result = await getBKRekap(value);
    setData(result.rows as Row[]);
    setLoading(false);
  };

  const filtered = useMemo(
    () => data.filter((r) => r.nama_siswa.toLowerCase().includes(search.toLowerCase().trim())),
    [data, search],
  );

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xl font-semibold text-[#1A1A2E]">Data Siswa BK</h4>
        <p className="mt-1 text-sm text-[#6B7280]">Pilih siswa untuk melihat riwayat layanan dan mencetak informasi.</p>
      </div>

      <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white premium-shadow">
        <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(0,0,0,0.04)] px-5 py-3">
          <select
            value={kelas ?? ''}
            onChange={(e) => handleKelas(Number(e.target.value))}
            className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#F8F9FB] px-3 py-1.5 text-xs outline-none focus:border-[#DC2626]"
          >
            {classes.map((k) => (
              <option key={k.id_kelas} value={k.id_kelas}>
                {k.nama_kelas} ({k.jumlah})
              </option>
            ))}
          </select>
          <span className="text-xs text-[#9CA3AF]">{filtered.length} siswa</span>
          <div className="relative ml-auto">
            <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari siswa..."
              className="w-48 rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#F8F9FB] py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#DC2626]"
            />
          </div>
        </div>

        <div className="divide-y divide-[rgba(0,0,0,0.04)]">
          {loading ? (
            <p className="px-5 py-10 text-center text-sm text-[#9CA3AF]">Memuat…</p>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[#9CA3AF]">Tidak ada siswa.</p>
          ) : (
            filtered.map((row) => (
              <Link
                key={row.id_siswa}
                href={`/guru/bk/siswa/${row.id_siswa}`}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[#F8F9FB]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1A1A2E]">{row.nama_siswa}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{row.nis ?? '—'} · {formatKelamin(row.kelamin)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full bg-[#F8F9FB] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280]">
                    {row.total} sesi
                  </span>
                  <svg className="h-4 w-4 text-[#C4C4CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
