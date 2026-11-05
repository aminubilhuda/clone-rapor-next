'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { confirmAlert } from '@/lib/swal';
import { BIDANG_BK, BIDANG_LABEL, bidangToArray } from '@/lib/bk';
import { formatAgendaDate, groupAgendaByWeek, type AgendaBKRow } from '@/lib/agenda-bk';
import { addAgendaBK, deleteAgendaBK, updateAgendaBK } from '@/lib/actions/agenda-bk-actions';

const BIDANG_STYLE: Record<string, string> = {
  pribadi: 'bg-emerald-50 text-emerald-700',
  sosial: 'bg-sky-50 text-sky-700',
  belajar: 'bg-amber-50 text-amber-700',
  karir: 'bg-violet-50 text-violet-700',
};

interface FormState {
  tanggal: string;
  waktu: string;
  jenis_kegiatan: string;
  bidang: string[];
  sasaran: string;
  hasil: string;
  tindak_lanjut: string;
}

const EMPTY_FORM: FormState = {
  tanggal: '',
  waktu: '',
  jenis_kegiatan: '',
  bidang: [],
  sasaran: '',
  hasil: '',
  tindak_lanjut: '',
};

export default function AgendaBKClient({ rows }: { rows: AgendaBKRow[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AgendaBKRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const weeks = groupAgendaByWeek(rows);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row: AgendaBKRow) => {
    setEditing(row);
    setForm({
      tanggal: row.tanggal,
      waktu: row.waktu ?? '',
      jenis_kegiatan: row.jenis_kegiatan,
      bidang: bidangToArray(row.bidang),
      sasaran: row.sasaran ?? '',
      hasil: row.hasil ?? '',
      tindak_lanjut: row.tindak_lanjut ?? '',
    });
    setError('');
    setModalOpen(true);
  };

  const toggleBidang = (key: string) => {
    setForm((prev) => ({
      ...prev,
      bidang: prev.bidang.includes(key)
        ? prev.bidang.filter((b) => b !== key)
        : [...prev.bidang, key],
    }));
  };

  const handleSave = async () => {
    if (!form.tanggal) {
      setError('Tanggal wajib diisi');
      return;
    }
    if (!form.jenis_kegiatan.trim()) {
      setError('Jenis kegiatan wajib diisi');
      return;
    }
    if (form.bidang.length === 0) {
      setError('Pilih minimal satu bidang layanan');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.set('tanggal', form.tanggal);
      fd.set('waktu', form.waktu);
      fd.set('jenis_kegiatan', form.jenis_kegiatan);
      fd.set('bidang', JSON.stringify(form.bidang));
      fd.set('sasaran', form.sasaran);
      fd.set('hasil', form.hasil);
      fd.set('tindak_lanjut', form.tindak_lanjut);
      if (editing) fd.set('id_agenda', String(editing.id_agenda));

      const result = editing ? await updateAgendaBK(fd) : await addAgendaBK(fd);
      if (result.success) {
        setModalOpen(false);
        showToast(editing ? 'Agenda berhasil diperbarui' : 'Agenda berhasil ditambahkan', 'success');
        router.refresh();
      } else {
        setError(result.error || 'Gagal menyimpan agenda');
      }
    } catch {
      setError('Gagal menyimpan agenda');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: AgendaBKRow) => {
    const ok = await confirmAlert(
      'Hapus agenda?',
      `Agenda "${row.jenis_kegiatan}" akan dihapus dari daftar.`,
    );
    if (!ok) return;

    const result = await deleteAgendaBK(row.id_agenda);
    if (result.success) {
      showToast('Agenda berhasil dihapus', 'success');
      router.refresh();
    } else {
      showToast(result.error || 'Gagal menghapus agenda', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-xl font-semibold text-[#1A1A2E]">Agenda Harian BK</h4>
          <p className="mt-1 text-sm text-[#6B7280]">Rencana layanan BK per periode aktif.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/cetak/bk/agenda"
            target="_blank"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[#1A1A2E] transition hover:border-[#DC2626] hover:text-[#DC2626]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Agenda
          </Link>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Agenda
          </button>
        </div>
      </div>

      {weeks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
          <p className="text-sm font-medium text-gray-700">Belum ada agenda.</p>
          <p className="mt-1 text-sm text-gray-500">Tambahkan kegiatan layanan pertama untuk periode ini.</p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-4 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
          >
            Tambah Agenda
          </button>
        </div>
      ) : (
        weeks.map((week) => (
          <div key={week.key} className="overflow-hidden rounded-xl border border-[rgba(0,0,0,0.04)] bg-white premium-shadow">
            <div className="flex flex-col gap-1 border-b border-[rgba(0,0,0,0.06)] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1A1A2E]">{week.label}</p>
                <p className="text-xs text-[#6B7280]">{week.range}</p>
              </div>
              <span className="text-xs font-medium text-[#9CA3AF]">{week.rows.length} kegiatan</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F8F9FB] text-left text-xs text-[#6B7280]">
                    <th className="w-10 px-3 py-3 text-center font-semibold">No</th>
                    <th className="w-40 px-3 py-3 font-semibold">Hari/Tanggal</th>
                    <th className="w-40 px-3 py-3 font-semibold">Waktu</th>
                    <th className="min-w-[220px] px-3 py-3 font-semibold">Jenis Kegiatan/Layanan</th>
                    <th className="w-36 px-3 py-3 font-semibold">Bidang</th>
                    <th className="w-40 px-3 py-3 font-semibold">Sasaran</th>
                    <th className="min-w-[180px] px-3 py-3 font-semibold">Hasil</th>
                    <th className="min-w-[180px] px-3 py-3 font-semibold">Tindak Lanjut</th>
                    <th className="w-24 px-3 py-3 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {week.rows.map((row, index) => (
                    <tr key={row.id_agenda} className="border-b border-[rgba(0,0,0,0.04)] align-top last:border-b-0 hover:bg-[#FEF2F2]/30">
                      <td className="px-3 py-3 text-center text-xs text-gray-500">{index + 1}</td>
                      <td className="px-3 py-3 text-xs font-medium text-[#1A1A2E]">{formatAgendaDate(row.tanggal)}</td>
                      <td className="px-3 py-3 text-xs text-gray-600">{row.waktu || '-'}</td>
                      <td className="px-3 py-3 text-xs text-gray-700">{row.jenis_kegiatan}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {bidangToArray(row.bidang).map((b) => (
                            <span key={b} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${BIDANG_STYLE[b] ?? 'bg-gray-100 text-gray-600'}`}>
                              {BIDANG_LABEL[b] ?? b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-700">{row.sasaran || '-'}</td>
                      <td className="px-3 py-3 text-xs text-gray-700">{row.hasil || '-'}</td>
                      <td className="px-3 py-3 text-xs text-gray-700">{row.tindak_lanjut || '-'}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            title="Edit agenda"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-100 hover:text-blue-800"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            title="Hapus agenda"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) setModalOpen(false);
          }}
        >
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="border-b px-4 py-4 sm:px-6">
              <h3 className="text-lg font-semibold text-[#1A1A2E]">
                {editing ? 'Edit Agenda' : 'Tambah Agenda'}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">Isi rencana kegiatan layanan BK.</p>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
              {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tanggal
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => setForm((prev) => ({ ...prev, tanggal: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Waktu
                  <input
                    type="text"
                    value={form.waktu}
                    onChange={(e) => setForm((prev) => ({ ...prev, waktu: e.target.value }))}
                    placeholder="08.30–09.15 (1 JP, dalam kelas)"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-gray-700">
                Jenis Kegiatan/Layanan
                <textarea
                  rows={2}
                  value={form.jenis_kegiatan}
                  onChange={(e) => setForm((prev) => ({ ...prev, jenis_kegiatan: e.target.value }))}
                  placeholder="Layanan informasi (klasikal): ..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Bidang Layanan</p>
                <div className="flex flex-wrap gap-3">
                  {BIDANG_BK.map((b) => (
                    <label key={b.key} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.bidang.includes(b.key)}
                        onChange={() => toggleBidang(b.key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {b.label}
                    </label>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700">
                Sasaran
                <textarea
                  rows={2}
                  value={form.sasaran}
                  onChange={(e) => setForm((prev) => ({ ...prev, sasaran: e.target.value }))}
                  placeholder="Kelas X RPL / peserta didik kelas X ..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Hasil
                <textarea
                  rows={2}
                  value={form.hasil}
                  onChange={(e) => setForm((prev) => ({ ...prev, hasil: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Tindak Lanjut
                <textarea
                  rows={2}
                  value={form.tindak_lanjut}
                  onChange={(e) => setForm((prev) => ({ ...prev, tindak_lanjut: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
