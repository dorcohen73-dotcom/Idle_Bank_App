const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('file://C:/Users/dorco/Desktop/AntiGravity/IdleBank/index.html', { waitUntil: 'networkidle0' });
    
    // Check if bottom-nav is visible
    const info = await page.evaluate(() => {
        const el = document.getElementById('bottom-nav');
        if (!el) return 'Not found';
        const rect = el.getBoundingClientRect();
        return {
            rect: rect.toJSON(),
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility,
            opacity: window.getComputedStyle(el).opacity,
            bottom: window.getComputedStyle(el).bottom
        };
    });
    console.log("BOTTOM NAV INFO:", info);

    await browser.close();
})();
