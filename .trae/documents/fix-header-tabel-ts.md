# Fix: Header Kolom Tabel Tab Sumatif Tengah Semester (TS) Hilang

## Masalah

Pada tab **Sumatif Tengah Semester (TS)** di halaman penilaian, tabel tidak memiliki header kolom "Nilai" di atas input field. Terlihat dari screenshot: hanya ada header "No" dan "Nama Peserta Didik", tetapi kolom ketiga (input nilai) tidak memiliki header.

## Root Cause

Di [penilaian-client.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/penilaian/[id_mapel_kelas]/_components/penilaian-client.tsx#L273-L288), branch `else` pada `<thead>` (non-AS) memiliki 2 kondisi yang menghapus kolom saat `isTS === true`:

1. **Line 277:** `{!isTS && tujuanRows.map(...)}` — header TP columns tidak muncul untuk TS
2. **Line 282:** `{!isAS && !isTS && (Jumlah + Rata-rata)}` — header Jumlah/Rata-rata juga tidak muncul untuk TS

Akibatnya `<thead>` hanya menampilkan 2 `<th>` (No + Nama Peserta Didik), sementara `<tbody>` menampilkan 3 `<td>` (No + Nama + input Nilai).

## Fix

**File:** `src/app/(dashboard)/guru/penilaian/[id_mapel_kelas]/_components/penilaian-client.tsx`

**Perubahan:** Tambahkan kolom header "Nilai" untuk tab TS di antara kondisi `{!isTS && ...}` dan `{!isAS && !isTS && ...}`.

```tsx
{/* Di dalam <tr className="bg-gray-100"> branch else, setelah baris !isTS TP columns */}
{isTS && (
  <th className="border-b border-gray-300 px-3 py-2.5 text-center text-xs font-semibold text-gray-600 min-w-[100px]">
    Nilai
  </th>
)}
```

**Tepatnya di antara line 281 dan 282** (setelah closing `)}` dari `!isTS && tujuanRows.map`, sebelum `{!isAS && !isTS && (`).

## Verification

1. `npm run build` — pasti 0 error
2. Restart dev server
3. Buka `http://localhost:3000/guru/penilaian/769?detail=sumatif-ts`
4. Verifikasi header tabel memiliki 3 kolom: **No | Nama Peserta Didik | Nilai**
