fp = r"D:\PROJECT\nextjs\clone-rapor-next\src\lib\pdf-templates\semester-template.ts"
with open(fp, "r", encoding="utf-8") as f:
    c = f.read()

er = '<tr><td style="width:5%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:20%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:15%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:10%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:50%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td></tr>'

old_def = "const prakerinRows = siswa.prakerin.map((p, i) => `"
new_def = "const prakerinRows = siswa.prakerin.length > 0 ? siswa.prakerin.map((p, i) => `"
c = c.replace(old_def, new_def)

# Find the closing of the map: </tr>`);
# Replace only the first occurrence (the prakerin one)
c = c.replace(
    '</tr>`);',
    "</tr>`).join('') : `" + er + "`;",
    1
)

with open(fp, "w", encoding="utf-8") as f:
    f.write(c)
print("Done")