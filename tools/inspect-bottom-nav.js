const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new'
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    
    const filePath = 'file:///' + path.resolve(__dirname, '../www/index.html').replace(/\\/g, '/');
    console.log('Navigating to: ' + filePath);
    
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    const navInfo = await page.evaluate(() => {
        const nav = document.querySelector('.bottom-nav');
        if (!nav) return 'No .bottom-nav found';
        const rect = nav.getBoundingClientRect();
        const style = window.getComputedStyle(nav);
        return {
            rect: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height },
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            zIndex: style.zIndex,
            position: style.position,
            bottom: style.bottom,
            transform: style.transform
        };
    });
    
    console.log('BOTTOM NAV INFO:');
    console.log(JSON.stringify(navInfo, null, 2));
    
    await browser.close();
})();
