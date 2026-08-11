# Graph Report - clone-rapor-next  (2026-08-08)

## Corpus Check
- 221 files · ~1,722,630 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1249 nodes · 2528 edges · 102 communities (78 shown, 24 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `72f06628`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mm
- Rapor Semester (Semester Report Card)
- mapel-kelas-client.tsx
- cetak-rapor/route.ts
- tu/layout.tsx
- prakerin-client.tsx
- mapel-siswa-grid.tsx
- ekstra-client.tsx
- kompetensi-client.tsx
- siswa/profile/_components/profile-form.tsx
- siswa-client.tsx
- compilerOptions
- p5bk-client.tsx
- a
- db.ts
- devDependencies
- requireTuAdmin
- y
- workbox-4a6e5f9b.js
- auth-guard.ts
- dependencies
- r
- index.ts
- organisasi-client.tsx
- mapel-client.tsx
- sekolah-helper.ts
- (dashboard)/profile/_components/profile-form.tsx
- daftar-rapor/page.tsx
- Rapor Semester Identity Max Layout
- deskripsi-client.tsx
- siswa-portal-data.ts
- dapodik-actions.ts
- auth.ts
- modal-siswa.tsx
- manifest.json
- app/layout.tsx
- absensi-piket-client.tsx
- Rencana Implementasi Modul Bimbingan Konseling (BK) — v2.1
- laporan-pendidikan/page.tsx
- package.json
- profil-actions.ts
- fallback-ce627215c0e4a9af.js
- tu/page.tsx
- dkn-client.tsx
- v
- buku-induk/page.tsx
- lager-nilai-kelas/page.tsx
- guru/organisasi/page.tsx
- Laporan Hasil Belajar
- guru/anggota-kelas/page.tsx
- modal-nilai-eskul.tsx
- presensi-actions.ts
- AGENTS.md
- db-migrate.sh script
- requireGuru
- cetak-rapor-guru-client.tsx
- getSekolahWithFilter
- E-R App Icon 192x192
- [[...path]]/route.ts
- login/page.tsx
- tu/ekstra/page.tsx
- rombel/page.tsx
- pwa.d.ts
- ecosystem.config.js
- next.config.ts
- File Icon SVG
- opencode.json
- README.md
- modal-import-siswa.tsx
- eslint.config.mjs
- anggota-kelas-actions.ts
- next
- react
- react-dom
- catatan-wali/page.tsx
- graphify.js
- postcss.config.mjs
- Next.js Logo SVG
- useToast
- Environment Variables
- Database Migrations
- Offline Page
- tu/piket-harian/page.tsx
- puppeteer
- { GET, POST }
- react-select
- confirmAlert
- sidebar-guru.tsx
- toast-provider.tsx
- kelas-ku/page.tsx
- rekap-presensi/page.tsx
- guru/page.tsx
- @ducanh2912/next-pwa
- SMK Abdi Negara Tuban School Logo Duplicate 3

## God Nodes (most connected - your core abstractions)
1. `getSekolahWithFilter()` - 102 edges
2. `requireTuAdmin()` - 88 edges
3. `useToast()` - 61 edges
4. `mm()` - 37 edges
5. `requireGuru()` - 24 edges
6. `syncDapodik()` - 24 edges
7. `a` - 18 edges
8. `r` - 16 edges
9. `POST()` - 16 edges
10. `SEKOLAH_ID` - 16 edges

## Surprising Connections (you probably didn't know these)
- `syncDapodik()` --indirect_call--> `u()`  [INFERRED]
  src/lib/actions/dapodik-actions.ts → public/fallback-ce627215c0e4a9af.js
- `SiswaClient()` --indirect_call--> `k()`  [INFERRED]
  src/app/(dashboard)/tu/kesiswaan/_components/siswa-client.tsx → public/workbox-4a6e5f9b.js
- `ModalImportSiswa()` --references--> `xlsx`  [EXTRACTED]
  src/app/(dashboard)/tu/kesiswaan/_components/modal-import-siswa.tsx → package.json
- `DKNClient()` --references--> `xlsx`  [EXTRACTED]
  src/app/(dashboard)/tu/laporan-pendidikan/daftar-kumpulan-nilai/_components/dkn-client.tsx → package.json
- `ModalImportPrakerin()` --references--> `xlsx`  [EXTRACTED]
  src/app/(dashboard)/tu/prakerin/_components/modal-import-prakerin.tsx → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Report Content Concepts** — output_pdf_rapor_semester_batch_laporanhasilbelajar, output_pdf_rapor_semester_batch_matapelajaran, output_pdf_rapor_semester_batch_capaiankompetensi, output_pdf_rapor_semester_batch_kokurikuler, output_pdf_rapor_semester_batch_ekstrakurikuler [INFERRED 0.75]
- **Development Workflow Concepts** — agents_md_filter_periode, agents_md_getsekolahwithfilter, agents_md_chromedevtoolsmcp, agents_md_postroutine [EXTRACTED 1.00]
- **Rapor Semester Multi-Page PDF Sequence** — concept_rapor_semester_report, concept_capaian_kompetensi_table, concept_student_identity_header, concept_kelompok_mata_pelajaran_umum, concept_kelompok_mata_pelajaran_kejuruan, concept_prakerin_section, concept_kokurikuler_assessment, concept_ekstrakurikuler_section, concept_absensi_summary, concept_catatan_wali_kelas, concept_parent_response_section, concept_keputusan_naik_kelas, concept_wali_kelas_signature, concept_kepala_sekolah_signature [EXTRACTED 1.00]
- **Student Portal Page Set** — concept_student_portal_ui, concept_dashboard_siswa_layout, concept_presensi_siswa_layout, concept_student_sidebar_menu [EXTRACTED 1.00]
- **SMK Report Generation Pipeline** — concept_daftar_rapor_admin_ui, concept_smk_pdf_generation, concept_pelengkap_rapor_cover, concept_rapor_semester_report, concept_rapor_color_coded_buttons [INFERRED 0.85]
- **Semester Report Card Layout Variants** — output_pdf_rapor-semester-identity-max-page-1_png, output_pdf_rapor-semester-identity-shifted-page-1_png, output_pdf_rapor-semester-page-1_png, output_pdf_rapor-semester-subject-middle-page-1_png [EXTRACTED 1.00]
- **Mid-Semester Report Card Variants** — output_pdf_rapor-tengah-semester-layout-final-page-1_png, output_pdf_rapor-tengah-semester-long-class-page-1_png, output_pdf_rapor-tengah-semester-pdfmake_png [EXTRACTED 1.00]
- **E-R Application Icon Set** — public_apple-touch-icon_png, public_icons_icon-192x192_png, public_icons_icon-512x512_png, public_icons_icon-maskable-512x512_png [INFERRED 0.95]

## Communities (102 total, 24 thin omitted)

### Community 0 - "mm"
Cohesion: 0.07
Nodes (70): mm(), ROBOTO_DIRECTORY, approvalBlock(), borderlessLayout, buildCover(), buildSchoolPage(), buildStudentPage(), buildTransferPage() (+62 more)

### Community 1 - "Rapor Semester (Semester Report Card)"
Cohesion: 0.06
Nodes (51): Absensi (Attendance) Summary Table, Capaian Kompetensi Assessment Table, Catatan Wali Kelas (Homeroom Teacher Notes), Daftar Rapor Admin UI System, Dashboard Siswa Layout Pattern, Ekstrakurikuler Assessment Section, Kelompok Mata Pelajaran Kejuruan (Vocational Subject Group), Kelompok Mata Pelajaran Umum (General Subject Group) (+43 more)

### Community 2 - "mapel-kelas-client.tsx"
Cohesion: 0.20
Nodes (15): COLUMNS, MapelKelasClient(), MapelKelasClientProps, ModalMapelKelas(), ModalMapelKelasProps, getData(), getKelas(), getMapel() (+7 more)

### Community 3 - "cetak-rapor/route.ts"
Cohesion: 0.11
Nodes (42): buildFooterTemplate(), POST(), tglIndo(), VALID_JENIS, wrapHtmlForPrint(), generatePelengkapRaporPdf(), formatTanggal(), generatePelengkapRaporHTML() (+34 more)

### Community 4 - "tu/layout.tsx"
Cohesion: 0.09
Nodes (24): POST(), getSidebarData(), TULayout(), DashboardLayout(), DashboardLayoutProps, menus, SidebarSiswa(), isParent() (+16 more)

### Community 5 - "prakerin-client.tsx"
Cohesion: 0.18
Nodes (13): ModalHapus(), ModalHapusProps, ModalPrakerin(), ModalPrakerinProps, COLUMNS, PrakerinClient(), PrakerinClientProps, getPrakerin() (+5 more)

### Community 6 - "mapel-siswa-grid.tsx"
Cohesion: 0.11
Nodes (25): KelasItem, MapelSiswaGrid(), MapelSiswaGridProps, Student, Subject, getEnrollments(), getKelasList(), getStudents() (+17 more)

### Community 7 - "ekstra-client.tsx"
Cohesion: 0.20
Nodes (13): COLUMNS, EkstraClient(), EkstraClientProps, ModalAnggotaEskul(), ModalAnggotaEskulProps, ModalEkstra(), ModalEkstraProps, addSiswaEkstra() (+5 more)

### Community 8 - "kompetensi-client.tsx"
Cohesion: 0.19
Nodes (11): COLUMNS, KompetensiClient(), KompetensiClientProps, ModalHapus(), ModalHapusProps, ModalKompetensi(), ModalKompetensiProps, getKompetensi() (+3 more)

### Community 9 - "siswa/profile/_components/profile-form.tsx"
Cohesion: 0.22
Nodes (6): ProfileForm(), Section, getData(), SiswaProfilePage(), resolveTingkat(), updateSiswaProfile()

### Community 10 - "siswa-client.tsx"
Cohesion: 0.25
Nodes (13): COLUMNS, SiswaClient(), SiswaClientProps, getReferensi(), KesiswaanPage(), deleteSiswa(), generateUsernamePasswordBulk(), getSiswaCount() (+5 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 12 - "p5bk-client.tsx"
Cohesion: 0.12
Nodes (24): ModalNilaiP5BK(), ModalNilaiP5BKProps, NilaiData, OPSI_NILAI, ProyekNilai, SiswaNilai, SubElemenItem, ModalP5BK() (+16 more)

### Community 14 - "db.ts"
Cohesion: 0.19
Nodes (8): getData(), KokurikulerPage(), getPenilaianData(), PageProps, PenilaianPage(), getData(), PrakerinPage(), globalForDb

### Community 15 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+11 more)

### Community 16 - "requireTuAdmin"
Cohesion: 0.16
Nodes (15): xlsx, dynamic, GET(), runtime, GET(), GET(), DAYS, PiketHarianClient() (+7 more)

### Community 17 - "y"
Cohesion: 0.14
Nodes (5): F, j(), p(), tt, y

### Community 18 - "workbox-4a6e5f9b.js"
Cohesion: 0.18
Nodes (12): n(), b(), constructor(), deleteCacheAndMetadata(), get(), h(), i, k() (+4 more)

### Community 19 - "auth-guard.ts"
Cohesion: 0.22
Nodes (7): CatatanWaliEditor(), Props, SaveStatus, STATUS_CLASS, STATUS_LABEL, saveCatatanWali(), SaveCatatanWaliInput

### Community 20 - "dependencies"
Cohesion: 0.12
Nodes (17): bcryptjs, idb, mysql2, next-auth, dependencies, bcryptjs, idb, mysql2 (+9 more)

### Community 21 - "r"
Cohesion: 0.29
Nodes (5): et(), g(), r, st(), U()

### Community 22 - "index.ts"
Cohesion: 0.12
Nodes (16): @auth/core/jwt, JWT, Kelas, KelasWali, KepalaSekolah, Mapel, MapelKelas, next-auth (+8 more)

### Community 23 - "organisasi-client.tsx"
Cohesion: 0.17
Nodes (17): ModalAnggotaOrganisasi(), ModalAnggotaProps, ModalOrganisasi(), ModalOrganisasiProps, COLUMNS, OrganisasiClient(), OrganisasiClientProps, getOrganisasi() (+9 more)

### Community 24 - "mapel-client.tsx"
Cohesion: 0.23
Nodes (11): COLUMNS, MapelClient(), MapelClientProps, ModalMapel(), ModalMapelProps, getKelompok(), getMapel(), MapelPage() (+3 more)

### Community 25 - "sekolah-helper.ts"
Cohesion: 0.16
Nodes (7): SEKOLAH_DIR, Entry, SekolahLogoRow, getData(), PengaturanPage(), Jabatan, SEKOLAH_ID

### Community 26 - "(dashboard)/profile/_components/profile-form.tsx"
Cohesion: 0.22
Nodes (10): getUserProfile(), GuruProfilPage(), ProfileForm(), ProfileFormProps, getUserProfile(), ProfilePage(), getUserProfile(), TuProfilUserPage() (+2 more)

### Community 27 - "daftar-rapor/page.tsx"
Cohesion: 0.22
Nodes (11): CHECKBOX_JENIS, DaftarRaporClient(), JENIS_CONFIG, JenisRapor, Props, DaftarRaporPage(), getKelas(), getSiswaKelas() (+3 more)

### Community 28 - "Rapor Semester Identity Max Layout"
Cohesion: 0.24
Nodes (10): Rapor Semester Identity Max Layout, Rapor Semester Identity Shifted Layout, Rapor Semester Page 1 - Subject Grades, Rapor Semester Page 2 - Extracurricular and Attendance, Rapor Semester Page 3 - Signatures and Decision, Rapor Semester Subject Middle Layout, Rapor Tengah Semester Final Layout, Rapor Tengah Semester Long Class Layout (+2 more)

### Community 29 - "deskripsi-client.tsx"
Cohesion: 0.05
Nodes (37): COLUMNS, DeskripsiClient(), DeskripsiClientProps, ModalDeskripsi(), ModalDeskripsiProps, ModalHapus(), ModalHapusProps, DeskripsiRaporPage() (+29 more)

### Community 30 - "siswa-portal-data.ts"
Cohesion: 0.27
Nodes (8): NilaiSiswaPage(), formatTanggal(), SiswaDashboardPage(), PresensiSiswaPage(), getNilaiSiswa(), getPresensiSiswa(), getSiswaPortalContext(), SiswaPortalContext

### Community 31 - "dapodik-actions.ts"
Cohesion: 0.05
Nodes (68): ENTITY_ORDER, ModalDetailSinkron(), Props, STATUS_META, ENTITAS, namaSemester(), PeriodeInfo, Props (+60 more)

### Community 32 - "auth.ts"
Cohesion: 0.18
Nodes (9): getData(), P5BKPage(), getData(), PiketHarianPage(), AnggotaKelasPage(), getData(), { handlers, signIn, signOut, auth }, StaffAuthRow (+1 more)

### Community 33 - "modal-siswa.tsx"
Cohesion: 0.22
Nodes (3): ModalSiswa(), ModalSiswaProps, Section

### Community 34 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

### Community 35 - "app/layout.tsx"
Cohesion: 0.32
Nodes (5): generateMetadata(), getLogoFilename(), viewport, ServiceWorkerRegister(), ToastProvider()

### Community 36 - "absensi-piket-client.tsx"
Cohesion: 0.23
Nodes (11): ABSEN_OPTIONS, AbsensiEntry, AbsensiPiketClient(), KelasItem, SiswaItem, AbsensiPiketPage(), cekAbsensiHariIni(), cekPiketHariIni() (+3 more)

### Community 37 - "Rencana Implementasi Modul Bimbingan Konseling (BK) — v2.1"
Cohesion: 0.05
Nodes (42): 0. Prasyarat — Toggle Guru BK di Pegawai TU, 10. Key Decisions, 11.1 Alur Pencatatan Layanan, 11.2 Siklus Status Kasus & Rekap Supervisi, 11. Flowchart Alur Proses, 12. Catatan Lanjutan (Fase Berikutnya), 1.1 `siswa_bk` — Penugasan Siswa ke Guru BK, 1.2 `layanan_bk` — Sesi Layanan Konseling (Header) (+34 more)

### Community 38 - "laporan-pendidikan/page.tsx"
Cohesion: 0.29
Nodes (8): Kelas, LegerClient(), LegerRow, NilaiKelas, getKelas(), getLeger(), getNilaiKelas(), LegerNilaiPage()

### Community 39 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 40 - "profil-actions.ts"
Cohesion: 0.36
Nodes (6): ProfilForm(), ProfilFormProps, getProfil(), ProfilPage(), saveFile(), updateProfil()

### Community 41 - "fallback-ce627215c0e4a9af.js"
Cohesion: 0.36
Nodes (4): f(), h(), r(), u()

### Community 42 - "tu/page.tsx"
Cohesion: 0.32
Nodes (6): CardStat(), CardStatProps, colorClasses, icons, getStats(), TUDashboardPage()

### Community 43 - "dkn-client.tsx"
Cohesion: 0.24
Nodes (8): computeData(), DKNClient(), GradeItem, MapelItem, Props, SemesterSeq, SiswaItem, DaftarKumpulanNilaiPage()

### Community 45 - "buku-induk/page.tsx"
Cohesion: 0.33
Nodes (5): BukuIndukGuruClient(), BukuIndukGuruClientProps, SECTIONS, SiswaBukuInduk, BukuIndukGuruPage()

### Community 46 - "lager-nilai-kelas/page.tsx"
Cohesion: 0.33
Nodes (5): LegerGuruClient(), LegerRow, NilaiKelas, RekapPresensi, LegerNilaiGuruPage()

### Community 47 - "guru/organisasi/page.tsx"
Cohesion: 0.33
Nodes (5): Anggota, Organisasi, OrganisasiGuruClient(), OrganisasiGuruClientProps, OrganisasiGuruPage()

### Community 48 - "Laporan Hasil Belajar"
Cohesion: 0.33
Nodes (6): Capaian Kompetensi, Ekstrakurikuler, Kokurikuler, Laporan Hasil Belajar, Mata Pelajaran, Laporan Hasil Belajar (pdfmake)

### Community 49 - "guru/anggota-kelas/page.tsx"
Cohesion: 0.40
Nodes (4): AnggotaKelasGuruClient(), AnggotaKelasGuruClientProps, COLUMNS, AnggotaKelasGuruPage()

### Community 50 - "modal-nilai-eskul.tsx"
Cohesion: 0.38
Nodes (5): Props, ModalNilaiEskul(), ModalNilaiEskulProps, NilaiRow, bulkUpdateSiswaEkstra()

### Community 51 - "presensi-actions.ts"
Cohesion: 0.32
Nodes (8): ABSEN_COLS, KelasItem, RekapAbsensiBKClient(), RekapItem, requireGuruBK(), getKelasListForBK(), getRekapAbsensiBK(), updatePresensiInline()

### Community 52 - "AGENTS.md"
Cohesion: 0.50
Nodes (3): Chrome DevTools MCP, Filter Periode (Tahun/Semester) — TU Pages, Post-Change Routine

### Community 53 - "db-migrate.sh script"
Cohesion: 0.50
Nodes (3): deploy.sh script, load_env(), db-migrate.sh script

### Community 54 - "requireGuru"
Cohesion: 0.30
Nodes (14): Option, Props, TPMultiKelasClient(), requireGuru(), addTujuanMulti(), copyTujuan(), createKode(), deleteTujuanByKode() (+6 more)

### Community 55 - "cetak-rapor-guru-client.tsx"
Cohesion: 0.18
Nodes (10): CetakRaporGuruClient(), CHECKBOX_JENIS, JENIS_CONFIG, JenisRapor, KelasItem, Props, Siswa, CetakRaporGuruPage() (+2 more)

### Community 56 - "getSekolahWithFilter"
Cohesion: 0.26
Nodes (12): GuruEkstraDetail(), EkstraPage(), getDetail(), getList(), getSiswa(), getSiswaEkstra(), PageProps, getDetail() (+4 more)

### Community 57 - "E-R App Icon 192x192"
Cohesion: 0.67
Nodes (4): E-R App Icon Apple Touch, E-R App Icon 192x192, E-R App Icon 512x512, E-R App Icon Maskable 512x512

### Community 60 - "tu/ekstra/page.tsx"
Cohesion: 0.60
Nodes (5): EkstraPage(), getEkstra(), getSiswa(), getSiswaEkstra(), getUsers()

### Community 61 - "rombel/page.tsx"
Cohesion: 0.31
Nodes (7): COLUMNS, RombelClient(), RombelClientProps, getRombel(), getUser(), RombelPage(), updateWaliKelas()

### Community 65 - "File Icon SVG"
Cohesion: 1.00
Nodes (3): File Icon SVG, Globe Icon SVG, Window Icon SVG

### Community 66 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 67 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 68 - "modal-import-siswa.tsx"
Cohesion: 0.47
Nodes (5): COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportSiswa(), ModalImportSiswaProps

### Community 70 - "anggota-kelas-actions.ts"
Cohesion: 0.24
Nodes (9): AnggotaKelasClient(), AnggotaKelasClientProps, COLUMNS, ModalTransferAnggotaKelas(), ModalTransferAnggotaKelasProps, bulkAddAnggotaKelas(), bulkRemoveAnggotaKelas(), deleteAnggotaKelas() (+1 more)

### Community 74 - "catatan-wali/page.tsx"
Cohesion: 0.22
Nodes (8): CatatanWaliClient(), FilterStatus, KelasItem, Props, SiswaItem, CatatanWaliPage(), KelasWaliRow, SiswaCatatanRow

### Community 82 - "useToast"
Cohesion: 0.27
Nodes (9): buildMap(), PenilaianClient(), TAB_INFO, COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportPrakerin(), ModalImportProps (+1 more)

### Community 88 - "tu/piket-harian/page.tsx"
Cohesion: 0.83
Nodes (3): getData(), getUser(), PiketHarianPage()

### Community 93 - "confirmAlert"
Cohesion: 0.40
Nodes (7): PengaturanClient(), Props, toDateInput(), addTahunPelajaran(), deleteTahunPelajaran(), savePengaturan(), confirmAlert()

### Community 94 - "sidebar-guru.tsx"
Cohesion: 0.43
Nodes (6): ALL_MENU_SECTIONS, getVisibleItems(), getVisibleSections(), SidebarGuru(), getGuruTugas(), GuruTugas

### Community 95 - "toast-provider.tsx"
Cohesion: 0.33
Nodes (5): ToastContext, ToastContextType, ToastItem, Toast(), ToastProps

### Community 97 - "rekap-presensi/page.tsx"
Cohesion: 0.40
Nodes (4): COLUMNS, RekapPresensiGuruClient(), RekapPresensiGuruClientProps, RekapPresensiGuruPage()

## Knowledge Gaps
- **359 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `fs`, `env`, `eslintConfig` (+354 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSekolahWithFilter()` connect `getSekolahWithFilter` to `mapel-kelas-client.tsx`, `cetak-rapor/route.ts`, `tu/layout.tsx`, `prakerin-client.tsx`, `mapel-siswa-grid.tsx`, `siswa-client.tsx`, `p5bk-client.tsx`, `db.ts`, `auth-guard.ts`, `organisasi-client.tsx`, `sekolah-helper.ts`, `daftar-rapor/page.tsx`, `auth.ts`, `absensi-piket-client.tsx`, `laporan-pendidikan/page.tsx`, `profil-actions.ts`, `tu/page.tsx`, `dkn-client.tsx`, `buku-induk/page.tsx`, `lager-nilai-kelas/page.tsx`, `guru/organisasi/page.tsx`, `guru/anggota-kelas/page.tsx`, `presensi-actions.ts`, `requireGuru`, `cetak-rapor-guru-client.tsx`, `tu/ekstra/page.tsx`, `rombel/page.tsx`, `anggota-kelas-actions.ts`, `catatan-wali/page.tsx`, `sidebar-guru.tsx`, `kelas-ku/page.tsx`, `rekap-presensi/page.tsx`, `guru/page.tsx`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `SiswaClient()` connect `siswa-client.tsx` to `workbox-4a6e5f9b.js`, `confirmAlert`, `useToast`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useToast` to `mapel-kelas-client.tsx`, `prakerin-client.tsx`, `mapel-siswa-grid.tsx`, `ekstra-client.tsx`, `kompetensi-client.tsx`, `siswa/profile/_components/profile-form.tsx`, `siswa-client.tsx`, `p5bk-client.tsx`, `requireTuAdmin`, `organisasi-client.tsx`, `mapel-client.tsx`, `(dashboard)/profile/_components/profile-form.tsx`, `deskripsi-client.tsx`, `dapodik-actions.ts`, `absensi-piket-client.tsx`, `profil-actions.ts`, `modal-nilai-eskul.tsx`, `presensi-actions.ts`, `requireGuru`, `rombel/page.tsx`, `modal-import-siswa.tsx`, `anggota-kelas-actions.ts`, `confirmAlert`, `toast-provider.tsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `fs` to the rest of the system?**
  _359 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `mm` be split into smaller, more focused modules?**
  _Cohesion score 0.06738245094409478 - nodes in this community are weakly interconnected._
- **Should `Rapor Semester (Semester Report Card)` be split into smaller, more focused modules?**
  _Cohesion score 0.05725490196078432 - nodes in this community are weakly interconnected._
- **Should `cetak-rapor/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10726950354609929 - nodes in this community are weakly interconnected._