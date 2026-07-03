const fs = require('fs');
['app.js', 'game.js', 'ui-events.js'].forEach(f => {
    try {
        const lines = fs.readFileSync(f, 'utf8').split('\n');
        lines.forEach((l, i) => {
            if (l.toLowerCase().includes('wheel_prize') || l.toLowerCase().includes('fortune')) {
                console.log(`${f}:${i+1} ${l.trim()}`);
            }
        });
    } catch(e){}
});
