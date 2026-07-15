import re, os
fp = r"D:\PROJECT\nextjs\clone-rapor-next\src\lib\pdf-templates\semester-template.ts"
with open(fp, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Identitas height
c = c.replace("height:14px;white-space:nowrap;padding-right:4px;\">Nama", "height:20px;white-space:nowrap;padding-right:4px;\">Nama")
c = c.replace("height:14px;white-space:nowrap;padding-right:4px;\">NIS / NISN", "height:20px;white-space:nowrap;padding-right:4px;\">NIS / NISN")
c = c.replace("height:14px;white-space:nowrap;padding-right:4px;\">Nama Sekolah", "height:20px;white-space:nowrap;padding-right:4px;\">Nama Sekolah")
c = c.replace("height:14px;white-space:nowrap;padding-right:4px;\">Alamat", "height:20px;white-space:nowrap;padding-right:4px;\">Alamat")

# 2. Prakerin section - always show
import re
# Match the conditional prakerin section and remove the conditional
pattern = r'\$\\{siswa\.prakerin\.length > 0 \? `\s*\n(.*?)(</div>)` : .*?}'
replacement = r'\1\2'
c = re.sub(pattern, replacement, c, flags=re.DOTALL)

# 3. height:20px to eskul, org, presensi, mapel rows
for target in [
    'padding:3px;border:1px solid #000;\">${escapeHtml(e.nama_eskul)}',
    'padding:3px;border:1px solid #000;\">${escapeHtml(e.predikat)}',
    'padding:3px;border:1px solid #000;\">${escapeHtml(e.keterangan)}',
    'padding:3px;border:1px solid #000;\">${escapeHtml(o.nama_organisasi)}',
    'padding:3px;border:1px solid #000;\">${escapeHtml(p.mitra)}',
    'padding:3px;border:1px solid #000;\">${escapeHtml(p.lokasi)}',
    'padding:3px;border:1px solid #000;\">${escapeHtml(p.durasi)}',
    'padding:3px;border:1px solid #000;\">${escapeHtml(p.keterangan)}',
    'padding:5px;border:1px solid #000;\">${escapeHtml(p.absen)}',
    'padding:5px;border:1px solid #000;\">${p.jumlah > 0 ? p.jumlah',
    'padding:3px;vertical-align:middle;border:1px solid #000;\" rowspan=\"2\">${escapeHtml(m.nama_mapel)}',
    'padding:3px;vertical-align:middle;border:1px solid #000;\">${escapeHtml(m.deskripsi_max)}',
    'padding:3px;vertical-align:middle;border:1px solid #000;\">${escapeHtml(m.deskripsi_min)}',
]:
    old = target
    new = target.replace("padding:", "height:20px;padding:")
    c = c.replace(old, new)

with open(fp, "w", encoding="utf-8") as f:
    f.write(c)
print("Done")