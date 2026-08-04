# Graph Report - .  (2026-08-03)

## Corpus Check
- Large corpus: 286 files · ~1,729,131 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1134 nodes · 2306 edges · 91 communities (65 shown, 26 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- PDF Templates & Report Generation
- Report Content Concepts
- Student Profile Form
- Report Print API
- Dashboard Layouts
- TU Delete Confirmation Modals
- Student Subject Mapping
- Extracurricular Management
- Teacher Grading System
- Teacher Attendance Piket
- Student Import Modal
- TypeScript Type Definitions
- P5BK Assessment Modal
- Workbox Cache Management
- Teacher Wali Pages
- ESLint & Dev Dependencies
- Excel Import API Routes
- Workbox Storage Classes
- Workbox Core Service Worker
- Guru Report Notes
- Core Backend Dependencies
- Workbox Runtime Caching
- App TypeScript Types
- Organization Management
- Auth & Push Notifications
- File API Routes
- Profile Pages
- Report List Admin
- Report PDF Screenshots
- Staff Management
- Student Dashboard Pages
- Report Description CRUD
- Competency Standards
- Daily Duty Schedule
- PWA Manifest Config
- Class Members & Prakerin
- Prakerin Internship Mgmt
- Study Groups & Class Advisors
- Grade Ledger Report
- Package Configuration
- TU Profile Page
- Fallback Service Worker
- TU Dashboard Stats
- Grade Collection Report
- Workbox Handler
- Student Record Book
- Teacher Grade Ledger
- Teacher Organization
- Report Content Nodes
- Guru Class Members
- Attendance Recap
- Organization Page
- Agent Workflow Config
- Deploy & Migration Scripts
- Push Notification API
- Guru Report Notes Page
- Learning Objectives
- PWA Icons
- Upload API
- Login & PWA Install
- Prakerin Page
- Study Group Page
- PWA Type Definitions
- PM2 Ecosystem Config
- Next.js Config
- SVG Assets
- Guru P5BK Page
- Guru Dashboard Page
- Next PWA Dependency
- ESLint Config
- IndexedDB Dependency
- Next.js Dependency
- React Dependency
- React DOM Dependency
- React Select Dependency
- Web Push Dependency
- PostCSS Config
- Next & Vercel SVGs
- Service Worker Entry
- Environment Variables
- Database Migrations
- Offline Fallback Page
- School Logo Upload
- NextAuth Route

## God Nodes (most connected - your core abstractions)
1. `getSekolahWithFilter()` - 99 edges
2. `requireTuAdmin()` - 81 edges
3. `useToast()` - 59 edges
4. `mm()` - 37 edges
5. `requireGuru()` - 24 edges
6. `a` - 18 edges
7. `r` - 16 edges
8. `POST()` - 16 edges
9. `compilerOptions` - 16 edges
10. `SEKOLAH_ID` - 15 edges

## Surprising Connections (you probably didn't know these)
- `SiswaClient()` --indirect_call--> `k()`  [INFERRED]
  src/app/(dashboard)/tu/kesiswaan/_components/siswa-client.tsx → public/workbox-4a6e5f9b.js
- `Rapor Semester Identity Max Layout` --conceptually_related_to--> `Provinsi Jawa Timur Coat of Arms`  [INFERRED]
  output/pdf/rapor-semester-identity-max-page-1.png → public/uploads/sekolah/logo-provinsi-jawa-timur.png
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

## Communities (91 total, 26 thin omitted)

### Community 0 - "PDF Templates & Report Generation"
Cohesion: 0.07
Nodes (71): mm(), ROBOTO_DIRECTORY, approvalBlock(), borderlessLayout, buildCover(), buildSchoolPage(), buildStudentPage(), buildTransferPage() (+63 more)

### Community 1 - "Report Content Concepts"
Cohesion: 0.06
Nodes (51): Absensi (Attendance) Summary Table, Capaian Kompetensi Assessment Table, Catatan Wali Kelas (Homeroom Teacher Notes), Daftar Rapor Admin UI System, Dashboard Siswa Layout Pattern, Ekstrakurikuler Assessment Section, Kelompok Mata Pelajaran Kejuruan (Vocational Subject Group), Kelompok Mata Pelajaran Umum (General Subject Group) (+43 more)

### Community 2 - "Student Profile Form"
Cohesion: 0.07
Nodes (32): ProfileForm(), Section, getData(), SiswaProfilePage(), COLUMNS, MapelKelasClient(), MapelKelasClientProps, ModalHapus() (+24 more)

### Community 3 - "Report Print API"
Cohesion: 0.11
Nodes (41): buildFooterTemplate(), POST(), tglIndo(), VALID_JENIS, wrapHtmlForPrint(), formatTanggal(), generatePelengkapRaporHTML(), infoRow() (+33 more)

### Community 4 - "Dashboard Layouts"
Cohesion: 0.07
Nodes (30): POST(), getSidebarData(), TULayout(), DashboardLayout(), DashboardLayoutProps, ALL_MENU_SECTIONS, getVisibleItems(), getVisibleSections() (+22 more)

### Community 5 - "TU Delete Confirmation Modals"
Cohesion: 0.06
Nodes (31): ModalHapus(), ModalHapusProps, ModalHapus(), ModalHapusProps, ModalHapus(), ModalHapusProps, ModalHapus(), ModalHapusProps (+23 more)

### Community 6 - "Student Subject Mapping"
Cohesion: 0.11
Nodes (25): KelasItem, MapelSiswaGrid(), MapelSiswaGridProps, Student, Subject, getEnrollments(), getKelasList(), getStudents() (+17 more)

### Community 7 - "Extracurricular Management"
Cohesion: 0.11
Nodes (24): GuruEkstraDetail(), Props, COLUMNS, EkstraClient(), EkstraClientProps, ModalAnggotaEskul(), ModalAnggotaEskulProps, ModalEkstra() (+16 more)

### Community 8 - "Teacher Grading System"
Cohesion: 0.08
Nodes (20): buildMap(), PenilaianClient(), TAB_INFO, getPenilaianData(), PageProps, PenilaianPage(), BroadcastForm(), TARGETS (+12 more)

### Community 9 - "Teacher Attendance Piket"
Cohesion: 0.15
Nodes (25): ABSEN_OPTIONS, AbsensiEntry, AbsensiPiketClient(), KelasItem, SiswaItem, AbsensiPiketPage(), Option, Props (+17 more)

### Community 10 - "Student Import Modal"
Cohesion: 0.11
Nodes (21): COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportSiswa(), ModalImportSiswaProps, ModalSiswa(), ModalSiswaProps, Section (+13 more)

### Community 11 - "TypeScript Type Definitions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 12 - "P5BK Assessment Modal"
Cohesion: 0.12
Nodes (24): ModalNilaiP5BK(), ModalNilaiP5BKProps, NilaiData, OPSI_NILAI, ProyekNilai, SiswaNilai, SubElemenItem, ModalP5BK() (+16 more)

### Community 14 - "Teacher Wali Pages"
Cohesion: 0.15
Nodes (17): CatatanWaliPage(), KelasWaliRow, SiswaCatatanRow, EkstraPage(), getDetail(), getList(), getSiswa(), getSiswaEkstra() (+9 more)

### Community 15 - "ESLint & Dev Dependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+13 more)

### Community 16 - "Excel Import API Routes"
Cohesion: 0.17
Nodes (14): xlsx, dynamic, GET(), runtime, GET(), GET(), ModalTransferAnggotaKelas(), ModalTransferAnggotaKelasProps (+6 more)

### Community 17 - "Workbox Storage Classes"
Cohesion: 0.14
Nodes (5): F, j(), p(), tt, y

### Community 18 - "Workbox Core Service Worker"
Cohesion: 0.18
Nodes (12): n(), b(), constructor(), deleteCacheAndMetadata(), get(), h(), i, k() (+4 more)

### Community 19 - "Guru Report Notes"
Cohesion: 0.12
Nodes (17): CHECKBOX_JENIS, JENIS_CONFIG, JenisRapor, KelasItem, Props, Siswa, CatatanWaliClient(), FilterStatus (+9 more)

### Community 20 - "Core Backend Dependencies"
Cohesion: 0.12
Nodes (17): bcryptjs, mysql2, next-auth, dependencies, bcryptjs, mysql2, next-auth, pdf-lib (+9 more)

### Community 21 - "Workbox Runtime Caching"
Cohesion: 0.29
Nodes (5): et(), g(), r, st(), U()

### Community 22 - "App TypeScript Types"
Cohesion: 0.12
Nodes (16): @auth/core/jwt, JWT, Kelas, KelasWali, KepalaSekolah, Mapel, MapelKelas, next-auth (+8 more)

### Community 23 - "Organization Management"
Cohesion: 0.23
Nodes (12): ModalAnggotaOrganisasi(), ModalAnggotaProps, ModalOrganisasi(), ModalOrganisasiProps, COLUMNS, OrganisasiClient(), OrganisasiClientProps, addSiswaOrganisasi() (+4 more)

### Community 24 - "Auth & Push Notifications"
Cohesion: 0.15
Nodes (7): getData(), KokurikulerPage(), getData(), PiketHarianPage(), { handlers, signIn, signOut, auth }, StaffAuthRow, StudentAuthRow

### Community 25 - "File API Routes"
Cohesion: 0.19
Nodes (5): SEKOLAH_DIR, Entry, SekolahLogoRow, Jabatan, SEKOLAH_ID

### Community 26 - "Profile Pages"
Cohesion: 0.22
Nodes (10): getUserProfile(), GuruProfilPage(), ProfileForm(), ProfileFormProps, getUserProfile(), ProfilePage(), getUserProfile(), TuProfilUserPage() (+2 more)

### Community 27 - "Report List Admin"
Cohesion: 0.22
Nodes (11): CHECKBOX_JENIS, DaftarRaporClient(), JENIS_CONFIG, JenisRapor, Props, DaftarRaporPage(), getKelas(), getSiswaKelas() (+3 more)

### Community 28 - "Report PDF Screenshots"
Cohesion: 0.16
Nodes (14): Rapor Semester Identity Max Layout, Rapor Semester Identity Shifted Layout, Rapor Semester Page 1 - Subject Grades, Rapor Semester Page 2 - Extracurricular and Attendance, Rapor Semester Page 3 - Signatures and Decision, Rapor Semester Subject Middle Layout, Rapor Tengah Semester Final Layout, Rapor Tengah Semester Long Class Layout (+6 more)

### Community 29 - "Staff Management"
Cohesion: 0.23
Nodes (10): ModalPegawai(), ModalPegawaiProps, COLUMNS, PegawaiClient(), PegawaiClientProps, getPegawai(), getReferensi(), PegawaiPage() (+2 more)

### Community 30 - "Student Dashboard Pages"
Cohesion: 0.27
Nodes (8): NilaiSiswaPage(), formatTanggal(), SiswaDashboardPage(), PresensiSiswaPage(), getNilaiSiswa(), getPresensiSiswa(), getSiswaPortalContext(), SiswaPortalContext

### Community 31 - "Report Description CRUD"
Cohesion: 0.24
Nodes (9): COLUMNS, DeskripsiClient(), DeskripsiClientProps, ModalDeskripsi(), ModalDeskripsiProps, DeskripsiRaporPage(), getDeskripsi(), deleteDeskripsi() (+1 more)

### Community 32 - "Competency Standards"
Cohesion: 0.24
Nodes (9): COLUMNS, KompetensiClient(), KompetensiClientProps, ModalKompetensi(), ModalKompetensiProps, getKompetensi(), KompetensiPage(), deleteKompetensi() (+1 more)

### Community 33 - "Daily Duty Schedule"
Cohesion: 0.24
Nodes (10): DAYS, PiketHarianClient(), PiketHarianClientProps, getData(), getUser(), PiketHarianPage(), addPiketHarian(), deletePiketHarian() (+2 more)

### Community 34 - "PWA Manifest Config"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

### Community 35 - "Class Members & Prakerin"
Cohesion: 0.25
Nodes (9): AnggotaKelasClient(), AnggotaKelasClientProps, COLUMNS, COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportPrakerin(), ModalImportProps (+1 more)

### Community 36 - "Prakerin Internship Mgmt"
Cohesion: 0.29
Nodes (8): ModalPrakerin(), ModalPrakerinProps, COLUMNS, PrakerinClient(), PrakerinClientProps, deletePrakerin(), importPrakerin(), updatePrakerin()

### Community 37 - "Study Groups & Class Advisors"
Cohesion: 0.22
Nodes (6): COLUMNS, RombelClient(), RombelClientProps, SaveCatatanWaliInput, updateWaliKelas(), globalForDb

### Community 38 - "Grade Ledger Report"
Cohesion: 0.29
Nodes (8): Kelas, LegerClient(), LegerRow, NilaiKelas, getKelas(), getLeger(), getNilaiKelas(), LegerNilaiPage()

### Community 39 - "Package Configuration"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 40 - "TU Profile Page"
Cohesion: 0.36
Nodes (6): ProfilForm(), ProfilFormProps, getProfil(), ProfilPage(), saveFile(), updateProfil()

### Community 41 - "Fallback Service Worker"
Cohesion: 0.36
Nodes (4): f(), h(), r(), u()

### Community 42 - "TU Dashboard Stats"
Cohesion: 0.32
Nodes (6): CardStat(), CardStatProps, colorClasses, icons, getStats(), TUDashboardPage()

### Community 43 - "Grade Collection Report"
Cohesion: 0.29
Nodes (7): computeData(), DKNClient(), GradeItem, MapelItem, Props, SemesterSeq, SiswaItem

### Community 45 - "Student Record Book"
Cohesion: 0.33
Nodes (5): BukuIndukGuruClient(), BukuIndukGuruClientProps, SECTIONS, SiswaBukuInduk, BukuIndukGuruPage()

### Community 46 - "Teacher Grade Ledger"
Cohesion: 0.33
Nodes (5): LegerGuruClient(), LegerRow, NilaiKelas, RekapPresensi, LegerNilaiGuruPage()

### Community 47 - "Teacher Organization"
Cohesion: 0.33
Nodes (5): Anggota, Organisasi, OrganisasiGuruClient(), OrganisasiGuruClientProps, OrganisasiGuruPage()

### Community 48 - "Report Content Nodes"
Cohesion: 0.33
Nodes (6): Capaian Kompetensi, Ekstrakurikuler, Kokurikuler, Laporan Hasil Belajar, Mata Pelajaran, Laporan Hasil Belajar (pdfmake)

### Community 49 - "Guru Class Members"
Cohesion: 0.40
Nodes (4): AnggotaKelasGuruClient(), AnggotaKelasGuruClientProps, COLUMNS, AnggotaKelasGuruPage()

### Community 50 - "Attendance Recap"
Cohesion: 0.40
Nodes (4): COLUMNS, RekapPresensiGuruClient(), RekapPresensiGuruClientProps, RekapPresensiGuruPage()

### Community 51 - "Organization Page"
Cohesion: 0.60
Nodes (5): getOrganisasi(), getSiswa(), getSiswaOrganisasi(), getUsers(), OrganisasiPage()

### Community 52 - "Agent Workflow Config"
Cohesion: 0.50
Nodes (3): Chrome DevTools MCP, Filter Periode (Tahun/Semester) — TU Pages, Post-Change Routine

### Community 53 - "Deploy & Migration Scripts"
Cohesion: 0.50
Nodes (3): deploy.sh script, load_env(), db-migrate.sh script

### Community 55 - "Guru Report Notes Page"
Cohesion: 0.40
Nodes (4): CetakRaporGuruClient(), CetakRaporGuruPage(), SiswaRaporRow, WaliKelasRow

### Community 56 - "Learning Objectives"
Cohesion: 0.60
Nodes (4): getDetail(), getOptions(), PageProps, TujuanPembelajaranPage()

### Community 57 - "PWA Icons"
Cohesion: 0.67
Nodes (4): E-R App Icon Apple Touch, E-R App Icon 192x192, E-R App Icon 512x512, E-R App Icon Maskable 512x512

### Community 60 - "Prakerin Page"
Cohesion: 0.83
Nodes (3): getPrakerin(), getUsers(), PrakerinPage()

### Community 61 - "Study Group Page"
Cohesion: 0.83
Nodes (3): getRombel(), getUser(), RombelPage()

### Community 65 - "SVG Assets"
Cohesion: 1.00
Nodes (3): File Icon SVG, Globe Icon SVG, Window Icon SVG

## Knowledge Gaps
- **306 isolated node(s):** `fs`, `env`, `eslintConfig`, `withPWA`, `nextConfig` (+301 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SiswaClient()` connect `Student Import Modal` to `Student Profile Form`, `Workbox Core Service Worker`, `Class Members & Prakerin`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `k()` connect `Workbox Core Service Worker` to `Student Import Modal`, `Workbox Cache Management`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `getSekolahWithFilter()` connect `Teacher Wali Pages` to `Student Profile Form`, `Report Print API`, `Dashboard Layouts`, `Student Subject Mapping`, `Extracurricular Management`, `Teacher Grading System`, `Teacher Attendance Piket`, `Student Import Modal`, `P5BK Assessment Modal`, `Excel Import API Routes`, `Guru Report Notes`, `Auth & Push Notifications`, `File API Routes`, `Report List Admin`, `Prakerin Internship Mgmt`, `Study Groups & Class Advisors`, `Grade Ledger Report`, `TU Profile Page`, `TU Dashboard Stats`, `Student Record Book`, `Teacher Grade Ledger`, `Teacher Organization`, `Guru Class Members`, `Attendance Recap`, `Organization Page`, `Guru Report Notes Page`, `Learning Objectives`, `Prakerin Page`, `Study Group Page`, `Guru P5BK Page`, `Guru Dashboard Page`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **What connects `fs`, `env`, `eslintConfig` to the rest of the system?**
  _306 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PDF Templates & Report Generation` be split into smaller, more focused modules?**
  _Cohesion score 0.06630630630630631 - nodes in this community are weakly interconnected._
- **Should `Report Content Concepts` be split into smaller, more focused modules?**
  _Cohesion score 0.05725490196078432 - nodes in this community are weakly interconnected._
- **Should `Student Profile Form` be split into smaller, more focused modules?**
  _Cohesion score 0.07446808510638298 - nodes in this community are weakly interconnected._