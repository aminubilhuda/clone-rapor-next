'use client';

import { useState } from 'react';
import { confirmAlert } from '@/lib/swal';
import { useToast } from '@/components/ui/toast-provider';
import { addPiketHarian, deletePiketHarianByHariUser } from '@/lib/actions/piket-harian-actions';

const DAYS = [
  { id: 1, label: 'Senin' },
  { id: 2, label: 'Selasa' },
  { id: 3, label: 'Rabu' },
  { id: 4, label: 'Kamis' },
  { id: 5, label: 'Jumat' },
  { id: 6, label: 'Sabtu' },
];

const MAX_ROWS = 5;

interface PiketHarianClientProps {
  data: any[];
  refUser: any[];
}

export default function PiketHarianClient({ data, refUser }: PiketHarianClientProps) {
  const { showToast } = useToast();
  const [activeDropdown, setActiveDropdown] = useState<{ dayId: number; row: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const dayMap: Record<number, any[]> = {};
  for (const d of DAYS) dayMap[d.id] = [];
  for (const row of data) {
    if (dayMap[row.id_harian]) dayMap[row.id_harian].push(row);
  }

  const getUsersForDay = (dayId: number) => {
    const assignedIds = new Set(dayMap[dayId].map((r: any) => r.id_user));
    return refUser.filter((u: any) => !assignedIds.has(u.id_user));
  };

  const handleAdd = async (dayId: number, userId: number) => {
    setSaving(true);
    setActiveDropdown(null);
    const result = await addPiketHarian(dayId, userId);
    if (result.success) {
      showToast('Guru berhasil ditambahkan!', 'success');
    } else {
      showToast(result.error || 'Gagal!', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (dayId: number, userId: number, nama: string) => {
    const ok = await confirmAlert('Hapus Piket', `Hapus ${nama} dari piket hari ini?`);
    if (!ok) return;
    const result = await deletePiketHarianByHariUser(dayId, userId);
    if (result.success) {
      showToast('Guru berhasil dihapus!', 'success');
    } else {
      showToast(result.error || 'Gagal!', 'error');
    }
  };

  return (
    <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
      <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between">
        <h3 className="font-semibold text-[#1A1A2E]">Jadwal Piket Harian</h3>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.04)]">
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-12">No</th>
                {DAYS.map((d) => (
                  <th key={d.id} className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">{d.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: MAX_ROWS }, (_, i) => (
                <tr key={i} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB]/50 transition-colors">
                  <td className="px-4 py-3 text-[#6B7280] font-medium">{i + 1}</td>
                  {DAYS.map((day) => {
                    const items = dayMap[day.id];
                    const user = items[i];
                    const available = getUsersForDay(day.id);

                    return (
                      <td key={day.id} className="px-4 py-3 relative">
                        {user ? (
                          <div className="inline-flex items-center gap-1.5 bg-[#F8F9FB] border border-[rgba(0,0,0,0.06)] rounded-lg px-2.5 py-1.5 text-sm text-[#1A1A2E] group">
                            <span className="truncate max-w-[120px]">{user.nama_user}</span>
                            <button
                              onClick={() => handleDelete(day.id, user.id_user, user.nama_user)}
                              className="text-[#DC2626]/50 hover:text-[#DC2626] transition-colors flex-shrink-0"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown?.dayId === day.id && activeDropdown?.row === i ? null : { dayId: day.id, row: i })}
                              disabled={saving || available.length === 0}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-dashed border-[rgba(0,0,0,0.15)] text-[#6B7280] hover:border-[#DC2626] hover:text-[#DC2626] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>

                            {activeDropdown?.dayId === day.id && activeDropdown?.row === i && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                                <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.06)] min-w-[180px] max-h-[180px] overflow-y-auto">
                                  {available.map((u: any) => (
                                    <button
                                      key={u.id_user}
                                      onClick={() => handleAdd(day.id, u.id_user)}
                                      className="block w-full text-left px-3 py-2 text-sm text-[#1A1A2E] hover:bg-[#F8F9FB] transition-colors"
                                    >
                                      {u.nama}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
