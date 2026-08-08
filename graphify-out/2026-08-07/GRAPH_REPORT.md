# Graph Report - clone-rapor-next  (2026-08-07)

## Corpus Check
- 218 files · ~1,721,193 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1238 nodes · 2501 edges · 100 communities (76 shown, 24 thin omitted)
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
- requireTuAdmin
- pelengkap-pdfmake.ts
- toast-provider.tsx
- tengah-semester-pdfmake.ts
- siswa-client.tsx
- compilerOptions
- p5bk-client.tsx
- a
- db.ts
- devDependencies
- piket-harian-client.tsx
- y
- workbox-4a6e5f9b.js
- cetak-rapor-guru-client.tsx
- dependencies
- r
- index.ts
- organisasi-client.tsx
- mapel-client.tsx
- auth.ts
- (dashboard)/profile/_components/profile-form.tsx
- daftar-rapor/page.tsx
- Rapor Semester Identity Max Layout
- deskripsi-client.tsx
- siswa/page.tsx
- dapodik-actions.ts
- tu/p5bk/page.tsx
- kompetensi-client.tsx
- manifest.json
- app/layout.tsx
- tu/prakerin/page.tsx
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
- kelas-ku/page.tsx
- pelengkap-template.ts
- AGENTS.md
- db-migrate.sh script
- auth-guard.ts
- catatan-rapor/page.tsx
- getSekolahWithFilter
- E-R App Icon 192x192
- [[...path]]/route.ts
- login/page.tsx
- mapel-kelas/page.tsx
- rombel-client.tsx
- pwa.d.ts
- ecosystem.config.js
- next.config.ts
- File Icon SVG
- opencode.json
- README.md
- [id_mapel_kelas]/page.tsx
- eslint.config.mjs
- useToast
- next
- react
- react-dom
- react-select
- graphify.js
- postcss.config.mjs
- Next.js Logo SVG
- mapel-siswa/page.tsx
- Environment Variables
- Database Migrations
- Offline Page
- naik-kelas/page.tsx
- puppeteer
- { GET, POST }
- singkron-client.tsx
- siswa/profile/_components/profile-form.tsx
- rombel/page.tsx
- tu/anggota-kelas/page.tsx
- rekap-presensi/page.tsx
- @ducanh2912/next-pwa
- SMK Abdi Negara Tuban School Logo Duplicate 3

## God Nodes (most connected - your core abstractions)
1. `getSekolahWithFilter()` - 102 edges
2. `requireTuAdmin()` - 87 edges
3. `useToast()` - 61 edges
4. `mm()` - 37 edges
5. `requireGuru()` - 24 edges
6. `syncDapodik()` - 23 edges
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

## Communities (100 total, 24 thin omitted)

### Community 0 - "mm"
Cohesion: 0.19
Nodes (26): mm(), ROBOTO_DIRECTORY, attendanceTable(), borderedLayout, borderlessLayout, cocurricularBlock(), competenceText(), createSemesterRaporDefinition() (+18 more)

### Community 1 - "Rapor Semester (Semester Report Card)"
Cohesion: 0.06
Nodes (51): Absensi (Attendance) Summary Table, Capaian Kompetensi Assessment Table, Catatan Wali Kelas (Homeroom Teacher Notes), Daftar Rapor Admin UI System, Dashboard Siswa Layout Pattern, Ekstrakurikuler Assessment Section, Kelompok Mata Pelajaran Kejuruan (Vocational Subject Group), Kelompok Mata Pelajaran Umum (General Subject Group) (+43 more)

### Community 2 - "mapel-kelas-client.tsx"
Cohesion: 0.29
Nodes (10): COLUMNS, MapelKelasClient(), MapelKelasClientProps, ModalMapelKelas(), ModalMapelKelasProps, autoEnrollSiswa(), copyMapelKelasFromPreviousYear(), copyMapelKelasFromSameYear() (+2 more)

### Community 3 - "cetak-rapor/route.ts"
Cohesion: 0.13
Nodes (34): buildFooterTemplate(), POST(), tglIndo(), VALID_JENIS, wrapHtmlForPrint(), generateRaporHTML(), JENIS_LABELS, JenisRapor (+26 more)

### Community 4 - "tu/layout.tsx"
Cohesion: 0.07
Nodes (30): POST(), getSidebarData(), TULayout(), DashboardLayout(), DashboardLayoutProps, ALL_MENU_SECTIONS, getVisibleItems(), getVisibleSections() (+22 more)

### Community 5 - "prakerin-client.tsx"
Cohesion: 0.05
Nodes (38): ModalHapusProps, ModalHapusProps, ModalHapusProps, ModalHapusProps, ModalHapus(), ModalHapusProps, ModalHapusProps, ModalHapus() (+30 more)

### Community 6 - "requireTuAdmin"
Cohesion: 0.15
Nodes (21): xlsx, dynamic, GET(), runtime, GET(), GET(), MapelSiswaGrid(), NaikKelasClient() (+13 more)

### Community 7 - "pelengkap-pdfmake.ts"
Cohesion: 0.16
Nodes (26): approvalBlock(), borderlessLayout, buildCover(), buildSchoolPage(), buildStudentPage(), buildTransferPage(), createPelengkapRaporDefinition(), displayValue() (+18 more)

### Community 8 - "toast-provider.tsx"
Cohesion: 0.15
Nodes (9): KelasItem, MapelSiswaGridProps, Student, Subject, ToastContext, ToastContextType, ToastItem, Toast() (+1 more)

### Community 9 - "tengah-semester-pdfmake.ts"
Cohesion: 0.19
Nodes (19): academicNote(), attendanceTable(), borderedLayout, borderlessLayout, createTengahSemesterRaporDefinition(), displayValue(), divider(), generateTengahSemesterRaporPdf() (+11 more)

### Community 10 - "siswa-client.tsx"
Cohesion: 0.10
Nodes (22): ModalHapus(), COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportSiswa(), ModalImportSiswaProps, ModalSiswa(), ModalSiswaProps (+14 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 12 - "p5bk-client.tsx"
Cohesion: 0.15
Nodes (18): ModalNilaiP5BK(), ModalNilaiP5BKProps, NilaiData, OPSI_NILAI, ProyekNilai, SiswaNilai, SubElemenItem, ModalP5BK() (+10 more)

### Community 14 - "db.ts"
Cohesion: 0.18
Nodes (8): getData(), KokurikulerPage(), getData(), PiketHarianPage(), getData(), PrakerinPage(), SaveCatatanWaliInput, globalForDb

### Community 15 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+11 more)

### Community 16 - "piket-harian-client.tsx"
Cohesion: 0.24
Nodes (10): DAYS, PiketHarianClient(), PiketHarianClientProps, getData(), getUser(), PiketHarianPage(), addPiketHarian(), deletePiketHarian() (+2 more)

### Community 17 - "y"
Cohesion: 0.14
Nodes (6): constructor(), deleteCacheAndMetadata(), F, j(), p(), y

### Community 18 - "workbox-4a6e5f9b.js"
Cohesion: 0.21
Nodes (10): n(), b(), get(), i, k(), O(), q(), s (+2 more)

### Community 19 - "cetak-rapor-guru-client.tsx"
Cohesion: 0.12
Nodes (17): CHECKBOX_JENIS, JENIS_CONFIG, JenisRapor, KelasItem, Props, Siswa, CatatanWaliClient(), FilterStatus (+9 more)

### Community 20 - "dependencies"
Cohesion: 0.12
Nodes (17): bcryptjs, idb, mysql2, next-auth, dependencies, bcryptjs, idb, mysql2 (+9 more)

### Community 21 - "r"
Cohesion: 0.23
Nodes (6): et(), g(), h(), r, st(), U()

### Community 22 - "index.ts"
Cohesion: 0.12
Nodes (16): @auth/core/jwt, JWT, Kelas, KelasWali, KepalaSekolah, Mapel, MapelKelas, next-auth (+8 more)

### Community 23 - "organisasi-client.tsx"
Cohesion: 0.16
Nodes (18): ModalAnggotaOrganisasi(), ModalAnggotaProps, ModalHapusOrganisasi(), ModalOrganisasi(), ModalOrganisasiProps, COLUMNS, OrganisasiClient(), OrganisasiClientProps (+10 more)

### Community 24 - "mapel-client.tsx"
Cohesion: 0.18
Nodes (13): COLUMNS, MapelClient(), MapelClientProps, ModalHapus(), ModalHapusProps, ModalMapel(), ModalMapelProps, getKelompok() (+5 more)

### Community 25 - "auth.ts"
Cohesion: 0.12
Nodes (13): SEKOLAH_DIR, Entry, SekolahLogoRow, getData(), SiswaProfilePage(), getData(), PengaturanPage(), { handlers, signIn, signOut, auth } (+5 more)

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
Cohesion: 0.22
Nodes (10): COLUMNS, DeskripsiClient(), DeskripsiClientProps, ModalDeskripsi(), ModalDeskripsiProps, ModalHapus(), DeskripsiRaporPage(), getDeskripsi() (+2 more)

### Community 30 - "siswa/page.tsx"
Cohesion: 0.25
Nodes (7): NilaiSiswaPage(), formatTanggal(), SiswaDashboardPage(), PresensiSiswaPage(), getNilaiSiswa(), getPresensiSiswa(), getSiswaPortalContext()

### Community 31 - "dapodik-actions.ts"
Cohesion: 0.09
Nodes (45): addDetail(), DetailRow, findKkIdByMatch(), flushDetail(), getConnection(), REVALIDATE, SyncContext, syncDapodik() (+37 more)

### Community 32 - "tu/p5bk/page.tsx"
Cohesion: 0.52
Nodes (6): getData(), getDimensiTree(), getKelas(), getTema(), getUser(), P5BKPage()

### Community 33 - "kompetensi-client.tsx"
Cohesion: 0.22
Nodes (10): COLUMNS, KompetensiClient(), KompetensiClientProps, ModalHapus(), ModalKompetensi(), ModalKompetensiProps, getKompetensi(), KompetensiPage() (+2 more)

### Community 34 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

### Community 35 - "app/layout.tsx"
Cohesion: 0.32
Nodes (5): generateMetadata(), getLogoFilename(), viewport, ServiceWorkerRegister(), ToastProvider()

### Community 36 - "tu/prakerin/page.tsx"
Cohesion: 0.83
Nodes (3): getPrakerin(), getUsers(), PrakerinPage()

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
Cohesion: 0.29
Nodes (7): computeData(), DKNClient(), GradeItem, MapelItem, Props, SemesterSeq, SiswaItem

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

### Community 51 - "pelengkap-template.ts"
Cohesion: 0.54
Nodes (7): formatTanggal(), generatePelengkapRaporHTML(), infoRow(), PelengkapSekolahInfo, PelengkapSiswaInfo, value(), escapeHtml()

### Community 52 - "AGENTS.md"
Cohesion: 0.50
Nodes (3): Chrome DevTools MCP, Filter Periode (Tahun/Semester) — TU Pages, Post-Change Routine

### Community 53 - "db-migrate.sh script"
Cohesion: 0.50
Nodes (3): deploy.sh script, load_env(), db-migrate.sh script

### Community 54 - "auth-guard.ts"
Cohesion: 0.06
Nodes (57): ABSEN_OPTIONS, AbsensiEntry, AbsensiPiketClient(), KelasItem, SiswaItem, AbsensiPiketPage(), Props, ABSEN_COLS (+49 more)

### Community 55 - "catatan-rapor/page.tsx"
Cohesion: 0.40
Nodes (4): CetakRaporGuruClient(), CetakRaporGuruPage(), SiswaRaporRow, WaliKelasRow

### Community 56 - "getSekolahWithFilter"
Cohesion: 0.13
Nodes (20): CatatanWaliPage(), KelasWaliRow, SiswaCatatanRow, GuruEkstraDetail(), EkstraPage(), getDetail(), getList(), getSiswa() (+12 more)

### Community 57 - "E-R App Icon 192x192"
Cohesion: 0.67
Nodes (4): E-R App Icon Apple Touch, E-R App Icon 192x192, E-R App Icon 512x512, E-R App Icon Maskable 512x512

### Community 60 - "mapel-kelas/page.tsx"
Cohesion: 0.60
Nodes (5): getData(), getKelas(), getMapel(), getUser(), MapelKelasPage()

### Community 61 - "rombel-client.tsx"
Cohesion: 0.47
Nodes (4): COLUMNS, RombelClient(), RombelClientProps, updateWaliKelas()

### Community 65 - "File Icon SVG"
Cohesion: 1.00
Nodes (3): File Icon SVG, Globe Icon SVG, Window Icon SVG

### Community 66 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 67 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 68 - "[id_mapel_kelas]/page.tsx"
Cohesion: 0.67
Nodes (3): getPenilaianData(), PageProps, PenilaianPage()

### Community 70 - "useToast"
Cohesion: 0.19
Nodes (13): buildMap(), PenilaianClient(), TAB_INFO, AnggotaKelasClient(), AnggotaKelasClientProps, COLUMNS, ModalTransferAnggotaKelas(), ModalTransferAnggotaKelasProps (+5 more)

### Community 82 - "mapel-siswa/page.tsx"
Cohesion: 0.60
Nodes (5): getEnrollments(), getKelasList(), getStudents(), getSubjects(), MapelSiswaPage()

### Community 88 - "naik-kelas/page.tsx"
Cohesion: 0.70
Nodes (4): getData(), getKelas(), getTingkat(), NaikKelasPage()

### Community 92 - "singkron-client.tsx"
Cohesion: 0.19
Nodes (13): ENTITY_ORDER, ModalDetailSinkron(), Props, STATUS_META, ENTITAS, Props, SingkronClient(), getData() (+5 more)

### Community 93 - "siswa/profile/_components/profile-form.tsx"
Cohesion: 0.18
Nodes (11): ProfileForm(), Section, PengaturanClient(), Props, toDateInput(), addTahunPelajaran(), deleteTahunPelajaran(), savePengaturan() (+3 more)

### Community 94 - "rombel/page.tsx"
Cohesion: 0.83
Nodes (3): getRombel(), getUser(), RombelPage()

### Community 97 - "rekap-presensi/page.tsx"
Cohesion: 0.40
Nodes (4): COLUMNS, RekapPresensiGuruClient(), RekapPresensiGuruClientProps, RekapPresensiGuruPage()

## Knowledge Gaps
- **356 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `fs`, `env`, `eslintConfig` (+351 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSekolahWithFilter()` connect `getSekolahWithFilter` to `mapel-kelas-client.tsx`, `cetak-rapor/route.ts`, `tu/layout.tsx`, `prakerin-client.tsx`, `siswa-client.tsx`, `p5bk-client.tsx`, `db.ts`, `cetak-rapor-guru-client.tsx`, `organisasi-client.tsx`, `auth.ts`, `daftar-rapor/page.tsx`, `tu/p5bk/page.tsx`, `tu/prakerin/page.tsx`, `laporan-pendidikan/page.tsx`, `profil-actions.ts`, `tu/page.tsx`, `buku-induk/page.tsx`, `lager-nilai-kelas/page.tsx`, `guru/organisasi/page.tsx`, `guru/anggota-kelas/page.tsx`, `kelas-ku/page.tsx`, `auth-guard.ts`, `catatan-rapor/page.tsx`, `mapel-kelas/page.tsx`, `[id_mapel_kelas]/page.tsx`, `useToast`, `mapel-siswa/page.tsx`, `naik-kelas/page.tsx`, `rombel/page.tsx`, `tu/anggota-kelas/page.tsx`, `rekap-presensi/page.tsx`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `SiswaClient()` connect `siswa-client.tsx` to `workbox-4a6e5f9b.js`, `siswa/profile/_components/profile-form.tsx`, `useToast`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useToast` to `kompetensi-client.tsx`, `mapel-kelas-client.tsx`, `prakerin-client.tsx`, `requireTuAdmin`, `toast-provider.tsx`, `profil-actions.ts`, `siswa-client.tsx`, `p5bk-client.tsx`, `piket-harian-client.tsx`, `rombel-client.tsx`, `siswa/profile/_components/profile-form.tsx`, `auth-guard.ts`, `organisasi-client.tsx`, `mapel-client.tsx`, `(dashboard)/profile/_components/profile-form.tsx`, `singkron-client.tsx`, `deskripsi-client.tsx`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `fs` to the rest of the system?**
  _356 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Rapor Semester (Semester Report Card)` be split into smaller, more focused modules?**
  _Cohesion score 0.05725490196078432 - nodes in this community are weakly interconnected._
- **Should `cetak-rapor/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12550607287449392 - nodes in this community are weakly interconnected._
- **Should `tu/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0707070707070707 - nodes in this community are weakly interconnected._