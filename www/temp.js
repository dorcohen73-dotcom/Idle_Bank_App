const fs = require('fs');

const lines = fs.readFileSync('locales.js', 'utf8').split('\n');
const newLines = [];

for (const line of lines) {
    newLines.push(line);
    if (line.includes('tellerCap: "קיבולת דלפק"')) {
        newLines.push('            tellerFull: "כספר מלא",');
    } else if (line.includes('tellerCap: "Desk Cap"')) {
        newLines.push('            tellerFull: "Full Teller",');
    } else if (line.includes('tellerCap: "Cap. Escritorio"')) {
        newLines.push('            tellerFull: "Cajero Lleno",');
    } else if (line.includes('tellerCap: "Емкость стола"')) {
        newLines.push('            tellerFull: "Полный кассир",');
    }
}

fs.writeFileSync('locales.js', newLines.join('\n'), 'utf8');
