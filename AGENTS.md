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

## Chrome DevTools MCP — Sudah Terpasang

`chrome-devtools-mcp` sudah dikonfigurasi di `opencode.json`. Tools:
- Navigasi, klik, isi form, screenshot, snapshot aksesibilitas
- Network, console, performance tracing
- Lighthouse audit, heap snapshot

Mulai pakai: cukup panggil tool `chrome-devtools_*` langsung.

## Post-Change Routine — Wajib

Setelah selesai perubahan code (apapun), jalankan 3 langkah ini secara berurutan:

1. **Build** — `npm run build` sampai 0 error
2. **Restart dev server** — `taskkill /F /IM node.exe`, lalu start ulang `npm run dev`, tunggu 8 detik
3. **Browser MCP test** — login (admin/admin123), screenshot halaman yang diubah, verifikasi tidak ada error visual atau console error

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
