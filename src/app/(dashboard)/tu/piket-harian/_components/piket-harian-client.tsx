'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [userSearch, setUserSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const dayMap: Record<number, any[]> = {};
  for (const d of DAYS) dayMap[d.id] = [];
  for (const row of data) {
    if (dayMap[row.id_harian]) dayMap[row.id_harian].push(row);
  }

  const closeDropdown = () => {
    setActiveDropdown(null);
    setDropdownPos(null);
  };

  const openDropdown = (event: React.MouseEvent<HTMLButtonElement>, dayId: number, row: number) => {
    const same = activeDropdown?.dayId === dayId && activeDropdown?.row === row;
    if (same) {
      closeDropdown();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const width = 256;
    const height = 300;
    let left = Math.min(rect.left, window.innerWidth - width - 8);
    left = Math.max(8, left);
    let top = rect.bottom + 4;
    if (top + height > window.innerHeight) {
      top = Math.max(8, rect.top - height - 4);
    }

    setDropdownPos({ top, left });
    setActiveDropdown({ dayId, row });
    setUserSearch('');
  };

  useEffect(() => {
    if (!activeDropdown) return;
    const onScroll = () => closeDropdown();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [activeDropdown]);

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
                              onClick={(event) => openDropdown(event, day.id, i)}
                              disabled={saving || available.length === 0}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-dashed border-[rgba(0,0,0,0.15)] text-[#6B7280] hover:border-[#DC2626] hover:text-[#DC2626] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>

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
      {activeDropdown && dropdownPos && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[60]" onClick={closeDropdown}>
            <div
              className="piket-dropdown fixed z-[61] w-64 overflow-hidden rounded-xl border border-[rgba(0,0,0,0.06)] bg-white premium-shadow"
              style={{ top: dropdownPos.top, left: dropdownPos.left }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-[rgba(0,0,0,0.06)] p-2">
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    autoFocus
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cari guru..."
                    className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#F8F9FB] py-1.5 pl-8 pr-2 text-xs outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>
              <div className="max-h-[220px] overflow-y-auto sidebar-scroll">
                {getUsersForDay(activeDropdown.dayId)
                  .filter((u: any) => u.nama.toLowerCase().includes(userSearch.toLowerCase().trim()))
                  .map((u: any) => (
                    <button
                      key={u.id_user}
                      onClick={() => handleAdd(activeDropdown.dayId, u.id_user)}
                      className="block w-full px-3 py-2 text-left text-sm text-[#1A1A2E] transition-colors hover:bg-[#F8F9FB]"
                    >
                      {u.nama}
                    </button>
                  ))}
                {getUsersForDay(activeDropdown.dayId).filter((u: any) =>
                  u.nama.toLowerCase().includes(userSearch.toLowerCase().trim()),
                ).length === 0 && (
                  <div className="px-3 py-3 text-center text-xs text-[#9CA3AF]">
                    Tidak ada guru yang cocok
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

    </div>
  );
}
