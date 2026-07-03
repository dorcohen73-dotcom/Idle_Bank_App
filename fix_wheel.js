const fs = require('fs');
const lines = fs.readFileSync('ui-events.js', 'utf8').split('\n');

const replacement = `
        GAME_CONFIG.WHEEL_PRIZES.forEach((p, index) => {
            if (index >= 6) return;

            const sliceAngle = 360 / 6;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;

            gradientString += \`\${colors[index]} \${startAngle}deg \${endAngle}deg\${index === 5 ? '' : ', '}\`;

            const seg = document.createElement('div');
            seg.className = \`wheel-seg seg-\${index + 1}\`;

            const middleAngle = startAngle + (sliceAngle / 2);
            seg.style.transform = \`rotate(\${middleAngle}deg) translateY(-115px)\`;

            let icon = '🎁';
            let text = '';

            if (p.type === 'cash') {
                icon = p.label === 'cash_small' ? '💰' : (p.label === 'cash_medium' ? '💵' : '💸');
                const eps = game.getEarningsPerSecond();
                const timeAmount = 3600 * eps * p.value;
                const pct = p.label === 'cash_big' ? 0.30 : (p.label === 'cash_medium' ? 0.20 : 0.10);
                const pctAmount = Math.round(game.state.cash * pct);
                text = \`+\${formatShortAmount(Math.max(timeAmount, pctAmount))}\`;
            } else if (p.type === 'boost') {
                icon = '⚡';
                text = \`+\${p.value}h\`;
            } else if (p.type === 'shares') {
                icon = '📈';
                const isSmall = (p.label === 'shares_1');
                let sharesAmount = Math.max(p.value, Math.floor((game.state.shares || 0) * (isSmall ? 0.25 : 0.50)));
                sharesAmount = Math.min(10000, sharesAmount);
                text = \`+\${formatShortAmount(sharesAmount)}\`;
            }

            seg.innerHTML = \`
                <div style="display:flex; flex-direction:row; align-items:center; gap:6px; transform: rotate(90deg); text-shadow: 1px 1px 4px rgba(0,0,0,0.8);">
                    <span style="font-size:1.6rem; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.6));">\${icon}</span>
                    <span dir="ltr" style="font-size:1.15rem; font-weight:900;">\${text}</span>
                </div>
            \`;
            segmentsContainer.appendChild(seg);
            currentAngle = endAngle;
        });
`;

let newLines = [];
let skip = false;
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('GAME_CONFIG.WHEEL_PRIZES.forEach((p, index) => {')) {
        skip = true;
        newLines.push(replacement.trim());
    }
    if (!skip) {
        newLines.push(lines[i]);
    }
    if (skip && lines[i].trim() === '});' && lines[i-1].includes('currentAngle = endAngle;')) {
        skip = false;
    }
}
fs.writeFileSync('ui-events.js', newLines.join('\n'));
