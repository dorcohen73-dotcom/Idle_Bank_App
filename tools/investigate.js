const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('file://C:/Users/dorco/Desktop/AntiGravity/IdleBank/index.html', { waitUntil: 'networkidle0' });
    
    // Close language modal
    try {
        await page.evaluate(() => {
            const btns = document.querySelectorAll('.lang-btn-choice');
            for(let b of btns) if(b.textContent.includes('IL')) b.click();
        });
        await wait(1000);
    } catch(e) {}
    
    // Close splash
    try {
        await page.evaluate(() => {
            const btn = document.getElementById('splash-play-btn');
            if(btn) btn.click();
        });
        await wait(1000);
    } catch(e) {}

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await wait(500);

    const info = await page.evaluate(() => {
        const el = document.getElementById('bottom-nav');
        if (!el) return 'Not found';
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        let visibility = 'visible';
        let curr = el;
        while(curr) {
            const s = window.getComputedStyle(curr);
            if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') {
                visibility = `hidden by ${curr.tagName}#${curr.id} (display: ${s.display}, visibility: ${s.visibility}, opacity: ${s.opacity})`;
                break;
            }
            curr = curr.parentElement;
        }

        return {
            rect: rect.toJSON(),
            display: style.display,
            position: style.position,
            bottom: style.bottom,
            zIndex: style.zIndex,
            opacity: style.opacity,
            visibilityFlag: visibility
        };
    });
    
    console.log(JSON.stringify(info, null, 2));
    await browser.close();
})();
