const fs = require('fs');
['style.css', 'premium_depts.css', 'premium_managers.css', 'ai_dashboard.css'].forEach(f => {
    try {
        const lines = fs.readFileSync(f, 'utf8').split('\n');
        lines.forEach((l, i) => {
            if (l.includes('ellipsis')) console.log(`${f}:${i+1} ${l.trim()}`);
        });
    } catch(e){}
});
