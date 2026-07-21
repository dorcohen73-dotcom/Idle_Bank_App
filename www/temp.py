import os

with open('locales.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'tellerCap: "קיבולת דלפק"' in line:
        new_lines.append('            tellerFull: "כספר מלא",\n')
    elif 'tellerCap: "Desk Cap"' in line:
        new_lines.append('            tellerFull: "Full Teller",\n')
    elif 'tellerCap: "Cap. Escritorio"' in line:
        new_lines.append('            tellerFull: "Cajero Lleno",\n')

with open('locales.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
