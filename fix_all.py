import re, sys
fp = r"D:\PROJECT\nextjs\clone-rapor-next\src\lib\pdf-templates\semester-template.ts"
with open(fp, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Identitas: 14px -> 20px
c = c.replace('height:14px;white-space:nowrap;padding-right:4px;">Nama', 'height:20px;white-space:nowrap;padding-right:4px;">Nama')
c = c.replace('height:14px;white-space:nowrap;padding-right:4px;">NIS / NISN', 'height:20px;white-space:nowrap;padding-right:4px;">NIS / NISN')
c = c.replace('height:14px;white-space:nowrap;padding-right:4px;">Nama Sekolah', 'height:20px;white-space:nowrap;padding-right:4px;">Nama Sekolah')
c = c.replace('height:14px;white-space:nowrap;padding-right:4px;">Alamat', 'height:20px;white-space:nowrap;padding-right:4px;">Alamat')

# 2. Prakerin section
er = '<tr><td style="width:5%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:20%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:15%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:10%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:50%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td></tr>'

# Remove conditional wrapper around prakerin section
old = '${siswa.prakerin.length > 0 ? `'
new = ''
c = c.replace(old, new)

# Replace the closing backtick + : ''}
# Find the pattern: </div>` : ''}  right after the prakerin table
c = c.replace('</div>` : \'\'}', '</div>')

# Make prakerinRows empty-state aware at usage point
c = c.replace(
    '${prakerinRows}',
    '${prakerinRows.length > 0 ? prakerinRows : `' + er + '`}'
)

# 3. height:20px to all data rows
targets = [
    ('padding:3px;border:1px solid #000;">${escapeHtml(p.mitra)}', True),
    ('padding:3px;border:1px solid #000;">${escapeHtml(p.lokasi)}', True),
    ('padding:3px;border:1px solid #000;">${escapeHtml(p.durasi)}', True),
    ('padding:3px;border:1px solid #000;">${escapeHtml(p.keterangan)}', True),
    ('padding:3px;border:1px solid #000;">${escapeHtml(e.nama_eskul)}', True),
    ('padding:3px;border:1px solid #000;">${escapeHtml(e.predikat)}', True),
    ('padding:3px;border:1px solid #000;">${escapeHtml(e.keterangan)}', True),
    ('padding:3px;border:1px solid #000;">${escapeHtml(o.nama_organisasi)}', True),
    ('padding:5px;border:1px solid #000;">${escapeHtml(p.absen)}', True),
    ('padding:5px;border:1px solid #000;">${p.jumlah > 0 ? p.jumlah', True),
    ('padding:3px;vertical-align:middle;border:1px solid #000;" rowspan="2">${escapeHtml(m.nama_mapel)}', True),
    ('padding:3px;vertical-align:middle;border:1px solid #000;">${escapeHtml(m.deskripsi_max)}', True),
    ('padding:3px;vertical-align:middle;border:1px solid #000;">${escapeHtml(m.deskripsi_min)}', True),
]
for t, _ in targets:
    old = t
    new = t.replace('padding:', 'height:20px;padding:')
    c = c.replace(old, new)

# 4. Catatan Wali: 54px -> 70px
c = c.replace('min-height:54px', 'min-height:70px')

# 5. Tanggapan: 35px -> 50px
c = c.replace('height:35px;padding:5px;border:1px solid #000;">${siswa.tanggapan_ortu', 'height:50px;padding:5px;border:1px solid #000;">${siswa.tanggapan_ortu')

# 6. Capaian Kompetensi deskripsi: 20px -> 24px
c = c.replace(
    'height:20px;padding:3px;vertical-align:middle;border:1px solid #000;">${escapeHtml(m.deskripsi_max)}',
    'height:24px;padding:3px;vertical-align:middle;border:1px solid #000;">${escapeHtml(m.deskripsi_max)}'
)
c = c.replace(
    'height:20px;padding:3px;vertical-align:middle;border:1px solid #000;">${escapeHtml(m.deskripsi_min)}',
    'height:24px;padding:3px;vertical-align:middle;border:1px solid #000;">${escapeHtml(m.deskripsi_min)}'
)

with open(fp, "w", encoding="utf-8") as f:
    f.write(c)
print("All changes applied successfully")