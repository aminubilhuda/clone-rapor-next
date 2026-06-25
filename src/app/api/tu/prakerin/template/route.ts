import * as XLSX from 'xlsx';

export async function GET() {
  const wb = XLSX.utils.book_new();

  const data = [
    { Mitra: 'PT Bina Karya', 'Lokasi/Alamat': 'Jl. Raya No. 10, Kediri', 'Tanggal Mulai': '2025-07-01', 'Tanggal Akhir': '2025-12-20', 'Pembimbing/Guru Pendamping': 'Budi Santoso' },
    { Mitra: '', 'Lokasi/Alamat': '', 'Tanggal Mulai': '', 'Tanggal Akhir': '', 'Pembimbing/Guru Pendamping': '' },
  ];

  const sheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, sheet, 'Template');

  // Column widths
  sheet['!cols'] = [
    { wch: 20 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
  ];

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-import-prakerin.xlsx"',
    },
  });
}
