import * as XLSX from 'xlsx';

export async function GET() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template data
  const data = [
    {
      'Nama Siswa *': 'Budi Santoso',
      'NIS': '001',
      'NISN': '0001234567',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir': '01/01/2008',
      'Jenis Kelamin': 'Laki-laki',
      'Agama': 'Islam',
      'Jurusan': 'Akuntansi',
      'Kontak': '08123456789',
      'Alamat': 'Jl. Merdeka No. 10',
      'Terima Kelas': 'XII RPL 1',
      'Tanggal Masuk': '01/07/2025',
      'Tingkat': 'X',
      'Username *': 'budi',
      'Password *': 'password123',
    },
    {
      'Nama Siswa *': 'Siti Aminah',
      'NIS': '002',
      'NISN': '0007654321',
      'Tempat Lahir': 'Surabaya',
      'Tanggal Lahir': '15/06/2008',
      'Jenis Kelamin': 'Perempuan',
      'Agama': 'Islam',
      'Jurusan': 'Akuntansi',
      'Kontak': '08567890123',
      'Alamat': 'Jl. Pahlawan No. 5',
      'Terima Kelas': 'XII RPL 2',
      'Tanggal Masuk': '01/07/2025',
      'Tingkat': 'XII',
      'Username *': 'siti',
      'Password *': 'password456',
    },
  ];

  const sheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, sheet, 'Template');

  sheet['!cols'] = [
    { wch: 20 }, // Nama Siswa
    { wch: 10 }, // NIS
    { wch: 15 }, // NISN
    { wch: 15 }, // Tempat Lahir
    { wch: 15 }, // Tanggal Lahir
    { wch: 15 }, // Jenis Kelamin
    { wch: 12 }, // Agama
    { wch: 20 }, // Jurusan
    { wch: 15 }, // Kontak
    { wch: 30 }, // Alamat
    { wch: 15 }, // Terima Kelas
    { wch: 15 }, // Tanggal Masuk
    { wch: 10 }, // Tingkat
    { wch: 15 }, // Username
    { wch: 15 }, // Password
  ];

  // Sheet 2: Petunjuk
  const petunjukData = [
    ['PETUNJUK PENGISIAN TEMPLATE IMPORT SISWA'],
    [''],
    ['Keterangan:', '* = Kolom Wajib diisi, Kolom tanpa tanda * = Opsional (boleh dikosongkan)'],
    [''],
    ['Nama Kolom di Excel', 'Status', 'Keterangan', 'Contoh Isian'],
    ['Nama Siswa *', 'Wajib', 'Nama lengkap siswa', 'Budi Santoso'],
    ['NIS', 'Opsional', 'Nomor Induk Siswa', '001'],
    ['NISN', 'Opsional', 'Nomor Induk Siswa Nasional', '0001234567'],
    ['Tempat Lahir', 'Opsional', 'Kota/kabupaten lahir', 'Jakarta'],
    ['Tanggal Lahir', 'Opsional', 'Format: DD/MM/YYYY', '01/01/2008'],
    ['Jenis Kelamin', 'Opsional', 'Isi salah satu: Laki-laki / Perempuan', 'Laki-laki'],
    ['Agama', 'Opsional', 'Isi salah satu: Islam, Kristen, Katolik, Hindu, Buddha, Konghucu', 'Islam'],
    ['Jurusan', 'Opsional', 'Nama kompetensi keahlian', 'Akuntansi'],
    ['Kontak', 'Opsional', 'Nomor telepon/HP siswa', '08123456789'],
    ['Alamat', 'Opsional', 'Alamat lengkap siswa', 'Jl. Merdeka No. 10'],
    ['Terima Kelas', 'Opsional', 'Kelas saat diterima (contoh: XII RPL 1)', 'XII RPL 1'],
    ['Tanggal Masuk', 'Opsional', 'Tanggal masuk/diterima di sekolah. Format: DD/MM/YYYY', '01/07/2025'],
    ['Tingkat', 'Opsional', 'Angka 1/2/3 atau roman (X/XI/XII). Jika kosong, auto-detect dari Terima Kelas', 'X atau 1'],
    ['Username *', 'Wajib', 'Username untuk login siswa', 'budi'],
    ['Password *', 'Wajib', 'Password untuk login siswa', 'password123'],
    [''],
    ['Catatan:', ''],
    ['- Kolom dengan tanda * di nama kolomnya HARUS diisi, kolom lain boleh dikosongkan.'],
    ['- Jika NIS atau NISN sudah ada di database, data siswa tersebut akan di-UPDATE (kecuali password dikosongkan).'],
    ['- Jika NIS dan NISN belum ada, siswa baru akan di-INSERT.'],
    ['- Password wajib diisi untuk siswa baru. Untuk update, kosongkan password jika tidak ingin mengubahnya.'],
    ['- Password akan di-hash otomatis oleh sistem.'],
    ['- Jenis Kelamin, Agama, dan Jurusan harus sesuai dengan data yang ada di sistem.'],
    ['- Hapus baris contoh (Budi Santoso, Siti Aminah) sebelum mengisi data siswa Anda.'],
  ];

  const petunjukSheet = XLSX.utils.aoa_to_sheet(petunjukData);
  // Merge title row
  petunjukSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
  ];
  petunjukSheet['!cols'] = [
    { wch: 25 }, // Nama Kolom
    { wch: 12 }, // Status
    { wch: 45 }, // Keterangan
    { wch: 30 }, // Contoh
  ];

  // Bold header row (row 4, 0-indexed)
  for (let c = 0; c < 4; c++) {
    const cell = petunjukSheet[XLSX.utils.encode_cell({ r: 4, c })];
    if (cell) cell.s = { font: { bold: true } };
  }

  XLSX.utils.book_append_sheet(wb, petunjukSheet, 'Petunjuk');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-import-siswa.xlsx"',
    },
  });
}
