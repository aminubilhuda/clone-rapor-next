# Graph Report - clone-rapor-next  (2026-08-04)

## Corpus Check
- 206 files · ~1,727,981 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1121 nodes · 2282 edges · 92 communities (69 shown, 23 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `256697dc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mm
- Rapor Semester (Semester Report Card)
- mapel-kelas-client.tsx
- cetak-rapor/route.ts
- tu/layout.tsx
- kompetensi-client.tsx
- mapel-siswa-grid.tsx
- ekstra-client.tsx
- useToast
- requireGuru
- siswa-client.tsx
- compilerOptions
- p5bk-client.tsx
- a
- getSekolahWithFilter
- devDependencies
- requireTuAdmin
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
- modal-import-siswa.tsx
- siswa/page.tsx
- deskripsi-client.tsx
- tu/p5bk/page.tsx
- piket-harian-client.tsx
- manifest.json
- app/layout.tsx
- prakerin-client.tsx
- mapel-siswa/page.tsx
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
- db.ts
- proxy.ts
- AGENTS.md
- db-migrate.sh script
- naik-kelas/page.tsx
- catatan-rapor/page.tsx
- tujuan-pembelajaran/page.tsx
- E-R App Icon 192x192
- [[...path]]/route.ts
- login/page.tsx
- tu/prakerin/page.tsx
- rombel/page.tsx
- pwa.d.ts
- ecosystem.config.js
- next.config.ts
- File Icon SVG
- opencode.json
- README.md
- [id_mapel_kelas]/page.tsx
- eslint.config.mjs
- idb
- next
- react
- react-dom
- react-select
- graphify.js
- postcss.config.mjs
- Next.js Logo SVG
- guru/prakerin/page.tsx
- Environment Variables
- Database Migrations
- Offline Page
- WhatsApp Logo
- puppeteer
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `getSekolahWithFilter()` - 99 edges
2. `requireTuAdmin()` - 81 edges
3. `useToast()` - 57 edges
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
- `GET()` --references--> `xlsx`  [EXTRACTED]
  src/app/api/tu/kesiswaan/template/route.ts → package.json
- `GET()` --references--> `xlsx`  [EXTRACTED]
  src/app/api/tu/prakerin/template/route.ts → package.json
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

## Communities (92 total, 23 thin omitted)

### Community 0 - "mm"
Cohesion: 0.09
Nodes (52): mm(), ROBOTO_DIRECTORY, approvalBlock(), borderlessLayout, buildCover(), buildSchoolPage(), buildStudentPage(), buildTransferPage() (+44 more)

### Community 1 - "Rapor Semester (Semester Report Card)"
Cohesion: 0.06
Nodes (51): Absensi (Attendance) Summary Table, Capaian Kompetensi Assessment Table, Catatan Wali Kelas (Homeroom Teacher Notes), Daftar Rapor Admin UI System, Dashboard Siswa Layout Pattern, Ekstrakurikuler Assessment Section, Kelompok Mata Pelajaran Kejuruan (Vocational Subject Group), Kelompok Mata Pelajaran Umum (General Subject Group) (+43 more)

### Community 2 - "mapel-kelas-client.tsx"
Cohesion: 0.10
Nodes (26): ProfileForm(), Section, COLUMNS, MapelKelasClient(), MapelKelasClientProps, ModalMapelKelas(), ModalMapelKelasProps, getData() (+18 more)

### Community 3 - "cetak-rapor/route.ts"
Cohesion: 0.07
Nodes (60): buildFooterTemplate(), POST(), tglIndo(), VALID_JENIS, wrapHtmlForPrint(), formatTanggal(), generatePelengkapRaporHTML(), infoRow() (+52 more)

### Community 4 - "tu/layout.tsx"
Cohesion: 0.08
Nodes (25): POST(), getSidebarData(), TULayout(), DashboardLayout(), DashboardLayoutProps, ALL_MENU_SECTIONS, getVisibleItems(), getVisibleSections() (+17 more)

### Community 5 - "kompetensi-client.tsx"
Cohesion: 0.05
Nodes (36): ModalHapus(), ModalHapusProps, ModalHapus(), ModalHapusProps, ModalHapus(), ModalHapusProps, COLUMNS, KompetensiClient() (+28 more)

### Community 6 - "mapel-siswa-grid.tsx"
Cohesion: 0.17
Nodes (16): KelasItem, MapelSiswaGrid(), MapelSiswaGridProps, Student, Subject, NaikKelasClient(), Props, deleteMapelSiswa() (+8 more)

### Community 7 - "ekstra-client.tsx"
Cohesion: 0.11
Nodes (24): GuruEkstraDetail(), Props, COLUMNS, EkstraClient(), EkstraClientProps, ModalAnggotaEskul(), ModalAnggotaEskulProps, ModalEkstra() (+16 more)

### Community 8 - "useToast"
Cohesion: 0.13
Nodes (17): buildMap(), PenilaianClient(), TAB_INFO, AnggotaKelasClient(), AnggotaKelasClientProps, COLUMNS, COLUMNS, RombelClient() (+9 more)

### Community 9 - "requireGuru"
Cohesion: 0.15
Nodes (25): ABSEN_OPTIONS, AbsensiEntry, AbsensiPiketClient(), KelasItem, SiswaItem, AbsensiPiketPage(), Option, Props (+17 more)

### Community 10 - "siswa-client.tsx"
Cohesion: 0.13
Nodes (16): ModalSiswa(), ModalSiswaProps, Section, COLUMNS, SiswaClient(), SiswaClientProps, getReferensi(), KesiswaanPage() (+8 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 12 - "p5bk-client.tsx"
Cohesion: 0.15
Nodes (18): ModalNilaiP5BK(), ModalNilaiP5BKProps, NilaiData, OPSI_NILAI, ProyekNilai, SiswaNilai, SubElemenItem, ModalP5BK() (+10 more)

### Community 14 - "getSekolahWithFilter"
Cohesion: 0.13
Nodes (19): CatatanWaliPage(), KelasWaliRow, SiswaCatatanRow, EkstraPage(), getDetail(), getList(), getSiswa(), getSiswaEkstra() (+11 more)

### Community 15 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+11 more)

### Community 16 - "requireTuAdmin"
Cohesion: 0.16
Nodes (15): dynamic, GET(), runtime, GET(), GET(), ModalTransferAnggotaKelas(), ModalTransferAnggotaKelasProps, PegawaiClient() (+7 more)

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
Nodes (17): bcryptjs, @ducanh2912/next-pwa, mysql2, next-auth, dependencies, bcryptjs, @ducanh2912/next-pwa, mysql2 (+9 more)

### Community 21 - "r"
Cohesion: 0.23
Nodes (6): et(), g(), h(), r, st(), U()

### Community 22 - "index.ts"
Cohesion: 0.12
Nodes (16): @auth/core/jwt, JWT, Kelas, KelasWali, KepalaSekolah, Mapel, MapelKelas, next-auth (+8 more)

### Community 23 - "organisasi-client.tsx"
Cohesion: 0.17
Nodes (17): ModalAnggotaOrganisasi(), ModalAnggotaProps, ModalOrganisasi(), ModalOrganisasiProps, COLUMNS, OrganisasiClient(), OrganisasiClientProps, getOrganisasi() (+9 more)

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
Cohesion: 0.16
Nodes (14): Rapor Semester Identity Max Layout, Rapor Semester Identity Shifted Layout, Rapor Semester Page 1 - Subject Grades, Rapor Semester Page 2 - Extracurricular and Attendance, Rapor Semester Page 3 - Signatures and Decision, Rapor Semester Subject Middle Layout, Rapor Tengah Semester Final Layout, Rapor Tengah Semester Long Class Layout (+6 more)

### Community 29 - "modal-import-siswa.tsx"
Cohesion: 0.32
Nodes (7): xlsx, COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportSiswa(), ModalImportSiswaProps, xlsx

### Community 30 - "siswa/page.tsx"
Cohesion: 0.25
Nodes (7): NilaiSiswaPage(), formatTanggal(), SiswaDashboardPage(), PresensiSiswaPage(), getNilaiSiswa(), getPresensiSiswa(), getSiswaPortalContext()

### Community 31 - "deskripsi-client.tsx"
Cohesion: 0.24
Nodes (9): COLUMNS, DeskripsiClient(), DeskripsiClientProps, ModalDeskripsi(), ModalDeskripsiProps, DeskripsiRaporPage(), getDeskripsi(), deleteDeskripsi() (+1 more)

### Community 32 - "tu/p5bk/page.tsx"
Cohesion: 0.52
Nodes (6): getData(), getDimensiTree(), getKelas(), getTema(), getUser(), P5BKPage()

### Community 33 - "piket-harian-client.tsx"
Cohesion: 0.24
Nodes (10): DAYS, PiketHarianClient(), PiketHarianClientProps, getData(), getUser(), PiketHarianPage(), addPiketHarian(), deletePiketHarian() (+2 more)

### Community 34 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

### Community 35 - "app/layout.tsx"
Cohesion: 0.38
Nodes (4): generateMetadata(), getLogoFilename(), viewport, ServiceWorkerRegister()

### Community 36 - "prakerin-client.tsx"
Cohesion: 0.18
Nodes (13): COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportPrakerin(), ModalImportProps, ModalPrakerin(), ModalPrakerinProps, COLUMNS (+5 more)

### Community 37 - "mapel-siswa/page.tsx"
Cohesion: 0.60
Nodes (5): getEnrollments(), getKelasList(), getStudents(), getSubjects(), MapelSiswaPage()

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

### Community 50 - "db.ts"
Cohesion: 0.14
Nodes (10): getKelasKu(), KelasKuPage(), getData(), PiketHarianPage(), COLUMNS, RekapPresensiGuruClient(), RekapPresensiGuruClientProps, RekapPresensiGuruPage() (+2 more)

### Community 51 - "proxy.ts"
Cohesion: 0.47
Nodes (5): checkRateLimit(), config, getRateLimitKey(), loginAttempts, proxy()

### Community 52 - "AGENTS.md"
Cohesion: 0.50
Nodes (3): Chrome DevTools MCP, Filter Periode (Tahun/Semester) — TU Pages, Post-Change Routine

### Community 53 - "db-migrate.sh script"
Cohesion: 0.50
Nodes (3): deploy.sh script, load_env(), db-migrate.sh script

### Community 54 - "naik-kelas/page.tsx"
Cohesion: 0.70
Nodes (4): getData(), getKelas(), getTingkat(), NaikKelasPage()

### Community 55 - "catatan-rapor/page.tsx"
Cohesion: 0.40
Nodes (4): CetakRaporGuruClient(), CetakRaporGuruPage(), SiswaRaporRow, WaliKelasRow

### Community 56 - "tujuan-pembelajaran/page.tsx"
Cohesion: 0.60
Nodes (4): getDetail(), getOptions(), PageProps, TujuanPembelajaranPage()

### Community 57 - "E-R App Icon 192x192"
Cohesion: 0.67
Nodes (4): E-R App Icon Apple Touch, E-R App Icon 192x192, E-R App Icon 512x512, E-R App Icon Maskable 512x512

### Community 60 - "tu/prakerin/page.tsx"
Cohesion: 0.83
Nodes (3): getPrakerin(), getUsers(), PrakerinPage()

### Community 61 - "rombel/page.tsx"
Cohesion: 0.83
Nodes (3): getRombel(), getUser(), RombelPage()

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

## Knowledge Gaps
- **305 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `fs`, `env`, `eslintConfig` (+300 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SiswaClient()` connect `siswa-client.tsx` to `useToast`, `workbox-4a6e5f9b.js`, `mapel-kelas-client.tsx`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `k()` connect `workbox-4a6e5f9b.js` to `siswa-client.tsx`, `a`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `getSekolahWithFilter()` connect `getSekolahWithFilter` to `mapel-kelas-client.tsx`, `cetak-rapor/route.ts`, `tu/layout.tsx`, `ekstra-client.tsx`, `requireGuru`, `siswa-client.tsx`, `p5bk-client.tsx`, `requireTuAdmin`, `cetak-rapor-guru-client.tsx`, `organisasi-client.tsx`, `auth.ts`, `daftar-rapor/page.tsx`, `tu/p5bk/page.tsx`, `prakerin-client.tsx`, `mapel-siswa/page.tsx`, `laporan-pendidikan/page.tsx`, `profil-actions.ts`, `tu/page.tsx`, `buku-induk/page.tsx`, `lager-nilai-kelas/page.tsx`, `guru/organisasi/page.tsx`, `guru/anggota-kelas/page.tsx`, `db.ts`, `naik-kelas/page.tsx`, `catatan-rapor/page.tsx`, `tujuan-pembelajaran/page.tsx`, `tu/prakerin/page.tsx`, `rombel/page.tsx`, `[id_mapel_kelas]/page.tsx`, `guru/prakerin/page.tsx`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `fs` to the rest of the system?**
  _305 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `mm` be split into smaller, more focused modules?**
  _Cohesion score 0.09292929292929293 - nodes in this community are weakly interconnected._
- **Should `Rapor Semester (Semester Report Card)` be split into smaller, more focused modules?**
  _Cohesion score 0.05725490196078432 - nodes in this community are weakly interconnected._
- **Should `mapel-kelas-client.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0953058321479374 - nodes in this community are weakly interconnected._