<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Filter Periode (Tahun/Semester) — TU Pages

Semua halaman TU yang menampilkan data transaksional (tabel punya kolom `tahun` + `semester`) **WAJIB** pakai `getSekolahWithFilter()` dari `@/lib/sekolah-helper`. Pattern:

```ts
import { getSekolahWithFilter } from '@/lib/sekolah-helper';

async function getData() {
  const sekolah = await getSekolahWithFilter();
  // sekolah.tahun, sekolah.semester — dari cookie filter atau fallback DB
  const [rows]: any = await pool.query(`
    SELECT ... FROM some_table
    WHERE tahun = ? AND semester = ?
    ORDER BY ...
  `, [sekolah.tahun, sekolah.semester]);
  return rows;
}
```

Tanpa filter (default): pakai `sekolah.tahun`/`sekolah.semester` dari database (periode aktif).
Dengan filter sidebar: pakai cookie `view_tahun`/`view_semester`.

Server actions yang INSERT cukup SELECT tahun/semester langsung dari tabel `sekolah` — record baru selalu di periode aktif.

Tabel **master** (tanpa tahun/semester): `kelas`, `users`, `mapel`, `eskul`, `kompetensi_keahlian`, `deskripsi_rapor`, `piket_harian` — gak perlu filter.
