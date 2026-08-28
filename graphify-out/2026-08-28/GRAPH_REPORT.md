# Graph Report - clone-rapor-next  (2026-08-28)

## Corpus Check
- 252 files · ~2,116,614 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1390 nodes · 2978 edges · 104 communities (79 shown, 25 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c438b543`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mm
- Rapor Semester (Semester Report Card)
- integrasi-api-client.tsx
- cetak-rapor/route.ts
- tu/layout.tsx
- prakerin-client.tsx
- requireTuAdmin
- ekstra-client.tsx
- pelengkap-pdfmake.ts
- kokurikuler-actions.ts
- siswa-client.tsx
- compilerOptions
- p5bk-client.tsx
- a
- catatan-rapor/page.tsx
- devDependencies
- requireGuru
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
- confirm-delete-modal.tsx
- siswa-portal-data.ts
- dapodik-actions.ts
- kompetensi-client.tsx
- pegawai-client.tsx
- manifest.json
- useToast
- [id_mapel_kelas]/page.tsx
- Rencana Implementasi Modul Bimbingan Konseling (BK) — v2.1
- laporan-pendidikan/page.tsx
- package.json
- mapel-kelas-client.tsx
- fallback-ce627215c0e4a9af.js
- tu/page.tsx
- dkn-client.tsx
- v
- buku-induk/page.tsx
- lager-nilai-kelas/page.tsx
- siswa/profile/_components/profile-form.tsx
- Laporan Hasil Belajar
- [id]/page.tsx
- modal-import-siswa.tsx
- auth.ts
- AGENTS.md
- db-migrate.sh script
- confirmAlert
- deskripsi-client.tsx
- guru/organisasi/page.tsx
- E-R App Icon 192x192
- [[...path]]/route.ts
- login/page.tsx
- guru/anggota-kelas/page.tsx
- mapel-siswa/page.tsx
- pwa.d.ts
- ecosystem.config.js
- next.config.ts
- File Icon SVG
- opencode.json
- README.md
- toast-provider.tsx
- eslint.config.mjs
- anggota-kelas-actions.ts
- next
- rekap-presensi/page.tsx
- react-dom
- tu/kokurikuler/page.tsx
- graphify.js
- postcss.config.mjs
- Next.js Logo SVG
- getSekolahWithFilter
- Environment Variables
- Database Migrations
- Offline Page
- pelengkap-template.ts
- puppeteer
- { GET, POST }
- tu/prakerin/page.tsx
- pegawai/page.tsx
- rombel/page.tsx
- kelas-ku/page.tsx
- react
- guru/kokurikuler/page.tsx
- next-auth
- naik-kelas/page.tsx
- pdf-lib
- SMK Abdi Negara Tuban School Logo Duplicate 3
- sweetalert2

## God Nodes (most connected - your core abstractions)
1. `getSekolahWithFilter()` - 108 edges
2. `requireTuAdmin()` - 103 edges
3. `useToast()` - 71 edges
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

## Communities (104 total, 25 thin omitted)

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
Nodes (30): POST(), getSidebarData(), TULayout(), DashboardLayout(), DashboardLayoutProps, ALL_MENU_SECTIONS, getVisibleItems(), getVisibleSections() (+22 more)

### Community 5 - "prakerin-client.tsx"
Cohesion: 0.18
Nodes (13): COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportPrakerin(), ModalImportProps, ModalPrakerin(), ModalPrakerinProps, COLUMNS (+5 more)

### Community 6 - "requireTuAdmin"
Cohesion: 0.16
Nodes (21): xlsx, dynamic, GET(), runtime, GET(), GET(), MapelSiswaGrid(), NaikKelasClient() (+13 more)

### Community 7 - "ekstra-client.tsx"
Cohesion: 0.11
Nodes (24): GuruEkstraDetail(), Props, COLUMNS, EkstraClient(), EkstraClientProps, ModalAnggotaEskul(), ModalAnggotaEskulProps, ModalEkstra() (+16 more)

### Community 8 - "pelengkap-pdfmake.ts"
Cohesion: 0.16
Nodes (26): approvalBlock(), borderlessLayout, buildCover(), buildSchoolPage(), buildStudentPage(), buildTransferPage(), createPelengkapRaporDefinition(), displayValue() (+18 more)

### Community 9 - "kokurikuler-actions.ts"
Cohesion: 0.18
Nodes (21): GuruKokurikulerClient(), GuruKokurikulerClientProps, OPSI_NILAI, COLUMNS, KokurikulerClient(), KokurikulerClientProps, OPSI_NILAI, KokurikulerEditClient() (+13 more)

### Community 10 - "siswa-client.tsx"
Cohesion: 0.13
Nodes (16): ModalSiswa(), ModalSiswaProps, Section, COLUMNS, SiswaClient(), SiswaClientProps, getReferensi(), KesiswaanPage() (+8 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 12 - "p5bk-client.tsx"
Cohesion: 0.12
Nodes (24): ModalNilaiP5BK(), ModalNilaiP5BKProps, NilaiData, OPSI_NILAI, ProyekNilai, SiswaNilai, SubElemenItem, ModalP5BK() (+16 more)

### Community 14 - "catatan-rapor/page.tsx"
Cohesion: 0.40
Nodes (4): CetakRaporGuruClient(), CetakRaporGuruPage(), SiswaRaporRow, WaliKelasRow

### Community 15 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+11 more)

### Community 16 - "requireGuru"
Cohesion: 0.06
Nodes (51): ABSEN_OPTIONS, AbsensiEntry, AbsensiPiketClient(), KelasItem, SiswaItem, AbsensiPiketPage(), CHECKBOX_JENIS, JENIS_CONFIG (+43 more)

### Community 17 - "y"
Cohesion: 0.14
Nodes (6): constructor(), deleteCacheAndMetadata(), F, j(), p(), y

### Community 18 - "workbox-4a6e5f9b.js"
Cohesion: 0.21
Nodes (10): n(), b(), get(), i, k(), O(), q(), s (+2 more)

### Community 19 - "tengah-semester-pdfmake.ts"
Cohesion: 0.19
Nodes (19): academicNote(), attendanceTable(), borderedLayout, borderlessLayout, createTengahSemesterRaporDefinition(), displayValue(), divider(), generateTengahSemesterRaporPdf() (+11 more)

### Community 20 - "dependencies"
Cohesion: 0.12
Nodes (17): bcryptjs, @ducanh2912/next-pwa, exceljs, idb, mysql2, dependencies, bcryptjs, @ducanh2912/next-pwa (+9 more)

### Community 21 - "r"
Cohesion: 0.23
Nodes (6): et(), g(), h(), r, st(), U()

### Community 22 - "index.ts"
Cohesion: 0.12
Nodes (16): @auth/core/jwt, JWT, Kelas, KelasWali, KepalaSekolah, Mapel, MapelKelas, next-auth (+8 more)

### Community 23 - "organisasi-client.tsx"
Cohesion: 0.17
Nodes (17): ModalAnggotaOrganisasi(), ModalAnggotaProps, ModalOrganisasi(), ModalOrganisasiProps, COLUMNS, OrganisasiClient(), OrganisasiClientProps, getOrganisasi() (+9 more)

### Community 24 - "db.ts"
Cohesion: 0.06
Nodes (73): SEKOLAH_DIR, Entry, SekolahLogoRow, OPTIONS(), POST(), runtime, GET(), OPTIONS() (+65 more)

### Community 25 - "mapel-client.tsx"
Cohesion: 0.18
Nodes (13): COLUMNS, MapelClient(), MapelClientProps, ModalHapus(), ModalHapusProps, ModalMapel(), ModalMapelProps, getKelompok() (+5 more)

### Community 26 - "(dashboard)/profile/_components/profile-form.tsx"
Cohesion: 0.22
Nodes (10): getUserProfile(), GuruProfilPage(), ProfileForm(), ProfileFormProps, getUserProfile(), ProfilePage(), getUserProfile(), TuProfilUserPage() (+2 more)

### Community 27 - "daftar-rapor/page.tsx"
Cohesion: 0.22
Nodes (11): CHECKBOX_JENIS, DaftarRaporClient(), JENIS_CONFIG, JenisRapor, Props, DaftarRaporPage(), getKelas(), getSiswaKelas() (+3 more)

### Community 28 - "Rapor Semester Identity Max Layout"
Cohesion: 0.24
Nodes (10): Rapor Semester Identity Max Layout, Rapor Semester Identity Shifted Layout, Rapor Semester Page 1 - Subject Grades, Rapor Semester Page 2 - Extracurricular and Attendance, Rapor Semester Page 3 - Signatures and Decision, Rapor Semester Subject Middle Layout, Rapor Tengah Semester Final Layout, Rapor Tengah Semester Long Class Layout (+2 more)

### Community 29 - "confirm-delete-modal.tsx"
Cohesion: 0.12
Nodes (14): ModalHapus(), ModalHapusProps, ModalHapus(), ModalHapusProps, ModalHapus(), ModalHapusProps, ModalHapusOrganisasi(), ModalHapusProps (+6 more)

### Community 30 - "siswa-portal-data.ts"
Cohesion: 0.27
Nodes (8): NilaiSiswaPage(), formatTanggal(), SiswaDashboardPage(), PresensiSiswaPage(), getNilaiSiswa(), getPresensiSiswa(), getSiswaPortalContext(), SiswaPortalContext

### Community 31 - "dapodik-actions.ts"
Cohesion: 0.05
Nodes (71): ENTITY_ORDER, ModalDetailSinkron(), Props, STATUS_META, ENTITAS, namaSemester(), PeriodeInfo, Props (+63 more)

### Community 32 - "kompetensi-client.tsx"
Cohesion: 0.19
Nodes (11): COLUMNS, KompetensiClient(), KompetensiClientProps, ModalHapus(), ModalHapusProps, ModalKompetensi(), ModalKompetensiProps, getKompetensi() (+3 more)

### Community 33 - "pegawai-client.tsx"
Cohesion: 0.23
Nodes (9): ModalHapus(), ModalHapusProps, ModalPegawai(), ModalPegawaiProps, COLUMNS, PegawaiClient(), PegawaiClientProps, deletePegawai() (+1 more)

### Community 34 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

### Community 35 - "useToast"
Cohesion: 0.19
Nodes (11): ModalExportSiswa(), ModalExportSiswaProps, ProfilForm(), ProfilFormProps, COLUMNS, RombelClient(), RombelClientProps, useToast() (+3 more)

### Community 36 - "[id_mapel_kelas]/page.tsx"
Cohesion: 0.36
Nodes (6): buildMap(), PenilaianClient(), TAB_INFO, getPenilaianData(), PageProps, PenilaianPage()

### Community 37 - "Rencana Implementasi Modul Bimbingan Konseling (BK) — v2.1"
Cohesion: 0.05
Nodes (42): 0. Prasyarat — Toggle Guru BK di Pegawai TU, 10. Key Decisions, 11.1 Alur Pencatatan Layanan, 11.2 Siklus Status Kasus & Rekap Supervisi, 11. Flowchart Alur Proses, 12. Catatan Lanjutan (Fase Berikutnya), 1.1 `siswa_bk` — Penugasan Siswa ke Guru BK, 1.2 `layanan_bk` — Sesi Layanan Konseling (Header) (+34 more)

### Community 38 - "laporan-pendidikan/page.tsx"
Cohesion: 0.29
Nodes (8): Kelas, LegerClient(), LegerRow, NilaiKelas, getKelas(), getLeger(), getNilaiKelas(), LegerNilaiPage()

### Community 39 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 40 - "mapel-kelas-client.tsx"
Cohesion: 0.20
Nodes (15): COLUMNS, MapelKelasClient(), MapelKelasClientProps, ModalMapelKelas(), ModalMapelKelasProps, getData(), getKelas(), getMapel() (+7 more)

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

### Community 47 - "siswa/profile/_components/profile-form.tsx"
Cohesion: 0.22
Nodes (6): ProfileForm(), Section, getData(), SiswaProfilePage(), resolveTingkat(), updateSiswaProfile()

### Community 48 - "Laporan Hasil Belajar"
Cohesion: 0.33
Nodes (6): Capaian Kompetensi, Ekstrakurikuler, Kokurikuler, Laporan Hasil Belajar, Mata Pelajaran, Laporan Hasil Belajar (pdfmake)

### Community 49 - "[id]/page.tsx"
Cohesion: 0.43
Nodes (7): getDimensi(), getKelas(), getProyekDetail(), getTujuanList(), getUsers(), KokurikulerEditPage(), PageProps

### Community 50 - "modal-import-siswa.tsx"
Cohesion: 0.43
Nodes (6): COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportSiswa(), ModalImportSiswaProps, normHeader()

### Community 51 - "auth.ts"
Cohesion: 0.12
Nodes (14): CatatanWaliPage(), KelasWaliRow, SiswaCatatanRow, getGuruDashboard(), GuruDashboardPage(), AnggotaKelasPage(), getData(), DaftarKumpulanNilaiPage() (+6 more)

### Community 52 - "AGENTS.md"
Cohesion: 0.50
Nodes (3): Chrome DevTools MCP, Filter Periode (Tahun/Semester) — TU Pages, Post-Change Routine

### Community 53 - "db-migrate.sh script"
Cohesion: 0.50
Nodes (3): deploy.sh script, load_env(), db-migrate.sh script

### Community 54 - "confirmAlert"
Cohesion: 0.16
Nodes (17): PengaturanClient(), Props, toDateInput(), DAYS, PiketHarianClient(), PiketHarianClientProps, getData(), getUser() (+9 more)

### Community 55 - "deskripsi-client.tsx"
Cohesion: 0.19
Nodes (11): COLUMNS, DeskripsiClient(), DeskripsiClientProps, ModalDeskripsi(), ModalDeskripsiProps, ModalHapus(), ModalHapusProps, DeskripsiRaporPage() (+3 more)

### Community 56 - "guru/organisasi/page.tsx"
Cohesion: 0.33
Nodes (5): Anggota, Organisasi, OrganisasiGuruClient(), OrganisasiGuruClientProps, OrganisasiGuruPage()

### Community 57 - "E-R App Icon 192x192"
Cohesion: 0.67
Nodes (4): E-R App Icon Apple Touch, E-R App Icon 192x192, E-R App Icon 512x512, E-R App Icon Maskable 512x512

### Community 60 - "guru/anggota-kelas/page.tsx"
Cohesion: 0.40
Nodes (4): AnggotaKelasGuruClient(), AnggotaKelasGuruClientProps, COLUMNS, AnggotaKelasGuruPage()

### Community 61 - "mapel-siswa/page.tsx"
Cohesion: 0.60
Nodes (5): getEnrollments(), getKelasList(), getStudents(), getSubjects(), MapelSiswaPage()

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
Cohesion: 0.15
Nodes (9): KelasItem, MapelSiswaGridProps, Student, Subject, ToastContext, ToastContextType, ToastItem, Toast() (+1 more)

### Community 70 - "anggota-kelas-actions.ts"
Cohesion: 0.24
Nodes (9): AnggotaKelasClient(), AnggotaKelasClientProps, COLUMNS, ModalTransferAnggotaKelas(), ModalTransferAnggotaKelasProps, bulkAddAnggotaKelas(), bulkRemoveAnggotaKelas(), deleteAnggotaKelas() (+1 more)

### Community 72 - "rekap-presensi/page.tsx"
Cohesion: 0.40
Nodes (4): COLUMNS, RekapPresensiGuruClient(), RekapPresensiGuruClientProps, RekapPresensiGuruPage()

### Community 74 - "tu/kokurikuler/page.tsx"
Cohesion: 0.70
Nodes (4): getData(), getKelas(), getUsers(), KokurikulerPage()

### Community 82 - "getSekolahWithFilter"
Cohesion: 0.16
Nodes (17): formatIndoDate(), GET(), EkstraPage(), getDetail(), getList(), getSiswa(), getSiswaEkstra(), PageProps (+9 more)

### Community 88 - "pelengkap-template.ts"
Cohesion: 0.54
Nodes (7): formatTanggal(), generatePelengkapRaporHTML(), infoRow(), PelengkapSekolahInfo, PelengkapSiswaInfo, value(), escapeHtml()

### Community 92 - "tu/prakerin/page.tsx"
Cohesion: 0.83
Nodes (3): getPrakerin(), getUsers(), PrakerinPage()

### Community 93 - "pegawai/page.tsx"
Cohesion: 0.83
Nodes (3): getPegawai(), getReferensi(), PegawaiPage()

### Community 94 - "rombel/page.tsx"
Cohesion: 0.83
Nodes (3): getRombel(), getUser(), RombelPage()

### Community 99 - "naik-kelas/page.tsx"
Cohesion: 0.70
Nodes (4): getData(), getKelas(), getTingkat(), NaikKelasPage()

## Knowledge Gaps
- **389 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `fs`, `env`, `eslintConfig` (+384 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `k()` connect `workbox-4a6e5f9b.js` to `siswa-client.tsx`, `a`, `dapodik-actions.ts`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `getSekolahWithFilter()` connect `getSekolahWithFilter` to `cetak-rapor/route.ts`, `tu/layout.tsx`, `prakerin-client.tsx`, `ekstra-client.tsx`, `kokurikuler-actions.ts`, `siswa-client.tsx`, `p5bk-client.tsx`, `catatan-rapor/page.tsx`, `requireGuru`, `organisasi-client.tsx`, `daftar-rapor/page.tsx`, `useToast`, `[id_mapel_kelas]/page.tsx`, `laporan-pendidikan/page.tsx`, `mapel-kelas-client.tsx`, `tu/page.tsx`, `buku-induk/page.tsx`, `lager-nilai-kelas/page.tsx`, `auth.ts`, `guru/organisasi/page.tsx`, `guru/anggota-kelas/page.tsx`, `mapel-siswa/page.tsx`, `anggota-kelas-actions.ts`, `rekap-presensi/page.tsx`, `tu/kokurikuler/page.tsx`, `tu/prakerin/page.tsx`, `rombel/page.tsx`, `kelas-ku/page.tsx`, `guru/kokurikuler/page.tsx`, `naik-kelas/page.tsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useToast` to `integrasi-api-client.tsx`, `prakerin-client.tsx`, `requireTuAdmin`, `ekstra-client.tsx`, `kokurikuler-actions.ts`, `siswa-client.tsx`, `p5bk-client.tsx`, `requireGuru`, `organisasi-client.tsx`, `mapel-client.tsx`, `(dashboard)/profile/_components/profile-form.tsx`, `dapodik-actions.ts`, `kompetensi-client.tsx`, `pegawai-client.tsx`, `[id_mapel_kelas]/page.tsx`, `mapel-kelas-client.tsx`, `siswa/profile/_components/profile-form.tsx`, `modal-import-siswa.tsx`, `confirmAlert`, `deskripsi-client.tsx`, `toast-provider.tsx`, `anggota-kelas-actions.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `fs` to the rest of the system?**
  _389 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Rapor Semester (Semester Report Card)` be split into smaller, more focused modules?**
  _Cohesion score 0.05725490196078432 - nodes in this community are weakly interconnected._
- **Should `cetak-rapor/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12550607287449392 - nodes in this community are weakly interconnected._
- **Should `tu/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0707070707070707 - nodes in this community are weakly interconnected._