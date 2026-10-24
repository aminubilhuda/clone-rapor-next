<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# clone-rapor-next

Aplikasi rapor sekolah untuk TU, guru, dan siswa. Next.js App Router + MySQL, auth NextAuth v5 Credentials, UI berbahasa Indonesia.

## Commands

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server (webpack, http://localhost:3000) |
| `npm run build` | Production build (webpack) |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (`vitest run`) |

Next 16 default-nya Turbopack; script proyek sengaja memakai `--webpack`. Jangan hapus flag itu tanpa alasan jelas.

## Arsitektur

- `src/app/(auth)/login` — halaman login.
- `src/app/(dashboard)/{tu,guru,siswa}` — halaman per peran; layout & error boundary di route group.
- `src/app/api/v1/*` — API eksternal (API key/Bearer JWT); envelope `{ success, statusCode, message, data, meta }` via `src/lib/api-response.ts`.
- `src/app/api/*` — endpoint internal (auth, uploads, dsb).
- `src/lib/actions/*` — server actions (`'use server'`) untuk query & mutasi halaman.
- `src/lib/db.ts` — pool mysql2 global + `withTransaction()` untuk operasi multi-statement.
- `src/lib/sekolah-helper.ts`, `view-filter.ts` — periode aktif & filter tahun/semester.
- `src/lib/auth.ts`, `api-auth-guard.ts`, `api-jwt.ts` — autentikasi web & API.
- `src/lib/pdf-templates/`, `excel.ts` — ekspor PDF/Excel.
- `src/proxy.ts` — proteksi route dashboard, redirect per peran, rate limit login.
- `src/components/{layout,ui,guru,pwa}` — komponen bersama.
- `src/app/sw.ts` + `@serwist/next` — PWA; service worker nonaktif di dev.
- `storage/uploads/` — file upload (di luar `public`), disajikan via `/api/uploads`.

## Konvensi

- TypeScript strict; import pakai alias `@/*` → `src/*`.
- Server action: `'use server'`, guard di awal (`requireGuru`, dll. dari `@/lib/actions/auth-guard`), mutasi mengembalikan `{ success, error }`, panggil `revalidatePath` setelah mutasi.
- API route: gunakan `apiSuccess`/`apiError` dari `@/lib/api-response.ts`; otorisasi via `@/lib/api-auth-guard.ts` (`ALL_ROLES`, `STAFF_ROLES`).
- Soft delete: filter `deleted_at IS NULL`; jangan hard delete data transaksional.
- Peran: `JABATAN` di `@/lib/constants.ts` (1 super_admin, 2 tu_admin, 3 guru, 4 siswa); `SEKOLAH_ID = 1`.
- Teks UI, pesan error, dan istilah domain memakai Bahasa Indonesia.
- Query SQL wajib parameter `?` (mysql2); jangan interpolasi input user.

## Auth & Otorisasi

- NextAuth v5 Credentials (`src/lib/auth.ts`): cek tabel `users` dulu, lalu `siswa` (`aktif = 1`); password bcrypt.
- `src/proxy.ts` membatasi `/tu`, `/guru`, `/siswa`, redirect sesuai `jabatan`, dan rate limit 5 percobaan login/menit.
- `/api/v1/*` menerima API key (`X-API-KEY`) atau Bearer JWT; lihat `src/lib/api-auth-guard.ts` dan `api-jwt.ts`.
- Login dev: `abdira` / `abdira`.

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

- Mapel konsentrasi Fase F boleh punya sub-mapel (`mapel.parent_id`, maks. 1 level).
  Induk hanya menjadi header rapor jika pada periode itu ada anak yang diikuti siswa.
  Panduan pengisian: `docs/mapel-konsentrasi.md`.

## Testing

- Vitest tanpa config khusus; tes di `src/lib/__tests__/*.test.ts` (api-jwt, excel, rapor-template, upload, validate).
- Jalankan `npm test`; tambahkan tes untuk logika murni/helper baru.

## Environment

`.env` lokal / `.env.local` di server: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `AUTH_SECRET`, `NEXTAUTH_URL`, `CHROME_PATH` (Chrome untuk cetak PDF Puppeteer). Jangan commit file env.

Jika server sudah punya Chrome, set `PUPPETEER_SKIP_DOWNLOAD=true` sebelum `npm ci`.

## Deploy

- `bash deploy.sh` di server: pull, `npm ci`, build, migrasi DB (`scripts/db-migrate.sh`), migrasi uploads, restart.
- `DEPLOY_MANAGER=pm2` (default) memakai `ecosystem.config.js` (port 31213); `aapanel` melewati PM2 dan restart dari panel.
- Migrasi SQL ada di `migrations/` (lihat `migrations/README.md`).

## MCP — Browser Automation

Terkonfigurasi global di `~/.config/opencode/opencode.json`:

- `chrome-devtools`: `npx -y chrome-devtools-mcp@latest` — navigasi, klik, isi form, screenshot, network/console, Lighthouse.
- `playwright`: `npx -y @playwright/mcp@latest` — headed Chrome, snapshot aksesibilitas, cocok untuk verifikasi UI.

Verifikasi: `opencode mcp list` → keduanya `connected`. Panggil tool `chrome-devtools_*` atau `playwright_*` langsung.

## Post-Change Routine — Wajib (macOS)

Setelah perubahan kode, jalankan berurutan:

1. **Build** — `npm run build` sampai 0 error
2. **Restart dev server** — `pkill -f "next dev" || true`, lalu `npm run dev`, tunggu ~8 detik
3. **Browser MCP test** — login (`abdira`/`abdira`), buka halaman yang diubah, screenshot, verifikasi tidak ada error visual atau console error

Untuk perubahan dokumentasi saja, cukup review `git diff` — build tidak wajib.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
