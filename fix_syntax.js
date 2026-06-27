const fs = require('fs');
const file = 'c:/Users/dorco/Desktop/אנטי גרפיטי/IDLE בנק/ui-events.js';
let code = fs.readFileSync(file, 'utf8');

const search = `    });\r
        } else {\r
            const reward = Math.round(game.getEarningsPerSecond() * 180);\r
            game.state.cash = Math.round((game.state.cash + reward + Number.EPSILON) * 100) / 100;\r
            game.state.lifetimeCash = Math.round((game.state.lifetimeCash + reward + Number.EPSILON) * 100) / 100;\r
            const msg = tObj.vipRewardCash ? tObj.vipRewardCash(formatMoney(reward)) : \`+\${formatMoney(reward)}\`;\r
            spawnFloating('💎 ' + msg, window.innerWidth / 2, window.innerHeight / 2 - 40, 'green');\r
            game.saveGame();\r
            draw();\r
        }\r
    }`;

code = code.replace(search, '');
fs.writeFileSync(file, code);
console.log('Fixed syntax error!');
