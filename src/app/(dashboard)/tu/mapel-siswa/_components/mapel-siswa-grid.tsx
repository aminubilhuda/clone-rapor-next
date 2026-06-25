'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toggleMapelSiswa, toggleMapelSiswaBatch } from '@/lib/actions/mapel-siswa-actions';
import { useToast } from '@/components/ui/toast-provider';

interface KelasItem {
  id: number;
  label: string;
}

interface Subject {
  id_mapel: number;
  nama_mapel: string;
}

interface Student {
  id_siswa: number;
  nama_siswa: string;
  nisn: string;
  enrollments: Set<number>;
}

interface MapelSiswaGridProps {
  kelasList: KelasItem[];
  selectedKelasId: number | null;
  subjects: Subject[];
  students: Student[];
  tahun: number;
  semester: number;
}

function HeaderCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.checked = checked;
      ref.current.indeterminate = indeterminate;
    }
  }, [checked, indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      disabled={disabled}
      onChange={onChange}
      className="w-4 h-4 text-[#DC2626] border-white/50 rounded focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-wait"
    />
  );
}

export default function MapelSiswaGrid({
  kelasList,
  selectedKelasId,
  subjects,
  students,
  tahun,
  semester,
}: MapelSiswaGridProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loadingCells, setLoadingCells] = useState<Set<string>>(new Set());
  const [loadingColumns, setLoadingColumns] = useState<Set<number>>(new Set());
  const [optimisticEnrollments, setOptimisticEnrollments] = useState<Map<string, boolean>>(new Map());

  const getCellKey = (siswaId: number, mapelId: number) => `${siswaId}_${mapelId}`;

  const isEnrolled = useCallback(
    (siswaId: number, mapelId: number) => {
      const key = getCellKey(siswaId, mapelId);
      if (optimisticEnrollments.has(key)) return optimisticEnrollments.get(key)!;
      const student = students.find((s) => s.id_siswa === siswaId);
      return student ? student.enrollments.has(mapelId) : false;
    },
    [students, optimisticEnrollments]
  );

  const enrolledCountForMapel = useCallback(
    (mapelId: number) => students.filter((s) => isEnrolled(s.id_siswa, mapelId)).length,
    [students, isEnrolled]
  );

  const handleToggle = async (siswaId: number, mapelId: number, checked: boolean) => {
    const key = getCellKey(siswaId, mapelId);

    setLoadingCells((prev) => new Set(prev).add(key));
    setOptimisticEnrollments((prev) => {
      const next = new Map(prev);
      next.set(key, checked);
      return next;
    });

    const fd = new FormData();
    fd.set('id_siswa', String(siswaId));
    fd.set('id_mapel', String(mapelId));
    fd.set('id_kelas', String(selectedKelasId));
    fd.set('diikuti', checked ? 'true' : 'false');

    const result = await toggleMapelSiswa(fd);

    setLoadingCells((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

    if (result.success) {
      showToast('Data berhasil disimpan!', 'success');
    } else {
      setOptimisticEnrollments((prev) => {
        const next = new Map(prev);
        next.set(key, !checked);
        return next;
      });
      showToast(result.error || 'Gagal menyimpan data!', 'error');
    }
  };

  const handleToggleAll = async (mapelId: number) => {
    const allChecked = students.every((s) => isEnrolled(s.id_siswa, mapelId));
    const newChecked = !allChecked;

    // Clear any per-cell pending toggles for this column
    setLoadingCells((prev) => {
      const next = new Set(prev);
      students.forEach((s) => next.delete(getCellKey(s.id_siswa, mapelId)));
      return next;
    });
    setLoadingColumns((prev) => new Set(prev).add(mapelId));
    setOptimisticEnrollments((prev) => {
      const next = new Map(prev);
      students.forEach((s) => next.set(getCellKey(s.id_siswa, mapelId), newChecked));
      return next;
    });

    const entries = students.map((s) => ({
      id_siswa: s.id_siswa,
      diikuti: newChecked,
    }));

    const fd = new FormData();
    fd.set('id_kelas', String(selectedKelasId));
    fd.set('id_mapel', String(mapelId));
    fd.set('entries', JSON.stringify(entries));

    const result = await toggleMapelSiswaBatch(fd);

    setLoadingColumns((prev) => {
      const next = new Set(prev);
      next.delete(mapelId);
      return next;
    });

    if (result.success) {
      showToast('Data berhasil disimpan!', 'success');
    } else {
      setOptimisticEnrollments((prev) => {
        const next = new Map(prev);
        students.forEach((s) => next.set(getCellKey(s.id_siswa, mapelId), !newChecked));
        return next;
      });
      showToast(result.error || 'Gagal menyimpan data!', 'error');
    }
  };

  if (!selectedKelasId) {
    return (
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] p-8 text-center">
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) router.push(`/tu/mapel-siswa?kelas=${e.target.value}`);
          }}
          className="w-full md:w-96 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none mb-4 transition-all"
        >
          <option value="">Pilih Kelas</option>
          {kelasList.map((k) => (
            <option key={k.id} value={k.id}>{k.label}</option>
          ))}
        </select>
        <p className="text-[#6B7280] mt-2">Pilih kelas untuk melihat data mata pelajaran siswa.</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] p-8">
        <KelasDropdown kelasList={kelasList} selectedKelasId={selectedKelasId} />
        <p className="text-[#6B7280] text-center mt-6">Belum ada siswa terdaftar di kelas ini.</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] p-8">
        <KelasDropdown kelasList={kelasList} selectedKelasId={selectedKelasId} />
        <p className="text-[#6B7280] text-center mt-6">Belum ada mata pelajaran yang dikonfigurasi untuk kelas ini.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
      <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
        <KelasDropdown kelasList={kelasList} selectedKelasId={selectedKelasId} />
        <p className="text-xs text-[#6B7280] mt-1">
          Tahun {tahun} - Semester {semester}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#DC2626] text-white">
              <th rowSpan={2} scope="col" className="text-center px-3 py-2 font-semibold w-12 sticky left-0 bg-[#DC2626] z-10 align-middle">NO</th>
              <th rowSpan={2} scope="col" className="text-left px-3 py-2 font-semibold min-w-44 sticky left-12 bg-[#DC2626] z-10 align-middle">Nama Siswa</th>
              {subjects.map((mapel) => (
                <th key={mapel.id_mapel} scope="col" className="text-center px-2 py-2 font-semibold min-w-16 max-w-20 align-middle">
                  <span className="text-[11px] leading-tight">{mapel.nama_mapel}</span>
                </th>
              ))}
            </tr>
            <tr className="bg-[#DC2626] text-white">
              {subjects.map((mapel) => {
                const allChecked = students.every((s) => isEnrolled(s.id_siswa, mapel.id_mapel));
                const noneChecked = students.every((s) => !isEnrolled(s.id_siswa, mapel.id_mapel));
                const colLoading = loadingColumns.has(mapel.id_mapel);
                return (
                  <td key={mapel.id_mapel} className="text-center px-2 py-1 align-middle">
                    <label className="inline-flex items-center justify-center gap-1 cursor-pointer">
                      <HeaderCheckbox
                        checked={allChecked}
                        indeterminate={!allChecked && !noneChecked}
                        disabled={colLoading}
                        onChange={() => handleToggleAll(mapel.id_mapel)}
                      />
                      {colLoading && (
                        <svg className="w-3 h-3 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                    </label>
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {students.map((siswa, i) => (
              <tr
                key={siswa.id_siswa}
                className={`${i % 2 === 0 ? 'bg-[#F8F9FB]' : 'bg-white'} hover:bg-[#F8F9FB] transition-colors`}
              >
                <td className="text-center px-3 py-2 text-[#6B7280] text-xs sticky left-0 bg-inherit z-[1]">{i + 1}</td>
                <td className="px-3 py-2 font-medium text-[#1A1A2E] sticky left-12 bg-inherit z-[1]">{siswa.nama_siswa}</td>
                {subjects.map((mapel) => {
                  const key = getCellKey(siswa.id_siswa, mapel.id_mapel);
                  const loading = loadingCells.has(key) || loadingColumns.has(mapel.id_mapel);
                  const enrolled = isEnrolled(siswa.id_siswa, mapel.id_mapel);
                  return (
                    <td key={mapel.id_mapel} className="text-center px-2 py-2">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enrolled}
                          disabled={loading}
                          onChange={(e) => handleToggle(siswa.id_siswa, mapel.id_mapel, e.target.checked)}
                          aria-label={`${siswa.nama_siswa} - ${mapel.nama_mapel}`}
                          className="w-4 h-4 text-[#DC2626] border-gray-300 rounded focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-wait"
                        />
                        {loading && (
                          <svg className="w-3 h-3 ml-1 animate-spin text-[#DC2626]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )}
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KelasDropdown({
  kelasList,
  selectedKelasId,
}: {
  kelasList: KelasItem[];
  selectedKelasId: number;
}) {
  const router = useRouter();
  return (
    <select
      value={selectedKelasId}
      onChange={(e) => router.push(`/tu/mapel-siswa?kelas=${e.target.value}`)}
      className="w-full md:w-96 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
    >
      <option value="">Pilih Kelas</option>
      {kelasList.map((k) => (
        <option key={k.id} value={k.id}>{k.label}</option>
      ))}
    </select>
  );
}
