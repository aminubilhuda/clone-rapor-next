import re
fp = 'D:\\PROJECT\\nextjs\\clone-rapor-next\\src\\lib\\pdf-templates\\semester-template.ts'
with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Make prakerin section always show with empty state
empty_row = '<tr><td style="width:5%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:20%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:15%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:10%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td><td style="width:50%;text-align:center;padding:10px 8px;height:20px;border:1px solid #000;">-</td></tr>'

# Change prakerinRows to handle empty
c = c.replace(
    'const prakerinRows = siswa.prakerin.map((p, i) => ',
    'const prakerinRows = siswa.prakerin.length > 0 ? siswa.prakerin.map((p, i) => '
)

# Find and replace the closing of the prakerinRows map statement
c = c.replace(
    "}).join('')",
    "}).join('') : " + empty_row + ""
)

with open(fp, 'w', encoding='utf-8') as f:
    f.write(c)
print('Done')
