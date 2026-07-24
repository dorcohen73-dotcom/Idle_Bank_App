const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new'
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    
    const filePath = 'file:///' + path.resolve(__dirname, '../www/index.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    console.log("Waiting 3s for splash screen...");
    await new Promise(r => setTimeout(r, 3000));
    
    console.log("Clicking fortune wheel button...");
    await page.evaluate(() => {
        const btn = document.querySelector('#fortune-wheel-btn');
        if (btn) btn.click();
        else console.log("FORTUNE WHEEL BUTTON NOT FOUND");
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    const modalStyle = await page.evaluate(() => {
        const modal = document.querySelector('#fortune-wheel-modal');
        if (!modal) return "Modal not found";
        const style = window.getComputedStyle(modal);
        return {
            display: style.display,
            opacity: style.opacity,
            pointerEvents: style.pointerEvents,
            visibility: style.visibility,
            backdropFilter: style.backdropFilter,
            classes: modal.className
        };
    });
    
    console.log("Fortune Wheel Modal:", modalStyle);
    
    await browser.close();
})();
