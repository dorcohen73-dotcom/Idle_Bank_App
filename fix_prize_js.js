const fs = require('fs');
let content = fs.readFileSync('ui-events.js', 'utf8');

const oldBlock = `        let valDesc = '';
        const l = (game.state && game.state.language) || 'en';
        if (p.type === 'cash') {
            const eps = game.getEarningsPerSecond();
            const timeAmount = 3600 * eps * p.value;
            const pct = p.label === 'cash_big' ? 0.30 : (p.label === 'cash_medium' ? 0.20 : 0.10);
            const pctAmount = Math.round(game.state.cash * pct);
            const finalCash = formatMoney(Math.max(timeAmount, pctAmount), true);
            valDesc = \`💵 +\${finalCash}\`;
        } else if (p.type === 'boost') {
            valDesc = l === 'he' ? \`⚡ +\${p.value} שעות בוסט\` : l === 'es' ? \`⚡ +\${p.value}h Boost\` : l === 'ru' ? \`⚡ +\${p.value}h Буст\` : \`⚡ +\${p.value}h Boost\`;
        } else if (p.type === 'shares') {
            const isSmall = (p.label === 'shares_1');
            let sharesAmount = Math.max(p.value, Math.floor((game.state.shares || 0) * (isSmall ? 0.25 : 0.50)));
            sharesAmount = Math.min(10000, sharesAmount);
            valDesc = l === 'he' ? \`📈 +\${sharesAmount} מניות זהב\` : l === 'es' ? \`📈 +\${sharesAmount} Acciones\` : l === 'ru' ? \`📈 +\${sharesAmount} Акций\` : \`📈 +\${sharesAmount} Shares\`;
        }

        li.innerHTML = \`<span class="wheel-prize-label">\${label}<span style="display:block; font-size:0.75rem; color:#a3e635; font-weight:600; margin-top:0.2rem; letter-spacing:0.5px;">\${valDesc}</span></span><span class="wheel-prize-weight">\${p.weight}%</span>\`;`;

const newBlock = `        let valDesc = '';
        let icon = '';
        const l = (game.state && game.state.language) || 'en';
        if (p.type === 'cash') {
            const eps = game.getEarningsPerSecond();
            const timeAmount = 3600 * eps * p.value;
            const pct = p.label === 'cash_big' ? 0.30 : (p.label === 'cash_medium' ? 0.20 : 0.10);
            const pctAmount = Math.round(game.state.cash * pct);
            const finalCash = formatMoney(Math.max(timeAmount, pctAmount), true);
            valDesc = \`+\${finalCash}\`;
            icon = p.label === 'cash_small' ? '💰' : (p.label === 'cash_medium' ? '💵' : '💸');
        } else if (p.type === 'boost') {
            valDesc = l === 'he' ? \`+\${p.value} שעות בוסט\` : l === 'es' ? \`+\${p.value}h Boost\` : l === 'ru' ? \`+\${p.value}h Буст\` : \`+\${p.value}h Boost\`;
            icon = '⚡';
        } else if (p.type === 'shares') {
            const isSmall = (p.label === 'shares_1');
            let sharesAmount = Math.max(p.value, Math.floor((game.state.shares || 0) * (isSmall ? 0.25 : 0.50)));
            sharesAmount = Math.min(10000, sharesAmount);
            valDesc = l === 'he' ? \`+\${sharesAmount} מניות זהב\` : l === 'es' ? \`+\${sharesAmount} Acciones\` : l === 'ru' ? \`+\${sharesAmount} Акций\` : \`+\${sharesAmount} Shares\`;
            icon = '📈';
        }

        li.innerHTML = \`
            <div class="prize-content-wrapper">
                <span class="wheel-prize-label">\${label}</span>
                <span class="wheel-prize-val">\${valDesc}</span>
                <span class="wheel-prize-weight">\${p.weight}%</span>
            </div>
            <div class="wheel-prize-icon">\${icon}</div>
        \`;`;

if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync('ui-events.js', content);
    console.log('Replaced JS block');
} else {
    console.log('Could not find JS block. Checking if already replaced...');
    if(content.includes('prize-content-wrapper')) {
        console.log('Already replaced!');
    } else {
        console.log('Error finding block!');
    }
}
