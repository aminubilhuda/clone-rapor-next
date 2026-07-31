'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';

const TARGETS = [
  { value: 'all', label: 'Semua Pengguna' },
  { value: 'siswa', label: 'Siswa' },
  { value: 'guru', label: 'Guru' },
  { value: 'tu', label: 'Tata Usaha' },
];

export default function BroadcastForm() {
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setResult(null);

    const fd = new FormData(e.currentTarget);
    const body = JSON.stringify({
      title: fd.get('title') || 'E-Rapor SMK Abdi Negara',
      body: fd.get('body'),
      url: fd.get('url') || '/',
      target: fd.get('target') || 'all',
    });

    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal');
      setResult(data.sent);
      showToast(`Notifikasi terkirim ke ${data.sent} perangkat`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirim notifikasi', 'error');
    } finally {
      setSending(false);
    }
  };

  const inputCls = "w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Judul Notifikasi</label>
        <input name="title" defaultValue="E-Rapor SMK Abdi Negara" className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Pesan <span className="text-red-500">*</span></label>
        <textarea name="body" rows={3} required className={inputCls} placeholder="Tulis pesan notifikasi..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Target Penerima</label>
        <select name="target" defaultValue="all" className={inputCls}>
          {TARGETS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">URL Tujuan (opsional)</label>
        <input name="url" defaultValue="/" className={inputCls} placeholder="/" />
        <p className="text-xs text-[#6B7280] mt-1">Halaman yang akan dibuka saat notifikasi diklik.</p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={sending}
          className="px-6 py-2.5 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {sending ? 'Mengirim...' : 'Kirim Notifikasi'}
        </button>
        {result !== null && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Terkirim ke {result} perangkat
          </span>
        )}
      </div>
    </form>
  );
}
