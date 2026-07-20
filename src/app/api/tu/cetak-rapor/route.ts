import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { SEKOLAH_ID } from '@/lib/constants';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { NextRequest, NextResponse } from 'next/server';
import { generateRaporHTML, JenisRapor, SiswaInfo, SekolahInfo } from '@/lib/pdf-templates/rapor-template';
import { generateTengahSemesterRaporHTML, SiswaMidRapor, KelompokMapelData, MapelNilai, PresensiData } from '@/lib/pdf-templates/tengah-semester-template';
import { generateSemesterRaporHTML, SiswaSemesterRapor, KelompokSemester, MapelSemester, PrakerinItem, EskulItem, OrganisasiItem } from '@/lib/pdf-templates/semester-template';
import { renderRaporPdf } from '@/lib/pdf-templates/render-pdf';

const VALID_JENIS: JenisRapor[] = ['pelengkap', 'tengah_semester', 'semester', 'p5bk', 'buku_induk'];

function buildFooterTemplate(nama_kelas: string, nama_siswa: string, nis: string, nisn: string): string {
  const info = `${nama_kelas || '-'} | ${nama_siswa || '-'} | ${nis || '-'}${nisn ? '/' + nisn : ''}`;
  const escaped = info.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return `<div style="font-size:9pt;font-family:Arial,Helvetica,sans-serif;font-style:italic;width:100%;padding:0 15mm;">
    <div style="display:flex;justify-content:space-between;border-top:1.5pt double #555;padding-top:6px;">
      <span>${escaped}</span>
      <span>Halaman: <span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>
  </div>`;
}

function tglIndo(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2 && session.user.jabatan !== 3)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id_siswa_list, jenis, tahun, semester } = body as {
    id_siswa_list: number[];
    jenis: string;
    tahun: number;
    semester: number;
  };

  if (!id_siswa_list?.length || !VALID_JENIS.includes(jenis as JenisRapor)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  // Honor TU historical-view cookie; fall back to active period.
  const sekolahView = await getSekolahWithFilter();
  const viewTahun = Number(sekolahView?.tahun);
  const viewSemester = Number(sekolahView?.semester);
  const useTahun = Number.isInteger(viewTahun) && viewTahun > 0 ? viewTahun : Number(tahun);
  const useSemester = Number.isInteger(viewSemester) && viewSemester > 0 ? viewSemester : Number(semester);
  if (!Number.isInteger(useTahun) || useTahun < 1 || (useSemester !== 1 && useSemester !== 2)) {
    return NextResponse.json({ error: 'Periode tidak valid' }, { status: 400 });
  }

  try {
    const placeholders = id_siswa_list.map(() => '?').join(',');
    const [siswaRows]: any = await pool.query(`
      SELECT s.id_siswa, s.nama_siswa, s.nis, s.nisn, k.nama_kelas
      FROM siswa s
      JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa
      JOIN kelas k ON sk.id_kelas = k.id_kelas
      WHERE sk.tahun = ? AND sk.semester = ? AND s.id_siswa IN (${placeholders})
        AND sk.deleted_at IS NULL AND s.deleted_at IS NULL
      ORDER BY s.nama_siswa ASC
    `, [useTahun, useSemester, ...id_siswa_list]);

    if (siswaRows.length === 0) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    const [sekolahRows]: any = await pool.query(
      'SELECT nama_sekolah, alamat, logo, lokasi, kabupaten, kecamatan, desa FROM sekolah WHERE id_sekolah = ?',
      [SEKOLAH_ID]
    );
    const s = sekolahRows[0] || {};

    const [ksRows]: any = await pool.query(
      'SELECT nama, nip FROM kepala_sekolah WHERE tahun = ? AND semester = ? LIMIT 1',
      [useTahun, useSemester]
    );
    const ks = ksRows[0] || {};

    const [tpRows]: any = await pool.query(
      'SELECT tahun_pelajaran FROM tahun_pelajaran WHERE id_tahun_pelajaran = ?', [useTahun]
    );
    const tahunPelajaran = tpRows[0]?.tahun_pelajaran || '';

    const [semRows]: any = await pool.query(
      'SELECT semester FROM semester WHERE id_semester = ?', [useSemester]
    );
    const semesterLabel = semRows[0]?.semester || '';

    const lokasi = s.lokasi === 1 ? s.kabupaten : s.lokasi === 2 ? s.kecamatan : s.desa;

    const sekolahInfo: SekolahInfo = {
      nama_sekolah: s.nama_sekolah || '',
      alamat: s.alamat || '',
      logo: s.logo || null,
      nama_kepsek: ks.nama || '',
      nip_kepsek: ks.nip || '',
    };

    if (jenis === 'tengah_semester') {
      const ids = id_siswa_list;

      const [siswaKelasRows]: any = await pool.query(`
        SELECT s.id_siswa, sk.id_kelas, k.nama_kelas, t.fase
        FROM siswa s
        JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa
        JOIN kelas k ON sk.id_kelas = k.id_kelas
        JOIN tingkat t ON k.id_tingkat = t.id_tingkat
        WHERE sk.tahun = ? AND sk.semester = ? AND s.id_siswa IN (${placeholders})
          AND sk.deleted_at IS NULL
      `, [tahun, semester, ...ids]);

      const siswaKelasMap = new Map<number, { id_kelas: number; nama_kelas: string; fase: string }>();
      for (const r of siswaKelasRows) {
        siswaKelasMap.set(r.id_siswa, { id_kelas: r.id_kelas, nama_kelas: r.nama_kelas, fase: r.fase });
      }
      const kelasIds = [...new Set(siswaKelasRows.map((r: any) => r.id_kelas))];
      const kelasPlaceholders = kelasIds.map(() => '?').join(',');

      const [kelompokRows]: any = await pool.query(
        'SELECT * FROM kelompok_mapel WHERE deleted_at IS NULL ORDER BY id_kelompok ASC'
      );

      const [mapelSiswaRows]: any = await pool.query(`
        SELECT ms.id_siswa, m.id_mapel, m.nama_mapel, m.id_kelompok, m.urut
        FROM mapel_siswa ms
        JOIN mapel m ON ms.id_mapel = m.id_mapel
        WHERE ms.tahun = ? AND ms.semester = ? AND ms.aktif = 1 AND ms.id_siswa IN (${placeholders})
        ORDER BY m.id_kelompok ASC, m.urut ASC
      `, [tahun, semester, ...ids]);

      const [nilaiTsRows]: any = await pool.query(`
        SELECT id_siswa, id_mapel, nilai FROM nilai_sumatif_ts
        WHERE tahun = ? AND semester = ? AND id_siswa IN (${placeholders})
      `, [tahun, semester, ...ids]);
      const nilaiTsMap = new Map<string, number>();
      for (const r of nilaiTsRows) {
        nilaiTsMap.set(`${r.id_siswa}-${r.id_mapel}`, r.nilai);
      }

      const allMapelIds = [...new Set(mapelSiswaRows.map((r: any) => r.id_mapel))];
      const mapelPlaceholders = allMapelIds.map(() => '?').join(',');
      const [kktpRows]: any = await pool.query(`
        SELECT DISTINCT id_mapel, kktp FROM tujuan_pembelajaran
        WHERE tahun = ? AND semester = ? AND id_mapel IN (${mapelPlaceholders})
      `, [tahun, semester, ...allMapelIds]);
      const kktpMap = new Map<number, number>();
      for (const r of kktpRows) {
        if (!kktpMap.has(r.id_mapel)) kktpMap.set(r.id_mapel, r.kktp);
      }

      const [presensiRows]: any = await pool.query(`
        SELECT p.id_siswa, p.id_absen, COALESCE(SUM(p.jumlah), 0) AS total
        FROM presensi p
        WHERE p.tahun = ? AND p.semester = ? AND p.id_siswa IN (${placeholders})
          AND p.deleted_at IS NULL
        GROUP BY p.id_siswa, p.id_absen
      `, [tahun, semester, ...ids]);

      const [absenRows]: any = await pool.query(
        'SELECT * FROM absen WHERE id_absen > 1 AND deleted_at IS NULL ORDER BY id_absen ASC'
      );

      const [catatanRows]: any = await pool.query(`
        SELECT id_siswa, catatan FROM catatan_wali
        WHERE tahun = ? AND semester = ? AND id_siswa IN (${placeholders})
          AND deleted_at IS NULL
      `, [tahun, semester, ...ids]);
      const catatanMap = new Map<number, string>();
      for (const r of catatanRows) catatanMap.set(r.id_siswa, r.catatan);

      let waliKelas = { nama: '', nip: '' };
      if (kelasIds.length > 0) {
        const [kwRows]: any = await pool.query(`
          SELECT u.nama, u.nip
          FROM kelas_wali kw
          JOIN users u ON kw.id_user = u.id_user
          WHERE kw.tahun = ? AND kw.semester = ? AND kw.deleted_at IS NULL AND kw.id_kelas IN (${kelasPlaceholders})
          LIMIT 1
        `, [tahun, semester, ...kelasIds]);
        if (kwRows[0]) waliKelas = { nama: kwRows[0].nama, nip: kwRows[0].nip || '-' };
      }

      const [pembagianRows]: any = await pool.query(
        'SELECT tanggal_mid FROM pembagian_raport WHERE tahun = ? AND semester = ? AND deleted_at IS NULL LIMIT 1',
        [tahun, semester]
      );
      const tanggalMid = pembagianRows[0]?.tanggal_mid ? tglIndo(pembagianRows[0].tanggal_mid) : '';

      const siswaMidList: SiswaMidRapor[] = siswaRows.map((row: any) => {
        const skInfo = siswaKelasMap.get(row.id_siswa) || { id_kelas: 0, nama_kelas: row.nama_kelas, fase: '' };

        const siswaMapels = mapelSiswaRows
          .filter((m: any) => m.id_siswa === row.id_siswa);

        const kelompokMapels: KelompokMapelData[] = kelompokRows.map((km: any) => ({
          huruf: km.huruf,
          kelompok: km.kelompok,
          mapels: siswaMapels
            .filter((m: any) => m.id_kelompok === km.id_kelompok)
            .map((m: any) => ({
              nama_mapel: m.nama_mapel,
              nilai: nilaiTsMap.get(`${row.id_siswa}-${m.id_mapel}`) ?? null,
              kktp: kktpMap.get(m.id_mapel) || 70,
            })),
        })).filter((km: KelompokMapelData) => km.mapels.length > 0);

        const presensi: PresensiData[] = absenRows.map((a: any) => {
          const found = presensiRows.find((p: any) => p.id_siswa === row.id_siswa && p.id_absen === a.id_absen);
          return { absen: a.absen, jumlah: found ? Number(found.total) : 0 };
        });

        return {
          id_siswa: row.id_siswa,
          nama_siswa: row.nama_siswa,
          nis: row.nis,
          nisn: row.nisn,
          nama_kelas: skInfo.nama_kelas,
          fase: skInfo.fase,
          id_kelas: skInfo.id_kelas,
          kelompok_mapels: kelompokMapels,
          presensi,
          catatan_wali: catatanMap.get(row.id_siswa) || '',
          wali_kelas: waliKelas.nama,
          nip_wali: waliKelas.nip,
          tanggal_mid: tanggalMid,
          lokasi,
        };
      });

      const html = generateTengahSemesterRaporHTML(siswaMidList, sekolahInfo, tahunPelajaran, semesterLabel, waliKelas);

      const firstSiswaMid = siswaMidList[0];
      const footerTengah = buildFooterTemplate(firstSiswaMid.nama_kelas, firstSiswaMid.nama_siswa, firstSiswaMid.nis || '-', firstSiswaMid.nisn || '-');

      return await renderRaporPdf(html, footerTengah, `rapor-tengah-semester-${Date.now()}.pdf`);
    }

    if (jenis === 'semester') {
      const ids = id_siswa_list;

      const [siswaKelasRows]: any = await pool.query(`
        SELECT s.id_siswa, sk.id_kelas, sk.id_tingkat, k.nama_kelas, t.fase
        FROM siswa s
        JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa
        JOIN kelas k ON sk.id_kelas = k.id_kelas
        JOIN tingkat t ON k.id_tingkat = t.id_tingkat
        WHERE sk.tahun = ? AND sk.semester = ? AND s.id_siswa IN (${placeholders})
          AND sk.deleted_at IS NULL
      `, [tahun, semester, ...ids]);

      const siswaKelasMap = new Map<number, { id_kelas: number; id_tingkat: number; nama_kelas: string; fase: string }>();
      for (const r of siswaKelasRows) {
        siswaKelasMap.set(r.id_siswa, { id_kelas: r.id_kelas, id_tingkat: r.id_tingkat, nama_kelas: r.nama_kelas, fase: r.fase });
      }
      const kelasIds = [...new Set(siswaKelasRows.map((r: any) => r.id_kelas))];
      const kelasPlaceholders = kelasIds.map(() => '?').join(',');

      const [kelompokRows]: any = await pool.query(
        'SELECT * FROM kelompok_mapel WHERE deleted_at IS NULL ORDER BY id_kelompok ASC'
      );

      const [mapelSiswaRows]: any = await pool.query(`
        SELECT ms.id_siswa, m.id_mapel, m.nama_mapel, m.id_kelompok, m.urut
        FROM mapel_siswa ms
        JOIN mapel m ON ms.id_mapel = m.id_mapel
        WHERE ms.tahun = ? AND ms.semester = ? AND ms.aktif = 1 AND ms.id_siswa IN (${placeholders})
        ORDER BY m.id_kelompok ASC, m.urut ASC
      `, [tahun, semester, ...ids]);

      const [nilaiMataRows]: any = await pool.query(`
        SELECT id_siswa, id_mapel, nilai FROM nilai_mata_pelajaran
        WHERE tahun = ? AND semester = ? AND id_siswa IN (${placeholders}) AND deleted_at IS NULL
      `, [tahun, semester, ...ids]);
      const nilaiMataMap = new Map<string, number>();
      for (const r of nilaiMataRows) {
        nilaiMataMap.set(`${r.id_siswa}-${r.id_mapel}`, Number(r.nilai));
      }

      const [deskRaporRows]: any = await pool.query(
        'SELECT nilai, keterangan FROM deskripsi_rapor WHERE deleted_at IS NULL ORDER BY nilai ASC'
      );

      const [phRows]: any = await pool.query(`
        SELECT id_siswa, id_mapel, id_tujuan, nilai FROM nilai_sumatif_ph
        WHERE tahun = ? AND semester = ? AND id_siswa IN (${placeholders}) AND deleted_at IS NULL
      `, [tahun, semester, ...ids]);

      const allMapelIds = [...new Set(mapelSiswaRows.map((r: any) => r.id_mapel))];
      const mapelPlaceholders = allMapelIds.length > 0 ? allMapelIds.map(() => '?').join(',') : 'NULL';
      const [tpRows2]: any = await pool.query(`
        SELECT id_tujuan, id_mapel, tujuan FROM tujuan_pembelajaran
        WHERE tahun = ? AND semester = ? AND id_mapel IN (${mapelPlaceholders})
      `, [tahun, semester, ...allMapelIds]);
      const tpMap = new Map<number, { id_mapel: number; tujuan: string }>();
      for (const r of tpRows2) tpMap.set(r.id_tujuan, { id_mapel: r.id_mapel, tujuan: r.tujuan });

      function findDeskripsi(nilai: number): string {
        let result = '';
        for (const d of deskRaporRows) {
          if (nilai >= d.nilai) result = d.keterangan;
        }
        return result;
      }

      const [prakerinRows]: any = await pool.query(`
        SELECT sp.id_siswa, p.mitra, p.lokasi, p.tanggal_mulai, p.tanggal_akhir, sp.keterangan
        FROM siswa_prakerin sp
        JOIN prakerin p ON sp.id_prakerin = p.id_prakerin
        WHERE sp.tahun = ? AND sp.semester = ? AND sp.id_siswa IN (${placeholders}) AND sp.deleted_at IS NULL
      `, [tahun, semester, ...ids]);

      const [kokurikulerRows]: any = await pool.query(`
        SELECT nk.id_siswa, dk.keterangan AS keterangan_nilai, dim.dimensi, pt.deskripsi
        FROM nilai_kokurikuler nk
        JOIN proyek_tujuan pt ON nk.id_proyek_tujuan = pt.id_proyek_tujuan
        JOIN proyek_kelas pk ON pt.id_proyek_kelas = pk.id_proyek_kelas
        JOIN deskripsi_kokurikuler dk ON nk.nilai = dk.nilai
        JOIN dimensi_kokurikuler dim ON pt.id_dimensi = dim.id_dimensi
        WHERE pk.tahun = ? AND pk.semester = ? AND nk.id_siswa IN (${placeholders})
          AND nk.deleted_at IS NULL AND pk.deleted_at IS NULL
      `, [tahun, semester, ...ids]);

      const [eskulRows]: any = await pool.query(`
        SELECT se.id_siswa, e.nama_eskul, se.predikat, se.keterangan
        FROM siswa_eskul se
        JOIN eskul e ON se.id_eskul = e.id_eskul
        WHERE se.tahun = ? AND se.semester = ? AND se.id_siswa IN (${placeholders}) AND se.deleted_at IS NULL
      `, [tahun, semester, ...ids]);

      const [orgRows]: any = await pool.query(`
        SELECT so.id_siswa, o.nama_organisasi
        FROM siswa_organisasi so
        JOIN organisasi o ON so.id_organisasi = o.id_organisasi
        WHERE so.tahun = ? AND so.semester = ? AND so.id_siswa IN (${placeholders}) AND so.deleted_at IS NULL
      `, [tahun, semester, ...ids]);

      const [presensiRows]: any = await pool.query(`
        SELECT p.id_siswa, p.id_absen, COALESCE(SUM(p.jumlah), 0) AS total
        FROM presensi p
        WHERE p.tahun = ? AND p.semester = ? AND p.id_siswa IN (${placeholders}) AND p.deleted_at IS NULL
        GROUP BY p.id_siswa, p.id_absen
      `, [tahun, semester, ...ids]);

      const [absenRows]: any = await pool.query(
        'SELECT * FROM absen WHERE id_absen > 1 AND deleted_at IS NULL ORDER BY id_absen ASC'
      );

      const [catatanRows]: any = await pool.query(`
        SELECT id_siswa, catatan FROM catatan_wali
        WHERE tahun = ? AND semester = ? AND id_siswa IN (${placeholders}) AND deleted_at IS NULL
      `, [tahun, semester, ...ids]);
      const catatanMap = new Map<number, string>();
      for (const r of catatanRows) catatanMap.set(r.id_siswa, r.catatan);

      let waliKelas = { nama: '', nip: '' };
      if (kelasIds.length > 0) {
        const [kwRows]: any = await pool.query(`
          SELECT u.nama, u.nip, kw.id_kelas
          FROM kelas_wali kw
          JOIN users u ON kw.id_user = u.id_user
          WHERE kw.tahun = ? AND kw.semester = ? AND kw.deleted_at IS NULL AND kw.id_kelas IN (${kelasPlaceholders})
          LIMIT 1
        `, [tahun, semester, ...kelasIds]);
        if (kwRows[0]) waliKelas = { nama: kwRows[0].nama, nip: kwRows[0].nip || '-' };
      }

      const [pembagianRows]: any = await pool.query(
        'SELECT tanggal_rapor FROM pembagian_raport WHERE tahun = ? AND semester = ? AND deleted_at IS NULL LIMIT 1',
        [tahun, semester]
      );
      const tanggalRapor = pembagianRows[0]?.tanggal_rapor ? tglIndo(pembagianRows[0].tanggal_rapor) : '';

      const tingkatIds = [...new Set(siswaKelasRows.map((r: any) => r.id_tingkat))];
      const firstTingkat = tingkatIds[0] as number | undefined;
      const tingkatNaik = firstTingkat ? firstTingkat + 1 : 0;
      let namaTingkatNaik = '';
      if (tingkatNaik) {
        const [tnRows]: any = await pool.query('SELECT tingkat FROM tingkat WHERE id_tingkat = ?', [tingkatNaik]);
        namaTingkatNaik = tnRows[0]?.tingkat || '';
      }

      const siswaSemList: SiswaSemesterRapor[] = siswaRows.map((row: any) => {
        const skInfo = siswaKelasMap.get(row.id_siswa) || { id_kelas: 0, id_tingkat: 0, nama_kelas: row.nama_kelas, fase: '' };
        const siswaMapels = mapelSiswaRows.filter((m: any) => m.id_siswa === row.id_siswa);

        const kelompokMapels: KelompokSemester[] = kelompokRows.map((km: any) => {
          const kmMapels: MapelSemester[] = siswaMapels
            .filter((m: any) => m.id_kelompok === km.id_kelompok)
            .map((m: any) => {
              const nilai = nilaiMataMap.get(`${row.id_siswa}-${m.id_mapel}`) || 0;
              const phList = phRows.filter((p: any) => p.id_siswa === row.id_siswa && p.id_mapel === m.id_mapel);
              const phMax = phList.length > 0 ? phList.reduce((a: any, b: any) => a.nilai >= b.nilai ? a : b) : null;
              const phMin = phList.length > 0 ? phList.reduce((a: any, b: any) => a.nilai <= b.nilai ? a : b) : null;
              return {
                nama_mapel: m.nama_mapel,
                nilai,
                deskripsi_max: phMax ? findDeskripsi(phMax.nilai) : '',
                tujuan_max: phMax?.id_tujuan ? tpMap.get(phMax.id_tujuan)?.tujuan || '' : '',
                deskripsi_min: phMin ? findDeskripsi(phMin.nilai) : '',
                tujuan_min: phMin?.id_tujuan ? tpMap.get(phMin.id_tujuan)?.tujuan || '' : '',
              };
            });
          return { huruf: km.huruf, kelompok: km.kelompok, mapels: kmMapels };
        }).filter((km: KelompokSemester) => km.mapels.length > 0);

        const siswaPrakerin: PrakerinItem[] = prakerinRows
          .filter((p: any) => p.id_siswa === row.id_siswa)
          .map((p: any) => {
            const mulai = new Date(p.tanggal_mulai);
            const akhir = new Date(p.tanggal_akhir);
            const bulan = Math.ceil((akhir.getTime() - mulai.getTime()) / (30 * 24 * 60 * 60 * 1000));
            return { mitra: p.mitra, lokasi: p.lokasi, durasi: `${bulan} Bulan`, keterangan: p.keterangan };
          });

        const siswaKokurikuler = kokurikulerRows.filter((k: any) => k.id_siswa === row.id_siswa);
        const kokurikuler_text = siswaKokurikuler.length > 0
          ? siswaKokurikuler.map((k: any) => `Ananda ${k.keterangan_nilai} dalam penguatan dimensi ${k.dimensi} terlihat dari ${k.deskripsi}. `).join('')
          : '';

        const siswaEskul: EskulItem[] = eskulRows
          .filter((e: any) => e.id_siswa === row.id_siswa)
          .map((e: any) => ({ nama_eskul: e.nama_eskul, predikat: e.predikat, keterangan: e.keterangan }));

        const siswaOrg: OrganisasiItem[] = orgRows
          .filter((o: any) => o.id_siswa === row.id_siswa)
          .map((o: any) => ({ nama_organisasi: o.nama_organisasi }));

        const presensi: PresensiData[] = absenRows.map((a: any) => {
          const found = presensiRows.find((p: any) => p.id_siswa === row.id_siswa && p.id_absen === a.id_absen);
          return { absen: a.absen, jumlah: found ? Number(found.total) : 0 };
        });

        return {
          id_siswa: row.id_siswa,
          nama_siswa: row.nama_siswa,
          nis: row.nis,
          nisn: row.nisn,
          nama_kelas: skInfo.nama_kelas,
          fase: skInfo.fase,
          id_kelas: skInfo.id_kelas,
          id_tingkat: skInfo.id_tingkat,
          kelompok_mapels: kelompokMapels,
          prakerin: siswaPrakerin,
          kokurikuler_text,
          eskul: siswaEskul,
          organisasi: siswaOrg,
          presensi,
          catatan_wali: catatanMap.get(row.id_siswa) || '',
          tanggapan_ortu: '',
          tanggal_rapor: tanggalRapor,
          lokasi,
          isSemester2: semester === 2,
          tingkatNaik: namaTingkatNaik,
          tahunPelajaran,
        };
      });

      const html = generateSemesterRaporHTML(siswaSemList, sekolahInfo, tahunPelajaran, semesterLabel, waliKelas);

      const firstSiswaSem = siswaSemList[0];
      const footerSemester = buildFooterTemplate(firstSiswaSem.nama_kelas, firstSiswaSem.nama_siswa, firstSiswaSem.nis || '-', firstSiswaSem.nisn || '-');

      return await renderRaporPdf(html, footerSemester, `rapor-semester-${Date.now()}.pdf`);
    }

    const siswaList: SiswaInfo[] = siswaRows.map((row: any) => ({
      id_siswa: row.id_siswa,
      nama_siswa: row.nama_siswa,
      nis: row.nis,
      nisn: row.nisn,
      nama_kelas: row.nama_kelas,
    }));

    const html = generateRaporHTML(
      jenis as JenisRapor,
      siswaList,
      sekolahInfo,
      tahunPelajaran,
      semesterLabel
    );

    const footerDefault = buildFooterTemplate(siswaList[0].nama_kelas, siswaList[0].nama_siswa, siswaList[0].nis || '-', siswaList[0].nisn || '-');

    return await renderRaporPdf(html, footerDefault, `rapor-${jenis}-${Date.now()}.pdf`, '20mm');
  } catch (error: any) {
    console.error('Cetak rapor error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal mencetak rapor' },
      { status: 500 }
    );
  }
}
