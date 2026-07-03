const fs = require('fs');
let content = fs.readFileSync('ui-events.js', 'utf8');

// Fix 1: formatShortAmount adds '$', we need a version for shares or just replace it inline
const sharesVisualOld = `text = \`+\${formatShortAmount(sharesAmount)}\`;`;
const sharesVisualNew = `text = \`+\${sharesAmount >= 1000 ? (sharesAmount/1000)+'K' : sharesAmount}\`;`;
if (content.includes(sharesVisualOld)) {
    content = content.replace(sharesVisualOld, sharesVisualNew);
} else {
    console.log("Could not find shares visual old text");
}

// Fix 2: Remove adSpinGranted filtering out 'cash' prizes
const prizePoolOld = `const prizePool = adSpinGranted
                    ? GAME_CONFIG.WHEEL_PRIZES.filter(p => p.type !== 'cash')
                    : GAME_CONFIG.WHEEL_PRIZES;`;
const prizePoolNew = `const prizePool = GAME_CONFIG.WHEEL_PRIZES;`;
if (content.includes(prizePoolOld)) {
    content = content.replace(prizePoolOld, prizePoolNew);
} else {
    console.log("Could not find prizePool filtering logic");
}

// Fix 3: Fix cash_medium execution percentage calculation
const pctAmountOld = `const pctAmount = Math.round(game.state.cash * (prize.label === 'cash_small' ? 0.10 : 0.30));`;
const pctAmountNew = `const pctAmount = Math.round(game.state.cash * (prize.label === 'cash_small' ? 0.10 : (prize.label === 'cash_medium' ? 0.20 : 0.30)));`;
if (content.includes(pctAmountOld)) {
    content = content.replace(pctAmountOld, pctAmountNew);
} else {
    console.log("Could not find pctAmount execution logic");
}

fs.writeFileSync('ui-events.js', content);
console.log("Fixed wheel bugs in ui-events.js");
