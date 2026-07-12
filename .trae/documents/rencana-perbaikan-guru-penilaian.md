# Rencana Perbaikan: Menu Guru & Penilaian Angka

## 1. Ringkasan

Berdasarkan analisis dan implementasi sebelumnya, dokumen ini berisi **status terkini** dari 7 item rencana perbaikan. **4 item sudah selesai, 3 item tersisa** untuk dikerjakan.

---

## 2. Status Implementasi

| Urut | Item | Severity | File | Status |
|------|------|----------|------|--------|
| 1 | SQL Migration: INT→DECIMAL(5,2) + Composite Index | 🔴 | SQL langsung | ✅ **SELESAI** |
| 2 | API Route: Simpan nilaiAkhir + validasi + fix parse | 🔴 | API route | ✅ **SELESAI** |
| 3 | **Client: Validasi input nilai (0-100)** | 🟡 | penilaian-client.tsx | ❌ **BELUM** |
| 4 | **Client: Ubah totalRaw jadi rata-rata Formatif + PH + AS** | 🟡 | penilaian-client.tsx | ❌ **BELUM** |
| 5 | API Route: Fix tipe parse nilai (float, bukan int) | 🟡 | API route | ✅ **SELESAI** (termasuk item 2) |
| 6 | **Server Action: Batch query getGuruTugas()** | 🟢 | guru-actions.ts | ❌ **BELUM** |
| 7 | SQL: Drop kolom `middle` | 🟢 | SQL langsung | ✅ **SELESAI** |

---

## 3. Detail Perubahan — Sisa 3 Item

### Item 3: Client — Validasi Input Nilai (0-100)

**File:** [penilaian-client.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/%28dashboard%29/guru/penilaian/%5Bid_mapel_kelas%5D/_components/penilaian-client.tsx)

**Apa:** Tambah validasi di semua `<input>` nilai (Formatif, PH, TS, AS) dan sebelum submit.

**Kenapa:** Guru bisa input nilai >100 atau teks, yang akan disimpan sebagai data tidak valid (parseInt/parseFloat).

**Bagaimana:**

1. **onChange regex filter** pada setiap input nilai — hanya izinkan digit + 1 titik desimal:
   ```tsx
   onChange={(e) => {
     const v = e.target.value;
     if (v === '' || /^\d{0,3}(\.\d{0,2})?$/.test(v)) {
       // izinkan
     } else {
       // potong karakter terakhir (revert)
       e.target.value = v.slice(0, -1);
     }
   }}
   ```

2. **onBlur range check (0-100)** pada setiap input:
   ```tsx
   onBlur={(e) => {
     const num = parseFloat(e.target.value);
     if (e.target.value !== '' && (isNaN(num) || num < 0 || num > 100)) {
       alert('Nilai harus antara 0-100');
       e.target.value = '';
     }
   }}
   ```

3. **Pre-submit validation loop** di `handleSave` — sebelum fetch, validasi SEMUA input:
   ```tsx
   // Sebelum fetch, validasi semua input
   const form = e.currentTarget;
   const inputs = form.querySelectorAll('input[name^="nilai_"]');
   for (const input of inputs) {
     const v = (input as HTMLInputElement).value;
     if (v === '') continue;
     const num = parseFloat(v);
     if (isNaN(num) || num < 0 || num > 100) {
       setError(`Nilai "${v}" tidak valid. Harus antara 0-100.`);
       setSaving(false);
       return;
     }
   }
   ```

**Catatan:** Input bertipe `text` + `inputMode="decimal"` (biarkan seperti adanya). Jangan ganti ke `type="number"` karena inputMode lebih fleksibel untuk desimal.

---

### Item 4: Client — Ubah totalRaw Jadi totalRata

**File:** [penilaian-client.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/%28dashboard%29/guru/penilaian/%5Bid_mapel_kelas%5D/_components/penilaian-client.tsx)

**Apa:** Ganti variabel `totalRaw` (menjumlahkan semua nilai mentah Formatif+PH+AS per TP) menjadi `totalRata` (rata-rata Formatif + rata-rata PH + AS).

**Kenapa:** `totalRaw` menjumlahkan puluhan nilai dengan skala berbeda tanpa bobot, tidak bermakna secara pedagogis. Guru butuh melihat gambaran komponen nilai, bukan akumulasi mentah.

**Bagaimana:**

Di bagian render tab AS, ganti:

```tsx
// SEBELUM (hapus):
const totalRaw = (() => {
  let s = 0;
  for (const tp of tujuanRows) {
    const vf = parseFloat(getN(formatifMap, sis.id_siswa, tp.id_tujuan));
    if (!isNaN(vf)) s += vf;
    const vp = parseFloat(getN(phMap, sis.id_siswa, tp.id_tujuan));
    if (!isNaN(vp)) s += vp;
  }
  return s + (isNaN(vAS) ? 0 : vAS);
})();
```

```tsx
// SESUDAH:
const totalRata = (() => {
  const f = parseFloat(avgF) || 0;
  const p = parseFloat(avgPH) || 0;
  const a = isNaN(vAS) ? 0 : vAS;
  return (f + p + a).toFixed(2);
})();
```

**Tampilkan:**
```tsx
{/* kolom Total */}
<td className="border px-2 py-2 text-center text-xs font-medium">{totalRata}</td>
```

**Catatan:** `avgF` dan `avgPH` sudah dihitung di atas (rata-rata per siswa). `vAS` juga sudah ada. `totalRata` tinggal menjumlahkan ketiganya.

---

### Item 6: Server Action — Batch Query getGuruTugas()

**File:** [guru-actions.ts](file:///d:/PROJECT/nextjs/clone-rapor-next/src/lib/actions/guru-actions.ts)

**Apa:** Jalankan 7 query yang pakai `tahun` + `semester` secara paralel dengan `Promise.all`, dan 1 query `piket_harian` (tanpa tahun/semester) tetap sendiri.

**Kenapa:** 8 query sequential = ~8× roundtrip latency ke MySQL. Dengan paralel, jadi ~1× roundtrip.

**Bagaimana:**

```tsx
// Ganti 7 query sequential jadi paralel
const [
  [waliRows],
  [ekstraRows],
  [orgRows],
  [mapelRows],
  [prakerinRows],
  [p5bkRows],
  [kokurikulerRows],
] = await Promise.all([
  pool.query(
    `SELECT k.id_kelas, k.nama_kelas
     FROM kelas_wali kw JOIN kelas k ON kw.id_kelas = k.id_kelas
     WHERE kw.id_user = ? AND kw.tahun = ? AND kw.semester = ?`,
    [idUser, tahun, semester]
  ),
  pool.query(
    `SELECT e.id_eskul, e.nama_eskul
     FROM pembina_eskul pe JOIN eskul e ON pe.id_eskul = e.id_eskul
     WHERE pe.id_user = ? AND pe.tahun = ? AND pe.semester = ?`,
    [idUser, tahun, semester]
  ),
  pool.query(
    `SELECT o.id_organisasi, o.nama_organisasi
     FROM pembina_organisasi po JOIN organisasi o ON po.id_organisasi = o.id_organisasi
     WHERE po.id_user = ? AND po.tahun = ? AND po.semester = ?`,
    [idUser, tahun, semester]
  ),
  pool.query(
    `SELECT 1 FROM mapel_kelas WHERE id_user = ? AND tahun = ? AND semester = ? LIMIT 1`,
    [idUser, tahun, semester]
  ),
  pool.query(
    `SELECT 1 FROM prakerin WHERE id_user = ? AND tahun = ? AND semester = ? LIMIT 1`,
    [idUser, tahun, semester]
  ),
  pool.query(
    `SELECT 1 FROM proyek_kelas WHERE id_user = ? AND tahun = ? AND semester = ? LIMIT 1`,
    [idUser, tahun, semester]
  ),
  pool.query(
    `SELECT 1 FROM nilai_kokurikuler nk
     JOIN proyek_kelas pk ON nk.id_proyek_kelas = pk.id_proyek_kelas
     WHERE pk.id_user = ? AND nk.tahun = ? AND nk.semester = ? LIMIT 1`,
    [idUser, tahun, semester]
  ),
]);

// Query piket (tanpa tahun/semester) tetap sendiri
const [piketRows] = await pool.query(
  'SELECT 1 FROM piket_harian WHERE id_user = ? LIMIT 1',
  [idUser]
);
```

---

## 4. File yang Berubah

| # | File | Perubahan |
|---|------|-----------|
| 1 | ✅ SQL (sudah eksekusi) | ALTER TABLE MODIFY DECIMAL, ADD INDEX, DROP COLUMN — **SELESAI** |
| 2 | ✅ `src/app/api/guru/penilaian/[id_mapel_kelas]/route.ts` | Simpan nilaiAkhir, validasi, fix parse — **SELESAI** |
| 3 | ❌ `src/app/(dashboard)/guru/penilaian/[id_mapel_kelas]/_components/penilaian-client.tsx` | Validasi input 0-100 (onChange regex + onBlur + pre-submit) + ubah totalRaw jadi totalRata |
| 4 | ❌ `src/lib/actions/guru-actions.ts` | Promise.all untuk 7 query paralel |

---

## 5. Verifikasi

1. **Build:** `npm run build` — 0 error ✅
2. **Restart dev server:** `taskkill /F /IM node.exe` lalu `npm run dev`, tunggu 8 detik ✅
3. **Browser test (agent-browser):**
   - Login sebagai guru (`dasa` / `12345678`)
   - Buka Kelas Ku → pilih mapel
   - Tab Formatif: input 78.5 → save → refresh → nilai tetap 78.5 ✅
   - Cobain input `150` → harus ditolak (error/tidak bisa) ✅
   - Cobain input `abc` → harus ditolak ✅
   - Tab AS: kolom Total tampilkan rata-rata F+PH+AS (bukan jumlah mentah) ✅
   - Tab AS: klik save → database `nilai_mata_pelajaran` terisi ✅
4. **TU Laporan Pendidikan:** buka halaman → nilai akhir dari `nilai_mata_pelajaran` muncul ✅

---

## 6. Catatan Tambahan

- **tidak ada perubahan schema DB** — hanya perubahan kode di 2 file
- **totalRata** = `avgF + avgPH + vAS` — ini hanya tampilan tambahan, tidak mempengaruhi rumus Nilai Akhir (35/35/30) yang tetap via API
- Perubahan di **guru-actions.ts** bersifat non-fungsional (hanya optimasi performa) — tidak mengubah output
