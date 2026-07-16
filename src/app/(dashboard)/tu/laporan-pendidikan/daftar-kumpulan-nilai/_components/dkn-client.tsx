'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

interface SiswaItem { id_siswa: number; nisn: string; nama_siswa: string }
interface MapelItem { id_mapel: number; nama_mapel: string; urut: number }
interface GradeItem { id_siswa: number; id_mapel: number; tahun: number; semester: number; nilai: string }
interface SemesterSeq { tahun: number; semester: number; seq: number }

interface Props {
  tingkatList: any[]; jurusanList: any[]; kelasList: any[]; tahunPelajaranList: any[]; semesterList: any[];
  siswa: SiswaItem[]; mapels: MapelItem[]; grades: GradeItem[]; semesterSeqs: SemesterSeq[];
  selectedTingkat?: number; selectedKelas?: number; currentTahun: number; currentSemester: number;
}

function computeData(siswa: SiswaItem[], mapels: MapelItem[], grades: GradeItem[], semesterSeqs: SemesterSeq[]) {
  const gl: Record<string, string> = {};
  grades.forEach((g) => { gl[`${g.id_siswa}_${g.tahun}_${g.semester}_${g.id_mapel}`] = g.nilai; });
  return siswa.map((s) => {
    const semRows = semesterSeqs.map((sem) => {
      const vals = mapels.map((mp) => gl[`${s.id_siswa}_${sem.tahun}_${sem.semester}_${mp.id_mapel}`] || '');
      const nums = vals.filter((v) => v !== '').map(Number);
      return { seq: sem.seq, vals, total: nums.reduce((a, b) => a + b, 0), avg: nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0 };
    });
    const nrrVals = mapels.map((_, mi) => {
      const nums = semRows.map((r) => Number(r.vals[mi])).filter((n) => !isNaN(n));
      return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : '';
    });
    const nrrNums = nrrVals.filter((v) => v !== '').map(Number);
    return { siswa: s, semRows, nrrVals, nrrTotal: nrrNums.reduce((a, b) => a + b, 0), nrrAvg: nrrNums.length ? nrrNums.reduce((a, b) => a + b, 0) / nrrNums.length : 0 };
  });
}

export default function DKNClient(props: Props) {
  const router = useRouter();
  const [idTingkat, setIdTingkat] = useState(props.selectedTingkat || '');
  const [idJurusan, setIdJurusan] = useState('');
  const [idKelas, setIdKelas] = useState(props.selectedKelas || '');

  const filteredKelas = useMemo(() => {
    let list = props.kelasList;
    if (idTingkat) list = list.filter((k: any) => k.id_tingkat === Number(idTingkat));
    if (idJurusan) list = list.filter((k: any) => k.id_kompetensi_keahlian === Number(idJurusan));
    return list;
  }, [props.kelasList, idTingkat, idJurusan]);

  const selectedKelasName = useMemo(() => {
    if (!idKelas) return '';
    const k = props.kelasList.find((k: any) => k.id_kelas === Number(idKelas));
    return k?.nama_kelas || '';
  }, [props.kelasList, idKelas]);

  const td = useMemo(
    () => computeData(props.siswa, props.mapels, props.grades, props.semesterSeqs),
    [props.siswa, props.mapels, props.grades, props.semesterSeqs]
  );

  const handleSubmit = () => {
    const sp = new URLSearchParams();
    if (idTingkat) sp.set('id_tingkat', String(idTingkat));
    if (idKelas) sp.set('id_kelas', String(idKelas));
    router.push(`/tu/laporan-pendidikan/daftar-kumpulan-nilai?${sp.toString()}`);
  };

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    if (!td.length || !props.mapels.length) return;
    const header = ['No', 'NISN', 'Nama Siswa', 'Keterangan', ...props.mapels.map((m) => m.nama_mapel), 'Total', 'Rata-rata'];
    const rows: any[][] = [header];
    td.forEach((d, idx) => {
      d.semRows.forEach((sem, si) => {
        rows.push([
          si === 0 ? idx + 1 : '', si === 0 ? d.siswa.nisn : '', si === 0 ? d.siswa.nama_siswa : '',
          `Semester ${sem.seq}`, ...sem.vals, Number(sem.total.toFixed(2)), Number(sem.avg.toFixed(2)),
        ]);
      });
      rows.push([
        '', '', '', 'NRR',
        ...d.nrrVals, Number(d.nrrTotal.toFixed(2)), Number(d.nrrAvg.toFixed(2)),
      ]);
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'DKN');
    XLSX.writeFile(wb, `DKN_${selectedKelasName.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div>
      <style>{css}</style>
      <div className="no-print mb-5 bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] p-4">
        <h2 className="text-sm font-semibold text-[#1A1A2E] mb-3">Filter DKN</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Tingkat</label>
            <select value={idTingkat} onChange={(e) => { setIdTingkat(e.target.value); setIdKelas(''); setIdJurusan(''); }}
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg px-3 py-2 text-sm min-w-[100px]">
              <option value="">-- Pilih --</option>
              {props.tingkatList.map((t: any) => <option key={t.id_tingkat} value={t.id_tingkat}>{t.tabjad}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Jurusan</label>
            <select value={idJurusan} onChange={(e) => { setIdJurusan(e.target.value); setIdKelas(''); }}
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg px-3 py-2 text-sm min-w-[140px]">
              <option value="">-- Semua --</option>
              {props.jurusanList.map((j: any) => <option key={j.id_kompetensi_keahlian} value={j.id_kompetensi_keahlian}>{j.kompetensi_keahlian}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Kelas</label>
            <select value={idKelas} onChange={(e) => setIdKelas(e.target.value)}
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg px-3 py-2 text-sm min-w-[140px]">
              <option value="">-- Pilih --</option>
              {filteredKelas.map((k: any) => <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>)}
            </select>
          </div>
          <button onClick={handleSubmit} disabled={!idTingkat || !idKelas}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
            Tampilkan
          </button>
          {td.length > 0 && (
            <>
              <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Cetak PDF</button>
              <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Export Excel</button>
            </>
          )}
        </div>
      </div>

      {!idKelas ? (
        <div className="text-center py-16"><p className="text-[#6B7280]">Pilih kelas untuk menampilkan Daftar Kumpulan Nilai.</p></div>
      ) : props.siswa.length === 0 ? (
        <div className="text-center py-16"><p className="text-[#6B7280]">Tidak ada data siswa untuk kelas {selectedKelasName}.</p></div>
      ) : (
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] overflow-x-auto">
          <h1 className="dkn-title">DAFTAR KUMPULAN NILAI</h1>
          <table className="dkn-tbl">
            <thead>
              <tr>
                <th className="dkn-th" rowSpan={2} style={{ width: 32 }}>No</th>
                <th className="dkn-th" rowSpan={2} style={{ width: 70 }}>NISN</th>
                <th className="dkn-th" rowSpan={2} style={{ minWidth: 150 }}>Nama Siswa</th>
                <th className="dkn-th dkn-th-v" rowSpan={2} style={{ width: 28, height: 100 }}>
                  <span className="v-text">KETERANGAN</span>
                </th>
                {props.mapels.map((m) => (
                  <th key={m.id_mapel} className="dkn-th dkn-th-v" style={{ width: 46, height: 100 }}>
                    <span className="v-text">{m.nama_mapel}</span>
                  </th>
                ))}
                <th className="dkn-th" rowSpan={2} style={{ width: 44 }}>Total</th>
                <th className="dkn-th" rowSpan={2} style={{ width: 52 }}>Rata-rata</th>
              </tr>
              <tr />
            </thead>
            <tbody>
              {td.flatMap((d, idx) => {
                const rc = d.semRows.length + 1;
                const semRows = d.semRows.map((sem, si) => (
                  <tr key={`${d.siswa.id_siswa}_s${si}`} className={si === 0 && idx > 0 ? 'grp-sep' : ''}>
                    {si === 0 && <td className="dkn-td tc" rowSpan={rc}>{idx + 1}</td>}
                    {si === 0 && <td className="dkn-td tc" rowSpan={rc}>{d.siswa.nisn}</td>}
                    {si === 0 && <td className="dkn-td td-name" rowSpan={rc}>{d.siswa.nama_siswa}</td>}
                    <td className="dkn-td tc">
                      {si === 0 ? (
                        <span className="v-wrap"><span className="v-text-sm">Semester</span>{sem.seq}</span>
                      ) : (
                        sem.seq
                      )}
                    </td>
                    {sem.vals.map((v, mi) => <td key={mi} className="dkn-td tc">{v || '-'}</td>)}
                    <td className="dkn-td tc">{sem.total.toFixed(2)}</td>
                    <td className="dkn-td tc">{sem.avg.toFixed(2)}</td>
                  </tr>
                ));
                const nrrRow = (
                  <tr key={`${d.siswa.id_siswa}_nrr`}>
                    <td className="dkn-td tc td-nrr-lbl">NRR</td>
                    {d.nrrVals.map((v, mi) => <td key={mi} className="dkn-td tc td-nrr">{v || '-'}</td>)}
                    <td className="dkn-td tc td-nrr">{d.nrrTotal.toFixed(2)}</td>
                    <td className="dkn-td tc td-nrr">{d.nrrAvg.toFixed(2)}</td>
                  </tr>
                );
                return [...semRows, nrrRow];
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const css = `
@media print {
  @page { size: F4 landscape; margin: 10mm; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  thead { display: table-header-group; }
}
.dkn-title {
  font-family: 'Times New Roman', Times, serif; font-size: 14pt; font-weight: 700;
  text-align: center; margin-bottom: 10px; padding-top: 4px;
}
.dkn-tbl { font-family: 'Times New Roman', Times, serif; font-size: 10pt; border-collapse: collapse; width: 100%; }
.dkn-th, .dkn-td { border: 1px solid #000; padding: 3px 6px; vertical-align: middle; font-size: 10pt; }
.dkn-th { background: #f0f0f0; font-weight: 700; text-align: center; }
.dkn-th-v { height: 120px; white-space: nowrap; vertical-align: bottom; }
.v-text { writing-mode: vertical-lr; text-orientation: mixed; font-size: 7pt; font-weight: 700; display: inline-block; }
.v-text-sm { writing-mode: vertical-lr; text-orientation: mixed; font-size: 8pt; font-weight: 700; white-space: nowrap; }
.v-wrap { display: inline-flex; align-items: center; gap: 3px; }
.tc { text-align: center !important; }
.td-name { font-weight: 600; }
.td-nrr { font-weight: 700; border-top-width: 2px !important; }
.td-nrr-lbl { font-weight: 700; border-top-width: 2px !important; }
.grp-sep td, .grp-sep th { border-top-width: 3px !important; }
`;
