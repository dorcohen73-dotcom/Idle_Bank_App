const fs = require('fs');
const file = 'c:/Users/dorco/Desktop/אנטי גרפיטי/IDLE בנק/ui-events.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /        \} else \{\r?\n            game\.saveGame\(\);\r?\n            draw\(\);\r?\n        \}\r?\n/;

const replacement = `        } else {
            game.saveGame();
            draw();
        }
    }

    // ==========================================
    // PRESTIGE NEAR-MISS BONUS BANNER
    // ==========================================
`;

code = code.replace(regex, replacement);
fs.writeFileSync(file, code);
console.log('Fixed brackets');
