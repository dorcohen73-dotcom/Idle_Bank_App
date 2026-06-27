const fs = require('fs');
let code = fs.readFileSync('game.js', 'utf8');
code = code.replace(/window\.gameAudio\.playClick\(\);/g, '');
code = code.replace(/if\s*\(typeof\s+window\s*!==\s*'undefined'\s*&&\s*window\.dispatchEvent\)/g, 'if (false)');
fs.writeFileSync('game-test.js', code);
