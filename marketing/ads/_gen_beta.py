import cairosvg, math

DEFS = '''<defs>
<radialGradient id="bg" cx="50%" cy="35%" r="80%"><stop offset="0%" stop-color="#1a3a8c"/><stop offset="45%" stop-color="#0d1a4a"/><stop offset="100%" stop-color="#0a0f2c"/></radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe48a"/><stop offset="50%" stop-color="#f0c040"/><stop offset="100%" stop-color="#b8860b"/></linearGradient>
<radialGradient id="coin" cx="38%" cy="32%" r="75%"><stop offset="0%" stop-color="#ffe48a"/><stop offset="60%" stop-color="#f0c040"/><stop offset="100%" stop-color="#b8860b"/></radialGradient>
<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity="0.55"/></filter></defs>'''

def coin(cx, cy, r):
    s = r/58
    return (f'<g filter="url(#sh)"><ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r}" fill="url(#coin)" stroke="#b8860b" stroke-width="{3.48*s:.2f}"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="{r*0.62:.1f}" ry="{r*0.62:.1f}" fill="none" stroke="#b8860b" stroke-width="{2.9*s:.2f}" opacity="0.7"/>'
            f'<text x="{cx}" y="{cy+r*0.34:.1f}" font-family="DejaVu Sans" font-weight="bold" font-size="{55.1*s:.1f}" fill="#b8860b" text-anchor="middle">$</text></g>')

def emblem(cx, cy, r):
    g = r/170
    lines = ''
    for a in range(0,360,45):
        rad = math.radians(a)
        x1 = cx + (r*0.3)*math.cos(rad); y1 = cy + (r*0.3)*math.sin(rad)
        x2 = cx + (r*0.95)*math.cos(rad); y2 = cy + (r*0.95)*math.sin(rad)
        lines += f'<line x1="{x1:.0f}" y1="{y1:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" stroke="url(#gold)" stroke-width="{15.3*g:.1f}" stroke-linecap="round"/>'
    return (f'<g filter="url(#sh)"><circle cx="{cx}" cy="{cy}" r="{r}" fill="#0d1a4a" stroke="url(#gold)" stroke-width="{22.1*g:.1f}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r*0.66:.1f}" fill="none" stroke="#f0c040" stroke-width="{8.5*g:.1f}" opacity="0.85"/>'
            f'{lines}<circle cx="{cx}" cy="{cy}" r="{r*0.3:.1f}" fill="url(#gold)"/>'
            f'<text x="{cx}" y="{cy+r*0.16:.1f}" font-family="DejaVu Sans" font-weight="bold" font-size="{85*g:.1f}" fill="#0a0f2c" text-anchor="middle">$</text></g>')

sq = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">{DEFS}
<rect width="1080" height="1080" fill="url(#bg)"/>
{coin(140,175,58)}{coin(940,235,50)}{coin(115,975,46)}{coin(975,975,52)}
{emblem(540,330,155)}
<text x="540" y="560" font-family="DejaVu Sans" font-weight="bold" font-size="50" fill="#f0c040" text-anchor="middle">IDLE BANK EMPIRE</text>
<g filter="url(#sh)"><rect x="150" y="614" width="780" height="102" rx="18" fill="url(#gold)"/>
<text x="540" y="682" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#0a0f2c" text-anchor="middle">BETA TESTERS WANTED</text></g>
<text x="540" y="785" font-family="DejaVu Sans" font-weight="normal" font-size="40" fill="#f8f8f8" text-anchor="middle">Play early &amp; help shape the game</text>
<text x="540" y="845" font-family="DejaVu Sans" font-weight="normal" font-size="29" fill="#a9b6d6" text-anchor="middle">Idle Tycoon   ·   Offline income   ·   Get credited</text>
<g filter="url(#sh)"><rect x="230" y="917" width="620" height="96" rx="48" fill="url(#gold)"/>
<text x="540" y="979" font-family="DejaVu Sans" font-weight="bold" font-size="40" fill="#0a0f2c" text-anchor="middle">JOIN THE BETA · FREE</text></g>
</svg>'''

st = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">{DEFS}
<rect width="1080" height="1920" fill="url(#bg)"/>
{coin(160,300,60)}{coin(920,420,52)}{coin(150,1585,48)}{coin(930,1585,56)}{coin(540,1700,42)}
{emblem(540,540,190)}
<text x="540" y="880" font-family="DejaVu Sans" font-weight="bold" font-size="60" fill="#f0c040" text-anchor="middle">IDLE BANK EMPIRE</text>
<g filter="url(#sh)"><rect x="110" y="930" width="860" height="118" rx="20" fill="url(#gold)"/>
<text x="540" y="1010" font-family="DejaVu Sans" font-weight="bold" font-size="60" fill="#0a0f2c" text-anchor="middle">BETA TESTERS WANTED</text></g>
<text x="540" y="1140" font-family="DejaVu Sans" font-weight="normal" font-size="46" fill="#f8f8f8" text-anchor="middle">Play early &amp; help shape the game</text>
<text x="540" y="1210" font-family="DejaVu Sans" font-weight="normal" font-size="32" fill="#a9b6d6" text-anchor="middle">Idle Tycoon   ·   Offline income   ·   Get credited</text>
<g filter="url(#sh)"><rect x="210" y="1346" width="660" height="108" rx="54" fill="url(#gold)"/>
<text x="540" y="1416" font-family="DejaVu Sans" font-weight="bold" font-size="44" fill="#0a0f2c" text-anchor="middle">JOIN THE BETA · FREE</text></g>
</svg>'''

for name, svg in [("idlebank_beta_square_en", sq), ("idlebank_beta_story_en", st)]:
    open(name+".svg","w").write(svg)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=name+".png", output_width=1080)
    print("wrote", name)
