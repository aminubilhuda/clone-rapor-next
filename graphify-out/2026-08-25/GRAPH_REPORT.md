# Graph Report - clone-rapor-next  (2026-08-25)

## Corpus Check
- 248 files · ~2,112,271 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1377 nodes · 2941 edges · 102 communities (80 shown, 22 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2e934b9d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mm
- Rapor Semester (Semester Report Card)
- integrasi-api-client.tsx
- cetak-rapor/route.ts
- tu/layout.tsx
- prakerin-client.tsx
- mapel-siswa-grid.tsx
- ekstra-client.tsx
- pelengkap-pdfmake.ts
- kokurikuler-actions.ts
- siswa-client.tsx
- compilerOptions
- p5bk-client.tsx
- a
- tujuan-pembelajaran/page.tsx
- devDependencies
- auth-guard.ts
- y
- workbox-4a6e5f9b.js
- tengah-semester-pdfmake.ts
- dependencies
- r
- index.ts
- organisasi-client.tsx
- db.ts
- mapel-client.tsx
- (dashboard)/profile/_components/profile-form.tsx
- daftar-rapor/page.tsx
- Rapor Semester Identity Max Layout
- tp-actions.ts
- siswa-portal-data.ts
- dapodik-actions.ts
- kompetensi-client.tsx
- pegawai-client.tsx
- manifest.json
- rombel/page.tsx
- rekap-absensi-bk-client.tsx
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
- tu/piket-harian/page.tsx
- Laporan Hasil Belajar
- guru/anggota-kelas/page.tsx
- anggota-kelas-actions.ts
- getSekolahWithFilter
- AGENTS.md
- db-migrate.sh script
- mapel-kelas-client.tsx
- deskripsi-client.tsx
- guru/organisasi/page.tsx
- E-R App Icon 192x192
- [[...path]]/route.ts
- login/page.tsx
- react-select
- tu/organisasi/page.tsx
- pwa.d.ts
- ecosystem.config.js
- next.config.ts
- File Icon SVG
- opencode.json
- README.md
- toast-provider.tsx
- eslint.config.mjs
- requireTuAdmin
- next
- react
- react-dom
- cetak-rapor-guru-client.tsx
- graphify.js
- postcss.config.mjs
- Next.js Logo SVG
- useToast
- Environment Variables
- Database Migrations
- Offline Page
- pelengkap-template.ts
- puppeteer
- { GET, POST }
- confirmAlert
- idb
- modal-siswa.tsx
- naik-kelas-client.tsx
- modal-import-siswa.tsx
- rekap-presensi/page.tsx
- mapel-siswa/page.tsx
- naik-kelas/page.tsx
- SMK Abdi Negara Tuban School Logo Duplicate 3

## God Nodes (most connected - your core abstractions)
1. `getSekolahWithFilter()` - 106 edges
2. `requireTuAdmin()` - 103 edges
3. `useToast()` - 67 edges
4. `mm()` - 37 edges
5. `apiError()` - 36 edges
6. `apiSuccess()` - 33 edges
7. `requireApiAuth()` - 32 edges
8. `apiOptionsResponse()` - 32 edges
9. `syncDapodik()` - 27 edges
10. `SEKOLAH_ID` - 26 edges

## Surprising Connections (you probably didn't know these)
- `syncDapodik()` --indirect_call--> `u()`  [INFERRED]
  src/lib/actions/dapodik-actions.ts → public/fallback-ce627215c0e4a9af.js
- `SiswaClient()` --indirect_call--> `k()`  [INFERRED]
  src/app/(dashboard)/tu/kesiswaan/_components/siswa-client.tsx → public/workbox-4a6e5f9b.js
- `syncDapodik()` --indirect_call--> `k()`  [INFERRED]
  src/lib/actions/dapodik-actions.ts → public/workbox-4a6e5f9b.js
- `ModalImportSiswa()` --references--> `xlsx`  [EXTRACTED]
  src/app/(dashboard)/tu/kesiswaan/_components/modal-import-siswa.tsx → package.json
- `DKNClient()` --references--> `xlsx`  [EXTRACTED]
  src/app/(dashboard)/tu/laporan-pendidikan/daftar-kumpulan-nilai/_components/dkn-client.tsx → package.json

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

## Communities (102 total, 22 thin omitted)

### Community 0 - "mm"
Cohesion: 0.19
Nodes (26): mm(), ROBOTO_DIRECTORY, attendanceTable(), borderedLayout, borderlessLayout, cocurricularBlock(), competenceText(), createSemesterRaporDefinition() (+18 more)

### Community 1 - "Rapor Semester (Semester Report Card)"
Cohesion: 0.06
Nodes (51): Absensi (Attendance) Summary Table, Capaian Kompetensi Assessment Table, Catatan Wali Kelas (Homeroom Teacher Notes), Daftar Rapor Admin UI System, Dashboard Siswa Layout Pattern, Ekstrakurikuler Assessment Section, Kelompok Mata Pelajaran Kejuruan (Vocational Subject Group), Kelompok Mata Pelajaran Umum (General Subject Group) (+43 more)

### Community 2 - "integrasi-api-client.tsx"
Cohesion: 0.27
Nodes (11): EndpointDoc, ENDPOINTS, IntegrasiApiClient(), IntegrasiApiClientProps, dynamic, IntegrasiApiPage(), ApiKeyItem, createApiKey() (+3 more)

### Community 3 - "cetak-rapor/route.ts"
Cohesion: 0.13
Nodes (34): buildFooterTemplate(), POST(), tglIndo(), VALID_JENIS, wrapHtmlForPrint(), generateRaporHTML(), JENIS_LABELS, JenisRapor (+26 more)

### Community 4 - "tu/layout.tsx"
Cohesion: 0.07
Nodes (32): POST(), getSidebarData(), TULayout(), DapodikSyncBanner(), DashboardLayout(), DashboardLayoutProps, ALL_MENU_SECTIONS, getVisibleItems() (+24 more)

### Community 5 - "prakerin-client.tsx"
Cohesion: 0.18
Nodes (13): ModalHapus(), ModalHapusProps, ModalPrakerin(), ModalPrakerinProps, COLUMNS, PrakerinClient(), PrakerinClientProps, getPrakerin() (+5 more)

### Community 6 - "mapel-siswa-grid.tsx"
Cohesion: 0.22
Nodes (10): KelasItem, MapelSiswaGrid(), MapelSiswaGridProps, Student, Subject, deleteMapelSiswa(), toggleMapelSiswa(), toggleMapelSiswaBatch() (+2 more)

### Community 7 - "ekstra-client.tsx"
Cohesion: 0.09
Nodes (30): GuruEkstraDetail(), Props, EkstraPage(), getDetail(), getList(), getSiswa(), getSiswaEkstra(), PageProps (+22 more)

### Community 8 - "pelengkap-pdfmake.ts"
Cohesion: 0.16
Nodes (26): approvalBlock(), borderlessLayout, buildCover(), buildSchoolPage(), buildStudentPage(), buildTransferPage(), createPelengkapRaporDefinition(), displayValue() (+18 more)

### Community 9 - "kokurikuler-actions.ts"
Cohesion: 0.07
Nodes (40): ModalHapus(), ModalHapusProps, ModalHapus(), ModalHapusProps, COLUMNS, KokurikulerClient(), KokurikulerClientProps, OPSI_NILAI (+32 more)

### Community 10 - "siswa-client.tsx"
Cohesion: 0.25
Nodes (13): COLUMNS, SiswaClient(), SiswaClientProps, getReferensi(), KesiswaanPage(), deleteSiswa(), generateUsernamePasswordBulk(), getSiswaCount() (+5 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 12 - "p5bk-client.tsx"
Cohesion: 0.12
Nodes (24): ModalNilaiP5BK(), ModalNilaiP5BKProps, NilaiData, OPSI_NILAI, ProyekNilai, SiswaNilai, SubElemenItem, ModalP5BK() (+16 more)

### Community 14 - "tujuan-pembelajaran/page.tsx"
Cohesion: 0.60
Nodes (4): getDetail(), getOptions(), PageProps, TujuanPembelajaranPage()

### Community 15 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+11 more)

### Community 16 - "auth-guard.ts"
Cohesion: 0.21
Nodes (14): ABSEN_OPTIONS, AbsensiEntry, AbsensiPiketClient(), KelasItem, SiswaItem, AbsensiPiketPage(), requireGuru(), saveCatatanWali() (+6 more)

### Community 17 - "y"
Cohesion: 0.14
Nodes (5): F, j(), p(), tt, y

### Community 18 - "workbox-4a6e5f9b.js"
Cohesion: 0.18
Nodes (12): n(), b(), constructor(), deleteCacheAndMetadata(), get(), h(), i, k() (+4 more)

### Community 19 - "tengah-semester-pdfmake.ts"
Cohesion: 0.19
Nodes (19): academicNote(), attendanceTable(), borderedLayout, borderlessLayout, createTengahSemesterRaporDefinition(), displayValue(), divider(), generateTengahSemesterRaporPdf() (+11 more)

### Community 20 - "dependencies"
Cohesion: 0.12
Nodes (17): bcryptjs, @ducanh2912/next-pwa, mysql2, next-auth, dependencies, bcryptjs, @ducanh2912/next-pwa, mysql2 (+9 more)

### Community 21 - "r"
Cohesion: 0.29
Nodes (5): et(), g(), r, st(), U()

### Community 22 - "index.ts"
Cohesion: 0.12
Nodes (16): @auth/core/jwt, JWT, Kelas, KelasWali, KepalaSekolah, Mapel, MapelKelas, next-auth (+8 more)

### Community 23 - "organisasi-client.tsx"
Cohesion: 0.23
Nodes (12): ModalAnggotaOrganisasi(), ModalAnggotaProps, ModalOrganisasi(), ModalOrganisasiProps, COLUMNS, OrganisasiClient(), OrganisasiClientProps, addSiswaOrganisasi() (+4 more)

### Community 24 - "db.ts"
Cohesion: 0.05
Nodes (75): SEKOLAH_DIR, Entry, SekolahLogoRow, OPTIONS(), POST(), runtime, GET(), OPTIONS() (+67 more)

### Community 25 - "mapel-client.tsx"
Cohesion: 0.23
Nodes (11): COLUMNS, MapelClient(), MapelClientProps, ModalMapel(), ModalMapelProps, getKelompok(), getMapel(), MapelPage() (+3 more)

### Community 26 - "(dashboard)/profile/_components/profile-form.tsx"
Cohesion: 0.22
Nodes (10): getUserProfile(), GuruProfilPage(), ProfileForm(), ProfileFormProps, getUserProfile(), ProfilePage(), getUserProfile(), TuProfilUserPage() (+2 more)

### Community 27 - "daftar-rapor/page.tsx"
Cohesion: 0.22
Nodes (11): CHECKBOX_JENIS, DaftarRaporClient(), JENIS_CONFIG, JenisRapor, Props, DaftarRaporPage(), getKelas(), getSiswaKelas() (+3 more)

### Community 28 - "Rapor Semester Identity Max Layout"
Cohesion: 0.24
Nodes (10): Rapor Semester Identity Max Layout, Rapor Semester Identity Shifted Layout, Rapor Semester Page 1 - Subject Grades, Rapor Semester Page 2 - Extracurricular and Attendance, Rapor Semester Page 3 - Signatures and Decision, Rapor Semester Subject Middle Layout, Rapor Tengah Semester Final Layout, Rapor Tengah Semester Long Class Layout (+2 more)

### Community 29 - "tp-actions.ts"
Cohesion: 0.28
Nodes (13): Option, Props, TPMultiKelasClient(), addTujuanMulti(), copyTujuan(), createKode(), deleteTujuanByKode(), formatDisplayOrder() (+5 more)

### Community 30 - "siswa-portal-data.ts"
Cohesion: 0.27
Nodes (8): NilaiSiswaPage(), formatTanggal(), SiswaDashboardPage(), PresensiSiswaPage(), getNilaiSiswa(), getPresensiSiswa(), getSiswaPortalContext(), SiswaPortalContext

### Community 31 - "dapodik-actions.ts"
Cohesion: 0.05
Nodes (69): ENTITY_ORDER, ModalDetailSinkron(), Props, STATUS_META, ENTITAS, namaSemester(), PeriodeInfo, Props (+61 more)

### Community 32 - "kompetensi-client.tsx"
Cohesion: 0.19
Nodes (11): COLUMNS, KompetensiClient(), KompetensiClientProps, ModalHapus(), ModalHapusProps, ModalKompetensi(), ModalKompetensiProps, getKompetensi() (+3 more)

### Community 33 - "pegawai-client.tsx"
Cohesion: 0.21
Nodes (11): ModalHapus(), ModalPegawai(), ModalPegawaiProps, COLUMNS, PegawaiClient(), PegawaiClientProps, getPegawai(), getReferensi() (+3 more)

### Community 34 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

### Community 35 - "rombel/page.tsx"
Cohesion: 0.31
Nodes (7): COLUMNS, RombelClient(), RombelClientProps, getRombel(), getUser(), RombelPage(), updateWaliKelas()

### Community 36 - "rekap-absensi-bk-client.tsx"
Cohesion: 0.29
Nodes (8): ABSEN_COLS, KelasItem, RekapAbsensiBKClient(), RekapItem, requireGuruBK(), getKelasListForBK(), getRekapAbsensiBK(), updatePresensiInline()

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
Cohesion: 0.53
Nodes (4): ProfilForm(), ProfilFormProps, saveFile(), updateProfil()

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

### Community 47 - "tu/piket-harian/page.tsx"
Cohesion: 0.83
Nodes (3): getData(), getUser(), PiketHarianPage()

### Community 48 - "Laporan Hasil Belajar"
Cohesion: 0.33
Nodes (6): Capaian Kompetensi, Ekstrakurikuler, Kokurikuler, Laporan Hasil Belajar, Mata Pelajaran, Laporan Hasil Belajar (pdfmake)

### Community 49 - "guru/anggota-kelas/page.tsx"
Cohesion: 0.40
Nodes (4): AnggotaKelasGuruClient(), AnggotaKelasGuruClientProps, COLUMNS, AnggotaKelasGuruPage()

### Community 50 - "anggota-kelas-actions.ts"
Cohesion: 0.24
Nodes (9): AnggotaKelasClient(), AnggotaKelasClientProps, COLUMNS, ModalTransferAnggotaKelas(), ModalTransferAnggotaKelasProps, bulkAddAnggotaKelas(), bulkRemoveAnggotaKelas(), deleteAnggotaKelas() (+1 more)

### Community 51 - "getSekolahWithFilter"
Cohesion: 0.11
Nodes (25): CatatanWaliPage(), KelasWaliRow, SiswaCatatanRow, getKelasKu(), KelasKuPage(), getData(), KokurikulerPage(), getData() (+17 more)

### Community 52 - "AGENTS.md"
Cohesion: 0.50
Nodes (3): Chrome DevTools MCP, Filter Periode (Tahun/Semester) — TU Pages, Post-Change Routine

### Community 53 - "db-migrate.sh script"
Cohesion: 0.50
Nodes (3): deploy.sh script, load_env(), db-migrate.sh script

### Community 54 - "mapel-kelas-client.tsx"
Cohesion: 0.16
Nodes (17): COLUMNS, MapelKelasClient(), MapelKelasClientProps, ModalHapus(), ModalHapusProps, ModalMapelKelas(), ModalMapelKelasProps, getData() (+9 more)

### Community 55 - "deskripsi-client.tsx"
Cohesion: 0.19
Nodes (11): COLUMNS, DeskripsiClient(), DeskripsiClientProps, ModalDeskripsi(), ModalDeskripsiProps, ModalHapus(), ModalHapusProps, DeskripsiRaporPage() (+3 more)

### Community 56 - "guru/organisasi/page.tsx"
Cohesion: 0.33
Nodes (5): Anggota, Organisasi, OrganisasiGuruClient(), OrganisasiGuruClientProps, OrganisasiGuruPage()

### Community 57 - "E-R App Icon 192x192"
Cohesion: 0.67
Nodes (4): E-R App Icon Apple Touch, E-R App Icon 192x192, E-R App Icon 512x512, E-R App Icon Maskable 512x512

### Community 61 - "tu/organisasi/page.tsx"
Cohesion: 0.60
Nodes (5): getOrganisasi(), getSiswa(), getSiswaOrganisasi(), getUsers(), OrganisasiPage()

### Community 65 - "File Icon SVG"
Cohesion: 1.00
Nodes (3): File Icon SVG, Globe Icon SVG, Window Icon SVG

### Community 66 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 67 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 68 - "toast-provider.tsx"
Cohesion: 0.17
Nodes (10): generateMetadata(), getLogoFilename(), viewport, ServiceWorkerRegister(), ToastContext, ToastContextType, ToastItem, ToastProvider() (+2 more)

### Community 70 - "requireTuAdmin"
Cohesion: 0.15
Nodes (16): xlsx, dynamic, GET(), runtime, GET(), GET(), DAYS, PiketHarianClient() (+8 more)

### Community 74 - "cetak-rapor-guru-client.tsx"
Cohesion: 0.09
Nodes (20): CetakRaporGuruClient(), CHECKBOX_JENIS, JENIS_CONFIG, JenisRapor, KelasItem, Props, Siswa, CetakRaporGuruPage() (+12 more)

### Community 82 - "useToast"
Cohesion: 0.27
Nodes (9): buildMap(), PenilaianClient(), TAB_INFO, COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportPrakerin(), ModalImportProps (+1 more)

### Community 88 - "pelengkap-template.ts"
Cohesion: 0.54
Nodes (7): formatTanggal(), generatePelengkapRaporHTML(), infoRow(), PelengkapSekolahInfo, PelengkapSiswaInfo, value(), escapeHtml()

### Community 92 - "confirmAlert"
Cohesion: 0.40
Nodes (7): PengaturanClient(), Props, toDateInput(), addTahunPelajaran(), deleteTahunPelajaran(), savePengaturan(), confirmAlert()

### Community 94 - "modal-siswa.tsx"
Cohesion: 0.22
Nodes (3): ModalSiswa(), ModalSiswaProps, Section

### Community 95 - "naik-kelas-client.tsx"
Cohesion: 0.54
Nodes (6): NaikKelasClient(), Props, getInfoPromosi(), promoteAllKelas(), promoteKelas(), updateNaikKelas()

### Community 96 - "modal-import-siswa.tsx"
Cohesion: 0.43
Nodes (6): COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportSiswa(), ModalImportSiswaProps, normHeader()

### Community 97 - "rekap-presensi/page.tsx"
Cohesion: 0.40
Nodes (4): COLUMNS, RekapPresensiGuruClient(), RekapPresensiGuruClientProps, RekapPresensiGuruPage()

### Community 98 - "mapel-siswa/page.tsx"
Cohesion: 0.60
Nodes (5): getEnrollments(), getKelasList(), getStudents(), getSubjects(), MapelSiswaPage()

### Community 99 - "naik-kelas/page.tsx"
Cohesion: 0.70
Nodes (4): getData(), getKelas(), getTingkat(), NaikKelasPage()

## Knowledge Gaps
- **385 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `fs`, `env`, `eslintConfig` (+380 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `k()` connect `workbox-4a6e5f9b.js` to `siswa-client.tsx`, `a`, `dapodik-actions.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useToast` to `integrasi-api-client.tsx`, `prakerin-client.tsx`, `mapel-siswa-grid.tsx`, `ekstra-client.tsx`, `kokurikuler-actions.ts`, `siswa-client.tsx`, `p5bk-client.tsx`, `auth-guard.ts`, `organisasi-client.tsx`, `db.ts`, `mapel-client.tsx`, `(dashboard)/profile/_components/profile-form.tsx`, `tp-actions.ts`, `dapodik-actions.ts`, `kompetensi-client.tsx`, `pegawai-client.tsx`, `rombel/page.tsx`, `rekap-absensi-bk-client.tsx`, `profil-actions.ts`, `anggota-kelas-actions.ts`, `mapel-kelas-client.tsx`, `deskripsi-client.tsx`, `toast-provider.tsx`, `requireTuAdmin`, `confirmAlert`, `naik-kelas-client.tsx`, `modal-import-siswa.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `getSekolahWithFilter()` connect `getSekolahWithFilter` to `cetak-rapor/route.ts`, `tu/layout.tsx`, `prakerin-client.tsx`, `ekstra-client.tsx`, `kokurikuler-actions.ts`, `siswa-client.tsx`, `p5bk-client.tsx`, `tujuan-pembelajaran/page.tsx`, `auth-guard.ts`, `daftar-rapor/page.tsx`, `tp-actions.ts`, `rombel/page.tsx`, `rekap-absensi-bk-client.tsx`, `laporan-pendidikan/page.tsx`, `profil-actions.ts`, `tu/page.tsx`, `buku-induk/page.tsx`, `lager-nilai-kelas/page.tsx`, `guru/anggota-kelas/page.tsx`, `anggota-kelas-actions.ts`, `mapel-kelas-client.tsx`, `guru/organisasi/page.tsx`, `tu/organisasi/page.tsx`, `cetak-rapor-guru-client.tsx`, `rekap-presensi/page.tsx`, `mapel-siswa/page.tsx`, `naik-kelas/page.tsx`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `fs` to the rest of the system?**
  _385 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Rapor Semester (Semester Report Card)` be split into smaller, more focused modules?**
  _Cohesion score 0.05725490196078432 - nodes in this community are weakly interconnected._
- **Should `cetak-rapor/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12550607287449392 - nodes in this community are weakly interconnected._
- **Should `tu/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06826241134751773 - nodes in this community are weakly interconnected._