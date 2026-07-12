# Perbaikan UI: Input Nilai di Tabel Penilaian

## Masalah
Input nilai di tabel penilaian pakai `border border-gray-300` di atas background putih. Border tipis + background putih bikin input terlihat samar dan susah dibedakan dari sel tabel biasa.

## Solusi
Perbaiki 5 grup input di [penilaian-client.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/penilaian/%5Bid_mapel_kelas%5D/_components/penilaian-client.tsx) dengan:

| Properti | Sebelum | Sesudah |
|----------|---------|---------|
| border | `border-gray-300` | `border-gray-400` |
| background | (default putih) | `bg-gray-50` |
| focus bg | (default putih) | `focus:bg-white` |
| focus ring | `focus:ring-2 ring-blue-500` | tetap sama |

### File: `penilaian-client.tsx`

**5 lokasi className yang diubah:**
1. Baris 263 — input Formatif di tab AS (className `w-14 ...`)
2. Baris 272 — input PH di tab AS (className `w-14 ...`)
3. Baris 280 — input AS di tab AS (className `w-14 ...`)
4. Baris 298 — input TS di tab TS (className `w-20 ...`)
5. Baris 322 — input Formatif/PH di tab biasa (className `w-full ...`)

Semua pola `border-gray-300` diganti:
```
border border-gray-300  →  border border-gray-400 bg-gray-50 focus:bg-white
```

Tidak ada perubahan logika atau fungsi — murni visual.

## Verifikasi
1. Build: `npm run build` — 0 error
2. Buka `http://localhost:3000/guru/penilaian/769?detail=sumatif-harian` — input lebih jelas
