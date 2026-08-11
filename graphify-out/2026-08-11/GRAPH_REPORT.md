# Graph Report - clone-rapor-next  (2026-08-11)

## Corpus Check
- 222 files · ~2,085,537 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1254 nodes · 2543 edges · 104 communities (81 shown, 23 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ac9f2e29`
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
- pelengkap-pdfmake.ts
- siswa/profile/_components/profile-form.tsx
- siswa-client.tsx
- compilerOptions
- p5bk-client.tsx
- a
- db.ts
- devDependencies
- kompetensi-client.tsx
- y
- workbox-4a6e5f9b.js
- tengah-semester-pdfmake.ts
- dependencies
- r
- index.ts
- organisasi-client.tsx
- modal-siswa.tsx
- sekolah-helper.ts
- (dashboard)/profile/_components/profile-form.tsx
- daftar-rapor/page.tsx
- Rapor Semester Identity Max Layout
- mapel-client.tsx
- siswa-portal-data.ts
- dapodik-actions.ts
- auth.ts
- pegawai-client.tsx
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
- [id_mapel_kelas]/page.tsx
- auth-guard.ts
- AGENTS.md
- db-migrate.sh script
- requireGuru
- cetak-rapor-guru-client.tsx
- getSekolahWithFilter
- E-R App Icon 192x192
- [[...path]]/route.ts
- login/page.tsx
- piket-harian-client.tsx
- useToast
- pwa.d.ts
- ecosystem.config.js
- next.config.ts
- File Icon SVG
- opencode.json
- README.md
- pengaturan-client.tsx
- eslint.config.mjs
- requireTuAdmin
- next
- react
- react-dom
- catatan-wali/page.tsx
- graphify.js
- postcss.config.mjs
- Next.js Logo SVG
- sidebar-guru.tsx
- Environment Variables
- Database Migrations
- Offline Page
- pelengkap-template.ts
- puppeteer
- { GET, POST }
- react-select
- tu/p5bk/page.tsx
- modal-import-siswa.tsx
- mapel-kelas/page.tsx
- idb
- rekap-presensi/page.tsx
- mapel-siswa/page.tsx
- naik-kelas/page.tsx
- rombel/page.tsx
- SMK Abdi Negara Tuban School Logo Duplicate 3
- tu/anggota-kelas/page.tsx

## God Nodes (most connected - your core abstractions)
1. `getSekolahWithFilter()` - 102 edges
2. `requireTuAdmin()` - 88 edges
3. `useToast()` - 61 edges
4. `mm()` - 37 edges
5. `syncDapodik()` - 27 edges
6. `requireGuru()` - 24 edges
7. `a` - 18 edges
8. `r` - 16 edges
9. `POST()` - 16 edges
10. `SEKOLAH_ID` - 16 edges

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

## Communities (104 total, 23 thin omitted)

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
Cohesion: 0.08
Nodes (26): POST(), getSidebarData(), TULayout(), DapodikSyncBanner(), DashboardLayout(), DashboardLayoutProps, menus, SidebarSiswa() (+18 more)

### Community 5 - "prakerin-client.tsx"
Cohesion: 0.15
Nodes (16): COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportPrakerin(), ModalImportProps, ModalPrakerin(), ModalPrakerinProps, COLUMNS (+8 more)

### Community 6 - "mapel-siswa-grid.tsx"
Cohesion: 0.17
Nodes (16): KelasItem, MapelSiswaGrid(), MapelSiswaGridProps, Student, Subject, NaikKelasClient(), Props, deleteMapelSiswa() (+8 more)

### Community 7 - "ekstra-client.tsx"
Cohesion: 0.12
Nodes (23): Props, COLUMNS, EkstraClient(), EkstraClientProps, ModalAnggotaEskul(), ModalAnggotaEskulProps, ModalEkstra(), ModalEkstraProps (+15 more)

### Community 8 - "pelengkap-pdfmake.ts"
Cohesion: 0.16
Nodes (26): approvalBlock(), borderlessLayout, buildCover(), buildSchoolPage(), buildStudentPage(), buildTransferPage(), createPelengkapRaporDefinition(), displayValue() (+18 more)

### Community 9 - "siswa/profile/_components/profile-form.tsx"
Cohesion: 0.22
Nodes (6): ProfileForm(), Section, getData(), SiswaProfilePage(), resolveTingkat(), updateSiswaProfile()

### Community 10 - "siswa-client.tsx"
Cohesion: 0.22
Nodes (14): COLUMNS, SiswaClient(), SiswaClientProps, getReferensi(), KesiswaanPage(), deleteSiswa(), generateUsernamePasswordBulk(), getSiswaCount() (+6 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 12 - "p5bk-client.tsx"
Cohesion: 0.15
Nodes (18): ModalNilaiP5BK(), ModalNilaiP5BKProps, NilaiData, OPSI_NILAI, ProyekNilai, SiswaNilai, SubElemenItem, ModalP5BK() (+10 more)

### Community 14 - "db.ts"
Cohesion: 0.17
Nodes (9): getData(), P5BKPage(), getGuruDashboard(), GuruDashboardPage(), getData(), PiketHarianPage(), getData(), PrakerinPage() (+1 more)

### Community 15 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+11 more)

### Community 16 - "kompetensi-client.tsx"
Cohesion: 0.19
Nodes (11): COLUMNS, KompetensiClient(), KompetensiClientProps, ModalHapus(), ModalHapusProps, ModalKompetensi(), ModalKompetensiProps, getKompetensi() (+3 more)

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
Cohesion: 0.17
Nodes (17): ModalAnggotaOrganisasi(), ModalAnggotaProps, ModalOrganisasi(), ModalOrganisasiProps, COLUMNS, OrganisasiClient(), OrganisasiClientProps, getOrganisasi() (+9 more)

### Community 24 - "modal-siswa.tsx"
Cohesion: 0.22
Nodes (3): ModalSiswa(), ModalSiswaProps, Section

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

### Community 29 - "mapel-client.tsx"
Cohesion: 0.05
Nodes (38): COLUMNS, DeskripsiClient(), DeskripsiClientProps, ModalDeskripsi(), ModalDeskripsiProps, ModalHapus(), ModalHapusProps, DeskripsiRaporPage() (+30 more)

### Community 30 - "siswa-portal-data.ts"
Cohesion: 0.27
Nodes (8): NilaiSiswaPage(), formatTanggal(), SiswaDashboardPage(), PresensiSiswaPage(), getNilaiSiswa(), getPresensiSiswa(), getSiswaPortalContext(), SiswaPortalContext

### Community 31 - "dapodik-actions.ts"
Cohesion: 0.05
Nodes (69): ENTITY_ORDER, ModalDetailSinkron(), Props, STATUS_META, ENTITAS, namaSemester(), PeriodeInfo, Props (+61 more)

### Community 32 - "auth.ts"
Cohesion: 0.17
Nodes (10): getKelasKu(), KelasKuPage(), getData(), KokurikulerPage(), getData(), getUser(), PiketHarianPage(), { handlers, signIn, signOut, auth } (+2 more)

### Community 33 - "pegawai-client.tsx"
Cohesion: 0.18
Nodes (12): ModalHapus(), ModalHapusProps, ModalPegawai(), ModalPegawaiProps, COLUMNS, PegawaiClient(), PegawaiClientProps, getPegawai() (+4 more)

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

### Community 50 - "[id_mapel_kelas]/page.tsx"
Cohesion: 0.36
Nodes (6): buildMap(), PenilaianClient(), TAB_INFO, getPenilaianData(), PageProps, PenilaianPage()

### Community 51 - "auth-guard.ts"
Cohesion: 0.26
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

### Community 60 - "piket-harian-client.tsx"
Cohesion: 0.33
Nodes (7): DAYS, PiketHarianClient(), PiketHarianClientProps, addPiketHarian(), deletePiketHarian(), deletePiketHarianByHariUser(), updatePiketHarian()

### Community 61 - "useToast"
Cohesion: 0.16
Nodes (13): AnggotaKelasClient(), AnggotaKelasClientProps, COLUMNS, COLUMNS, RombelClient(), RombelClientProps, ToastContext, ToastContextType (+5 more)

### Community 65 - "File Icon SVG"
Cohesion: 1.00
Nodes (3): File Icon SVG, Globe Icon SVG, Window Icon SVG

### Community 66 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 67 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 68 - "pengaturan-client.tsx"
Cohesion: 0.50
Nodes (6): PengaturanClient(), Props, toDateInput(), addTahunPelajaran(), deleteTahunPelajaran(), savePengaturan()

### Community 70 - "requireTuAdmin"
Cohesion: 0.16
Nodes (15): xlsx, dynamic, GET(), runtime, GET(), GET(), ModalTransferAnggotaKelas(), ModalTransferAnggotaKelasProps (+7 more)

### Community 74 - "catatan-wali/page.tsx"
Cohesion: 0.13
Nodes (15): CatatanWaliClient(), FilterStatus, KelasItem, Props, SiswaItem, CatatanWaliPage(), KelasWaliRow, SiswaCatatanRow (+7 more)

### Community 82 - "sidebar-guru.tsx"
Cohesion: 0.43
Nodes (6): ALL_MENU_SECTIONS, getVisibleItems(), getVisibleSections(), SidebarGuru(), getGuruTugas(), GuruTugas

### Community 88 - "pelengkap-template.ts"
Cohesion: 0.54
Nodes (7): formatTanggal(), generatePelengkapRaporHTML(), infoRow(), PelengkapSekolahInfo, PelengkapSiswaInfo, value(), escapeHtml()

### Community 93 - "tu/p5bk/page.tsx"
Cohesion: 0.52
Nodes (6): getData(), getDimensiTree(), getKelas(), getTema(), getUser(), P5BKPage()

### Community 94 - "modal-import-siswa.tsx"
Cohesion: 0.43
Nodes (6): COLUMN_MAP, excelDateToISO(), findHeader(), ModalImportSiswa(), ModalImportSiswaProps, normHeader()

### Community 95 - "mapel-kelas/page.tsx"
Cohesion: 0.60
Nodes (5): getData(), getKelas(), getMapel(), getUser(), MapelKelasPage()

### Community 97 - "rekap-presensi/page.tsx"
Cohesion: 0.40
Nodes (4): COLUMNS, RekapPresensiGuruClient(), RekapPresensiGuruClientProps, RekapPresensiGuruPage()

### Community 98 - "mapel-siswa/page.tsx"
Cohesion: 0.60
Nodes (5): getEnrollments(), getKelasList(), getStudents(), getSubjects(), MapelSiswaPage()

### Community 99 - "naik-kelas/page.tsx"
Cohesion: 0.70
Nodes (4): getData(), getKelas(), getTingkat(), NaikKelasPage()

### Community 100 - "rombel/page.tsx"
Cohesion: 0.83
Nodes (3): getRombel(), getUser(), RombelPage()

## Knowledge Gaps
- **360 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `fs`, `env`, `eslintConfig` (+355 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `k()` connect `workbox-4a6e5f9b.js` to `siswa-client.tsx`, `a`, `dapodik-actions.ts`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `getSekolahWithFilter()` connect `getSekolahWithFilter` to `mapel-kelas-client.tsx`, `cetak-rapor/route.ts`, `tu/layout.tsx`, `prakerin-client.tsx`, `ekstra-client.tsx`, `siswa-client.tsx`, `p5bk-client.tsx`, `db.ts`, `organisasi-client.tsx`, `sekolah-helper.ts`, `daftar-rapor/page.tsx`, `auth.ts`, `absensi-piket-client.tsx`, `laporan-pendidikan/page.tsx`, `profil-actions.ts`, `tu/page.tsx`, `dkn-client.tsx`, `buku-induk/page.tsx`, `lager-nilai-kelas/page.tsx`, `guru/organisasi/page.tsx`, `guru/anggota-kelas/page.tsx`, `[id_mapel_kelas]/page.tsx`, `auth-guard.ts`, `requireGuru`, `cetak-rapor-guru-client.tsx`, `requireTuAdmin`, `catatan-wali/page.tsx`, `sidebar-guru.tsx`, `tu/p5bk/page.tsx`, `mapel-kelas/page.tsx`, `rekap-presensi/page.tsx`, `mapel-siswa/page.tsx`, `naik-kelas/page.tsx`, `rombel/page.tsx`, `tu/anggota-kelas/page.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useToast` to `mapel-kelas-client.tsx`, `prakerin-client.tsx`, `mapel-siswa-grid.tsx`, `ekstra-client.tsx`, `siswa/profile/_components/profile-form.tsx`, `siswa-client.tsx`, `p5bk-client.tsx`, `kompetensi-client.tsx`, `organisasi-client.tsx`, `(dashboard)/profile/_components/profile-form.tsx`, `mapel-client.tsx`, `dapodik-actions.ts`, `pegawai-client.tsx`, `absensi-piket-client.tsx`, `profil-actions.ts`, `[id_mapel_kelas]/page.tsx`, `auth-guard.ts`, `requireGuru`, `piket-harian-client.tsx`, `pengaturan-client.tsx`, `requireTuAdmin`, `modal-import-siswa.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `syncDapodik()` (e.g. with `u()` and `k()`) actually correct?**
  _`syncDapodik()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `fs` to the rest of the system?**
  _360 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Rapor Semester (Semester Report Card)` be split into smaller, more focused modules?**
  _Cohesion score 0.05725490196078432 - nodes in this community are weakly interconnected._
- **Should `cetak-rapor/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12550607287449392 - nodes in this community are weakly interconnected._