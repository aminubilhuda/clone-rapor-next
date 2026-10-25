'use client';

import {
  BIDANG_BK,
  HEADER_FIELD_LABEL,
  JENIS_FIELDS,
  PESERTA_FIELD_LABEL,
  type BKHeaderField,
  type BKPesertaField,
  type JenisLayananBK,
} from '@/lib/bk';

export function BidangPicker({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}) {
  const toggle = (key: string) => {
    onChange(value.includes(key) ? value.filter((v) => v !== key) : [...value, key]);
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">Bidang Bimbingan</label>
      <div className="flex flex-wrap gap-1.5">
        {BIDANG_BK.map((bidang) => {
          const active = value.includes(bidang.key);
          return (
            <button
              key={bidang.key}
              type="button"
              onClick={() => toggle(bidang.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                  : 'border-[rgba(0,0,0,0.1)] bg-white text-[#6B7280] hover:border-[rgba(0,0,0,0.2)]'
              }`}
            >
              {active ? '✓ ' : ''}
              {bidang.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-3 py-2 text-sm text-[#1A1A2E] outline-none transition-colors placeholder:text-[#C4C4CC] focus:border-[#DC2626] focus:ring-2 focus:ring-red-500/15';

export function HeaderFields({
  jenis,
  value,
  onChange,
}: {
  jenis: JenisLayananBK;
  value: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  const fields = JENIS_FIELDS[jenis].header;
  if (fields.length === 0) return null;

  return (
    <div className="space-y-3">
      {fields.map((field: BKHeaderField) => {
        const isLong = field === 'pihak_terlibat' || field === 'tujuan';
        return (
          <div key={field}>
            <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">
              {HEADER_FIELD_LABEL[field]}
              {JENIS_FIELDS[jenis].requiredHeader.includes(field) && (
                <span className="ml-1 text-rose-500">*</span>
              )}
            </label>
            {isLong ? (
              <textarea
                rows={3}
                value={value[field] ?? ''}
                onChange={(e) => onChange(field, e.target.value)}
                className={inputClass}
              />
            ) : (
              <input
                value={value[field] ?? ''}
                onChange={(e) => onChange(field, e.target.value)}
                className={inputClass}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PesertaFields({
  jenis,
  value,
  onChange,
}: {
  jenis: JenisLayananBK;
  value: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  const fields = JENIS_FIELDS[jenis].peserta;
  if (fields.length === 0) return null;

  const longFields: BKPesertaField[] = [
    'permasalahan',
    'arahan',
    'tindak_lanjut',
    'hasil',
    'pembinaan',
    'referal',
    'peristiwa',
  ];

  return (
    <div className="space-y-3">
      {fields.map((field) => {
        const isLong = longFields.includes(field);
        const required = JENIS_FIELDS[jenis].required.includes(field);
        return (
          <div key={field}>
            <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">
              {PESERTA_FIELD_LABEL[field]}
              {required && <span className="ml-1 text-rose-500">*</span>}
            </label>
            {isLong ? (
              <textarea
                rows={3}
                value={value[field] ?? ''}
                onChange={(e) => onChange(field, e.target.value)}
                className={inputClass}
              />
            ) : (
              <input
                value={value[field] ?? ''}
                onChange={(e) => onChange(field, e.target.value)}
                className={inputClass}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { inputClass };
