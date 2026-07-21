'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { saveCatatanWali } from '@/lib/actions/catatan-wali-actions';

type SaveStatus = 'empty' | 'dirty' | 'saving' | 'saved' | 'error';

interface Props {
  idKelas: number;
  idSiswa: number;
  initialValue: string;
  siswaName: string;
  autoFocus?: boolean;
  onSaved?: (catatan: string) => void;
}

const STATUS_LABEL: Record<SaveStatus, string> = {
  empty: 'Belum terisi',
  dirty: 'Belum disimpan',
  saving: 'Menyimpan...',
  saved: 'Tersimpan',
  error: 'Gagal menyimpan',
};

const STATUS_CLASS: Record<SaveStatus, string> = {
  empty: 'text-gray-500',
  dirty: 'text-amber-600',
  saving: 'text-blue-600',
  saved: 'text-emerald-600',
  error: 'text-red-600',
};

export default function CatatanWaliEditor({
  idKelas,
  idSiswa,
  initialValue,
  siswaName,
  autoFocus = false,
  onSaved,
}: Props) {
  const normalizedInitial = initialValue.trim();
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<SaveStatus>(normalizedInitial ? 'saved' : 'empty');
  const currentValueRef = useRef(initialValue);
  const lastSavedRef = useRef(normalizedInitial);
  const savingRef = useRef(false);
  const queuedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const flushSave = useCallback(async () => {
    clearTimer();
    if (savingRef.current) {
      queuedRef.current = true;
      return;
    }

    savingRef.current = true;
    do {
      queuedRef.current = false;
      const valueToSave = currentValueRef.current.trim();
      if (valueToSave === lastSavedRef.current) break;

      setStatus('saving');
      const result = await saveCatatanWali({ idKelas, idSiswa, catatan: valueToSave });
      if (!result.success) {
        setStatus('error');
        savingRef.current = false;
        return;
      }

      lastSavedRef.current = result.catatan;
      onSaved?.(result.catatan);
    } while (queuedRef.current || currentValueRef.current.trim() !== lastSavedRef.current);

    savingRef.current = false;
    setStatus(lastSavedRef.current ? 'saved' : 'empty');
  }, [clearTimer, idKelas, idSiswa, onSaved]);

  useEffect(() => {
    currentValueRef.current = value;
    const normalizedValue = value.trim();
    if (normalizedValue === lastSavedRef.current) {
      if (!savingRef.current) setStatus(normalizedValue ? 'saved' : 'empty');
      return;
    }

    if (savingRef.current) queuedRef.current = true;
    setStatus('dirty');
    clearTimer();
    timerRef.current = setTimeout(() => {
      void flushSave();
    }, 800);

    return clearTimer;
  }, [clearTimer, flushSave, value]);

  useEffect(() => clearTimer, [clearTimer]);

  return (
    <div className="space-y-1.5">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value.slice(0, 500))}
        onBlur={() => void flushSave()}
        maxLength={500}
        rows={3}
        autoFocus={autoFocus}
        aria-label={`Catatan wali ${siswaName}`}
        placeholder="Tulis perkembangan, motivasi, atau hal yang perlu diperhatikan..."
        className="min-h-24 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
      />
      <div className="flex min-h-5 items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</span>
          {status === 'error' && (
            <button
              type="button"
              onClick={() => void flushSave()}
              className="font-medium text-red-600 underline decoration-red-300 underline-offset-2"
            >
              Coba lagi
            </button>
          )}
        </div>
        <span className="text-gray-400">{value.length}/500</span>
      </div>
    </div>
  );
}
