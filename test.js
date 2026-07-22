const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/index.html', { waitUntil: 'networkidle0' });
    const res = await page.evaluate(() => {
        const n = document.getElementById('bottom-nav');
        if (!n) return 'No bottom-nav';
        const s = window.getComputedStyle(n);
        const r = n.getBoundingClientRect();
        const coveredBy = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
        return {
            position: s.position,
            display: s.display,
            bottom: s.bottom,
            zIndex: s.zIndex,
            rectTop: Math.round(r.top),
            rectBottom: Math.round(r.bottom),
            winH: window.innerHeight,
            coveredById: coveredBy ? coveredBy.id : null,
            coveredByClass: coveredBy ? coveredBy.className : null
        };
    });
    console.log(JSON.stringify(res));
    await browser.close();
})();
