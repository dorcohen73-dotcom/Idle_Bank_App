const fs = require('fs');
['ui-tabs.js', 'style.css', 'premium_depts.css', 'premium_managers.css'].forEach(f => {
    try {
        const lines = fs.readFileSync(f, 'utf8').split('\n');
        lines.forEach((l, i) => {
            if (l.includes('MAX')) console.log(`${f}:${i+1} ${l.trim()}`);
        });
    } catch(e){}
});
