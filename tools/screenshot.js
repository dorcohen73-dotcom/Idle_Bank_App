const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Simulate iPhone 12 Pro (has touch, pointer: coarse, narrow viewport)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    
    // Open the local file
    await page.goto('file://C:/Users/dorco/Desktop/AntiGravity/IdleBank/index.html', { waitUntil: 'networkidle0' });
    
    // Check if bottom-nav is visible
    const bottomNav = await page.$('#bottom-nav');
    const box = await bottomNav.boundingBox();
    const display = await page.evaluate(() => window.getComputedStyle(document.getElementById('bottom-nav')).display);
    
    console.log('Bottom Nav bounding box:', box);
    console.log('Bottom Nav display:', display);
    
    await page.screenshot({ path: 'C:/Users/dorco/Desktop/AntiGravity/IdleBank/artifacts/debug_mobile.png' });
    await browser.close();
})();
